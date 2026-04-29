from pydantic import BaseModel


class MeetingRequest(BaseModel):
    meeting_url: str
    summary: str = None
    status: str = "created"