from fastapi import APIRouter, BackgroundTasks
from app.pipelines.meeting_pipeline import MeetingPipeline
from app.schemas.meeting_schema import MeetingRequest
from app.utils.logger import setup_logger
import uuid
from app.store.job_store import jobs

logger = setup_logger(__name__)
router = APIRouter()
pipeline = MeetingPipeline()


# @router.post("/meetings/process")
# def process_meeting(request: MeetingRequest, background_tasks: BackgroundTasks):
#     logger.info(f"Received request to process meeting: {request.meeting_url}")
#     def run_pipeline():
#         try:
#             pipeline.run(request.meeting_url)
#             logger.info(f"Successfully processed meeting: {request.meeting_url}")
#         except Exception as e:
#             logger.error(f"Error processing meeting {request.meeting_url}: {str(e)}")

#     background_tasks.add_task(run_pipeline)

#     return {
#         "status": "processing",
#         "message": "Meeting processing started"
#     }


@router.post("/meetings")
def create_meeting(request: MeetingRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())

    jobs[job_id] = {
        "status": "processing",
        "result": None
    }

    def run():
        try:
            result = pipeline.run(request.meeting_url)
            jobs[job_id]["status"] = "completed"
            jobs[job_id]["result"] = result
        except Exception as e:
            jobs[job_id]["status"] = "failed"
            jobs[job_id]["result"] = str(e)

    background_tasks.add_task(run)

    return {
        "job_id": job_id,
        "status": "processing"
    }


@router.get("/meetings/{job_id}")
def get_status(job_id: str):
    job = jobs.get(job_id)

    if not job:
        return {"error": "Job not found"}

    return {
        "job_id": job_id,
        "status": job["status"]
    }



@router.get("/meetings/{job_id}/result")
def get_result(job_id: str):
    job = jobs.get(job_id)

    if not job:
        return {"error": "Job not found"}

    if job["status"] != "completed":
        return {
            "status": job["status"],
            "message": "Result not ready yet"
        }

    return {
        "status": "completed",
        "result": job["result"]
    }






