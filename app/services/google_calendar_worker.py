from datetime import datetime, timezone
import threading
from app.services.google_calendar_service import get_calendar_events
from app.db.database import SessionLocal
from app.db.models import Meeting, User
from app.pipelines.meeting_pipeline import MeetingPipeline
from app.utils.logger import setup_logger

logger = setup_logger(__name__)
pipeline = MeetingPipeline()

def run_pipeline_async(meeting_id):
    db = SessionLocal()
    try:
        meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if meeting:
            pipeline.run(db, meeting)
    except Exception as e:
        logger.error(f"Async pipeline failed for meeting {meeting_id}: {str(e)}")
    finally:
        db.close()

def process_calendar_events():
    db = SessionLocal()
    try:
        users = db.query(User).filter(User.google_access_token.isnot(None)).all()
        logger.info(f"Checking calendar for {len(users)} users")

        for user in users:
            try:
                events = get_calendar_events(user)
                logger.info(f"Found {len(events)} events for user {user.email}")

                for event in events:
                    meet_link = event.get("hangoutLink")
                    event_id = event.get("id")
                    summary = event.get("summary", "Untitled Meeting")

                    if not meet_link or not event_id:
                        continue

                    # ✅ prevent duplicate meetings
                    existing = db.query(Meeting).filter_by(
                        google_event_id=event_id
                    ).first()

                    if existing:
                        continue

                    # ⏰ check meeting start time
                    start_time = event["start"].get("dateTime")
                    if not start_time:
                        continue

                    start_dt = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
                    now = datetime.now(timezone.utc)

                    # only trigger if meeting is about to start or started recently
                    diff = (start_dt - now).total_seconds()
                    # Join if meeting starts in the next 2 minutes OR started in the last 5 minutes
                    if not (-300 <= diff <= 120):
                        continue

                    logger.info(f"🚀 Auto joining meeting '{summary}': {meet_link}")

                    # ✅ CREATE DB ENTRY
                    meeting = Meeting(
                        meeting_url=meet_link,
                        status="processing",
                        user_id=user.id,
                        google_event_id=event_id,
                        google_event_data=event, # 🔥 Store full event JSON
                        title=summary
                    )

                    db.add(meeting)
                    db.commit()
                    db.refresh(meeting)

                    # ✅ RUN PIPELINE ASYNC
                    thread = threading.Thread(target=run_pipeline_async, args=(meeting.id,))
                    thread.start()
            except Exception as e:
                logger.error(f"Error processing calendar for user {user.email}: {str(e)}")
                
    except Exception as e:
        logger.error(f"Error in process_calendar_events: {str(e)}")
    finally:
        db.close()