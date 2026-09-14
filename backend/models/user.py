import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum as SqlEnum

from database.db import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    student = "student"


class User(Base):
    """
    A single table for both admin and student accounts, distinguished by `role`.

    Kept simple on purpose for phase 1 — student-specific fields (batch, class,
    parent contact, etc.) can be added to this table or split into a related
    StudentProfile table later without breaking auth.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SqlEnum(UserRole), nullable=False, default=UserRole.student)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    # Stores the chosen DiceBear customization options as a JSON string,
    # e.g. {"style": "adventurer", "seed": "...", "hair": "long03", ...}
    # Nullable so existing accounts (created before this feature) just get
    # a default look until the student customizes it themselves.
    avatar_config = Column(String, nullable=True)
