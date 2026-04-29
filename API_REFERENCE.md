# API Reference Guide - Agentic Meeting Assistant

Quick reference for all API endpoints and specifications.

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Response Codes](#response-codes)
- [Examples](#examples)

---

## Base URL

```
http://localhost:8000
```

Production: Configure in environment variables

---

## Authentication

Currently, the API uses environment variable-based authentication for external services:
- **Recall.ai**: Bearer token in `Authorization` header
- **OpenAI**: API key in request headers

Future versions will implement API key-based client authentication.

---

## Endpoints

### 1. Health Check

**GET** `/health`

Check if the application is running and healthy.

**Response**: 
```json
{
  "status": "healthy"
}
```

**Status Code**: `200 OK`

---

### 2. Create Meeting Job

**POST** `/meetings`

Submit a Google Meet URL for processing.

**Request Body**:
```json
{
  "meeting_url": "https://meet.google.com/kkx-yhbd-dnc"
}
```

**Response Success** (200 OK):
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing"
}
```

**Response Validation Error** (422 Unprocessable Entity):
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

**Query Parameters**: None

**Headers**: 
- `Content-Type: application/json`

---

### 3. Check Job Status

**GET** `/meetings/{job_id}`

Check the current status of a meeting processing job.

**Path Parameters**:
- `job_id` (string, required) - Unique job identifier from job creation

**Response - Processing**:
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing"
}
```

**Response - Completed**:
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed"
}
```

**Response - Failed**:
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "failed"
}
```

**Response - Job Not Found** (200 OK):
```json
{
  "error": "Job not found"
}
```

**Status Code**: `200 OK`

---

### 4. Get Job Results

**GET** `/meetings/{job_id}/result`

Retrieve the analysis results of a completed job.

**Path Parameters**:
- `job_id` (string, required) - Unique job identifier

**Response - Completed** (200 OK):
```json
{
  "status": "completed",
  "result": {
    "cleaned_transcript": [
      {
        "speaker": "Alice",
        "text": "Let's discuss the Q2 timeline."
      },
      {
        "speaker": "Bob",
        "text": "I agree. We need to plan resource allocation."
      }
    ],
    "summary": "The meeting discussed Q2 planning, timeline establishment, and resource requirements for the upcoming quarter.",
    "key_decisions": [
      "Use Python for backend development",
      "Schedule weekly sync meetings",
      "Allocate budget for new tools"
    ],
    "action_items": [
      {
        "task": "Create detailed project timeline",
        "owner": "Alice",
        "due_date": "2026-05-05",
        "priority": "High",
        "status": "Open"
      },
      {
        "task": "Review resource requirements",
        "owner": "Bob",
        "due_date": "2026-05-08",
        "priority": "Medium",
        "status": "Open"
      }
    ],
    "risks_blockers": [
      {
        "item": "Potential budget constraints",
        "severity": "High",
        "mitigation": "Resubmit budget request with detailed breakdown"
      },
      {
        "item": "Team member availability",
        "severity": "Medium",
        "mitigation": "Finalize staffing plan by end of week"
      }
    ]
  }
}
```

**Response - Still Processing** (200 OK):
```json
{
  "status": "processing",
  "message": "Result not ready yet"
}
```

**Response - Job Failed** (200 OK):
```json
{
  "status": "failed",
  "message": "Error message describing the failure"
}
```

**Response - Job Not Found** (200 OK):
```json
{
  "error": "Job not found"
}
```

**Status Code**: `200 OK`

---

## Response Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request format |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error in request body |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Service temporarily unavailable |

---

## Status Values

| Status | Meaning |
|--------|---------|
| `processing` | Job is currently being processed |
| `completed` | Job finished successfully with results |
| `failed` | Job encountered an error during processing |

---

## Examples

### Complete Workflow Using cURL

```bash
# 1. Create a job
JOB_RESPONSE=$(curl -X POST http://localhost:8000/meetings \
  -H "Content-Type: application/json" \
  -d '{"meeting_url": "https://meet.google.com/kkx-yhbd-dnc"}')

# Extract job_id
JOB_ID=$(echo $JOB_RESPONSE | grep -o '"job_id":"[^"]*"' | cut -d'"' -f4)
echo "Job ID: $JOB_ID"

# 2. Poll for completion
while true; do
  STATUS_RESPONSE=$(curl http://localhost:8000/meetings/$JOB_ID)
  STATUS=$(echo $STATUS_RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  echo "Current status: $STATUS"
  
  if [ "$STATUS" == "completed" ] || [ "$STATUS" == "failed" ]; then
    break
  fi
  
  sleep 10
done

# 3. Get results
curl http://localhost:8000/meetings/$JOB_ID/result
```

