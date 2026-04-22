import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    RECALL_API_KEY = os.getenv("RECALL_API_KEY")
    BASE_URL = os.getenv("BASE_URL")

settings = Settings()