# Architecture

**Analysis Date:** 2024-04-28

## Pattern Overview

**Overall:** Layered Architecture with Background Task Processing.

**Key Characteristics:**
- **Separation of Concerns:** Clear layers for API routing, business logic (pipelines), external services, and AI logic.
- **Asynchronous Processing:** Long-running meeting processing is handled in the background using FastAPI's `BackgroundTasks`.
- **Stateless Services:** Most components are stateless, relying on passed data or configuration.

## Layers

**API Layer:**
- Purpose: Handles HTTP requests, input validation, and job status tracking.
- Location: `app/api/`
- Contains: `routes.py`, `schemas/`
- Depends on: `pipelines/`, `schemas/`, `store/`
- Used by: External clients

**Pipeline Layer:**
- Purpose: Orchestrates the meeting processing workflow.
- Location: `app/pipelines/`
- Contains: `meeting_pipeline.py`
- Depends on: `services/`, `processors/`, `ai_agents/`
- Used by: `api/routes.py`

**Service Layer:**
- Purpose: Wraps external API interactions (Recall.ai).
- Location: `app/services/`
- Contains: `recall_ai_service.py`
- Depends on: `config/`, `utils/`
- Used by: `pipelines/`

**Processor/AI Layer:**
- Purpose: Handles data transformation and AI-driven analysis.
- Location: `app/processors/`, `app/ai_agents/`
- Contains: `transcript_processor.py`, `openAI_transcript_analyzer.py`
- Depends on: `utils/`, `config/`
- Used by: `pipelines/`

## Data Flow

**Meeting Processing Flow:**

1. **Request:** Client sends `POST /meetings` with a `meeting_url`.
2. **Job Creation:** `api/routes.py` creates a UUID and stores it in `job_store.py` with "processing" status.
3. **Background Task:** `MeetingPipeline.run()` is invoked as a background task.
4. **Bot Creation:** `RecallService` creates a recording bot for the URL.
5. **Polling:** `RecallService` polls for the recording status until it is "done".
6. **Fetch & Process:** The transcript is fetched, cleaned/formatted by `TranscriptProcessor`.
7. **AI Analysis:** `OpenAITranscriptAnalyzer` sends the transcript to OpenAI and receives a JSON summary.
8. **Completion:** The job status in `job_store.py` is updated to "completed" and the result is stored.

**State Management:**
- Job state is managed in-memory via a simple dictionary in `app/store/job_store.py`. This state is lost on server restart.

## Key Abstractions

**MeetingPipeline:**
- Purpose: High-level workflow orchestration.
- Examples: `app/pipelines/meeting_pipeline.py`
- Pattern: Command/Orchestrator pattern.

**RecallService:**
- Purpose: Abstracting Recall.ai API complexities.
- Examples: `app/services/recall_ai_service.py`
- Pattern: Wrapper/Adapter pattern.

## Entry Points

**Main API Application:**
- Location: `main.py`
- Triggers: Uvicorn execution (`python main.py`)
- Responsibilities: Initializing FastAPI, including routers, and starting the server.

## Error Handling

**Strategy:** Exception raising and logging.

**Patterns:**
- `try...except` blocks in routes and services to capture and log errors.
- HTTP exceptions raised for client errors (e.g., `response.raise_for_status()`).

## Cross-Cutting Concerns

**Logging:** Centralized logger setup in `app/utils/logger.py` used across all modules.
**Validation:** Pydantic models in `app/schemas/` for request validation.
**Authentication:** Environment-based API keys for external services.

---

*Architecture analysis: 2024-04-28*
