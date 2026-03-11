"""
Import db_export JSON files into MongoDB Atlas.
Drops existing collections and imports fresh data.
"""
import asyncio
import json
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://gargiparab7_db_user:vEJt4wQ0rvEuIzb9@cluster0.lyibl3t.mongodb.net/tenderflow")

EXPORT_DIR = os.path.join(os.path.dirname(__file__), "..", "db_export")

COLLECTIONS = ["users", "tenders", "orders", "wallet_transactions"]


async def import_data():
    client = AsyncIOMotorClient(MONGO_URI)
    db_name = MONGO_URI.rsplit("/", 1)[-1].split("?")[0] if "/" in MONGO_URI else "tenderflow"
    db = client[db_name]

    for collection_name in COLLECTIONS:
        json_file = os.path.join(EXPORT_DIR, f"{collection_name}.json")
        if not os.path.exists(json_file):
            print(f"SKIP: {json_file} not found")
            continue

        with open(json_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        if not data:
            print(f"SKIP: {collection_name} is empty")
            continue

        # Remove _id fields to let MongoDB generate new ObjectIds
        for doc in data:
            if "_id" in doc:
                del doc["_id"]

        # Drop existing collection and insert fresh data
        await db[collection_name].drop()
        result = await db[collection_name].insert_many(data)
        print(f"OK: Imported {len(result.inserted_ids)} documents into '{collection_name}'")

    print("Done! All collections imported to Atlas.")
    client.close()


if __name__ == "__main__":
    asyncio.run(import_data())
