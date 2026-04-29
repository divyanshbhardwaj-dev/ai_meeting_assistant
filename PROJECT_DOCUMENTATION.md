# Agentic Meeting Assistant - Comprehensive Project Documentation

**Version:** 1.0.0  
**Last Updated:** April 28, 2026  
**Author:** Shivalika AI Team  
**Project Status:** Active Development

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Design](#architecture--design)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Data Flow & Processing Pipeline](#data-flow--processing-pipeline)
8. [Setup & Installation Guide](#setup--installation-guide)
9. [Configuration Guide](#configuration-guide)
10. [Usage Guide](#usage-guide)
11. [Error Handling & Logging](#error-handling--logging)
12. [Development Guidelines](#development-guidelines)
13. [Deployment Considerations](#deployment-considerations)
14. [Troubleshooting](#troubleshooting)
15. [Future Enhancements](#future-enhancements)

---

## 🎯 Project Overview

### Purpose

The **Agentic Meeting Assistant** is a sophisticated backend service designed to automate the complete lifecycle of virtual meeting management. It seamlessly integrates with Google Meet and other meeting platforms via Recall.ai, automatically attending meetings, recording transcripts, and leveraging AI-powered analysis to extract meaningful insights.

### Key Objectives

- **Automation**: Eliminate manual meeting recording and transcription tasks
- **Intelligence**: Transform raw meeting data into structured, actionable insights
- **Scalability**: Process multiple meetings concurrently without blocking
- **Reliability**: Ensure robust error handling and comprehensive logging
- **Integration**: Provide clean REST APIs for easy consumption by other services

### Core Features

1. **Automated Bot Attendance**
   - Join meetings automatically using Google Meet URLs
   - Maintain consistent presence throughout meeting duration
   - Support for various meeting platforms via Recall.ai

2. **Intelligent Transcript Processing**
   - Fetch raw transcripts from Recall.ai
   - Clean and format transcript data
   - Remove filler words, stammers, and incomplete thoughts

3. **AI-Powered Analysis**
   - Generate concise meeting summaries
   - Extract key decisions with context
   - Identify action items with owner assignment and due dates
   - Flag risks, blockers, and concerns
   - Use GPT-4o-mini for advanced NLP capabilities

4. **Asynchronous Processing**
   - Process meetings in background without blocking API responses
   - Track job status with unique job IDs
   - Provide real-time status updates and results retrieval

5. **Comprehensive Logging**
   - Track every step in the meeting lifecycle
   - Support for DEBUG, INFO, WARNING, and ERROR levels
   - Timestamp and context information for all log entries

---

## 🏗️ Architecture & Design

### Design Pattern: Layered Architecture

The system is organized into distinct layers, each with a specific responsibility:

```
┌─────────────────────────────────────────────────┐
│         API Layer (routes.py)                   │
│    - HTTP request handling                      │
│    - Input validation (Pydantic)                │
│    - Response formatting                        │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│      Pipeline Orchestration Layer               │
│    (meeting_pipeline.py)                        │
│    - Coordinate component interaction           │
│    - Manage data flow between layers            │
│    - Error propagation                          │
└─────────────────┬───────────────────────────────┘
                  │
      ┌───────────┼───────────┬──────────┐
      │           │           │          │
┌─────▼────┐ ┌───▼────┐ ┌────▼───┐ ┌───▼─────┐
│ Service  │ │AI Agent│ │ Proces │ │ Config  │
│  Layer   │ │ Layer  │ │sor     │ │ Layer   │
│(Recall.  │ │(OpenAI)│ │ Layer  │ │(settings)│
│  ai)     │ │        │ │        │ │         │
└──────────┘ └────────┘ └────────┘ └─────────┘
```

### Key Architectural Principles

1. **Separation of Concerns**
   - Each layer has a single, well-defined responsibility
   - Loose coupling between layers
   - Easy to test individual components

2. **Dependency Injection**
   - Services initialize dependencies internally
   - Configuration centralized in `settings.py`
   - Easy to mock for testing

3. **Error Handling**
   - Exceptions propagate up the stack
   - Detailed logging at each layer
   - Graceful degradation where possible

4. **Scalability**
   - Asynchronous job processing with background tasks
   - In-memory job store (can be replaced with database)
   - Stateless API design for horizontal scaling

---

## 💻 Technology Stack

### Backend Framework
- **FastAPI** (0.x)
  - Modern, fast web framework
  - Automatic OpenAPI documentation
  - Built-in data validation via Pydantic
  - Async support for background tasks

### Database
- **PostgreSQL**
  - Relational database for persistent storage
  - Stores meetings, participants, and tasks
- **SQLAlchemy** (2.0+)
  - ORM for database interaction
  - Declarative models and session management

### External APIs & Services
- **Recall.ai API**
  - Meeting integration and bot management
  - Transcript generation and delivery
  - Meeting metadata collection

- **OpenAI API (GPT-4o-mini)**
  - Advanced natural language processing
  - Structured JSON response generation
  - Meeting analysis and insight extraction

### Python Dependencies
- **pydantic** - Data validation and settings management
- **sqlalchemy** - Database toolkit and ORM
- **psycopg2-binary** - PostgreSQL database adapter
- **requests** - HTTP client for API communication
- **python-dotenv** - Environment variable management
- **openai** - Official OpenAI Python client library
- **uvicorn** - ASGI server for running FastAPI

### Infrastructure & Utilities
- **Python 3.8+** - Programming language
- **Virtual Environment (venv)** - Dependency isolation
- **Logging Framework** - Python built-in logging module

---

## 📁 Project Structure

```
agentic-meeting-assistant/
├── main.py                                   # Application entry point
├── README.md                                 # Quick start guide
├── requirements.txt                          # Python dependencies
├── .gitignore                                # Git exclusion rules
├── .env                                      # Environment variables (not in repo)
│
└── app/
    ├── __init__.py
    │
    ├── api/
    │   ├── __init__.py
    │   ├── db_dependency.py                 # DB session dependency
    │   └── routes.py                        # API endpoint definitions
    │
    ├── ai_agents/
    │   ├── __init__.py
    │   ├── openAI_transcript_analyzer.py    # OpenAI integration
    │   └── prompts/
    │       ├── __init__.py
    │       └── openAI_transcript_analyzer_prompt.py  # System prompt
    │
    ├── config/
    │   ├── __init__.py
    │   └── settings.py                      # Configuration management
    │
    ├── db/
    │   ├── __init__.py
    │   ├── database.py                      # DB connection setup
    │   ├── init_db.py                       # DB initialization script
    │   └── models.py                        # SQLAlchemy models
    │
    ├── pipelines/
    │   ├── __init__.py
    │   └── meeting_pipeline.py              # Main orchestration logic
    │
    ├── processors/
    │   ├── __init__.py
    │   └── transcript_processor.py          # Transcript cleaning & formatting
    │
    ├── schemas/
    │   ├── __init__.py
    │   └── meeting_schema.py                # Pydantic data models
    │
    ├── services/
    │   ├── __init__.py
    │   └── recall_ai_service.py             # Recall.ai API wrapper
    │
    ├── store/
    │   └── job_store.py                     # In-memory status tracking
    │
    ├── utils/
    │   ├── __init__.py
    │   └── logger.py                        # Logging configuration
    │
    └── venv/                                # Python virtual environment (gitignored)
```

### Directory Responsibilities

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `api/` | HTTP request handling and routing | `routes.py`, `db_dependency.py` |
| `ai_agents/` | OpenAI integration and analysis | `openAI_transcript_analyzer.py`, `prompts/` |
| `config/` | Configuration management | `settings.py` |
| `db/` | Database persistence (PostgreSQL) | `models.py`, `database.py` |
| `pipelines/` | Workflow orchestration | `meeting_pipeline.py` |
| `processors/` | Data transformation | `transcript_processor.py` |
| `schemas/` | Request/response data models | `meeting_schema.py` |
| `services/` | External API integration | `recall_ai_service.py` |
| `store/` | Job status tracking (in-memory) | `job_store.py` |
| `utils/` | Shared utilities | `logger.py` |

---

## 🗄️ Database Schema

### 1. Meeting Model
- **id**: UUID (Primary Key)
- **meeting_url**: String
- **bot_id**: String (Nullable, updated after bot creation)
- **status**: String (created, processing, completed, failed)
- **summary**: Text (Nullable, updated after AI analysis)
- **created_at**: DateTime

### 2. Participant Model
- **id**: Integer (Primary Key)
- **name**: String
- **email**: String
- **meeting_id**: ForeignKey(meetings.id)

### 3. Task Model
- **id**: Integer (Primary Key)
- **meeting_id**: ForeignKey(meetings.id)
- **task**: Text
- **owner_name**: String
- **owner_email**: String
- **priority**: String (low, medium, high)
- **status**: String (pending, completed)
- **due_date**: String
- **created_at**: DateTime

---

## 🔧 Core Components

### 1. API Layer (`app/api/routes.py`)

**Purpose**: Handle HTTP requests and define API endpoints

**Components**:
- `router`: FastAPI APIRouter instance
- `pipeline`: MeetingPipeline instance for processing
- Job store reference for state management

**Key Endpoints**:
```python
POST /meetings              # Create new meeting job
GET /meetings/{job_id}      # Check job status
GET /meetings/{job_id}/result  # Retrieve analysis results
GET /health                 # Health check endpoint
```

**Request/Response Flow**:
1. Receive MeetingRequest with meeting URL
2. Generate unique job_id
3. Store job in job store with initial status
4. Add processing task to background queue
5. Return job_id immediately
6. Client polls for results asynchronously

---

### 2. Pipeline Layer (`app/pipelines/meeting_pipeline.py`)

**Purpose**: Orchestrate the entire meeting processing workflow

**Workflow Sequence**:

```
Input: meeting_url
  ↓
1. Create Bot (Recall.ai)
  ↓
2. Wait for Transcript Generation
  ↓
3. Fetch Transcript JSON
  ↓
4. Format Transcript
  ↓
5. Run AI Analysis
  ↓
Output: Structured JSON Analysis
```

**Key Methods**:
- `__init__()`: Initialize RecallService
- `run(meeting_url: str)`: Execute complete pipeline
  - Logs each step for monitoring
  - Handles exceptions and propagates errors
  - Returns final AI analysis result

**Data Integrity**:
- Validates meeting_url format
- Checks bot creation success
- Verifies transcript availability
- Ensures formatted transcript is non-empty
- Validates AI response format

---

### 3. Service Layer (`app/services/recall_ai_service.py`)

**Purpose**: Manage Recall.ai API communication

**Authentication**:
- Bearer token from `RECALL_API_KEY` environment variable
- Passed in Authorization header for all requests

**Core Methods**:

#### `create_bot(meeting_url: str, bot_name: str = "AI Note Taker")`
- **Endpoint**: `POST {BASE_URL}/bot/`
- **Payload**:
  ```python
  {
      "meeting_url": "https://meet.google.com/...",
      "bot_name": "AI Note Taker",
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
  ```
- **Returns**: Bot object with `id` field
- **Status Code**: 201 (Created)

#### `get_bot(bot_id: str)`
- **Endpoint**: `GET {BASE_URL}/bot/{bot_id}/`
- **Returns**: Complete bot object with status and recording data

#### `list_bots()`
- **Endpoint**: `GET {BASE_URL}/bot/`
- **Returns**: Array of all bot instances

#### `wait_for_transcript(bot_id: str, timeout: int = 1200)`
- **Purpose**: Poll for transcript readiness with exponential backoff
- **Timeout**: 20 minutes (1200 seconds) default
- **Polling Strategy**:
  - Initial poll interval: 10 seconds
  - Increases with elapsed time, capped at 30 seconds
  - Checks recording status codes: "done", "completed"
  - Validates transcript status and download URL
  - Logs progress at each iteration

**Error Handling**:
- HTTP status validation with `raise_for_status()`
- Timeout exceptions for long-running operations
- Detailed error logging with response content

---

### 4. AI Agent Layer (`app/ai_agents/openAI_transcript_analyzer.py`)

**Purpose**: Leverage OpenAI GPT-4o-mini for intelligent analysis

**Key Features**:
- Uses official OpenAI Python client
- Structured JSON output mode (prevents hallucination)
- Comprehensive system and user prompts
- Error recovery and detailed logging

**Analysis Method**:

```python
OpenAITranscriptAnalyzer.analyze(transcript: str) -> str
```

**Process**:
1. Load analysis prompt template
2. Format prompt with actual transcript
3. Initialize OpenAI client with API key
4. Send to GPT-4o-mini with JSON mode enabled
5. Return formatted JSON response

**Prompt Structure** (XML-based):
- System role definition
- Analysis objectives
- Multi-step task breakdown
- Output format specification
- Example JSON structure

**Response Format**:
```json
{
  "cleaned_transcript": [
    {
      "speaker": "string",
      "text": "string"
    }
  ],
  "summary": "string",
  "key_decisions": ["string"],
  "action_items": [
    {
      "task": "string",
      "owner": "string",
      "due_date": "string",
      "priority": "string",
      "status": "string"
    }
  ],
  "risks_blockers": [
    {
      "item": "string",
      "severity": "string",
      "mitigation": "string"
    }
  ]
}
```

---

### 5. Processor Layer (`app/processors/transcript_processor.py`)

**Purpose**: Clean and format raw transcript data

**Key Methods**:

#### `clean_text(text: str) -> str`
- Removes spaces before punctuation
- Collapses multiple whitespace into single spaces
- Strips leading/trailing whitespace
- **Example**:
  ```
  Input:  "Hello  ,  how are you  ?  "
  Output: "Hello, how are you?"
  ```

#### `format(transcript_json: list) -> str`
- Processes Recall.ai transcript format
- Extracts speaker name and words
- Cleans each sentence
- Produces readable speaker-prefixed format
- **Output Format**:
  ```
  Speaker One: This is their first statement.
  Speaker Two: This is the response.
  Speaker One: And a follow-up comment.
  ```

**Data Validation**:
- Skips empty sentences
- Validates speaker field presence
- Logs line count for monitoring
- Handles malformed blocks gracefully

---

### 6. Configuration Layer (`app/config/settings.py`)

**Purpose**: Centralized environment variable management

**Configuration Variables**:

| Variable | Source | Purpose | Required |
|----------|--------|---------|----------|
| `OPEN_API_KEY` | `.env` | OpenAI API authentication | Yes |
| `RECALL_API_KEY` | `.env` | Recall.ai API authentication | Yes |
| `BASE_URL` | `.env` | Recall.ai API base URL | Yes |

**Environment Loading**:
- Loads from `.env` file using `python-dotenv`
- Validates required variables during initialization
- Logs warnings for missing critical keys

**Usage**:
```python
from app.config.settings import settings

api_key = settings.OPEN_API_KEY
recall_key = settings.RECALL_API_KEY
```

---

### 7. Data Model Layer (`app/schemas/meeting_schema.py`)

**Purpose**: Define and validate request/response schemas

**MeetingRequest Model**:
```python
class MeetingRequest(BaseModel):
    meeting_url: str
```

**Validation**:
- URL string format
- Pydantic automatic validation
- Type checking at runtime

---

### 8. Job Storage (`app/store/job_store.py`)

**Purpose**: In-memory job state management

**Current Implementation**:
```python
jobs = {}  # In-memory dictionary
```

**Job Structure**:
```python
{
  "job_id": {
    "status": "processing|completed|failed",
    "result": None | "analysis_result" | "error_message"
  }
}
```

**States**:
- `processing`: Job is currently being processed
- `completed`: Job finished successfully with results
- `failed`: Job encountered an error

**Limitations & Future Improvements**:
- ⚠️ Data lost on application restart
- ⚠️ Not suitable for multi-instance deployments
- 🔄 Should migrate to persistent database (PostgreSQL, Redis)

---

### 9. Logging Utility (`app/utils/logger.py`)

**Purpose**: Standardized logging across application

**Logger Configuration**:
- **Level**: INFO (DEBUG available for detailed tracing)
- **Format**: `timestamp - logger_name - level - message`
- **Output**: stdout (suitable for container environments)

**Usage**:
```python
from app.utils.logger import setup_logger

logger = setup_logger(__name__)
logger.info("Processing started")
logger.error("Error occurred", exc_info=True)
```

**Log Levels**:
- **DEBUG**: Detailed diagnostic information
- **INFO**: Confirmation that things are working
- **WARNING**: Something unexpected or suboptimal
- **ERROR**: A more serious problem

---

## 🔌 API Documentation

### Base Configuration

- **Host**: `0.0.0.0`
- **Port**: `8000`
- **Base Path**: `/`

### Health Check

**Endpoint**: `GET /health`

**Purpose**: Verify application is running

**Response**:
```json
{
  "status": "healthy"
}
```

**Status Code**: 200

---

### Create Meeting Job

**Endpoint**: `POST /meetings`

**Purpose**: Submit a meeting URL for processing

**Request Body**:
```json
{
  "meeting_url": "https://meet.google.com/kkx-yhbd-dnc"
}
```

**Response**:
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing"
}
```

**Status Code**: 200

**Error Responses**:
- **422 Unprocessable Entity**: Invalid request format
  ```json
  {
    "detail": [
      {
        "loc": ["body", "meeting_url"],
        "msg": "field required",
        "type": "value_error.missing"
      }
    ]
  }
  ```

**Process Flow**:
1. Validate request schema
2. Generate UUID v4 for job_id
3. Initialize job in store with "processing" status
4. Add pipeline execution to background tasks
5. Return immediately to client

---

### Check Job Status

**Endpoint**: `GET /meetings/{job_id}`

**Purpose**: Check current processing status of a job

**Path Parameters**:
- `job_id` (string, required): Unique job identifier

**Response (Processing)**:
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing"
}
```

**Response (Not Found)**:
```json
{
  "error": "Job not found"
}
```

**Status Code**: 200

**Polling Strategy**:
- Recommended interval: 5-10 seconds
- Maximum reasonable polling time: 30 minutes
- Implement exponential backoff for production use

---

### Get Job Results

**Endpoint**: `GET /meetings/{job_id}/result`

**Purpose**: Retrieve analysis results once job is completed

**Path Parameters**:
- `job_id` (string, required): Unique job identifier

**Response (Completed)**:
```json
{
  "status": "completed",
  "result": {
    "cleaned_transcript": [...],
    "summary": "Meeting covered project timeline and resource allocation...",
    "key_decisions": ["Use Python for backend development"],
    "action_items": [...],
    "risks_blockers": [...]
  }
}
```

**Response (Still Processing)**:
```json
{
  "status": "processing",
  "message": "Result not ready yet"
}
```

**Response (Failed)**:
```json
{
  "status": "failed",
  "message": "Error message describing what went wrong"
}
```

**Response (Not Found)**:
```json
{
  "error": "Job not found"
}
```

**Status Code**: 200

---

## 📊 Data Flow & Processing Pipeline

### Complete End-to-End Flow

```
┌─────────────────────┐
│  Client Application │
│  (External Service) │
└──────────┬──────────┘
           │
           │ POST /meetings
           │ {meeting_url: "https://meet.google.com/..."}
           ↓
┌──────────────────────────┐
│   FastAPI Route Handler   │
│   (api/routes.py)         │
└──────────┬───────────────┘
           │
           │ Creates job_id
           │ Stores in job_store
           │ Adds background task
           │
           ↓
┌──────────────────────────────┐
│  Background Task Executor    │
│  (asyncio BackgroundTasks)   │
└──────────┬───────────────────┘
           │
           │ Calls pipeline.run()
           ↓
┌──────────────────────────────┐
│  MeetingPipeline             │
│  (pipelines/meeting_pipeline │
│   .py)                       │
└──────┬─────────────────┬──────┘
       │                 │
       │                 │ Uses
       ↓                 ↓
┌─────────────┐    ┌──────────────┐
│RecallService│    │Transcript    │
│             │    │Processor     │
│1. Create Bot│    │              │
│2. Wait for  │    │Cleans &      │
│   Transcript│    │Formats       │
│3. Fetch URL │    │              │
└──────┬──────┘    └──────┬───────┘
       │                  │
       │ HTTP Requests    │
       │ to Recall.ai     │ Raw JSON
       │                  │
       │                  │
       └────────┬─────────┘
                │
                ↓
┌──────────────────────────────┐
│  OpenAITranscriptAnalyzer    │
│  (ai_agents/)                │
│                              │
│  - Formats prompt            │
│  - Calls GPT-4o-mini         │
│  - Validates JSON response   │
└────────────┬─────────────────┘
             │
             │ HTTP Request
             │ to OpenAI API
             │
             ↓
         [GPT-4o-mini]
         
             │ JSON Response
             ↓
┌──────────────────────────────┐
│  Analysis Result             │
│  (JSON with Summary, Actions,│
│   Decisions, Risks)          │
└────────────┬─────────────────┘
             │
             │ Stored in job_store
             │ Result linked to job_id
             │
             ↓
    ┌────────────────────┐
    │ Client polls for   │
    │ GET /meetings/{id} │
    │ until "completed"  │
    └────────────────────┘
             │
             ↓
    ┌────────────────────┐
    │ Client requests    │
    │ GET /meetings/{id} │
    │ /result            │
    └────────────────────┘
             │
             ↓
    ┌────────────────────┐
    │ Returns full       │
    │ analysis result    │
    └────────────────────┘
```

### Critical Data Transformations

#### Stage 1: Transcript Acquisition
```
Recall.ai Bot → Raw Transcript JSON
{
  "words": [
    {
      "text": "word",
      "speaker": {...},
      "timestamp": ...
    }
  ]
}
```

#### Stage 2: Transcript Formatting
```
Raw JSON → Formatted String
"Alice: Hello, this is Alice speaking.
Bob: Hi Alice, how are you today?"
```

#### Stage 3: AI Analysis
```
Formatted String → Structured JSON Analysis
{
  "summary": "...",
  "key_decisions": [...],
  "action_items": [{...}],
  "risks_blockers": [{...}]
}
```

---

## 🚀 Setup & Installation Guide

### Prerequisites

- **Python 3.8+** (tested on 3.10+)
- **pip** (Python package manager)
- **Virtual Environment** support (built-in to Python 3.3+)
- **Git** (for cloning repository)
- **API Keys**:
  - Recall.ai API key and base URL
  - OpenAI API key

### Step 1: Clone Repository

```bash
git clone https://github.com/shivalika-ai/agentic-meeting-assistant.git
cd agentic-meeting-assistant
```

### Step 2: Create Virtual Environment

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

### Step 3: Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Current Dependencies**:
```
annotated-types==0.7.0
anyio==4.13.0
certifi==2025.1.31
charset-normalizer==3.3.2
click==8.1.7
exceptiongroup==1.2.2
fastapi==0.109.2
h11==0.14.0
httpcore==1.1.0
httpx==0.27.0
idna==3.7
pydantic==2.7.4
pydantic-core==2.18.2
python-dotenv==1.0.1
requests==2.32.3
sniffio==1.3.1
starlette==0.37.0
typing-extensions==4.12.2
urllib3==2.2.3
uvicorn==0.27.0
openai==1.52.0
```

### Step 4: Configure Environment Variables

Create `.env` file in project root:

```bash
# .env file
OPEN_API_KEY=sk-your-openai-api-key-here
RECALL_API_KEY=your-recall-api-key-here
BASE_URL=https://api.recall.ai/api
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

**⚠️ IMPORTANT**: Never commit `.env` file to version control. Add to `.gitignore`.

### Step 5: Initialize Database

Ensure your PostgreSQL server is running and the database specified in `DATABASE_URL` exists. Then run:

```bash
python app/db/init_db.py
```

### Step 6: Verify Installation

```bash
# Test import
python -c "from app.config.settings import settings; print('✅ Config loaded')"

# Test FastAPI app
python -c "from main import app; print('✅ FastAPI app initialized')"
```

### Step 7: Start Development Server

**Option A: Using Python directly**:
```bash
python main.py
```

**Option B: Using Uvicorn**:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Step 7: Test API

Open browser or use curl:

```bash
# Health check
curl http://localhost:8000/health

# API documentation
# Open http://localhost:8000/docs (Swagger UI)
# Open http://localhost:8000/redoc (ReDoc)
```

---

## ⚙️ Configuration Guide

### Environment Variables

| Variable | Example | Purpose | Required |
|----------|---------|---------|----------|
| `OPEN_API_KEY` | `sk-proj-...` | OpenAI API authentication | Yes |
| `RECALL_API_KEY` | `eyJ0eXAi...` | Recall.ai API authentication | Yes |
| `BASE_URL` | `https://api.recall.ai/api` | Recall.ai API endpoint | Yes |

### API Configuration (app/config/settings.py)

```python
class Settings:
    OPEN_API_KEY = os.getenv("OPEN_API_KEY")
    RECALL_API_KEY = os.getenv("RECALL_API_KEY")
    BASE_URL = os.getenv("BASE_URL")
    
    def __init__(self):
        # Validation of required variables
        if not self.OPEN_API_KEY:
            logger.warning("OPEN_API_KEY is not set")
```

### FastAPI Configuration (main.py)

```python
app = FastAPI(
    title="Agentic Meeting Assistant",
    description="Automated meeting recording and analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Server configuration
if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",      # Listen on all interfaces
        port=8000,           # Default port
        workers=1,           # Single worker for development
        reload=True          # Auto-reload on code changes
    )
```

### Recall.ai Service Configuration

**Bot Creation Parameters**:
```python
payload = {
    "meeting_url": "https://meet.google.com/...",
    "bot_name": "AI Note Taker",
    "recording_config": {
        "transcript": {
            "provider": {
                "recallai_streaming": {
                    "language_code": "en"  # Can be changed for other languages
                }
            }
        },
        "participant_events": {},
        "meeting_metadata": {}
    }
}
```

**Polling Configuration** (wait_for_transcript):
- **Initial Timeout**: 1200 seconds (20 minutes)
- **Initial Sleep**: 10 seconds
- **Maximum Sleep**: 30 seconds
- **Backoff Formula**: `min(10 + elapsed_minutes, 30)`

### OpenAI Configuration

**Model**: `gpt-4o-mini`
- Optimized for cost-efficiency
- Capable of JSON mode responses
- Suitable for structured analysis tasks

**Response Format**: JSON mode enabled
```python
response_format={"type": "json_object"}
```

**System Prompt**: Strict JSON generator instruction
```python
{"role": "system", "content": "You are a strict JSON generator."}
```

---

## 💡 Usage Guide

### For Developers

#### 1. Processing a Meeting URL

```bash
# Start server
python main.py

# Create a processing job
curl -X POST http://localhost:8000/meetings \
  -H "Content-Type: application/json" \
  -d '{"meeting_url": "https://meet.google.com/kkx-yhbd-dnc"}'

# Response:
# {
#   "job_id": "550e8400-e29b-41d4-a716-446655440000",
#   "status": "processing"
# }
```

#### 2. Checking Job Progress

```bash
# Check status
curl http://localhost:8000/meetings/550e8400-e29b-41d4-a716-446655440000

# Response:
# {"job_id": "...", "status": "processing"}  # Until done
# {"job_id": "...", "status": "completed"}   # When finished
```

#### 3. Retrieving Results

```bash
# Get analysis results
curl http://localhost:8000/meetings/550e8400-e29b-41d4-a716-446655440000/result

# Response:
# {
#   "status": "completed",
#   "result": {
#     "summary": "Meeting discussed Q2 goals and timeline...",
#     "key_decisions": [...],
#     "action_items": [...],
#     "risks_blockers": [...]
#   }
# }
```

#### 4. Python Client Example

```python
import requests
import time

BASE_URL = "http://localhost:8000"

# Step 1: Create job
response = requests.post(
    f"{BASE_URL}/meetings",
    json={"meeting_url": "https://meet.google.com/..."}
)
job_data = response.json()
job_id = job_data["job_id"]
print(f"Created job: {job_id}")

# Step 2: Poll for completion (with timeout)
start_time = time.time()
timeout = 1800  # 30 minutes
poll_interval = 10

while time.time() - start_time < timeout:
    status_response = requests.get(f"{BASE_URL}/meetings/{job_id}")
    status = status_response.json()["status"]
    
    print(f"Status: {status}")
    
    if status == "completed":
        break
    elif status == "failed":
        print("Job failed!")
        break
    
    time.sleep(poll_interval)

# Step 3: Get results
if status == "completed":
    result_response = requests.get(f"{BASE_URL}/meetings/{job_id}/result")
    result = result_response.json()
    print("Analysis Results:")
    print(result["result"])
```

#### 5. Docker Usage

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

ENV OPEN_API_KEY=${OPEN_API_KEY}
ENV RECALL_API_KEY=${RECALL_API_KEY}
ENV BASE_URL=${BASE_URL}

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build and run
docker build -t agentic-meeting-assistant .
docker run -p 8000:8000 \
  -e OPEN_API_KEY=your_key \
  -e RECALL_API_KEY=your_key \
  -e BASE_URL=https://api.recall.ai/api \
  agentic-meeting-assistant
```

---

## 🛡️ Error Handling & Logging

### Error Hierarchy

```
Exception
├── RecallAIException
│   ├── BotCreationError
│   ├── TranscriptTimeoutError
│   └── TranscriptFetchError
├── OpenAIException
│   ├── AnalysisError
│   └── JSONFormatError
├── ProcessingException
│   └── TranscriptFormattingError
└── ValidationException
    └── InvalidMeetingURLError
```

### Common Error Scenarios

#### 1. Missing API Keys

**Error**:
```
WARNING: OPEN_API_KEY is not set in environment variables
```

**Solution**:
```bash
# Verify .env file
cat .env

# Ensure keys are set
export OPEN_API_KEY=sk-...
export RECALL_API_KEY=...
export BASE_URL=...
```

#### 2. Invalid Meeting URL

**Error**:
```
ERROR: Failed to create bot: {"detail": "Invalid meeting URL format"}
```

**Solution**:
- Use valid Google Meet URL: `https://meet.google.com/xxx-xxxx-xxx`
- Ensure meeting is accessible
- Verify URL is not restricted to specific users

#### 3. Transcript Timeout

**Error**:
```
ERROR: Timeout waiting for transcript for bot abc123def456
```

**Solution**:
- Increase timeout in `RecallService.wait_for_transcript()`
- Check if meeting is still active
- Verify bot joined meeting successfully
- Check Recall.ai dashboard for errors

#### 4. OpenAI API Rate Limit

**Error**:
```
ERROR: Error during OpenAI analysis: RateLimitError
```

**Solution**:
- Implement retry logic with exponential backoff
- Use request queuing
- Upgrade OpenAI subscription for higher limits

### Logging Configuration

**Log Levels** (in app/utils/logger.py):
```python
logger.setLevel(logging.INFO)  # Set to DEBUG for verbose output
```

**Log Output**:
```
2024-04-28 10:30:45,123 - app.pipelines.meeting_pipeline - INFO - 🤖 Creating bot for URL: https://meet.google.com/...
2024-04-28 10:30:47,456 - app.services.recall_ai_service - INFO - Create bot STATUS: 201
2024-04-28 10:30:48,789 - app.services.recall_ai_service - INFO - Waiting for transcript for bot bot_id...
```

### Structured Error Responses

**API Error Format**:
```json
{
  "error": "Description of what went wrong",
  "status_code": 400,
  "timestamp": "2024-04-28T10:30:00Z"
}
```

### Log Rotation

For production, implement log rotation:
```python
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler(
    'app.log',
    maxBytes=10485760,  # 10MB
    backupCount=5
)
```

---

## 🔨 Development Guidelines

### Code Organization

1. **Module Structure**
   - One responsibility per module
   - Clear, descriptive names
   - Logical grouping in packages

2. **Naming Conventions**
   - Classes: PascalCase (e.g., `RecallService`)
   - Functions/Methods: snake_case (e.g., `wait_for_transcript`)
   - Constants: UPPER_CASE (e.g., `TIMEOUT_SECONDS`)
   - Private members: _leading_underscore

3. **Documentation**
   - Docstrings for all public functions
   - Type hints for all parameters
   - Comments for complex logic

### Example: Adding a New Feature

#### Feature: Add Meeting Duration Logging

**1. Update MeetingPipeline** (app/pipelines/meeting_pipeline.py):
```python
import time

def run(self, meeting_url: str):
    start_time = time.time()
    # ... existing code ...
    duration = time.time() - start_time
    logger.info(f"Meeting processing completed in {duration:.2f} seconds")
```

**2. Update Schema** (app/schemas/meeting_schema.py):
```python
class MeetingResponse(BaseModel):
    job_id: str
    status: str
    duration: float = None  # Optional
```

**3. Update API Route** (app/api/routes.py):
```python
@router.get("/meetings/{job_id}/result")
def get_result(job_id: str):
    # Include duration in response
    job = jobs.get(job_id)
    return {
        "status": "completed",
        "result": job["result"],
        "duration": job.get("duration")
    }
```

### Testing Guidelines

#### Unit Test Example

```python
# tests/test_transcript_processor.py
import pytest
from app.processors.transcript_processor import TranscriptProcessor

def test_clean_text():
    input_text = "Hello  ,  world  !"
    expected = "Hello, world!"
    assert TranscriptProcessor.clean_text(input_text) == expected

def test_format_transcript():
    mock_transcript = [
        {
            "participant": {"name": "Alice"},
            "words": [
                {"text": "Hello"},
                {"text": "everyone"}
            ]
        }
    ]
    result = TranscriptProcessor.format(mock_transcript)
    assert "Alice: Hello everyone" in result
```

#### Integration Test Example

```python
# tests/test_api_integration.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_create_meeting():
    response = client.post(
        "/meetings",
        json={"meeting_url": "https://meet.google.com/test"}
    )
    assert response.status_code == 200
    assert "job_id" in response.json()
```

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/add-meeting-duration-logging

# 2. Make changes and commit
git add app/pipelines/meeting_pipeline.py
git commit -m "feat: add meeting duration logging"

# 3. Push to remote
git push origin feature/add-meeting-duration-logging

# 4. Create pull request on GitHub
# ... review process ...

# 5. Merge to main
git merge --no-ff feature/add-meeting-duration-logging
```

---

## 🚢 Deployment Considerations

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] API keys secured and not in version control
- [ ] Dependencies listed in requirements.txt
- [ ] Unit tests passing
- [ ] Code linting (flake8, black) applied
- [ ] Security scan completed
- [ ] Error handling comprehensive
- [ ] Logging at appropriate levels
- [ ] Rate limiting implemented
- [ ] Database migration (if applicable)

### Deployment Options

#### 1. Heroku Deployment

Create `Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

```bash
heroku create agentic-meeting-assistant
heroku config:set OPEN_API_KEY=sk-...
heroku config:set RECALL_API_KEY=...
heroku config:set BASE_URL=...
git push heroku main
```

#### 2. AWS Lambda (Serverless)

Requires framework like Serverless or AWS SAM

#### 3. Docker & Kubernetes

```yaml
# kubernetes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agentic-meeting-assistant
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: agentic-meeting-assistant:latest
        ports:
        - containerPort: 8000
        env:
        - name: OPEN_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: openai
```

#### 4. Traditional VPS (DigitalOcean, Linode)

```bash
# Install system dependencies
sudo apt update && sudo apt install python3-pip python3-venv

# Clone and setup
git clone <repo> /var/www/agentic-meeting-assistant
cd /var/www/agentic-meeting-assistant
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup Nginx reverse proxy
# Setup systemd service
# Setup SSL with Let's Encrypt
```

### Performance Optimization

1. **Caching**
   - Cache frequently accessed transcripts
   - Use Redis for distributed caching

2. **Database**
   - Migrate from in-memory job store to PostgreSQL
   - Add indexing for fast lookups
   - Implement connection pooling

3. **Async Processing**
   - Use Celery or RQ for distributed task queue
   - Process multiple meetings in parallel
   - Implement priority queues

4. **Monitoring**
   - Add Prometheus metrics
   - Use Sentry for error tracking
   - Implement health check endpoints

---

## 🔍 Troubleshooting

### Common Issues and Solutions

#### Issue 1: "ModuleNotFoundError: No module named 'app'"

**Cause**: Virtual environment not activated or dependencies not installed

**Solution**:
```bash
# Activate virtual environment
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\Activate.ps1  # Windows

# Install dependencies
pip install -r requirements.txt
```

#### Issue 2: "RECALL_API_KEY is not set"

**Cause**: Environment variables not loaded

**Solution**:
```bash
# Check .env file exists in project root
ls -la .env

# Verify contents
cat .env

# Reload environment
source .env  # Linux/Mac
# Windows: manually set in PowerShell or use .env file loader
```

#### Issue 3: 403 Unauthorized from Recall.ai

**Cause**: Invalid API key or expired credentials

**Solution**:
- Verify API key is current
- Check Recall.ai dashboard for API key regeneration
- Ensure key has required permissions

#### Issue 4: "Timeout waiting for transcript"

**Cause**: Meeting not properly transcribed or bot didn't join

**Solution**:
1. Verify meeting URL is correct
2. Check if meeting is still active
3. Increase timeout in `RecallService`
4. Check Recall.ai logs for errors
5. Verify bot permissions in Recall.ai dashboard

#### Issue 5: OpenAI "Invalid JSON" response

**Cause**: Prompt template issue or model rate limiting

**Solution**:
```python
# In openAI_transcript_analyzer.py, add validation:
try:
    response = client.chat.completions.create(...)
    result = response.choices[0].message.content
    json.loads(result)  # Validate JSON
except json.JSONDecodeError:
    logger.error("Invalid JSON from OpenAI")
    # Implement retry logic
```

#### Issue 6: Port 8000 Already in Use

**Cause**: Another process using port 8000

**Solution**:
```bash
# Find process using port 8000
lsof -i :8000  # Linux/Mac
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows

# Or use different port
uvicorn main:app --port 8001
```

#### Issue 7: "CORS Error" in Browser

**Cause**: Cross-Origin Request Blocked

**Solution**:
```python
# Add CORS middleware to main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Debug Mode

Enable detailed logging:

```python
# main.py or app/utils/logger.py
logger.setLevel(logging.DEBUG)

# Or via environment variable
import logging
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
```

---

## 🔮 Future Enhancements

### Planned Features (v1.1)

1. **Database Integration**
   - Replace in-memory job store with PostgreSQL
   - Add job history and analytics
   - Implement data retention policies

2. **Advanced Analysis**
   - Sentiment analysis of meetings
   - Participant engagement metrics
   - Topic clustering across meetings
   - Follow-up item tracking

3. **Multiple Language Support**
   - Support for 10+ languages
   - Language detection
   - Multilingual summaries

4. **Integration Hub**
   - Slack notifications
   - Jira ticket creation
   - Google Calendar integration
   - Microsoft Teams webhook support

### Planned Features (v2.0)

1. **Real-time Processing**
   - WebSocket connections for live updates
   - Real-time transcript streaming
   - Live action item identification

2. **AI Enhancements**
   - Finetuned models for domain-specific analysis
   - Multi-turn conversation summarization
   - Predictive insights and forecasting

3. **Enterprise Features**
   - User authentication and authorization
   - Role-based access control (RBAC)
   - Audit logging and compliance
   - SLA-based service levels

4. **Mobile Application**
   - Native iOS/Android apps
   - Offline viewing of transcripts
   - Push notifications

5. **Advanced Integrations**
   - Zapier/Make.com support
   - Custom webhook system
   - API marketplace for third-party extensions

### Technical Debt & Refactoring

- [ ] Implement dependency injection framework
- [ ] Add comprehensive unit test suite (>80% coverage)
- [ ] Refactor MeetingPipeline for better testability
- [ ] Add API rate limiting and throttling
- [ ] Implement circuit breaker pattern for external APIs
- [ ] Add request/response caching
- [ ] Optimize database queries
- [ ] Add security headers to API responses
- [ ] Implement request signing for API authentication
- [ ] Add API versioning strategy

---

## 📚 Additional Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Recall.ai API Docs](https://docs.recall.ai/)
- [OpenAI API Reference](https://platform.openai.com/docs/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

### Community
- GitHub Issues for bug reports
- Discussions for feature requests
- Contributing guidelines

### Tools & Libraries
- **Testing**: pytest, coverage.py
- **Linting**: flake8, black
- **Type Checking**: mypy
- **API Documentation**: Swagger UI, ReDoc

---

## 📝 License

This project is proprietary software developed by Shivalika AI.

---

## 👥 Team

- **Project Lead**: [Name]
- **Backend Developer**: [Name]
- **AI/ML Specialist**: [Name]

---

## 🙋 Support

For issues, questions, or feature requests:
- Create an issue on GitHub
- Contact: support@shivalika-ai.com
- Documentation Wiki: [Link]

---

**Document Version**: 1.0.0  
**Last Updated**: April 28, 2026  
**Next Review**: May 28, 2026
