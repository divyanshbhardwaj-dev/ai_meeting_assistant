from openai import OpenAI
from app.config.settings import settings
from app.processors.transcript_processor import TranscriptProcessor
from app.utils.logger import setup_logger
from app.ai_agents.prompts.openAI_transcript_analyzer_prompt import prompt as analyzer_prompt
from app.ai_agents.test_transcript import test_transcript

logger = setup_logger(__name__)

client = OpenAI(api_key=settings.OPEN_API_KEY)  # Initialize the OpenAI client with your API key

class OpenAITranscriptAnalyzer:

    @staticmethod
    def analyze(transcript: str) -> str:


        logger.info("Starting analysis of transcript with OpenAI...")
        
        # Use the imported prompt and inject the transcript
        # Note: The prompt template uses {transcript} as the placeholder
        formatted_transcript = TranscriptProcessor.format(test_transcript)

        if not formatted_transcript.strip():
            raise ValueError("Transcript is empty, skipping analysis")

        formatted_prompt = analyzer_prompt.replace("{transcript}", formatted_transcript)

        print("FORMATTED TRANSCRIPT:\n", formatted_transcript)

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": formatted_prompt}],
                timeout=60
            )
            logger.info("OpenAI analysis completed successfully.")
            print("OPENAI RESPONSE:\n", response.choices[0].message.content)
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error during OpenAI analysis: {str(e)}")
            raise
