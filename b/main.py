"""
TenderFlow Backend - FastAPI + MongoDB (Motor)
Features:
  - OTP-based email verification on registration
  - Wallet system (top-up, balance, deduct)
  - Payment: COD or Online (wallet deduction)
  - Taxes: GST 18% split as SGST 9% + CGST 9%
  - Downloadable payment slip (JSON, rendered as PDF on frontend)
  - Refund to wallet on order cancellation
  - Admin analytics
"""

from fastapi import FastAPI, HTTPException, Depends, Query, File, UploadFile, Response, Header, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import httpx
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List, cast
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
import os
import uuid
import shutil
import random
import string
from dotenv import load_dotenv

# Email
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

load_dotenv()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# ─── Configuration ───────────────────────────────────────────────────────────

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/tenderflow")
JWT_SECRET = os.getenv("JWT_SECRET", "please_change_this_secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
MAIL_FROM = os.getenv("MAIL_FROM", "")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "TenderFlow")

COMPANY_NAME = os.getenv("COMPANY_NAME", "TenderFlow Pvt. Ltd.")
COMPANY_GST_NO = os.getenv("COMPANY_GST_NO", "27AABCT3518Q1ZV")
COMPANY_ADDRESS = os.getenv("COMPANY_ADDRESS", "123, Commerce Hub, Mumbai - 400001, Maharashtra")
GST_RATE = float(os.getenv("GST_RATE", "18"))
SGST_RATE = GST_RATE / 2
CGST_RATE = GST_RATE / 2

# ─── App Setup ───────────────────────────────────────────────────────────────

app = FastAPI(title="TenderFlow API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Middleware to strip /api prefix (needed for Vercel serverless deployment)
@app.middleware("http")
async def strip_api_prefix(request, call_next):
    if request.scope["path"].startswith("/api"):
        request.scope["path"] = request.scope["path"][4:] or "/"
    return await call_next(request)

# Mount static files for images
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ─── Database ────────────────────────────────────────────────────────────────

client: Optional[AsyncIOMotorClient] = None
db: Optional[AsyncIOMotorDatabase] = None


@app.on_event("startup")
async def startup_db():
    global client, db
    client = AsyncIOMotorClient(MONGO_URI)
    db_name = MONGO_URI.rsplit("/", 1)[-1] if "/" in MONGO_URI else "tenderflow"
    db = client[db_name]
    print(f"[OK] Connected to MongoDB: {db_name}")

    # Auto-seed default admin user if none exists
    admin_email = "admin@gmail.com"
    admin_exists = await db.users.find_one({"email": admin_email})
    if not admin_exists:
        admin_doc = {
            "user_id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password("admin@123"),
            "full_name": "Admin",
            "role": "admin",
            "is_verified": True,
            "wallet_balance": 0.0,
            "created_at": datetime.utcnow().isoformat(),
        }
        await db.users.insert_one(admin_doc)
        print(f"[OK] Default admin created -> {admin_email} / admin@123")
    else:
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {
                "password_hash": hash_password("admin@123"),
                "role": "admin",
                "is_verified": True,
            }}
        )
        print(f"[OK] Admin user {admin_email} updated/verified")


@app.on_event("shutdown")
async def shutdown_db():
    global client
    if client:
        client.close()


def get_db() -> AsyncIOMotorDatabase:
    """Get database instance with proper type assertion."""
    if db is None:
        raise RuntimeError("Database not initialized")
    return cast(AsyncIOMotorDatabase, db)


# ─── Security ────────────────────────────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(token: str) -> dict:
    """Decode JWT and return the user document from MongoDB."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await get_db().users.find_one({"user_id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def extract_token(authorization: Optional[str] = None) -> str:
    """Extract Bearer token from Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    return authorization[7:]


# ─── Email Setup (fastapi-mail) ───────────────────────────────────────────────

conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_FROM=MAIL_FROM,
    MAIL_PORT=MAIL_PORT,
    MAIL_SERVER=MAIL_SERVER,
    MAIL_FROM_NAME=MAIL_FROM_NAME,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

def generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))

