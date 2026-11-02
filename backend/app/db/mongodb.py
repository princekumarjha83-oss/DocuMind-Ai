"""MongoDB Atlas async client configuration using Motor."""
import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger(__name__)

class MongoDBManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

    @classmethod
    def get_client(cls) -> Optional[AsyncIOMotorClient]:
        if cls.client is None and settings.MONGODB_URL:
            try:
                cls.client = AsyncIOMotorClient(
                    settings.MONGODB_URL,
                    serverSelectionTimeoutMS=5000
                )
                cls.db = cls.client[settings.MONGODB_DB_NAME]
                logger.info("Connected to MongoDB Atlas cluster")
            except Exception as e:
                logger.error(f"Failed to initialize MongoDB client: {e}")
        return cls.client

    @classmethod
    def get_database(cls) -> Optional[AsyncIOMotorDatabase]:
        if cls.db is None:
            cls.get_client()
        return cls.db

    @classmethod
    async def ping(cls) -> bool:
        if not settings.MONGODB_URL:
            return False
        try:
            client = cls.get_client()
            if client:
                await client.admin.command("ping")
                return True
        except Exception as e:
            logger.warning(f"MongoDB ping failed: {e}")
            return False
        return False

mongodb_manager = MongoDBManager()

