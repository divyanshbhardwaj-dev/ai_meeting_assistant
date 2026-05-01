# Developer Guide - Agentic Meeting Assistant

Practical guide for developers building on this codebase.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure & Navigation](#project-structure--navigation)
3. [Code Conventions](#code-conventions)
4. [Common Development Tasks](#common-development-tasks)
5. [Testing](#testing)
6. [Debugging](#debugging)
7. [Version Control](#version-control)
8. [Performance Optimization](#performance-optimization)
9. [Common Issues & Solutions](#common-issues--solutions)
10. [Contributing](#contributing)

---

## Development Setup

### Prerequisites

- **Python**: 3.8+ (3.10+ recommended)
- **Git**: for version control
- **Editor**: VS Code, PyCharm, or similar
- **API Keys**: Recall.ai and OpenAI
- **OS**: Windows, macOS, or Linux

### Step-by-Step Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/shivalika-ai/agentic-meeting-assistant.git
cd agentic-meeting-assistant
```

#### 2. Create and Activate Virtual Environment

**Windows (PowerShell)**:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS/Linux**:
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 4. Setup Environment Variables

Create `.env` file in project root:

```bash
OPEN_API_KEY=sk-proj-your-key-here
RECALL_API_KEY=your-recall-key-here
BASE_URL=https://api.recall.ai/api
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

#### 5. Verify Installation

```bash
# Test imports
python -c "from main import app; print('✅ App initialized')"

# Test API
python main.py
# Visit http://localhost:8000/health
```

#### 6. Frontend Setup (Optional)

If you wish to serve the frontend from the backend:

```bash
cd meeting_ai_frontend
npm install
npm run build
```

The backend is configured to automatically serve the frontend from `meeting_ai_frontend/dist` if it exists.

### IDE Setup

#### VS Code

`.vscode/settings.json`:
```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "[python]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "ms-python.python"
  }
}
```

#### PyCharm

1. File → Settings → Project → Python Interpreter
2. Add Interpreter → Existing Environment
3. Select `{project}/venv/bin/python`
4. Enable code inspections

---

## Project Structure & Navigation

### Quick File Reference

| Path | Purpose | Key Files |
|------|---------|-----------|
| `app/` | Application package | - |
| `app/api/` | HTTP endpoints | `routes.py` |
| `app/pipelines/` | Workflow orchestration | `meeting_pipeline.py` |
| `app/services/` | External API wrappers | `recall_ai_service.py` |
| `app/ai_agents/` | AI integration | `openAI_transcript_analyzer.py` |
| `app/processors/` | Data transformation | `transcript_processor.py` |
| `app/schemas/` | Data models | `meeting_schema.py` |
| `app/config/` | Configuration | `settings.py` |
| `app/store/` | Data persistence | `job_store.py` |
| `app/utils/` | Shared utilities | `logger.py` |

### Understanding the Code Flow

```
Request arrives
    ↓
routes.py (API handler)
    ↓
meeting_pipeline.py (orchestrator)
    ├─ recall_ai_service.py (external API)
    ├─ transcript_processor.py (data cleanup)
    └─ openAI_transcript_analyzer.py (AI analysis)
    ↓
Result stored in job_store.py
```

---

## Code Conventions

### Python Style Guide

Follow **PEP 8** with these preferences:

#### Naming Conventions

```python
# Classes: PascalCase
class RecallService:
    pass

# Functions/Methods: snake_case
def wait_for_transcript(bot_id: str) -> str:
    pass

# Constants: UPPER_CASE
MAX_RETRIES = 3
TIMEOUT_SECONDS = 1200

# Private members: _leading_underscore
class MyClass:
    _private_method(self):
        pass
```

#### Type Hints

Always use type hints:

```python
# Good
def format(transcript_json: list) -> str:
    pass

# Bad
def format(transcript_json):
    pass
```

#### Docstrings

Use docstrings for all public functions:

```python
def wait_for_transcript(self, bot_id: str, timeout: int = 1200) -> str:
    """
    Wait for transcript to be ready from Recall.ai.
    
    Args:
        bot_id: Unique identifier of the bot
        timeout: Maximum seconds to wait (default: 1200 = 20 min)
    
    Returns:
        Download URL of the transcript
    
    Raises:
        TimeoutError: If transcript not ready within timeout
        Exception: If transcript processing failed
    
    Example:
        >>> service = RecallService()
        >>> url = service.wait_for_transcript("bot_123", timeout=600)
    """
```

#### Comments

Use comments sparingly, for "why" not "what":

```python
# Good: Explains why
# Retry with exponential backoff to handle temporary API issues
while attempts < max_retries:
    pass

# Bad: Repeats what code does
# Loop through attempts
while attempts < max_retries:
    pass
```

### Import Organization

```python
# 1. Standard library
import json
import time
from typing import Dict, List

# 2. Third-party
import requests
from fastapi import FastAPI, APIRouter
from pydantic import BaseModel

# 3. Local imports
from app.config.settings import settings
from app.utils.logger import setup_logger
```

### Error Handling

```python
# Good: Specific exception handling
try:
    response = requests.post(url, headers=headers)
    response.raise_for_status()
except requests.HTTPError as e:
    logger.error(f"API error: {e.response.status_code}")
except requests.Timeout:
    logger.error("Request timeout")

# Bad: Generic exception handling
try:
    response = requests.post(url, headers=headers)
except Exception:
    pass
```

---

## Common Development Tasks

### Task 1: Adding a New API Endpoint

**Goal**: Add endpoint to export analysis as PDF

**Steps**:

1. **Create Processor** (`app/processors/pdf_exporter.py`):
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

class PDFExporter:
    @staticmethod
    def export(analysis: dict) -> bytes:
        """Convert analysis JSON to PDF bytes."""
        # Implementation
        pass
```

2. **Add Schema** (update `app/schemas/meeting_schema.py`):
```python
class ExportRequest(BaseModel):
    job_id: str
    format: str = "pdf"  # pdf, json, markdown
```

3. **Add Route** (update `app/api/routes.py`):
```python
from app.schemas.meeting_schema import ExportRequest
from app.processors.pdf_exporter import PDFExporter

@router.post("/meetings/{job_id}/export")
def export_meeting(job_id: str, request: ExportRequest):
    job = jobs.get(job_id)
    if not job or job["status"] != "completed":
        return {"error": "Job not found or not completed"}
    
    pdf_bytes = PDFExporter.export(job["result"])
    return FileResponse(
        BytesIO(pdf_bytes),
        filename=f"meeting_{job_id}.pdf"
    )
```

4. **Update Requirements**:
```bash
pip install reportlab
pip freeze > requirements.txt
```

5. **Test**:
```python
# tests/test_pdf_exporter.py
def test_pdf_export():
    sample_analysis = {
        "summary": "Test meeting",
        "key_decisions": ["Decision 1"]
    }
    pdf = PDFExporter.export(sample_analysis)
    assert len(pdf) > 0
```

### Task 2: Extending the AI Analysis

**Goal**: Add sentiment analysis to meeting analysis

**Steps**:

1. **Update Prompt** (`app/ai_agents/prompts/openAI_transcript_analyzer_prompt.py`):
```python
prompt = """
... existing prompt ...

<section id="sentiment">
  <title>Meeting Sentiment</title>
  <description>Overall sentiment of the meeting (positive/neutral/negative)</description>
</section>
"""
```

2. **Update Analyzer** (`app/ai_agents/openAI_transcript_analyzer.py`):
```python
@staticmethod
def analyze(transcript: str) -> str:
    # ... existing code ...
    
    # Add sentiment analysis request
    formatted_prompt = analyzer_prompt.replace(
        "{transcript}", 
        transcript
    )
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a strict JSON generator."},
            {"role": "user", "content": formatted_prompt}
        ],
        response_format={"type": "json_object"},
        timeout=60
    )
    
    return response.choices[0].message.content
```

3. **Test**:
```bash
# Test with actual meeting transcript
python -m pytest tests/test_sentiment_analysis.py -v
```

### Task 3: Adding Database Support

**Goal**: Replace in-memory job store with PostgreSQL

**Steps**:

1. **Create Models** (`app/models/job.py`):
```python
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(String, primary_key=True)
    meeting_url = Column(String)
    status = Column(String)  # processing, completed, failed
    result = Column(JSON)
    created_at = Column(DateTime)
    completed_at = Column(DateTime)
```

2. **Create Database Module** (`app/db/session.py`):
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

3. **Update Routes** (`app/api/routes.py`):
```python
from app.db.session import get_db
from app.models.job import Job

@router.post("/meetings")
def create_meeting(
    request: MeetingRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    job_id = str(uuid.uuid4())
    
    # Create in database
    job = Job(id=job_id, meeting_url=request.meeting_url, status="processing")
    db.add(job)
    db.commit()
    
    # ... rest of implementation
```

---

## Testing

### Unit Testing

```python
# tests/test_transcript_processor.py
import pytest
from app.processors.transcript_processor import TranscriptProcessor

class TestTranscriptProcessor:
    
    def test_clean_text_removes_extra_whitespace(self):
        input_text = "Hello   world"
        assert TranscriptProcessor.clean_text(input_text) == "Hello world"
    
    def test_clean_text_fixes_punctuation(self):
        input_text = "Hello , world !"
        assert TranscriptProcessor.clean_text(input_text) == "Hello, world!"
    
    def test_format_with_empty_transcript(self):
        result = TranscriptProcessor.format([])
        assert result == ""
```

### Integration Testing

```python
# tests/test_api_integration.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_full_meeting_workflow():
    # Create job
    response = client.post(
        "/meetings",
        json={"meeting_url": "https://meet.google.com/test"}
    )
    assert response.status_code == 200
    data = response.json()
    job_id = data["job_id"]
    
    # Check status
    response = client.get(f"/meetings/{job_id}")
    assert response.status_code == 200
    assert "status" in response.json()
```

### Mocking External APIs

```python
# tests/test_services.py
from unittest.mock import Mock, patch
from app.services.recall_ai_service import RecallService

@patch('requests.post')
def test_create_bot_success(mock_post):
    mock_response = Mock()
    mock_response.status_code = 201
    mock_response.json.return_value = {"id": "bot_123"}
    mock_post.return_value = mock_response
    
    service = RecallService()
    bot = service.create_bot("https://meet.google.com/test")
    
    assert bot["id"] == "bot_123"
    mock_post.assert_called_once()
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_transcript_processor.py

# Run with coverage
pytest --cov=app tests/

# Run with verbose output
pytest -v

# Run tests matching pattern
pytest -k "test_clean"
```

---

## Debugging

### Enabling Debug Logging

```python
# main.py or during development
import logging

logging.basicConfig(level=logging.DEBUG)

# Or in environment
export LOG_LEVEL=DEBUG
python main.py
```

### Using Python Debugger

#### Interactive Debugging

```python
# Add breakpoint in code
def some_function():
    x = 1
    breakpoint()  # Execution pauses here
    y = 2
```

```bash
# Run with debugger
python -m pdb main.py
```

#### VS Code Debugging

Create `.vscode/launch.json`:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "FastAPI",
            "type": "python",
            "request": "launch",
            "module": "uvicorn",
            "args": [
                "main:app",
                "--reload",
                "--host", "0.0.0.0",
                "--port", "8000"
            ],
            "jinja": true
        }
    ]
}
```

### Logging for Debugging

```python
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

def run(self, meeting_url: str):
    logger.info(f"Processing: {meeting_url}")
    
    try:
        bot = self.recall.create_bot(meeting_url)
        logger.debug(f"Bot created: {bot}")
    except Exception as e:
        logger.error(f"Bot creation failed: {str(e)}", exc_info=True)
        raise
```

### Debugging API Requests

```bash
# Using curl with verbose output
curl -v -X POST http://localhost:8000/meetings \
  -H "Content-Type: application/json" \
  -d '{"meeting_url": "https://meet.google.com/test"}'

# Using httpie (easier to read)
http POST localhost:8000/meetings meeting_url="https://meet.google.com/test"
```

---

## Version Control

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/description

# 2. Make changes
git add app/api/routes.py
git status

# 3. Commit with clear message
git commit -m "feat: add new endpoint for PDF export"

# 4. Push to remote
git push origin feature/description

# 5. Create pull request on GitHub
# ... review process ...

# 6. Merge when approved
git checkout main
git pull origin main
git merge --no-ff feature/description
git push origin main
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, etc)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Examples**:
```
feat(api): add meeting export endpoint
fix(processor): handle empty transcripts
docs: update API documentation
refactor(pipeline): simplify error handling
test: add integration tests for API
```

### Branch Naming

```
feature/description      # New features
fix/description          # Bug fixes
docs/description         # Documentation
refactor/description     # Code improvements
```

---

## Performance Optimization

### Identifying Bottlenecks

```python
import time
import cProfile
import pstats

# Measure function execution time
def measure_time(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        duration = time.time() - start
        print(f"{func.__name__} took {duration:.2f}s")
        return result
    return wrapper

@measure_time
def analyze_transcript(transcript):
    # Your code here
    pass

# Profile entire script
cProfile.run('main()', 'stats')
p = pstats.Stats('stats')
p.sort_stats('cumulative').print_stats(10)
```

### Optimization Techniques

#### 1. Caching Results

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_meeting_summary(job_id: str) -> dict:
    # Expensive operation
    return jobs[job_id]["result"]
```

#### 2. Async Processing

```python
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)

def process_multiple_meetings(urls: list):
    futures = [executor.submit(process_meeting, url) for url in urls]
    results = [f.result() for f in futures]
    return results
```

#### 3. Database Query Optimization

```python
# Bad: N+1 queries
for job in jobs:
    print(job.result)  # Separate query per job

# Good: Single query with join
jobs_with_results = db.query(Job).options(
    joinedload(Job.result)
).all()
```

---

## Common Issues & Solutions

### Issue: "ModuleNotFoundError"

**Cause**: Missing dependency or wrong Python path

**Solution**:
```bash
# Verify virtual environment is activated
which python  # Should show venv path

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: "API Key not found"

**Cause**: Environment variables not loaded

**Solution**:
```bash
# Check .env file exists
ls -la .env

# Reload shell
source .env  # Linux/Mac
# PowerShell: manually set variables
```

### Issue: "Timeout waiting for transcript"

**Cause**: Recall.ai still processing

**Solution**:
```python
# Increase timeout in recall_ai_service.py
wait_for_transcript(bot_id, timeout=1800)  # 30 minutes

# Or check Recall.ai dashboard for errors
```

### Issue: "Port already in use"

**Cause**: Another process on port 8000

**Solution**:
```bash
# Find process
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
uvicorn main:app --port 8001
```

---

## Contributing

### Code Review Checklist

Before submitting PR:

- [ ] Code follows style guide (PEP 8)
- [ ] All functions have type hints
- [ ] Tests written for new functionality
- [ ] All tests passing (`pytest`)
- [ ] No console logs (use logger)
- [ ] No hardcoded credentials
- [ ] Documentation updated
- [ ] No breaking changes to API
- [ ] Commit messages follow conventions

### PR Template

```markdown
## Description
Brief description of changes

## Related Issue
Fixes #123

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation

## Testing Done
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Checklist
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Documentation updated
```

---

## Google Calendar Setup

To enable automatic meeting joining from Google Calendar, follow these steps to configure your own Google Cloud project:

### 1. Create a Google Cloud Project
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (e.g., "Meeting Assistant").

### 2. Enable Google Calendar API
1.  In the sidebar, go to **APIs & Services > Library**.
2.  Search for "Google Calendar API" and click **Enable**.

### 3. Configure OAuth Consent Screen
1.  Go to **APIs & Services > OAuth consent screen**.
2.  Choose **User Type: External** and click **Create**.
3.  Fill in the required App information.
4.  In the **Scopes** section, add the following scopes:
    *   `.../auth/calendar.readonly`
    *   `.../auth/calendar.events`
    *   `.../auth/userinfo.email`
    *   `openid`
5.  Add your own email as a **Test User** (since the app is in Testing mode).

### 4. Create OAuth 2.0 Credentials
1.  Go to **APIs & Services > Credentials**.
2.  Click **Create Credentials > OAuth client ID**.
3.  Select **Application type: Web application**.
4.  Add **Authorized redirect URIs**: `http://localhost:8000/auth/google/callback`.
5.  Click **Create** and copy your **Client ID** and **Client Secret**.

### 5. Update Environment Variables
Add the credentials to your `.env` file:
```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

### 6. Connect your Account
1.  Ensure you are logged in to the Meeting Assistant application.
2.  Navigate to `http://localhost:8000/auth/google/login`.
3.  Follow the Google authorization flow.
4.  Once redirected back with a "Google connected" message, the scheduler will automatically scan your calendar every 2 minutes and join any upcoming meetings with a valid link.

---

**Document Version**: 1.1.0  
**Last Updated**: April 30, 2026