async def send_otp_email(to_email: str, otp: str, full_name: str):
    """Send OTP email using fastapi-mail."""
    if not MAIL_USERNAME or not MAIL_PASSWORD:
        print(f"[MAIL] [DEV MODE] OTP for {to_email}: {otp}")
        return

    body = f"""
    <html>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f9fafb; padding: 40px 20px;">
      <div style="max-width: 500px; margin: auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">TenderFlow</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Secure Verification</p>
        </div>
        <p style="color: #1f2937; font-size: 16px; font-weight: 600;">Hello {full_name},</p>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">Thank you for joining TenderFlow. Please use the following code to verify your email address:</p>
        <div style="text-align: center; margin: 35px 0;">
          <div style="background: #f3f4f6; color: #111827; font-size: 36px; font-weight: 800; letter-spacing: 8px; padding: 20px; border-radius: 12px; display: inline-block; border: 1px solid #e5e7eb;">
            {otp}
          </div>
        </div>
        <p style="color: #9ca3af; font-size: 13px; text-align: center;">This code is valid for 10 minutes. Do not share it with others.</p>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center;">
          <p style="color: #d1d5db; font-size: 12px; margin: 0;">&copy; {datetime.utcnow().year} {COMPANY_NAME}</p>
        </div>
      </div>
    </body>
    </html>
    """

    message = MessageSchema(
        subject="TenderFlow Verification Code",
        recipients=[to_email],
        body=body,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        print(f"[OK] OTP email sent to {to_email} via fastapi-mail")
    except Exception as e:
        print(f"[WARN] Email send failed: {str(e)}")


async def send_status_update_email(to_email: str, full_name: str, order_id: str, new_status: str, title: str):
    """Send order status update email using fastapi-mail."""
    if not MAIL_USERNAME or not MAIL_PASSWORD:
        return

    status_colors = {
        "pending": "#f59e0b",
        "confirmed": "#3b82f6",
        "processing": "#6366f1",
        "dispatched": "#8b5cf6",
        "delivered": "#10b981",
        "cancelled": "#ef4444"
    }
    color = status_colors.get(new_status.lower(), "#6b7280")

    body = f"""
    <html>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f9fafb; padding: 40px 20px;">
      <div style="max-width: 500px; margin: auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">TenderFlow</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Order Update</p>
        </div>
        <p style="color: #1f2937; font-size: 16px; font-weight: 600;">Hello {full_name},</p>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">There is an update regarding your order for <strong>{title}</strong>.</p>
        
        <div style="text-align: center; margin: 35px 0;">
          <p style="color: #6b7280; font-size: 13px; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Order Status</p>
          <div style="background: {color}15; color: {color}; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; padding: 12px 24px; border-radius: 8px; display: inline-block; border: 1px solid {color}30;">
            {new_status.upper()}
          </div>
        </div>
        
        <p style="color: #4b5563; font-size: 14px; text-align: center;">You can track your order timeline in your TenderFlow dashboard.</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center;">
          <p style="color: #d1d5db; font-size: 12px; margin: 0;">&copy; {datetime.utcnow().year} {COMPANY_NAME}</p>
        </div>
      </div>
    </body>
    </html>
    """

    message = MessageSchema(
        subject=f"Order Update: #{order_id[:8].upper()} is now {new_status.title()}",
        recipients=[to_email],
        body=body,
        subtype=MessageType.html
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"[OK] Status update email sent to {to_email}")
    except Exception as e:
        print(f"[WARN] Email send failed: {str(e)}")


# ─── Tax Helper ──────────────────────────────────────────────────────────────

def calculate_taxes(subtotal: float):
    sgst = round(subtotal * SGST_RATE / 100, 2)
    cgst = round(subtotal * CGST_RATE / 100, 2)
    total_tax = round(sgst + cgst, 2)
    grand_total = round(subtotal + total_tax, 2)
    return {
        "subtotal": round(subtotal, 2),
        "sgst_rate": SGST_RATE,
        "cgst_rate": CGST_RATE,
        "sgst_amount": sgst,
        "cgst_amount": cgst,
        "total_tax": total_tax,
        "grand_total": grand_total,
    }


# ─── Pydantic Models ────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "customer"
    account_type: str = "individual"  # "individual" or "business"
    # B2B company fields
    company_name: Optional[str] = None
    company_gstin: Optional[str] = None
    company_pan: Optional[str] = None
    company_address: Optional[str] = None
    company_phone: Optional[str] = None


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    company_gstin: Optional[str] = None
    company_pan: Optional[str] = None
    company_address: Optional[str] = None
    company_phone: Optional[str] = None


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class ResendOTPRequest(BaseModel):
    email: EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TenderCreate(BaseModel):
    title: str
    description: str
    price: float
    weight: Optional[str] = None
    deadline: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    status: str = "active"
    min_order_qty: int = 1
    bulk_discount_tiers: Optional[list] = None  # [{"min_qty": 10, "discount_pct": 5}, ...]


class OrderCreate(BaseModel):
    tender_id: str
    quantity: int
    notes: Optional[str] = None
    payment_method: str = "transfer"  # "transfer" or "online"
    delivery_address: Optional[str] = None
    delivery_city: Optional[str] = None
    delivery_state: Optional[str] = None
    delivery_pincode: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str


class WalletTopUp(BaseModel):
    amount: float


# ─── Order Status Flow ──────────────────────────────────────────────────────

ORDER_STATUS_FLOW = ["pending", "confirmed", "processing", "dispatched", "delivered"]
ORDER_STATUS_LABELS = {
    "pending": "Order Placed",
    "confirmed": "Confirmed",
    "processing": "Processing",
    "dispatched": "Dispatched",
    "delivered": "Delivered",
    "cancelled": "Cancelled",
}


# ─── Helper: serialise MongoDB documents ────────────────────────────────────

def serialise(doc: dict) -> dict:
    """Convert MongoDB document to JSON-friendly dict (remove _id ObjectId)."""
    if doc is None:
        return None
    doc = dict(doc)
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


# ─── Auth Routes ─────────────────────────────────────────────────────────────


@app.post("/auth/register")
async def register(req: RegisterRequest, background_tasks: BackgroundTasks):
    # Check if user already exists and verified
    existing = await get_db().users.find_one({"email": req.email})
    if existing and existing.get("is_verified", False):
        raise HTTPException(status_code=400, detail="Email already registered")

    # Generate OTP
    otp = generate_otp()
    otp_expires = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

    company_data = {
        "company_name": req.company_name or "",
        "company_gstin": req.company_gstin or "",
        "company_pan": req.company_pan or "",
        "company_address": req.company_address or "",
        "company_phone": req.company_phone or "",
    }

    if existing and not existing.get("is_verified", False):
        # Update existing unverified registration
        await get_db().users.update_one(
            {"email": req.email},
            {"$set": {
                "password_hash": hash_password(req.password),
                "full_name": req.full_name,
                "account_type": req.account_type,
                "otp": otp,
                "otp_expires": otp_expires,
                **company_data,
            }}
        )
    else:
        user_id = str(uuid.uuid4())
        role = req.role if req.role in ("customer", "admin") else "customer"
        
        # Admins and Individuals are auto-approved. 
        # Business accounts require manual KYC approval by an admin.
        if role == "admin":
            is_approved = True
        elif req.account_type == "individual":
            is_approved = True
        else:
            is_approved = False
        
        user_doc = {
            "user_id": user_id,
            "email": req.email,
            "password_hash": hash_password(req.password),
            "full_name": req.full_name,
            "role": role,
            "account_type": req.account_type,
            "is_verified": False,
            "is_approved": is_approved,
            "otp": otp,
            "otp_expires": otp_expires,
            "wallet_balance": 0.0,
            **company_data,
            "created_at": datetime.utcnow().isoformat(),
        }
        await get_db().users.insert_one(user_doc)

    # Send OTP email in background
    background_tasks.add_task(send_otp_email, req.email, otp, req.full_name)

    return {"detail": "OTP sent to your email. Please verify to complete registration.", "email": req.email}


@app.post("/auth/verify-otp")
async def verify_otp(req: VerifyOTPRequest):
    user = await get_db().users.find_one({"email": req.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("is_verified", False):
        raise HTTPException(status_code=400, detail="Email already verified")

    stored_otp = user.get("otp", "")
    otp_expires = user.get("otp_expires", "")

    if stored_otp != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if datetime.fromisoformat(otp_expires) < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    # Mark as verified
    await get_db().users.update_one(
        {"email": req.email},
        {"$set": {"is_verified": True}, "$unset": {"otp": "", "otp_expires": ""}}
    )

    token = create_access_token({"user_id": user["user_id"], "role": user["role"]})

    user_response = {
        "user_id": user["user_id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "created_at": user.get("created_at", ""),
        "wallet_balance": user.get("wallet_balance", 0.0),
        "is_verified": user.get("is_verified", False),
        "is_approved": user.get("is_approved", False),
        "account_type": user.get("account_type", "individual"),
        "company_name": user.get("company_name", ""),
        "company_gstin": user.get("company_gstin", ""),
        "company_pan": user.get("company_pan", ""),
        "company_address": user.get("company_address", ""),
        "company_phone": user.get("company_phone", ""),
    }

    return {"access_token": token, "user": user_response}


@app.post("/auth/resend-otp")
async def resend_otp(req: ResendOTPRequest, background_tasks: BackgroundTasks):
    user = await get_db().users.find_one({"email": req.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.get("is_verified", False):
        raise HTTPException(status_code=400, detail="Email already verified")

    otp = generate_otp()
    otp_expires = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

    await get_db().users.update_one(
        {"email": req.email},
        {"$set": {"otp": otp, "otp_expires": otp_expires}}
    )

    background_tasks.add_task(send_otp_email, req.email, otp, user["full_name"])
    return {"detail": "New OTP sent to your email."}


@app.post("/auth/login")
async def login(req: LoginRequest):
    user = await get_db().users.find_one({"email": req.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.get("is_verified", False):
        raise HTTPException(status_code=403, detail="Please verify your email before logging in.")

    token = create_access_token({"user_id": user["user_id"], "role": user["role"]})

    user_response = {
        "user_id": user["user_id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "created_at": user.get("created_at", ""),
        "wallet_balance": user.get("wallet_balance", 0.0),
        "is_verified": user.get("is_verified", False),
        "is_approved": user.get("is_approved", False),
        "account_type": user.get("account_type", "individual"),
        "company_name": user.get("company_name", ""),
        "company_gstin": user.get("company_gstin", ""),
        "company_pan": user.get("company_pan", ""),
        "company_address": user.get("company_address", ""),
        "company_phone": user.get("company_phone", ""),
    }

    return {"access_token": token, "user": user_response}


# ─── Profile Routes ──────────────────────────────────────────────────────────

@app.get("/profile")
async def get_profile(authorization: Optional[str] = Header(None)):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "created_at": user.get("created_at", ""),
        "wallet_balance": user.get("wallet_balance", 0.0),
        "is_verified": user.get("is_verified", False),
        "is_approved": user.get("is_approved", False),
        "account_type": user.get("account_type", "individual"),
        "company_name": user.get("company_name", ""),
        "company_gstin": user.get("company_gstin", ""),
        "company_pan": user.get("company_pan", ""),
        "company_address": user.get("company_address", ""),
        "company_phone": user.get("company_phone", ""),
    }


@app.put("/profile")
async def update_profile(req: ProfileUpdate, authorization: Optional[str] = Header(None)):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)
    update_data = {}
    for field in ["full_name", "company_name", "company_gstin", "company_pan", "company_address", "company_phone"]:
        val = getattr(req, field, None)
        if val is not None:
            update_data[field] = val
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    await get_db().users.update_one({"user_id": user["user_id"]}, {"$set": update_data})
    updated = await get_db().users.find_one({"user_id": user["user_id"]})
    return {
        "detail": "Profile updated successfully",
        "user": {
            "user_id": updated["user_id"],
            "email": updated["email"],
            "full_name": updated["full_name"],
            "role": updated["role"],
            "created_at": updated.get("created_at", ""),
            "wallet_balance": updated.get("wallet_balance", 0.0),
            "company_name": updated.get("company_name", ""),
            "company_gstin": updated.get("company_gstin", ""),
            "company_pan": updated.get("company_pan", ""),
            "company_address": updated.get("company_address", ""),
            "company_phone": updated.get("company_phone", ""),
        }
    }


# ─── Wallet Routes ───────────────────────────────────────────────────────────

@app.get("/wallet")
async def get_wallet(authorization: Optional[str] = Header(None)):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)

    # Fetch latest balance from DB
    fresh_user = await get_db().users.find_one({"user_id": user["user_id"]})
    balance = fresh_user.get("wallet_balance", 0.0) if fresh_user else 0.0

    # Get wallet transactions
    cursor = get_db().wallet_transactions.find({"user_id": user["user_id"]}).sort("created_at", -1).limit(20)
    transactions = []
    async for txn in cursor:
        transactions.append(serialise(txn))

    return {"balance": balance, "transactions": transactions}


@app.post("/wallet/topup")
async def wallet_topup(req: WalletTopUp, authorization: Optional[str] = Header(None)):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)

    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    if req.amount > 100000:
        raise HTTPException(status_code=400, detail="Maximum top-up is ₹1,00,000 per transaction")

    # Update wallet balance
    await get_db().users.update_one(
        {"user_id": user["user_id"]},
        {"$inc": {"wallet_balance": req.amount}}
    )

    # Record transaction
    txn = {
        "txn_id": str(uuid.uuid4()),
        "user_id": user["user_id"],
        "type": "credit",
        "amount": req.amount,
        "description": "Wallet Top-up",
        "created_at": datetime.utcnow().isoformat(),
    }
    await get_db().wallet_transactions.insert_one(txn)

    fresh_user = await get_db().users.find_one({"user_id": user["user_id"]})
    new_balance = fresh_user.get("wallet_balance", 0.0) if fresh_user else 0.0

    return {"detail": f"₹{req.amount:,.2f} added to wallet", "balance": new_balance}


# ─── Tender Routes ───────────────────────────────────────────────────────────

@app.get("/tenders")
async def list_tenders(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(50, le=500),
):
    query = {}

    if status:
        query["status"] = status

    if category:
        query["category"] = category

    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]

    cursor = get_db().tenders.find(query).sort("created_at", -1).limit(limit)
    tenders = []
    async for tender in cursor:
        tenders.append(serialise(tender))

    return tenders


@app.get("/tenders/{tender_id}")
async def get_tender(tender_id: str):
    tender = await get_db().tenders.find_one({"tender_id": tender_id})
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    return serialise(tender)


@app.post("/tenders")
async def create_tender(
    tender: TenderCreate,
    authorization: Optional[str] = Header(None),
):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)

    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    tender_id = str(uuid.uuid4())
    tender_doc = {
        "tender_id": tender_id,
        "title": tender.title,
        "description": tender.description,
        "price": tender.price,
        "weight": tender.weight,
        "deadline": tender.deadline,
        "image_url": tender.image_url,
        "category": tender.category,
        "status": tender.status,
        "created_by": user["user_id"],
        "created_at": datetime.utcnow().isoformat(),
    }

    await get_db().tenders.insert_one(tender_doc)
    return serialise(tender_doc)


@app.put("/tenders/{tender_id}")
async def update_tender(
    tender_id: str,
    tender: TenderCreate,
    authorization: Optional[str] = Header(None),
):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)

    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    existing = await get_db().tenders.find_one({"tender_id": tender_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Tender not found")

    update_data = {
        "title": tender.title,
        "description": tender.description,
        "price": tender.price,
        "weight": tender.weight,
        "deadline": tender.deadline,
        "image_url": tender.image_url,
        "category": tender.category,
        "status": tender.status,
        "min_order_qty": tender.min_order_qty,
        "bulk_discount_tiers": tender.bulk_discount_tiers or [],
        "updated_at": datetime.utcnow().isoformat(),
    }

    await get_db().tenders.update_one({"tender_id": tender_id}, {"$set": update_data})
    updated = await get_db().tenders.find_one({"tender_id": tender_id})
    return serialise(cast(dict, updated))


@app.delete("/tenders/{tender_id}")
async def delete_tender(
    tender_id: str,
    authorization: Optional[str] = Header(None),
):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)

    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    result = await get_db().tenders.delete_one({"tender_id": tender_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tender not found")

    return {"detail": "Tender deleted successfully"}


# ─── Order Routes ────────────────────────────────────────────────────────────

@app.post("/orders")
async def create_order(
    order: OrderCreate,
    authorization: Optional[str] = Header(None),
):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)

    if user["role"] == "admin":
        raise HTTPException(status_code=403, detail="Admin accounts cannot place orders")

    if not user.get("is_approved", False) or user.get("account_type") != "business":
        raise HTTPException(
            status_code=403, 
            detail="Only approved business accounts can place orders. Please complete your B2B profile or wait for verification."
        )

    if order.payment_method not in ("transfer", "online"):
        raise HTTPException(status_code=400, detail="payment_method must be 'transfer' or 'online'")

    # Fetch tender
    tender = await get_db().tenders.find_one({"tender_id": order.tender_id})
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    if tender.get("status") != "active":
        raise HTTPException(status_code=400, detail="Tender is not active")

    # Check min order qty
    min_qty = tender.get("min_order_qty", 1)
    if order.quantity < min_qty:
        raise HTTPException(status_code=400, detail=f"Minimum order quantity is {min_qty} units")

    # Calculate base subtotal
    subtotal = tender["price"] * order.quantity

    # Apply bulk discount if applicable
    bulk_discount_pct = 0
    bulk_tiers = tender.get("bulk_discount_tiers") or []
    for tier in sorted(bulk_tiers, key=lambda t: t.get("min_qty", 0), reverse=True):
        if order.quantity >= tier.get("min_qty", 0):
            bulk_discount_pct = tier.get("discount_pct", 0)
            break
    discount_amount = subtotal * (bulk_discount_pct / 100)
    subtotal_after_discount = subtotal - discount_amount

    tax_info = calculate_taxes(subtotal_after_discount)
    grand_total = tax_info["grand_total"]

    # Enforce Transfer limit
    if order.payment_method == "transfer" and grand_total > 5000000:
        raise HTTPException(
            status_code=400,
            detail="Bank Transfer is only available for orders below ₹5,000,000 via this gateway. Please use alternative methods."
        )

    # If online payment → deduct from wallet
    if order.payment_method == "online":
        fresh_user = await get_db().users.find_one({"user_id": user["user_id"]})
        wallet_balance = fresh_user.get("wallet_balance", 0.0) if fresh_user else 0.0

        if wallet_balance < grand_total:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient wallet balance. Required: ₹{grand_total:,.2f}, Available: ₹{wallet_balance:,.2f}"
            )

        # Deduct from wallet
        await get_db().users.update_one(
            {"user_id": user["user_id"]},
            {"$inc": {"wallet_balance": -grand_total}}
        )

        # Record wallet debit transaction
        txn = {
            "txn_id": str(uuid.uuid4()),
            "user_id": user["user_id"],
            "type": "debit",
            "amount": grand_total,
            "description": f"Payment for order - {tender['title']}",
            "created_at": datetime.utcnow().isoformat(),
        }
        await get_db().wallet_transactions.insert_one(txn)

    order_id = str(uuid.uuid4())
    now_str = datetime.utcnow().isoformat()
    slip_no = f"TF-{datetime.utcnow().strftime('%Y%m%d')}-{order_id[:6].upper()}"
    po_number = f"PO-{datetime.utcnow().strftime('%Y%m%d%H%M')}-{order_id[:4].upper()}"

    # Order tracking timeline
    timeline = [
        {"status": "pending", "label": "Order Placed", "timestamp": now_str}
    ]

    order_doc = {
        "order_id": order_id,
        "slip_no": slip_no,
        "po_number": po_number,
        "tender_id": order.tender_id,
        "tender_title": tender["title"],
        "user_id": user["user_id"],
        "user_name": user["full_name"],
        "user_email": user["email"],
        "buyer_company": user.get("company_name", ""),
        "buyer_gstin": user.get("company_gstin", ""),
        "quantity": order.quantity,
        "unit_price": tender["price"],
        "bulk_discount_pct": bulk_discount_pct,
        "discount_amount": round(discount_amount, 2),
        "subtotal": tax_info["subtotal"],
        "sgst_rate": tax_info["sgst_rate"],
        "cgst_rate": tax_info["cgst_rate"],
        "sgst_amount": tax_info["sgst_amount"],
        "cgst_amount": tax_info["cgst_amount"],
        "total_tax": tax_info["total_tax"],
        "total_price": grand_total,
        "payment_method": order.payment_method,
        "payment_status": "paid" if order.payment_method == "online" else "pending",
        "notes": order.notes,
        "delivery_address": order.delivery_address or user.get("company_address", ""),
        "delivery_city": order.delivery_city or "",
        "delivery_state": order.delivery_state or "",
        "delivery_pincode": order.delivery_pincode or "",
        "status": "pending",
        "timeline": timeline,
        "created_at": now_str,
        # Seller company info
        "company_name": COMPANY_NAME,
        "company_gst_no": COMPANY_GST_NO,
        "company_address": COMPANY_ADDRESS,
    }

    await get_db().orders.insert_one(order_doc)
    return serialise(order_doc)


@app.get("/orders")
async def list_orders(
    authorization: Optional[str] = Header(None),
):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)

    # Admin sees all orders, customer sees only their own
    if user["role"] == "admin":
        query = {}
    else:
        query = {"user_id": user["user_id"]}

    cursor = get_db().orders.find(query).sort("created_at", -1)
    orders = []
    async for order in cursor:
        orders.append(serialise(order))

    return orders


@app.get("/orders/{order_id}")
async def get_order(order_id: str, authorization: Optional[str] = Header(None)):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)

    order = await get_db().orders.find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if user["role"] != "admin" and order["user_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return serialise(order)


@app.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status_update: StatusUpdate,
    authorization: Optional[str] = Header(None),
):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)

    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    valid_statuses = ["pending", "confirmed", "processing", "dispatched", "delivered", "cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {valid_statuses}")

    order = await get_db().orders.find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    old_status = order.get("status", "")
    now_str = datetime.utcnow().isoformat()

    # Add to timeline
    timeline = order.get("timeline", [])
    label = ORDER_STATUS_LABELS.get(status_update.status, status_update.status.capitalize())
    timeline.append({"status": status_update.status, "label": label, "timestamp": now_str})

    result = await get_db().orders.update_one(
        {"order_id": order_id},
        {"$set": {"status": status_update.status, "updated_at": now_str, "timeline": timeline}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")

    # ─── Refund Logic ─────────────────────────────────
    # Refund if: new status = cancelled AND old was not cancelled AND payment was online
    if (
        status_update.status == "cancelled"
        and old_status != "cancelled"
        and order.get("payment_method") == "online"
        and order.get("payment_status") == "paid"
    ):
        refund_amount = order.get("total_price", 0.0)
        customer_user_id = order["user_id"]

        # Credit wallet
        await get_db().users.update_one(
            {"user_id": customer_user_id},
            {"$inc": {"wallet_balance": refund_amount}}
        )

        # Record refund transaction
        refund_txn = {
            "txn_id": str(uuid.uuid4()),
            "user_id": customer_user_id,
            "type": "refund",
            "amount": refund_amount,
            "description": f"Refund for cancelled order - {order.get('tender_title', '')} (#{order.get('slip_no', order_id)})",
            "order_id": order_id,
            "created_at": datetime.utcnow().isoformat(),
        }
        await get_db().wallet_transactions.insert_one(refund_txn)

        # Update payment status
        await get_db().orders.update_one(
            {"order_id": order_id},
            {"$set": {"payment_status": "refunded"}}
        )

        return {"detail": "Order cancelled and ₹{:,.2f} refunded to wallet".format(refund_amount)}

    # Update payment status to paid when delivered via offline transfer
    if status_update.status == "delivered" and order.get("payment_method") == "transfer":
        await get_db().orders.update_one(
            {"order_id": order_id},
            {"$set": {"payment_status": "paid"}}
        )

    # Queue an email dispatch logic 
    import asyncio
    try:
        if order.get("user_email"):
            asyncio.create_task(
                send_status_update_email(
                    order.get("user_email"),
                    order.get("user_name", "Customer"),
                    order_id,
                    status_update.status,
                    order.get("tender_title", "Tender")
                )
            )
    except Exception as e:
        print(f"Failed to queue email task: {e}")

    return {"detail": "Order status updated", "status": status_update.status}


@app.post("/orders/{order_id}/cancel")
async def cancel_order_by_customer(
    order_id: str,
    authorization: Optional[str] = Header(None),
):
    """Allow customer to cancel their own pending order."""
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)

    order = await get_db().orders.find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order["user_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    if order.get("status") not in ("pending",):
        raise HTTPException(status_code=400, detail="Only pending orders can be cancelled")

    await get_db().orders.update_one(
        {"order_id": order_id},
        {"$set": {"status": "cancelled", "updated_at": datetime.utcnow().isoformat()}}
    )

    # Refund if online payment
    refund_msg = ""
    if order.get("payment_method") == "online" and order.get("payment_status") == "paid":
        refund_amount = order.get("total_price", 0.0)
        await get_db().users.update_one(
            {"user_id": user["user_id"]},
            {"$inc": {"wallet_balance": refund_amount}}
        )
        refund_txn = {
            "txn_id": str(uuid.uuid4()),
            "user_id": user["user_id"],
            "type": "refund",
            "amount": refund_amount,
            "description": f"Refund for cancelled order - {order.get('tender_title', '')} (#{order.get('slip_no', order_id)})",
            "order_id": order_id,
            "created_at": datetime.utcnow().isoformat(),
        }
        await get_db().wallet_transactions.insert_one(refund_txn)
        await get_db().orders.update_one(
            {"order_id": order_id},
            {"$set": {"payment_status": "refunded"}}
        )
        refund_msg = f" ₹{refund_amount:,.2f} refunded to your wallet."

    import asyncio
    try:
        if order.get("user_email"):
            asyncio.create_task(
                send_status_update_email(
                    order.get("user_email"),
                    order.get("user_name", "Customer"),
                    order_id,
                    "cancelled",
                    order.get("tender_title", "Tender")
                )
            )
    except Exception as e:
        print(f"Failed to queue email task: {e}")

    return {"detail": f"Order cancelled.{refund_msg}"}


@app.get("/orders/{order_id}/slip")
async def get_payment_slip(order_id: str, authorization: Optional[str] = Header(None)):
    """Return full order details for payment slip generation."""
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)

    order = await get_db().orders.find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if user["role"] != "admin" and order["user_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    slip_data = serialise(order)
    # Ensure all required fields exist for older orders without tax breakdown
    slip_data.setdefault("company_name", COMPANY_NAME)
    slip_data.setdefault("company_gst_no", COMPANY_GST_NO)
    slip_data.setdefault("company_address", COMPANY_ADDRESS)
    slip_data.setdefault("subtotal", order.get("unit_price", 0) * order.get("quantity", 1))
    slip_data.setdefault("sgst_rate", SGST_RATE)
    slip_data.setdefault("cgst_rate", CGST_RATE)
    slip_data.setdefault("sgst_amount", round(slip_data["subtotal"] * SGST_RATE / 100, 2))
    slip_data.setdefault("cgst_amount", round(slip_data["subtotal"] * CGST_RATE / 100, 2))
    slip_data.setdefault("total_tax", slip_data["sgst_amount"] + slip_data["cgst_amount"])
    slip_data.setdefault("payment_method", "transfer")
    slip_data.setdefault("payment_status", "pending")
    slip_data.setdefault("slip_no", f"TF-{order_id[:8].upper()}")

    return slip_data


# ─── Admin User Management ────────────────────────────────────────────────────

@app.get("/admin/users/pending")
async def get_pending_users(authorization: Optional[str] = Header(None)):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    cursor = get_db().users.find({"is_approved": False, "role": "customer"}).sort("created_at", -1)
    users = []
    async for u in cursor:
        users.append(serialise(u))
    return users


@app.post("/admin/users/{user_id}/approve")
async def approve_user(user_id: str, authorization: Optional[str] = Header(None)):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    result = await get_db().users.update_one(
        {"user_id": user_id},
        {"$set": {"is_approved": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"detail": "User account approved"}


@app.post("/admin/users/{user_id}/reject")
async def reject_user(user_id: str, authorization: Optional[str] = Header(None)):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    # For now, rejection just keeps them as is_approved=False or we could delete/disable
    # Let's just set a flag if needed, but for now we'll just allow un-approval
    result = await get_db().users.update_one(
        {"user_id": user_id},
        {"$set": {"is_approved": False}}
    )
    return {"detail": "User account rejection status updated"}


@app.get("/admin/users")
async def get_all_users(authorization: Optional[str] = Header(None)):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    cursor = get_db().users.find({"role": {"$ne": "admin"}}).sort("created_at", -1)
    users = []
    async for u in cursor:
        users.append(serialise(u))
    return users


@app.put("/admin/users/{user_id}/account-type")
async def update_user_account_type(user_id: str, req: dict, authorization: Optional[str] = Header(None)):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    new_type = req.get("account_type")
    if new_type not in ("business", "individual"):
        raise HTTPException(status_code=400, detail="Invalid account type")

    # If changing to individual, we auto-approve
    is_approved = True if new_type == "individual" else False
    
    await get_db().users.update_one(
        {"user_id": user_id},
        {"$set": {"account_type": new_type, "is_approved": is_approved}}
    )
    return {"detail": f"Account type updated to {new_type}"}


# ─── Admin Analytics ─────────────────────────────────────────────────────────

@app.get("/admin/analytics")
async def admin_analytics(
    authorization: Optional[str] = Header(None),
):
    token = extract_token(cast(str, authorization))
    user = await get_current_user(token)

    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    total_orders = await get_db().orders.count_documents({})

    revenue_pipeline = [
        {"$match": {"status": {"$ne": "cancelled"}}},
        {"$group": {
            "_id": None, 
            "total_revenue": {"$sum": "$total_price"},
            "total_tax": {"$sum": "$total_tax"},
            "total_discount": {"$sum": "$discount_amount"}
        }}
    ]
    revenue_result = await get_db().orders.aggregate(revenue_pipeline).to_list(1)
    rev_data = revenue_result[0] if revenue_result else {"total_revenue": 0, "total_tax": 0, "total_discount": 0}

    active_tenders = await get_db().tenders.count_documents({"status": "active"})
    total_customers = await get_db().users.count_documents({"role": "customer"})
    pending_orders = await get_db().orders.count_documents({"status": "pending"})
    cancelled_orders = await get_db().orders.count_documents({"status": "cancelled"})
    pending_approvals = await get_db().users.count_documents({"is_approved": False, "role": "customer"})

    # Top customers
    top_customers_pipeline = [
        {"$match": {"status": {"$ne": "cancelled"}}},
        {"$group": {
            "_id": "$user_id",
            "name": {"$first": "$user_name"},
            "company": {"$first": "$buyer_company"},
            "total_spent": {"$sum": "$total_price"},
            "order_count": {"$sum": 1}
        }},
        {"$sort": {"total_spent": -1}},
        {"$limit": 5}
    ]
    top_customers = await get_db().orders.aggregate(top_customers_pipeline).to_list(5)

    recent_cursor = get_db().orders.find().sort("created_at", -1).limit(10)
    recent_orders = []
    async for order in recent_cursor:
        recent_orders.append(serialise(order))

    # Calculate status distribution
    status_dist = []
    status_cursor = get_db().orders.aggregate([
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ])
    async for stat in status_cursor:
        status_dist.append({"status": stat["_id"], "count": stat["count"]})

    return {
        "total_orders": total_orders,
        "total_revenue": rev_data["total_revenue"],
        "total_tax": rev_data["total_tax"],
        "total_discount": rev_data["total_discount"],
        "active_tenders": active_tenders,
        "total_customers": total_customers,
        "pending_orders": pending_orders,
        "cancelled_orders": cancelled_orders,
        "pending_approvals": pending_approvals,
        "status_distribution": status_dist,
        "top_customers": top_customers,
        "recent_orders": recent_orders,
    }


# ─── File Upload ─────────────────────────────────────────────────────────────

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image and return the relative path for accessing it."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        filename_str = file.filename or "image"
        extension = filename_str.split(".")[-1] if "." in filename_str else "jpg"
        extension = extension.lower().replace(".", "")
        filename = f"{uuid.uuid4()}.{extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {"image_url": f"/uploads/{filename}", "filename": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")


@app.get("/proxy-image")
async def proxy_image(url: str):
    """Proxy external images to bypass CORS, Referrer, and Hotlinking restrictions."""
    try:
        url = url.strip()

        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
                "Sec-Fetch-Dest": "image",
                "Sec-Fetch-Mode": "no-cors",
                "Sec-Fetch-Site": "cross-site",
                "Referer": url,
            }

            resp = await client.get(url, headers=headers)

            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail=f"Target server returned {resp.status_code}")

            content_type = resp.headers.get("Content-Type", "image/jpeg")

            return Response(
                content=resp.content,
                media_type=content_type,
                headers={
                    "Cache-Control": "public, max-age=31536000",
                    "Access-Control-Allow-Origin": "*",
                    "X-Proxied-By": "TenderFlow"
                }
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Proxy error: {str(e)}")


# ─── Health Check ────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "database": "mongodb"}


# ─── Run ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
