import requests

from app.services.recall_ai_service import RecallService
from app.processors.transcript_processor import TranscriptProcessor
from app.ai_agents.openAI_transcript_analyzer import OpenAITranscriptAnalyzer 
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class MeetingPipeline:

    def __init__(self):
        self.recall = RecallService()

    def run(self, meeting_url: str):
        logger.info(f"🤖 Creating bot for URL: {meeting_url}")
        bot = self.recall.create_bot(meeting_url)

        bot_id = bot["id"]

        logger.info(f"⏳ Waiting for transcript for bot_id: {bot_id}")
        transcript_url = self.recall.wait_for_transcript(bot_id)

        logger.info("📥 Fetching transcript...")
        transcript_json = requests.get(transcript_url).json()

        logger.info("🧾 Formatting transcript...")
        formatted = TranscriptProcessor.format(transcript_json)
        logger.debug(f"Formatted transcript: {formatted}")

        logger.info("🧠 Running AI analysis...")
        result = OpenAITranscriptAnalyzer.analyze(formatted)

        logger.info("🚀 FINAL AI ANALYSIS COMPLETED")
        return result
