import re
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class TranscriptProcessor:

    @staticmethod
    def clean_text(text: str) -> str:
        text = re.sub(r"\s+([.,!?])", r"\1", text)
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    @staticmethod
    def format(transcript_json: list) -> str:
        logger.info(f"Formatting transcript with {len(transcript_json)} blocks.")
        lines = []

        for block in transcript_json:
            participant = block.get("participant", {})
            speaker = participant.get("name", "Unknown")

            words = block.get("words", [])
            sentence = " ".join([w.get("text", "") for w in words])

            sentence = TranscriptProcessor.clean_text(sentence)

            if sentence:
                lines.append(f"{speaker}: {sentence}")

        logger.info(f"Formatted {len(lines)} lines of transcript.")
        return "\n".join(lines)
