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
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:8000,http://127.0.0.1:8000").split(",")

    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")
    APP_PUBLIC_URL = os.getenv("APP_PUBLIC_URL", "http://localhost:8000")

    def __init__(self):
        if not self.OPEN_API_KEY:
            logger.warning("OPEN_API_KEY is not set in environment variables.")
        if not self.RECALL_API_KEY:
            logger.warning("RECALL_API_KEY is not set in environment variables.")
        if not self.BASE_URL:
            logger.warning("BASE_URL is not set in environment variables.")
        if not self.GOOGLE_CLIENT_ID:
            logger.warning("GOOGLE_CLIENT_ID is not set in environment variables.")
        if not self.GOOGLE_CLIENT_SECRET:
            logger.warning("GOOGLE_CLIENT_SECRET is not set in environment variables.")

settings = Settings()
