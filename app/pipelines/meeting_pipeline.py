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
        # Unique participants from transcript using their Recall ID
        unique_participants = {} # recall_id -> name
        for block in transcript_json:
            p_info = block.get("participant", {})
            p_id = p_info.get("id")
            name = p_info.get("name")
            if p_id and name:
                unique_participants[p_id] = name
        
        # Get attendee map from Google Calendar data if available
        attendee_map = {}
        
        # If google_event_data is missing, try to fetch it if we have a user with google tokens
        if not meeting.google_event_data and meeting.user and meeting.user.google_access_token:
            try:
                from app.services.google_calendar_service import get_calendar_events
                events = get_calendar_events(meeting.user)
                for event in events:
                    if event.get("hangoutLink") == meeting.meeting_url:
                        meeting.google_event_id = event.get("id")
                        meeting.google_event_data = event
                        db.commit()
                        logger.info(f"Dynamically found matching Google event for meeting {meeting.id}")
                        break
            except Exception as e:
                logger.error(f"Failed to dynamically fetch calendar data: {str(e)}")

        if meeting.google_event_data and "attendees" in meeting.google_event_data:
            logger.info(f"Processing {len(meeting.google_event_data['attendees'])} attendees from Google data")
            for attendee in meeting.google_event_data["attendees"]:
                a_email = attendee.get("email")
                if not a_email:
                    continue
                
                # Store by exact email (Recall often uses email if display name is missing)
                attendee_map[a_email.lower()] = a_email

                # Store by full name
                a_name = attendee.get("displayName")
                if a_name:
                    attendee_map[a_name.lower()] = a_email
                
                # Store by email prefix (common in Recall AI)
                prefix = a_email.split("@")[0].lower()
                attendee_map[prefix] = a_email
                
                # Store by parts of name
                if a_name:
                    for part in a_name.lower().split():
                        if len(part) > 2: # ignore short names
                            attendee_map[part] = a_email

        logger.info(f"Cross-referencing {len(unique_participants)} participants with {len(attendee_map)} unique calendar mapping keys")
        logger.info(f"Mapping keys available: {list(attendee_map.keys())}")

        # Track name occurrences for database display names
        name_counts = {}
        for p_id, name in unique_participants.items():
            if name not in name_counts:
                name_counts[name] = 0
            name_counts[name] += 1

        current_counts = {}

        for p_id, name in unique_participants.items():
            display_name = name
            if name_counts[name] > 1:
                if name not in current_counts:
                    current_counts[name] = 0
                current_counts[name] += 1
                display_name = f"{name} ({current_counts[name]})"

            # Try to find email using multiple strategies
            email = attendee_map.get(name.lower())
            is_organizer = False
            
            if not email:
                # Try matching by first name or last name
                for part in name.lower().split():
                    if part in attendee_map:
                        email = attendee_map[part]
                        break
            
            # Check if this person is the organizer
            if email and meeting.google_event_data and meeting.google_event_data.get("organizer", {}).get("email") == email:
                is_organizer = True
            
            logger.debug(f"Matching participant: '{name}' -> Email: {email or 'NOT FOUND'}, Organizer: {is_organizer}")
            
            participant = Participant(
                meeting_id=meeting.id,
                name=display_name,
                recall_id=p_id,
                email=email,
                is_organizer=str(is_organizer) # Maintaining string compatibility for now
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
    

