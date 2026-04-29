from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Meeting
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter(prefix="/transcriptions", tags=["Transcriptions"])


# ✅ Get formatted transcript
@router.get("/{meeting_id}")
def get_transcript(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if not meeting:
        return {"error": "Meeting not found"}

    return {
        "meeting_id": meeting.id,
        "transcript_text": meeting.transcript_text
    }


# ✅ Get raw transcript JSON
@router.get("/{meeting_id}/raw")
def get_raw_transcript(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if not meeting:
        return {"error": "Meeting not found"}

    return {
        "meeting_id": meeting.id,
        "transcript_raw": meeting.transcript_raw
    }