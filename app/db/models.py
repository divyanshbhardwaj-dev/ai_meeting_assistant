from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from .database import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    meeting_url = Column(String)
    bot_id = Column(String, nullable=True)

    status = Column(String, default="pending")
    summary = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    transcript_raw = Column(JSON)      # full Recall response
    transcript_text = Column(Text)     # formatted version

    user_id = Column(UUID, ForeignKey("users.id"))
    user = relationship("User")

    tasks = relationship("Task", back_populates="meeting")

    google_event_id = Column(String, unique=True)

class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))

    name = Column(String)
    email = Column(String, nullable=True)

    # meeting = relationship("Meeting", back_populates="participants")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(Integer, ForeignKey("meetings.id"))

    task = Column(String)
    owner_name = Column(String)
    priority = Column(String)
    due_date = Column(String)

    meeting = relationship("Meeting", back_populates="tasks")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    google_access_token = Column(String)
    google_refresh_token = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)