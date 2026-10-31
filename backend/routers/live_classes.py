import re

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.db import get_db
from models.academic import LiveClass, Student, Teacher
from models.user import User, UserRole
from schemas.academic_ext import LiveClassCreate, LiveClassOut, LiveClassUpdate
from utils.deps import get_current_user, require_role

router = APIRouter(prefix="/live-classes", tags=["live-classes"])

_WILDCARDS = {"", "all", "allbatches"}


def _norm(value: str | None) -> str:
    """'CLASS 7', 'class-7' and '7' all compare equal; case/spacing ignored."""
    text = re.sub(r"[^a-z0-9]+", "", (value or "").lower())
    return text[5:] if text.startswith("class") and len(text) > 5 else text


def live_class_visible_to(live_class: LiveClass, student: Student | None) -> bool:
    """
    Batch-wise delivery. A class is meant for ONE class (and optionally ONE batch
    of it). A student sees it only when both match:
      - class set, batch empty/"All" -> every batch of that class
      - class set, batch set         -> only that batch
      - class empty, batch set       -> older rows saved before the class field was
                                        used; matched against the student's batch or class
      - both empty                   -> open to everybody
    """
    target_class = _norm(live_class.className)
    target_batch = _norm(live_class.batch)
    batch_is_wild = target_batch in _WILDCARDS

    if not target_class and batch_is_wild:
        return True
    if student is None:
        return False

    my_class, my_batch = _norm(student.className), _norm(student.batch)
    if target_class:
        return target_class == my_class and (batch_is_wild or target_batch == my_batch)
    return target_batch in {my_class, my_batch}


def _student_of(db: Session, user: User) -> Student | None:
    return db.query(Student).filter_by(user_id=user.id).first()


@router.get("", response_model=list[LiveClassOut])
def list_live_classes(
    className: str | None = None,
    subject: str | None = None,
    batch: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(LiveClass).order_by(LiveClass.scheduledDate.asc(), LiveClass.startTime.asc())
    if className:
        query = query.filter(LiveClass.className == className)
    if subject:
        query = query.filter(LiveClass.subject == subject)
    if batch:
        query = query.filter(LiveClass.batch == batch)
    rows = query.all()

    if current_user.role == UserRole.student:
        student = _student_of(db, current_user)
        rows = [r for r in rows if live_class_visible_to(r, student)]
    return rows


@router.post("", response_model=LiveClassOut, status_code=status.HTTP_201_CREATED)
def create_live_class(
    payload: LiveClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    teacher_id = payload.teacher_id
    teacher_name = payload.teacherName or current_user.name
    if current_user.role == UserRole.teacher and not teacher_id:
        t = db.query(Teacher).filter_by(user_id=current_user.id).first()
        if t:
            teacher_id = t.id
            teacher_name = payload.teacherName or t.name

    live_class = LiveClass(
        title=payload.title,
        subject=payload.subject,
        className=payload.className,
        batch=payload.batch,
        teacher_id=teacher_id,
        teacherName=teacher_name,
        scheduledDate=payload.scheduledDate,
        startTime=payload.startTime,
        endTime=payload.endTime,
        meetingLink=payload.meetingLink,
        description=payload.description or "",
        status=payload.status,
    )
    db.add(live_class)
    db.commit()
    db.refresh(live_class)
    return live_class


@router.get("/{class_id}", response_model=LiveClassOut)
def get_live_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    live_class = db.query(LiveClass).filter(LiveClass.id == class_id).first()
    if not live_class:
        raise HTTPException(status_code=404, detail="Live class not found")
    if current_user.role == UserRole.student and not live_class_visible_to(
        live_class, _student_of(db, current_user)
    ):
        raise HTTPException(status_code=404, detail="Live class not found")
    return live_class


@router.put("/{class_id}", response_model=LiveClassOut)
def update_live_class(
    class_id: int,
    payload: LiveClassUpdate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    live_class = db.query(LiveClass).filter(LiveClass.id == class_id).first()
    if not live_class:
        raise HTTPException(status_code=404, detail="Live class not found")

    # Only the fields the client sent are changed (an omitted field used to be
    # reset to its default, wiping the link/date/time on every edit).
    for key, value in payload.model_dump(exclude_unset=True).items():
        if key == "title" and not (value or "").strip():
            continue  # never blank the title
        if key == "status" and not value:
            continue
        setattr(live_class, key, value)

    db.commit()
    db.refresh(live_class)
    return live_class


@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_live_class(
    class_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    live_class = db.query(LiveClass).filter(LiveClass.id == class_id).first()
    if not live_class:
        raise HTTPException(status_code=404, detail="Live class not found")

    db.delete(live_class)
    db.commit()
