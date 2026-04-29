# Technology Stack

**Analysis Date:** 2024-04-28

## Languages

**Primary:**
- Python 3.x - Used for the entire backend and AI agent logic.

## Runtime

**Environment:**
- Python 3.14 (implied by `.pyc` filenames)

**Package Manager:**
- pip
- Lockfile: `requirements.txt` present.

## Frameworks

**Core:**
- FastAPI - Web framework for building APIs.
- Uvicorn - ASGI server for running the FastAPI application.

**Testing:**
- Not detected. No testing framework like `pytest` or `unittest` is configured in `requirements.txt`.

**Build/Dev:**
- `python-dotenv` - For managing environment variables.

## Key Dependencies

**Critical:**
- `openai` (2.32.0) - Interface for transcript analysis using GPT models.
- `requests` (2.33.1) - Used for making synchronous HTTP requests to Recall.ai and fetching transcripts.
- `pydantic` (2.13.3) - Data validation and settings management.
- `httpx` (0.28.1) - Asynchronous HTTP client (used as a dependency or for future async needs).

**Infrastructure:**
- `uvicorn` (0.45.0) - High-performance ASGI server.

## Configuration

**Environment:**
- Configured via `.env` file.
- Key configs required: `OPEN_API_KEY`, `RECALL_API_KEY`, `BASE_URL`.

**Build:**
- No complex build configuration. Standard Python package structure.

## Platform Requirements

**Development:**
- Python 3.x
- Access to OpenAI API and Recall.ai API.

**Production:**
- Any environment supporting Python and Uvicorn (e.g., Docker, Heroku, AWS).

---

*Stack analysis: 2024-04-28*
