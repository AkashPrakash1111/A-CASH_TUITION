from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime

from database.db import Base


class Student(Base):
    """
    Roster entry for a student — separate from their login account (User).
    `user_id` optionally links to the User created for their login, so
    later features (e.g. the student's own dashboard) can look up their
    class/batch without duplicating data. Nullable because older/edited
    entries may not always have this set.
    """
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    name = Column(String, nullable=False)
    className = Column(String, nullable=False)
    batch = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    dob = Column(String, nullable=True)
    parent = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    subject = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    qualification = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    className = Column(String, nullable=True)
    teacher = Column(String, nullable=True)
    description = Column(String, nullable=True)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)


class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    batchName = Column(String, nullable=False)
    className = Column(String, nullable=True)
    subject = Column(String, nullable=True)
    teacher = Column(String, nullable=True)
    days = Column(String, nullable=True)
    time = Column(String, nullable=True)
    capacity = Column(String, nullable=True)
    enrolled = Column(String, nullable=True)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)
