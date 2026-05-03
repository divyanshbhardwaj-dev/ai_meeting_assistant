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

        # Map recall_id to a unique speaker label
        speaker_labels = {}
        # Count occurrences of each name to add suffixes if needed
        name_to_ids = {}

        # First pass: collect unique IDs for each name
        for block in transcript_json:
            participant = block.get("participant", {})
            name = participant.get("name", "Unknown")
            p_id = participant.get("id")
            if p_id:
                if name not in name_to_ids:
                    name_to_ids[name] = []
                if p_id not in name_to_ids[name]:
                    name_to_ids[name].append(p_id)

        # Second pass: assign unique labels
        for name, ids in name_to_ids.items():
            if len(ids) > 1:
                for i, p_id in enumerate(ids, 1):
                    speaker_labels[p_id] = f"{name} ({i})"
            else:
                speaker_labels[ids[0]] = name

        # Third pass: format lines
        for block in transcript_json:
            participant = block.get("participant", {})
            p_id = participant.get("id")
            speaker = speaker_labels.get(p_id, participant.get("name", "Unknown"))

            words = block.get("words", [])
            sentence = " ".join([w.get("text", "") for w in words])

            sentence = TranscriptProcessor.clean_text(sentence)

            if sentence:
                lines.append(f"{speaker}: {sentence}")

        logger.info(f"Formatted {len(lines)} lines of transcript.")
        return "\n".join(lines)
