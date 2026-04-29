# Agentic Meeting Assistant

The **Agentic Meeting Assistant** is a powerful backend service designed to automate the process of recording, transcribing, and analyzing virtual meetings. By integrating with Recall.ai for meeting interaction and OpenAI for intelligent analysis, it transforms raw conversations into structured, actionable insights.

## 🚀 Features

- **Automated Bot Attendance**: Joins meetings automatically via a URL.
- **Transcript Processing**: Fetches and cleans raw transcripts into a readable format.
- **AI-Powered Analysis**: Uses GPT-4o-mini to generate:
  - Concise Summaries
  - Key Decisions
  - Action Items (with owners and due dates)
  - Risks and Blockers
- **Asynchronous Workflow**: Processes meetings in the background to ensure API responsiveness.
- **Robust Logging**: Comprehensive tracking of every step in the meeting lifecycle.

---

## 🏗️ Architecture

The project follows a **Layered Architecture** with a clear separation of concerns:

- **API Layer (`app/api`)**: Handles HTTP requests and validates inputs using Pydantic.
- **Pipeline Layer (`app/pipelines`)**: Orchestrates the flow from bot creation to AI analysis.
- **Service Layer (`app/services`)**: Manages external communication with Recall.ai.
- **AI Agent Layer (`app/ai_agents`)**: Handles prompt engineering and OpenAI communication.
- **Processor Layer (`app/processors`)**: Cleans and formats raw data for the AI.
- **Utility Layer (`app/utils`)**: Provides shared services like logging.

---

## 🛠️ Tech Stack

- **Language**: Python 3.10+
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Web API)
- **Server**: [Uvicorn](https://www.uvicorn.org/) (ASGI Server)
- **AI**: [OpenAI API](https://openai.com/) (GPT-4o-mini)
- **Meeting Infrastructure**: [Recall.ai](https://www.recall.ai/) (Recording & Transcription)
- **Data Validation**: [Pydantic](https://docs.pydantic.dev/)

---

## 🚦 Getting Started

### Prerequisites

- Python 3.10 or higher
- [OpenAI API Key](https://platform.openai.com/)
- [Recall.ai API Key](https://www.recall.ai/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd agentic-meeting-assistant
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows
   # or
   source venv/bin/activate      # macOS/Linux
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   OPEN_API_KEY=your_openai_api_key
   RECALL_API_KEY=your_recall_api_key
   BASE_URL=https://ap-northeast-1.recall.ai/api/v1
   ```

### Running the Application

Start the server using the entry point:
```bash
python main.py
```
The API will be available at `http://localhost:8000`.

---

## 📖 API Documentation

### Process Meeting
Triggers the background process for a meeting.

- **URL**: `/meetings/process`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "meeting_url": "https://zoom.us/j/..."
  }
  ```
- **Response**:
  ```json
  {
    "status": "processing",
    "message": "Meeting processing started"
  }
  ```

### Health Check
Check the status of the service.
- **URL**: `/health`
- **Method**: `GET`

---

## 📜 Coding Conventions

- **Naming**: PEP8 (snake_case for functions/files, PascalCase for classes).
- **Imports**: Absolute imports (e.g., `from app.config.settings import settings`).
- **Logging**: Use the centralized logger from `app.utils.logger`.
- **Error Handling**: Use `try-except` blocks in background tasks and services.

---

## 🧪 Development

### Running AI Analysis Manually
You can test the AI agent directly using a sample transcript:
- See `app/ai_agents/test_transcript.py` for sample data.
- The prompt template is located in `app/ai_agents/prompts/openAI_transcript_analyzer_prompt.py`.

---

## 📄 License
This project is private and confidential.
