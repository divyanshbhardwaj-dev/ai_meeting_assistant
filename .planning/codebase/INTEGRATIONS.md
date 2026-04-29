# External Integrations

**Analysis Date:** 2024-04-28

## APIs & External Services

**AI Analysis:**
- OpenAI - Used for analyzing meeting transcripts.
  - SDK/Client: `openai` Python package.
  - Auth: `OPEN_API_KEY` environment variable.

**Meeting Recording & Transcription:**
- Recall.ai - Used to join meetings as a bot and provide transcripts.
  - SDK/Client: Direct REST API calls using `requests` in `app/services/recall_ai_service.py`.
  - Auth: `RECALL_API_KEY` environment variable.

## Data Storage

**Databases:**
- None - Currently uses an in-memory dictionary for job tracking.
  - Client: `app/store/job_store.py`

**File Storage:**
- Local filesystem only - For logs and temporary storage if needed.

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- Custom - API currently has no authentication for its own endpoints.

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- Standard Python `logging` module configured in `app/utils/logger.py`.

## CI/CD & Deployment

**Hosting:**
- Not specified.

**CI Pipeline:**
- None detected.

## Environment Configuration

**Required env vars:**
- `OPEN_API_KEY`: API key for OpenAI.
- `RECALL_API_KEY`: API key for Recall.ai.
- `BASE_URL`: Base URL for Recall.ai API.

**Secrets location:**
- `.env` file (not committed).

## Webhooks & Callbacks

**Incoming:**
- None - The system currently polls Recall.ai for transcript status instead of using webhooks.

**Outgoing:**
- None

---

*Integration audit: 2024-04-28*
