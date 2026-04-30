import requests

from app.services.recall_ai_service import RecallService
from app.processors.transcript_processor import TranscriptProcessor
from app.ai_agents.openAI_transcript_analyzer import OpenAITranscriptAnalyzer 
from app.utils.logger import setup_logger
import json
from app.db.models import Meeting, Task
from sqlalchemy.orm import Session
from app.ai_agents.test_transcript import test_transcript

logger = setup_logger(__name__)

class MeetingPipeline:

    def __init__(self):
        self.recall = RecallService()


    def save_tasks(self, db, meeting_id, tasks):
        for t in tasks:
            task = Task(
                meeting_id=meeting_id,
                task=t.get("task"),
                owner_name=t.get("owner"),
                priority=t.get("priority", "medium"),
                due_date=t.get("due_date"),
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

            meeting.transcript_raw = test_transcript
            db.commit()

            logger.info("🧾 Formatting transcript...")
            formatted = TranscriptProcessor.format(test_transcript)

            meeting.transcript_text = formatted
            db.commit()

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
    

