import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load env variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/tenderflow")

tenders_data = [
    {
        "title": "Spanner Set Tender",
        "description": "Supply of spanner sets used for tightening and loosening railway bolts and nuts during track maintenance.",
        "price": 450,
        "weight": "0.8 kg",
        "category": "Hand Tools"
    },
    {
        "title": "Hammer Tender",
        "description": "Supply of heavy-duty hammers used for fixing spikes and fittings in railway tracks.",
        "price": 350,
        "weight": "1 kg",
        "category": "Hand Tools"
    },
    {
        "title": "Screwdriver Set Tender",
        "description": "Supply of screwdriver sets used for small railway equipment maintenance and repair work.",
        "price": 300,
        "weight": "0.4 kg",
        "category": "Hand Tools"
    },
    {
        "title": "Measuring Tape Tender",
        "description": "Supply of measuring tapes used for measuring railway track distance and materials during inspection.",
        "price": 250,
        "weight": "0.3 kg",
        "category": "Measuring Tools"
    },
    {
        "title": "Allen Key Set Tender",
        "description": "Supply of allen key sets used for tightening hex bolts in railway equipment.",
        "price": 400,
        "weight": "0.2 kg",
        "category": "Hand Tools"
    },
    {
        "title": "Safety Gloves Tender",
        "description": "Supply of protective safety gloves for railway workers during track maintenance.",
        "price": 200,
        "weight": "0.1 kg",
        "category": "Safety Equipment"
    },
    {
        "title": "Reflective Safety Vest Tender",
        "description": "Supply of reflective safety vests used to increase visibility of railway workers near tracks.",
        "price": 350,
        "weight": "0.2 kg",
        "category": "Safety Equipment"
    },
    {
        "title": "Track Marker Chalk Tender",
        "description": "Supply of chalk used for marking positions on railway tracks during inspection or repair work.",
        "price": 50,
        "weight": "0.05 kg",
        "category": "Marking Tools"
    },
    {
        "title": "Wire Brush Tender",
        "description": "Supply of wire brushes used for cleaning rust and dirt from railway metal components.",
        "price": 150,
        "weight": "0.25 kg",
        "category": "Cleaning Tools"
    },
    {
        "title": "Adjustable Wrench Tender",
        "description": "Supply of adjustable wrenches used for tightening and loosening different sizes of nuts and bolts.",
        "price": 600,
        "weight": "0.7 kg",
        "category": "Hand Tools"
    },
    {
        "title": "Pliers Tender",
        "description": "Supply of pliers used for gripping, bending, and cutting wires during railway electrical and maintenance work.",
        "price": 350,
        "weight": "0.3 kg",
        "category": "Hand Tools"
    },
    {
        "title": "Hand Saw Tender",
        "description": "Supply of hand saws used for cutting small wooden parts or materials during railway maintenance.",
        "price": 500,
        "weight": "0.6 kg",
        "category": "Cutting Tools"
    },
    {
        "title": "Metal File Tender",
        "description": "Supply of metal files used for smoothing rough edges of railway metal components.",
        "price": 220,
        "weight": "0.25 kg",
        "category": "Finishing Tools"
    },
    {
        "title": "Safety Helmet Tender",
        "description": "Supply of protective helmets used by railway workers during construction and maintenance work.",
        "price": 750,
        "weight": "0.4 kg",
        "category": "Safety Equipment"
    },
    {
        "title": "Electrical Tester Tender",
        "description": "Supply of electrical testers used for checking voltage in railway electrical systems.",
        "price": 180,
        "weight": "0.15 kg",
        "category": "Electrical Tools"
    },
    {
        "title": "Insulation Tape Tender",
        "description": "Supply of insulation tape used for protecting and covering railway electrical wires.",
        "price": 90,
        "weight": "0.05 kg",
        "category": "Electrical Materials"
    },
    {
        "title": "Lubricating Oil Can Tender",
        "description": "Supply of small oil cans used for lubricating railway machine parts and joints.",
        "price": 300,
        "weight": "0.35 kg",
        "category": "Maintenance Tools"
    },
    {
        "title": "Steel Ruler Tender",
        "description": "Supply of steel rulers used for accurate measurement during railway equipment maintenance.",
        "price": 120,
        "weight": "0.1 kg",
        "category": "Measuring Tools"
    },
    {
        "title": "Dust Mask Tender",
        "description": "Supply of dust masks used by railway workers for protection from dust during maintenance work.",
        "price": 80,
        "weight": "0.05 kg",
        "category": "Safety Equipment"
    },
    {
        "title": "Cable Tie Pack Tender",
        "description": "Supply of cable ties used for organizing and securing electrical wires in railway systems.",
        "price": 150,
        "weight": "0.2 kg",
        "category": "Electrical Accessories"
    }
]

async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db_name = MONGO_URI.rsplit("/", 1)[-1] if "/" in MONGO_URI else "tenderflow"
    db = client[db_name]
    
    # Get admin user ID
    admin = await db.users.find_one({"role": "admin"})
    admin_id = admin["user_id"] if admin else "admin-system"

    # Set deadline to 30 days from now
    deadline = (datetime.utcnow() + timedelta(days=30)).isoformat()
    
    docs_to_insert = []
    
    for item in tenders_data:
        # Check if already exists by title
        exists = await db.tenders.find_one({"title": item["title"]})
        
        doc = {
            "title": item["title"],
            "description": item["description"],
            "price": float(item["price"]),
            "weight": item["weight"],
            "category": item["category"],
            "image_url": None, # "with no image" as requested
            "status": "active",
            "deadline": deadline,
            "created_by": admin_id,
            "created_at": datetime.utcnow().isoformat(),
            "min_order_qty": 1,
            "bulk_discount_tiers": []
        }
        
        if exists:
            # Update
            await db.tenders.update_one({"title": item["title"]}, {"$set": doc})
            print(f"UPDATED: {item['title']}")
        else:
            # Insert
            doc["tender_id"] = str(uuid.uuid4())
            docs_to_insert.append(doc)
            print(f"PREPARED: {item['title']}")

    if docs_to_insert:
        await db.tenders.insert_many(docs_to_insert)
        print(f"Inserted {len(docs_to_insert)} new tenders.")
    
    print(f"Seeding completed.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
