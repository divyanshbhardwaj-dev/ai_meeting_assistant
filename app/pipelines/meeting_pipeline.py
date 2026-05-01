import requests

from app.services.recall_ai_service import RecallService
from app.processors.transcript_processor import TranscriptProcessor
from app.ai_agents.openAI_transcript_analyzer import OpenAITranscriptAnalyzer 
from app.utils.logger import setup_logger
import json
from app.db.models import Meeting, Task, Participant
from sqlalchemy.orm import Session
from datetime import datetime

logger = setup_logger(__name__)

class MeetingPipeline:

    def __init__(self):
        self.recall = RecallService()

    def parse_iso_date(self, date_str):
        if not date_str:
            return None
        try:
            # Handle YYYY-MM-DD or full ISO
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            logger.warning(f"Failed to parse date string: {date_str}")
            return None

    def save_participants(self, db, meeting, transcript_json):
        # Unique participants from transcript
        transcript_names = set()
        for block in transcript_json:
            name = block.get("participant", {}).get("name")
            if name:
                transcript_names.add(name)
        
        # Get attendee map from Google Calendar data if available
        attendee_map = {}
        if meeting.google_event_data and "attendees" in meeting.google_event_data:
            for attendee in meeting.google_event_data["attendees"]:
                a_name = attendee.get("displayName") or attendee.get("email", "").split("@")[0]
                a_email = attendee.get("email")
                if a_name and a_email:
                    attendee_map[a_name.lower()] = a_email

        logger.info(f"Cross-referencing {len(transcript_names)} names with {len(attendee_map)} calendar attendees")

        for name in transcript_names:
            # Try to find email in calendar data
            email = attendee_map.get(name.lower())
            
            participant = Participant(
                meeting_id=meeting.id,
                name=name,
                email=email,
                is_organizer="False"
            )
            db.add(participant)
        
        db.commit()

    def save_tasks(self, db, meeting_id, tasks):
        for t in tasks:
            task = Task(
                meeting_id=meeting_id,
                task=t.get("task"),
                owner_name=t.get("owner"),
                priority=t.get("priority", "medium"),
                due_date=self.parse_iso_date(t.get("due_date")),
            )
            db.add(task)

        db.commit()


    def run(self, db, meeting):
        try:
            meeting_url = meeting.meeting_url

            logger.info(f"🤖 Creating bot for URL: {meeting_url}")
            bot = self.recall.create_bot(meeting_url)

            bot_id = bot["id"]

            meeting.bot_id = bot_id
            db.commit()

            logger.info(f"⏳ Waiting for transcript for bot_id: {bot_id}")
            transcript_url = self.recall.wait_for_transcript(bot_id)

            logger.info("📥 Fetching transcript...")
            transcript_json = requests.get(transcript_url).json()

            # ✅ Use actual transcript data
            meeting.transcript_raw = transcript_json
            db.commit()

            logger.info("🧾 Formatting transcript...")
            formatted = TranscriptProcessor.format(transcript_json)

            meeting.transcript_text = formatted
            db.commit()

            # ✅ Save Participants
            logger.info("👥 Saving participants...")
            self.save_participants(db, meeting, transcript_json)

            logger.info("🧠 Running AI analysis...")
            result = OpenAITranscriptAnalyzer.analyze(formatted)

            result_json = json.loads(result)

            # save title
            title = result_json.get("title", f"Meeting {meeting.id}")
            meeting.title = title

            # Save summary
            summary = result_json.get("summary")
            meeting.summary = summary
            logger.info(f"Summary generated: {summary[:50]}...")

            meeting.status = "completed"
            db.commit()

            # Save tasks
            self.save_tasks(db, meeting.id, result_json.get("action_items", []))

            return result_json

        except Exception as e:
            logger.error(f"Pipeline failed: {str(e)}")

            meeting.status = "failed"
            db.commit()

            raise
    