### Complete Workflow Using Python

```python
import requests
import json
import time

BASE_URL = "http://localhost:8000"

# 1. Create job
print("Creating meeting job...")
create_response = requests.post(
    f"{BASE_URL}/meetings",
    json={"meeting_url": "https://meet.google.com/kkx-yhbd-dnc"},
    headers={"Content-Type": "application/json"}
)

job_data = create_response.json()
job_id = job_data["job_id"]
print(f"✓ Job created: {job_id}")

# 2. Poll for completion
print("\nWaiting for processing...")
max_wait = 1800  # 30 minutes
start_time = time.time()
poll_interval = 10

while time.time() - start_time < max_wait:
    status_response = requests.get(f"{BASE_URL}/meetings/{job_id}")
    status_data = status_response.json()
    status = status_data.get("status", "unknown")
    
    print(f"  Status: {status}")
    
    if status == "completed":
        print("✓ Processing completed!")
        break
    elif status == "failed":
        print("✗ Processing failed!")
        break
    
    time.sleep(poll_interval)

# 3. Get results
if status == "completed":
    print("\nFetching results...")
    result_response = requests.get(f"{BASE_URL}/meetings/{job_id}/result")
    result_data = result_response.json()
    
    print("\n=== ANALYSIS RESULTS ===\n")
    
    result = result_data["result"]
    
    print("SUMMARY:")
    print(result["summary"])
    
    print("\nKEY DECISIONS:")
    for decision in result["key_decisions"]:
        print(f"  • {decision}")
    
    print("\nACTION ITEMS:")
    for item in result["action_items"]:
        print(f"  • {item['task']} (Owner: {item['owner']}, Due: {item['due_date']})")
    
    print("\nRISKS & BLOCKERS:")
    for risk in result["risks_blockers"]:
        print(f"  • {risk['item']} (Severity: {risk['severity']})")
```

### Using JavaScript/Node.js

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function processMeeting(meetingUrl) {
  try {
    // 1. Create job
    console.log('Creating meeting job...');
    const createResponse = await axios.post(`${BASE_URL}/meetings`, {
      meeting_url: meetingUrl
    });
    
    const jobId = createResponse.data.job_id;
    console.log(`✓ Job created: ${jobId}`);
    
    // 2. Poll for completion
    console.log('\nWaiting for processing...');
    let status = 'processing';
    let maxWait = 1800000; // 30 minutes in ms
    let startTime = Date.now();
    
    while (Date.now() - startTime < maxWait && status === 'processing') {
      const statusResponse = await axios.get(`${BASE_URL}/meetings/${jobId}`);
      status = statusResponse.data.status;
      console.log(`  Status: ${status}`);
      
      if (status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s
      }
    }
    
    if (status === 'completed') {
      // 3. Get results
      console.log('\nFetching results...');
      const resultResponse = await axios.get(`${BASE_URL}/meetings/${jobId}/result`);
      const result = resultResponse.data.result;
      
      console.log('\n=== ANALYSIS RESULTS ===\n');
      console.log('SUMMARY:', result.summary);
      console.log('KEY DECISIONS:', result.key_decisions);
      console.log('ACTION ITEMS:', result.action_items);
      console.log('RISKS:', result.risks_blockers);
      
      return result;
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Usage
processMeeting('https://meet.google.com/kkx-yhbd-dnc');
```

---

## Rate Limiting

Currently not implemented. For production deployment, consider:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/meetings")
@limiter.limit("10/minute")
async def create_meeting(request: MeetingRequest):
    # endpoint logic
```

---

## Common Response Patterns

### Success Response Pattern
```json
{
  "job_id": "uuid-string",
  "status": "processing|completed|failed",
  "result": {}  // Only in /result endpoint when completed
}
```

### Error Response Pattern
```json
{
  "error": "Human-readable error message",
  "detail": {} // Additional error details if available
}
```

---

## Testing API Endpoints

### Using Postman

1. Create new Collection: "Agentic Meeting Assistant"
2. Add requests for each endpoint
3. Use environment variables for dynamic job_id

### Using Swagger UI

Visit: `http://localhost:8000/docs`

Interactive API documentation with "Try it out" feature.

### Using ReDoc

Visit: `http://localhost:8000/redoc`

Alternative API documentation view.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-28 | Initial API release |
| TBD | TBD | API key authentication |
| TBD | TBD | Rate limiting |
| TBD | TBD | WebSocket real-time updates |

---

For more details, see [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
