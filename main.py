import requests

from app.services.recall_ai_service import RecallService
from app.config.settings import settings


MEETING_URL = "https://meet.google.com/kkx-yhbd-dnc"

def run():
    recall = RecallService()


    print("🤖 Creating bot...")
    bot = recall.create_bot(MEETING_URL)

    print("\n✅ BOT CREATED:")
    print(bot)

    bot_id = bot.get("id")

    print("\n🔍 Checking status...")
    status = recall.get_bot(bot_id)

    print("\n⏳ Waiting for recording to be ready...")
    recordings = recall.wait_for_recording(bot_id)
    print(recordings)

    download_url = recall.wait_for_recording(bot_id)

    transcript_url = recall.wait_for_recording(bot_id)

    print("\n📥 Fetching transcript...")
    response = requests.get(transcript_url)
    transcript_data = response.json()

    print("\n🧾 RAW TRANSCRIPT:")
    print(transcript_data)

    print("\n🎬 DOWNLOAD URL:")
    print(download_url)


    print("\n📊 BOT STATUS:")
    print(status)


if __name__ == "__main__":
    run()