import requests
from app.config.settings import settings
import time


class RecallService:
    def __init__(self):
        self.base_url = settings.BASE_URL
        self.headers = {
            "Authorization": f"Bearer {settings.RECALL_API_KEY}",
            "Content-Type": "application/json"
        }

    # 1. Create bot (join meeting)
    def create_bot(self, meeting_url: str, bot_name: str = "AI Note Taker"):
        url = f"{self.base_url}/bot/"

        payload = {
            "meeting_url": meeting_url,
            "bot_name": bot_name,
            "recording_config": {
                "transcript": {
                    "provider": {
                        "recallai_streaming": {
                            "language_code": "en"
                        }
                    }
                },
                "participant_events": {},
                "meeting_metadata": {}
            }
        }
        response = requests.post(url, json=payload, headers=self.headers)

        print("STATUS:", response.status_code)
        print("RESPONSE:", response.text)

        response.raise_for_status()
        return response.json()

    # 2. Get bot status
    def get_bot(self, bot_id: str):
        url = f"{self.base_url}/bot/{bot_id}/"

        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    # 3. List all bots (optional but useful)
    def list_bots(self):
        url = f"{self.base_url}/bot/"

        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def wait_for_recording(self, bot_id: str, timeout: int = 1200):
        start_time = time.time()

        while True:
            bot_data = self.get_bot(bot_id)
            recordings = bot_data.get("recordings", [])

            if recordings:
                rec = next(
                    (r for r in recordings if r.get("status", {}).get("code") in ["done", "completed"]),
                    None
                )

                if not rec:
                    print("⏳ No completed recording yet...")
                else:
                    transcript = rec.get("media_shortcuts", {}).get("transcript", {})
                    status = transcript.get("status", {}).get("code")
                    download_url = transcript.get("data", {}).get("download_url")

                    print(f"📝 Transcript Status: {status}")

                    # Debug (optional)
                    # print("FULL TRANSCRIPT OBJECT:", transcript)

                    if status in ["failed", "canceled"]:
                        raise Exception(f"Transcript failed: {status}")

                    if status in ["done", "completed"] and download_url:
                        print("✅ Transcript ready!")
                        return download_url

            else:
                print("⏳ No recordings yet...")

            if time.time() - start_time > timeout:
                raise TimeoutError("Transcript not ready in time")

            print("⏳ Waiting...")

            sleep_time = min(10 + int((time.time() - start_time) / 60), 30)
            time.sleep(sleep_time)