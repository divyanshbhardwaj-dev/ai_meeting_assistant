import token

from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.services.google_service import SCOPES
from app.dependencies.auth import get_current_user
from app.utils.logger import setup_logger
from app.config.settings import settings
import requests
from urllib.parse import urlencode

logger = setup_logger(__name__)

router = APIRouter(prefix="/auth/google")


@router.get("/login")
def login():
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "prompt":"consent",        # 🔥 forces re-consent
        "access_type":"offline",   # 🔥 ensures refresh_token
        "include_granted_scopes":"false",  # 🔥 VERY IMPORTANT
        "response_type":"code",
        "scope":" ".join(SCOPES),
        "state":token
    }
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return {"auth_url": auth_url}


@router.get("/exchange-code")
def exchange_code(
    request: Request,
    code: str = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")
        
    logger.info(f"--- START TOKEN EXCHANGE ---")
    logger.info(f"User from JWT: {user.email} (ID: {user.id})")
    
    try:
        # Manual exchange using requests to avoid PKCE/state issues
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        
        logger.info(f"Exchanging code with redirect_uri: {settings.GOOGLE_REDIRECT_URI}")
        response = requests.post(token_url, data=data)
        tokens = response.json()
        
        if response.status_code != 200:
            logger.error(f"Google Token Exchange Failed: {tokens}")
            raise HTTPException(status_code=400, detail=f"Google Error: {tokens.get('error_description', 'Unknown error')}")

        access_token = tokens.get("access_token")
        refresh_token = tokens.get("refresh_token")
        
        if not access_token:
            logger.error("No access token received from Google")
            raise HTTPException(status_code=400, detail="No access token received")

        logger.info(f"Google tokens fetched successfully. Refresh token present: {bool(refresh_token)}")

        # Manual update to ensure persistence
        db.query(User).filter(User.id == user.id).update({
            "google_access_token": access_token,
            "google_refresh_token": refresh_token if refresh_token else User.google_refresh_token
        })
        
        db.commit()
        
        # Verify immediately
        db.refresh(user)
        logger.info(f"Post-commit check - User: {user.email}, AT set: {bool(user.google_access_token)}")
        
        return {"message": "Google connected", "is_connected": True}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"FATAL ERROR in exchange_code: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    finally:
        logger.info(f"--- END TOKEN EXCHANGE ---")

@router.get("/status")
def get_google_status(user=Depends(get_current_user)):
    from app.services.google_calendar_service import get_google_user_info
    google_info = get_google_user_info(user)
    return {
        "is_connected": bool(user.google_access_token),
        "email": user.email,
        "google_info": google_info
    }

@router.get("/events")
def get_events(user=Depends(get_current_user)):
    from app.services.google_calendar_service import get_calendar_events
    events = get_calendar_events(user)
    return events