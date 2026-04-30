import os
from dotenv import load_dotenv
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

load_dotenv()


class Settings:
    OPEN_API_KEY = os.getenv("OPEN_API_KEY")
    RECALL_API_KEY = os.getenv("RECALL_API_KEY")
    BASE_URL = os.getenv("BASE_URL")
    AUTH_SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "supersecret")
    ALGORITHM = "HS256"

    def __init__(self):
        if not self.OPEN_API_KEY:
            logger.warning("OPEN_API_KEY is not set in environment variables.")
        if not self.RECALL_API_KEY:
            logger.warning("RECALL_API_KEY is not set in environment variables.")
        if not self.BASE_URL:
            logger.warning("BASE_URL is not set in environment variables.")

settings = Settings()
