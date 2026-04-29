# Codebase Concerns

**Analysis Date:** 2024-04-28

## Tech Debt

**Hardcoded Test Data in AI Analysis:**
- Issue: `OpenAITranscriptAnalyzer.analyze` ignores the passed `transcript` argument and uses `test_transcript` from a file instead.
- Files: `app/ai_agents/openAI_transcript_analyzer.py`
- Impact: Real transcripts from meetings will not be analyzed; the system will always return a summary of the test data.
- Fix approach: Replace `TranscriptProcessor.format(test_transcript)` with `transcript` (which is already formatted in the pipeline).

**In-Memory Job Store:**
- Issue: `jobs` dictionary in `app/store/job_store.py` is in-memory only.
- Files: `app/store/job_store.py`, `app/api/routes.py`
- Impact: All job history and results are lost if the server restarts.
- Fix approach: Integrate a persistent database (e.g., SQLite, PostgreSQL) or a key-value store (e.g., Redis).

**Synchronous HTTP Requests in Background Tasks:**
- Issue: `requests` library is used for polling and fetching transcripts, which is synchronous.
- Files: `app/services/recall_ai_service.py`, `app/pipelines/meeting_pipeline.py`
- Impact: While it runs in a background thread, it still blocks the thread for long periods during `time.sleep()`.
- Fix approach: Use `httpx.AsyncClient` and `await asyncio.sleep()`.

## Security Considerations

**API Authentication:**
- Risk: The `/meetings` endpoints are public and have no authentication.
- Files: `app/api/routes.py`
- Current mitigation: None.
- Recommendations: Add API key validation or OAuth2 to protect endpoints.

## Performance Bottlenecks

**Polling for Transcripts:**
- Problem: `wait_for_transcript` uses a polling loop with `time.sleep()`.
- Files: `app/services/recall_ai_service.py`
- Cause: Synchronous polling is inefficient.
- Improvement path: Implement Webhooks if Recall.ai supports them to receive status updates asynchronously.

## Fragile Areas

**Recall.ai Integration:**
- Files: `app/services/recall_ai_service.py`
- Why fragile: Highly dependent on the exact response structure of Recall.ai. Minimal error handling for varied recording statuses.
- Safe modification: Add robust schema validation for Recall.ai responses.

## Missing Critical Features

**Persistence:**
- Problem: No database to store meeting results.
- Blocks: Historical analysis, re-viewing previous summaries.

**Webhooks Support:**
- Problem: Relying on polling instead of webhooks for status updates.
- Blocks: Scalability and responsiveness.

## Test Coverage Gaps

**Unit and Integration Tests:**
- What's not tested: Entire codebase has no executable tests.
- Files: `app/`
- Risk: Changes can introduce regressions unnoticed; refactoring is dangerous.
- Priority: High

---

*Concerns audit: 2024-04-28*
