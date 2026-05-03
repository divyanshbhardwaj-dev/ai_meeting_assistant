from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from app.config.settings import settings
from datetime import datetime, timezone
import requests
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


def get_calendar_events(user):
    if not user.google_access_token:
        logger.warning(f"User {user.email} has no Google access token")
        return []

    creds = Credentials(
        token=user.google_access_token,
        refresh_token=user.google_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET
    )

    try:
        service = build("calendar", "v3", credentials=creds)

        events = service.events().list(
            calendarId="primary",
            maxResults=10,
            singleEvents=True,
            orderBy="startTime",
            timeMin=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        ).execute()

        return events.get("items", [])
    except Exception as e:
        logger.error(f"Error fetching calendar events for {user.email}: {str(e)}")
        return []

def get_google_user_info(user):
    if not user.google_access_token:
        return None
        
    try:
        url = "https://www.googleapis.com/oauth2/v3/userinfo"
        headers = {"Authorization": f"Bearer {user.google_access_token}"}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching Google user info for {user.email}: {str(e)}")
        return None