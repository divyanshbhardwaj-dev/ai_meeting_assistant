from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from .database import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    meeting_url = Column(String)
    bot_id = Column(String, nullable=True)

    status = Column(String, default="pending")
    summary = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    transcript_raw = Column(JSON)      # full Recall response
    transcript_text = Column(Text)     # formatted version

    tasks = relationship("Task", back_populates="meeting")

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