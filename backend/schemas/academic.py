from datetime import datetime
from pydantic import BaseModel


# ---- Student ----

class StudentCreate(BaseModel):
    name: str
    className: str
    batch: str | None = None
    gender: str | None = None
    dob: str | None = None
    parent: str | None = None
    phone: str | None = None
    status: str = "Active"
    user_id: int | None = None
    login_id: str | None = None
    password: str | None = None


class StudentOut(BaseModel):
    id: int
    name: str
    className: str
    batch: str | None = None
    gender: str | None = None
    dob: str | None = None
    parent: str | None = None
    phone: str | None = None
    status: str = "Active"
    user_id: int | None = None
    login_id: str | None = None
    username: str | None = None
    email: str | None = None
    avatar_config: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Teacher ----

class TeacherCreate(BaseModel):
    name: str
    subject: str | None = None
    batch: str | None = None
    phone: str | None = None
    email: str | None = None
    qualification: str | None = None
    experience: str | None = None
    status: str = "Active"
    user_id: int | None = None
    login_id: str | None = None
    username: str | None = None
    password: str | None = None


class TeacherOut(BaseModel):
    id: int
    name: str
    subject: str | None = None
    batch: str | None = None
    phone: str | None = None
    email: str | None = None
    qualification: str | None = None
    experience: str | None = None
    status: str = "Active"
    user_id: int | None = None
    login_id: str | None = None
    username: str | None = None
    avatar_config: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Subject ----

class SubjectCreate(BaseModel):
    name: str
    className: str | None = None
    teacher: str | None = None
    description: str | None = None
    status: str = "Active"


class SubjectOut(SubjectCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Batch ----

class BatchCreate(BaseModel):
    batchName: str
    className: str | None = None
    subject: str | None = None
    teacher: str | None = None
    days: str | None = None
    time: str | None = None
    capacity: str | None = None
    enrolled: str | None = None
    status: str = "Active"


class BatchOut(BatchCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
