# Agentic Meeting Assistant: Live Transcription Architecture

This document provides a technical deep-dive into the implementation of the real-time transcription engine.

## 1. System Overview

The Live Transcription feature enables users to watch a real-time, scrolling transcript of a meeting as it occurs. The system bridges the audio captured by a Recall.ai bot in Google Meet/Zoom/Teams to the user's browser with sub-second latency.

### Core Technologies
- **Recall.ai**: Recording and transcription engine.
- **FastAPI (Python)**: Backend server handling data ingestion and broadcasting.
- **WebSockets**: Bi-directional communication for low-latency streaming.
- **React (TypeScript)**: Frontend UI for displaying the scrolling transcript.
- **ngrok**: Public tunnel for local development.

---

## 2. Data Flow Architecture

### Step 1: Bot Creation & Configuration
When a meeting is started, the `MeetingPipeline` calls `RecallService.create_bot()`. The bot is configured with specific `realtime_endpoints`:
- **Endpoint Type**: `websocket` (preferred over webhooks to bypass HTTP interceptors).
- **URL**: `wss://<public_url>/ws/recall/{meeting_id}`.
- **Events**: Subscribes to `transcript.data` (finalized sentences) and `transcript.partial_data` (real-time typing).

### Step 2: Audio to Text (Recall.ai)
The Recall.ai bot processes the meeting audio. Based on the configuration (`prioritize_accuracy` or `prioritize_latency`), it generates JSON-formatted transcript chunks.

### Step 3: Backend Ingestion (`app/api/ws_router.py`)
Recall.ai establishes a persistent WebSocket connection to the backend's `/ws/recall/{meeting_id}` endpoint.
- **Payload Handling**: The backend receives deeply nested JSON payloads.
- **Robust Parsing**: The `extract_transcript_fields` function handles multiple schema variations (e.g., `data.data.transcript`, `data.transcript`, or raw `words` arrays).
- **Speaker Mapping**: It extracts the speaker's name from the `participant` metadata.

### Step 4: Internal Broadcasting
Once parsed, the backend converts the Recall.ai data into a standardized internal format:
```json
{
  "type": "transcript_update",
  "speaker": "John Doe",
  "text": "Hello world...",
  "is_final": true
}
```
The `ConnectionManager` then broadcasts this payload to all frontend clients currently viewing that specific `meeting_id`.

### Step 5: Database Persistence
If `is_final` is `True`, the backend appends the formatted line to the `transcript` column in the `meetings` table. This ensures that users who join late or refresh the page see the historical transcript.

### Step 6: Frontend Rendering (`MeetingDetailPage.tsx`)
The React app maintains a persistent WebSocket connection to `/ws/{meeting_id}`.
- **`liveTranscript` State**: Stores an array of finalized sentences.
- **`activePartial` State**: Stores the current "typing" sentence for the active speaker.
- **UI Logic**: Renders finalized lines normally and the partial line with a pulsing "typing..." indicator.

---

## 3. Key Technical Decisions

### Why WebSockets over Webhooks?
During development, we discovered that **ngrok's free tier** intercepts HTTP POST webhooks with an interstitial "browser warning" page. Since Recall.ai expects a standard HTTP response, it would fail to deliver webhooks. 
- **Solution**: Moving to WebSockets bypassed this entirely, as ngrok allows `ws://` traffic without the warning screen. It also reduced overhead by maintaining a single persistent connection.

### Handling Schema Evolution
Recall.ai often changes its payload structure between versions or across different meeting platforms. Our parser uses a **fallback strategy**:
1. Checks for triple-nested `data.data.transcript`.
2. Checks for double-nested `data.transcript`.
3. Falls back to joining individual word objects from the `words` array if a full `text` string is missing.

---

## 4. Troubleshooting

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| No live text | `APP_PUBLIC_URL` is localhost | Set a public ngrok/Cloudflare URL in `.env`. |
| "Empty text" logs | Schema mismatch | Verify `extract_transcript_fields` against raw bot logs. |
| Text appears late | Mode set to `accuracy` | Use `prioritize_accuracy` with `language_code: 'en'` for faster results. |
| Bot not joining | Invalid Meeting URL | Ensure the URL is a direct Google Meet/Zoom link. |

---

## 5. Deployment Requirements
To run this feature locally:
1. Run `ngrok http 8000`.
2. Update `.env` with `APP_PUBLIC_URL=https://your-id.ngrok-free.app`.
3. Ensure `RECALL_API_KEY` is valid.
4. Open the frontend and click the **Transcript** tab.
