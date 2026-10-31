from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey

from database.db import Base


class Parent(Base):
    """
    Parent account profile.
    Linked to a login account (User) via user_id.
    """
    __tablename__ = "parents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, unique=True)  # User.id
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    relation = Column(String, default="Parent")  # Father | Mother | Guardian
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)


class ParentStudentLink(Base):
    """
    Authoritative many-to-many junction between Parents and Students.
    Allows parents to view progress and audit study messages of their linked children.
    """
    __tablename__ = "parent_student_links"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("parents.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    relationship_type = Column(String, default="Parent")
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
