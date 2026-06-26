from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
import logging

from app.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class Database:
    """
    Singleton async MongoDB client wrapper.
    Manages connection lifecycle via FastAPI startup/shutdown events.
    """

    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

    @classmethod
    async def connect(cls) -> None:
        """Initialize the Motor async client and select the database."""
        logger.info("Connecting to MongoDB...")
        cls.client = AsyncIOMotorClient(
            settings.MONGO_URI,
            maxPoolSize=10,
            minPoolSize=1,
            serverSelectionTimeoutMS=5000,
        )
        cls.db = cls.client[settings.DATABASE_NAME]

        # Verify connection
        await cls.client.admin.command("ping")
        logger.info(f"Connected to MongoDB database: '{settings.DATABASE_NAME}'")

        # Create indexes
        await cls._create_indexes()

    @classmethod
    async def disconnect(cls) -> None:
        """Close the Motor client on application shutdown."""
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed.")

    @classmethod
    async def _create_indexes(cls) -> None:
        """Create all required indexes for the leads collection."""
        leads_collection = cls.db["leads"]

        await leads_collection.create_index("email", unique=True)
        await leads_collection.create_index("tracking_token", unique=True, sparse=True)
        await leads_collection.create_index("click_token", unique=True, sparse=True)
        await leads_collection.create_index("created_at")
        await leads_collection.create_index("email_sent")
        await leads_collection.create_index("email_opened")
        await leads_collection.create_index("link_clicked")

        logger.info("MongoDB indexes created successfully.")

    @classmethod
    def get_db(cls) -> AsyncIOMotorDatabase:
        """Return the active database instance."""
        if cls.db is None:
            raise RuntimeError("Database not initialized. Call Database.connect() first.")
        return cls.db


# Dependency injection helper for FastAPI routes
async def get_database() -> AsyncIOMotorDatabase:
    return Database.get_db()
