from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text

from database.db import Base


class StudyMessage(Base):
    """
    Academic messaging between students / study peers.
    Fully auditable by parents (for linked children) and administrators.
    """
    __tablename__ = "study_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_user_id = Column(Integer, nullable=False, index=True)    # User.id
    recipient_user_id = Column(Integer, nullable=False, index=True) # User.id
    sender_name = Column(String, nullable=False)
    recipient_name = Column(String, nullable=False)
    subject_tag = Column(String, nullable=True)                     # e.g., "Physics - Ch 3 Notes"
    content = Column(Text, nullable=False)
    file_url = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    """
    System-wide security and communication audit log.
    Ensures student safety and institutional transparency.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, nullable=True, index=True)           # User.id
    actor_name = Column(String, nullable=True)
    actor_role = Column(String, nullable=True)
    action = Column(String, nullable=False)                         # e.g., "SEND_MESSAGE", "DELETE_STUDENT"
    entity_type = Column(String, nullable=True)                     # "message", "note", "exam"
    entity_id = Column(String, nullable=True)
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
