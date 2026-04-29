# Coding Conventions

**Analysis Date:** 2024-04-28

## Naming Patterns

**Files:**
- Snake case: `meeting_pipeline.py`, `recall_ai_service.py`.

**Functions:**
- Snake case: `create_bot`, `analyze`, `get_status`.

**Variables:**
- Snake case: `job_id`, `bot_data`, `transcript_url`.

**Types/Classes:**
- Pascal case: `MeetingPipeline`, `RecallService`, `TranscriptProcessor`.

## Code Style

**Formatting:**
- Standard Python (PEP8 implied).
- No specific formatting tool (like Black or Ruff) configuration found in the project root.

**Linting:**
- Not detected.

## Import Organization

**Order:**
1. Standard library imports (e.g., `import os`, `import time`).
2. Third-party library imports (e.g., `from fastapi import ...`).
3. Local application imports (e.g., `from app.config.settings import ...`).

**Path Aliases:**
- Absolute imports starting with `app` are preferred: `from app.utils.logger import setup_logger`.

## Error Handling

**Patterns:**
- Use `response.raise_for_status()` for HTTP requests to catch errors early.
- Wrap background task logic in `try...except` blocks to update job status on failure.
- Log errors with `logger.error(f"Message: {str(e)}")`.

## Logging

**Framework:** Standard Python `logging`.

**Patterns:**
- Define a logger per module: `logger = setup_logger(__name__)`.
- Use `logger.info()` for tracking progress (e.g., "Received request", "Fetching transcript").
- Use `logger.error()` for exceptions.
- Use `logger.debug()` for detailed data (e.g., formatted transcript).

## Comments

**When to Comment:**
- Minimal commenting observed. Comments are mostly used for high-level step descriptions or temporary notes.

**JSDoc/TSDoc:**
- Not applicable. No standard Python docstring pattern strictly followed, though some methods have basic descriptions.

## Function Design

**Size:** Functions are generally small and focused on a single responsibility.

**Parameters:** Mostly positional parameters, sometimes with defaults (e.g., `bot_name` in `create_bot`).

**Return Values:** Return dicts/JSON-serializable objects or specific objects like UUIDs.

## Module Design

**Exports:** Classes are typically exported from modules.

**Barrel Files:** `__init__.py` files are present in most directories but are currently empty.

---

*Convention analysis: 2024-04-28*
