from fastapi import APIRouter, BackgroundTasks, Depends
from requests import Session
from app.api.db_dependency import get_db
from app.dependencies.auth import get_current_user
from app.pipelines.meeting_pipeline import MeetingPipeline
from app.schemas.meeting_schema import MeetingRequest
from app.utils.logger import setup_logger
import uuid
from app.db.database import SessionLocal
from app.db.models import Meeting, Task
from app.store.job_store import jobs

logger = setup_logger(__name__)
router = APIRouter()
pipeline = MeetingPipeline()


@router.post("/inject-bot")
def create_meeting(
    request: MeetingRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    job_id = str(uuid.uuid4())

    meeting = Meeting(
        meeting_url=request.meeting_url,
        status="processing",
        summary=None,
        bot_id=None,
        user_id=user.id
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    jobs[job_id] = {
        "status": "processing",
        "meeting_id": meeting.id
    }

    def run():
        local_db = SessionLocal()
        try:
            # Fetch the meeting object within the new session
            db_meeting = local_db.query(Meeting).filter(Meeting.id == meeting.id).first()
            if not db_meeting:
                logger.error(f"Meeting {meeting.id} not found in background task")
                return

            result = pipeline.run(local_db, db_meeting)

            jobs[job_id]["status"] = "completed"
            jobs[job_id]["result"] = result

        except Exception as e:
            jobs[job_id]["status"] = "failed"
            jobs[job_id]["result"] = str(e)
            logger.error(f"Error in background task: {str(e)}")

        finally:
            local_db.close()

    background_tasks.add_task(run)

    return {
        "job_id": job_id,
        "meeting_id": meeting.id
    }


# @router.get("/meetings/{job_id}")
# def get_status(job_id: str):
#     job = jobs.get(job_id)

#     if not job:
#         return {"error": "Job not found"}

#     return {
#         "job_id": job_id,
#         "status": job["status"]
#     }



# @router.get("/meetings/{job_id}/result")
# def get_result(job_id: str):
#     job = jobs.get(job_id)

#     if not job:
#         return {"error": "Job not found"}

#     if job["status"] != "completed":
#         return {
#             "status": job["status"],
#             "message": "Result not ready yet"
#         }

#     return {
#         "status": "completed",
#         "result": job["result"]
#     }


@router.get("/allmeetings")
def get_meetings(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    meetings = db.query(Meeting).filter(Meeting.user_id == user.id).all()
    return meetings


@router.get("/allmeetings/{meeting_id}")
def get_meeting_detail(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if not meeting:
        return {"error": "Meeting not found"}

    return {
        "id": meeting.id,
        "meeting_url": meeting.meeting_url,
        "title" : meeting.title,
        "status": meeting.status,
        "summary": meeting.summary,
        "transcript_raw": meeting.transcript_raw,
        "transcript_text": meeting.transcript_text,
        "created_at": meeting.created_at,
        "updated_at": meeting.updated_at,
        "tasks": [
            {
                "id": t.id,
                "task": t.task,
                "owner": t.owner_name,
                "priority": t.priority,
                "due_date": t.due_date,
                "is_completed": bool(t.is_completed),
                "created_at": t.created_at,
                "updated_at": t.updated_at
            }
            for t in meeting.tasks
        ],
        "participants": [
            {
                "id": p.id,
                "name": p.name,
                "email": p.email,
                "is_organizer": p.is_organizer,
                "avatar_url": p.avatar_url,
                "created_at": p.created_at
            }
            for p in meeting.participants
        ]
    }


@router.get("/tasks")
def get_tasks(
    db: Session = Depends(get_db),
    owner: str = None,
    priority: str = None
):
    query = db.query(Task)

    if owner:
        query = query.filter(Task.owner_name == owner)

    if priority:
        query = query.filter(Task.priority == priority)

    tasks = query.all()

    return [
        {
            "id": t.id,
            "task": t.task,
            "owner": t.owner_name,
            "priority": t.priority,
            "due_date": t.due_date,
            "is_completed": bool(t.is_completed),
            "meeting_id": t.meeting_id,
            "created_at": t.created_at
        }
        for t in tasks
    ]

@router.get("/meetings/{meeting_id}/tasks")
def get_meeting_tasks(meeting_id: int, db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.meeting_id == meeting_id).all()

    return [
        {
            "id": t.id,
            "task": t.task,
            "owner": t.owner_name,
            "priority": t.priority,
            "due_date": t.due_date,
            "is_completed": bool(t.is_completed)
        }
        for t in tasks
    ]