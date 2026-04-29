# Codebase Structure

**Analysis Date:** 2024-04-28

## Directory Layout

```
[project-root]/
├── app/                    # Application source code
│   ├── ai_agents/          # AI logic and prompt templates
│   ├── api/                # API routes and schemas
│   ├── config/             # Configuration and settings
│   ├── pipelines/          # Business logic orchestrators
│   ├── processors/         # Data transformation logic
│   ├── schemas/            # Pydantic data models
│   ├── services/           # External service integrations
│   ├── store/              # Data persistence (in-memory)
│   └── utils/              # Shared utilities (logging)
├── main.py                 # Application entry point
├── requirements.txt        # Dependency list
└── .env                    # Environment variables (local only)
```

## Directory Purposes

**app/ai_agents/:**
- Purpose: Houses the logic for interacting with LLMs.
- Contains: `openAI_transcript_analyzer.py` (analysis logic), `prompts/` (system/user prompt templates).
- Key files: `app/ai_agents/openAI_transcript_analyzer.py`

**app/api/:**
- Purpose: Defines the REST interface.
- Contains: `routes.py` (endpoint definitions).
- Key files: `app/api/routes.py`

**app/pipelines/:**
- Purpose: Orchestrates multi-step processes.
- Contains: `meeting_pipeline.py` (coordinates bot creation, transcript fetching, and AI analysis).

**app/services/:**
- Purpose: Client wrappers for external APIs.
- Contains: `recall_ai_service.py` (Recall.ai API integration).

**app/store/:**
- Purpose: Temporary or permanent data storage.
- Contains: `job_store.py` (in-memory dictionary for background job tracking).

## Key File Locations

**Entry Points:**
- `main.py`: Starts the FastAPI server using Uvicorn.

**Configuration:**
- `app/config/settings.py`: Loads and validates environment variables.

**Core Logic:**
- `app/pipelines/meeting_pipeline.py`: The main workflow for meeting processing.

**Testing:**
- `app/ai_agents/test_transcript.py`: Contains a large sample transcript for development/testing.

## Naming Conventions

**Files:**
- snake_case: `meeting_pipeline.py`, `recall_ai_service.py`.

**Directories:**
- snake_case: `ai_agents`, `api`.

## Where to Add New Code

**New Feature (e.g., Slack Integration):**
- Primary code: `app/services/slack_service.py`
- Integration in pipeline: `app/pipelines/meeting_pipeline.py`

**New AI Agent (e.g., Sentiment Analysis):**
- Implementation: `app/ai_agents/sentiment_analyzer.py`
- Prompt: `app/ai_agents/prompts/sentiment_prompt.py`

**Utilities:**
- Shared helpers: `app/utils/`

## Special Directories

**__pycache__/:**
- Purpose: Python bytecode cache.
- Generated: Yes
- Committed: No

---

*Structure analysis: 2024-04-28*
