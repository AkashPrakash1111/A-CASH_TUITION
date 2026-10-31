import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from database.db import get_db
from models.messaging import StudyMessage, AuditLog
from models.parent import Parent, ParentStudentLink
from models.academic import Student
from models.user import User, UserRole
from schemas.academic_ext import StudyMessageCreate, StudyMessageOut, AuditLogOut
from utils.deps import get_current_user, require_role

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("", response_model=list[StudyMessageOut])
def get_my_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns messages involving the current user, newest first."""
    return (
        db.query(StudyMessage)
        .filter(
            or_(
                StudyMessage.sender_user_id == current_user.id,
                StudyMessage.recipient_user_id == current_user.id,
            )
        )
        .order_by(StudyMessage.created_at.desc())
        .limit(100)
        .all()
    )


@router.get("/thread/{other_user_id}", response_model=list[StudyMessageOut])
def get_thread(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns ordered conversation between current user and specified peer."""
    messages = (
        db.query(StudyMessage)
        .filter(
            or_(
                and_(StudyMessage.sender_user_id == current_user.id, StudyMessage.recipient_user_id == other_user_id),
                and_(StudyMessage.sender_user_id == other_user_id, StudyMessage.recipient_user_id == current_user.id),
            )
        )
        .order_by(StudyMessage.created_at.asc())
        .all()
    )
    # Mark messages sent to current_user as read
    for msg in messages:
        if msg.recipient_user_id == current_user.id and not msg.is_read:
            msg.is_read = True
    db.commit()
    return messages


@router.post("", response_model=StudyMessageOut, status_code=status.HTTP_201_CREATED)
def send_message(
    payload: StudyMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipient = db.query(User).filter_by(id=payload.recipient_user_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    message = StudyMessage(
        sender_user_id=current_user.id,
        recipient_user_id=recipient.id,
        sender_name=current_user.name,
        recipient_name=recipient.name,
        subject_tag=payload.subject_tag,
        content=payload.content,
        file_url=payload.file_url,
        is_read=False,
    )
    db.add(message)

    # Add audit log for safe supervision
    audit = AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.name,
        actor_role=current_user.role.value,
        action="SEND_STUDY_MESSAGE",
        entity_type="study_message",
        details_json=json.dumps({
            "recipient_id": recipient.id,
            "recipient_name": recipient.name,
            "subject_tag": payload.subject_tag,
        }),
    )
    db.add(audit)
    db.commit()
    db.refresh(message)
    return message


@router.get("/supervised/{student_user_id}", response_model=list[StudyMessageOut])
def get_supervised_messages(
    student_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Supervision endpoint for Parents and Admins only.
    Verifies that a Parent is linked to the target student before granting audit visibility.
    """
    if current_user.role == UserRole.admin:
        pass  # Admin has institutional audit access
    elif current_user.role == UserRole.parent:
        parent_profile = db.query(Parent).filter_by(user_id=current_user.id).first()
        student_profile = db.query(Student).filter_by(user_id=student_user_id).first()
        if not parent_profile or not student_profile:
            raise HTTPException(status_code=403, detail="Not authorized to audit this student's communications")

        link = (
            db.query(ParentStudentLink)
            .filter_by(parent_id=parent_profile.id, student_id=student_profile.id)
            .first()
        )
        if not link:
            raise HTTPException(status_code=403, detail="You are not linked as parent for this student")
    else:
        raise HTTPException(status_code=403, detail="Supervision access restricted to Parents and Administrators")

    return (
        db.query(StudyMessage)
        .filter(
            or_(
                StudyMessage.sender_user_id == student_user_id,
                StudyMessage.recipient_user_id == student_user_id,
            )
        )
        .order_by(StudyMessage.created_at.desc())
        .all()
    )


@router.get("/audit-logs", response_model=list[AuditLogOut])
def list_audit_logs(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.admin)),
):
    """Institutional security audit logs for administrators."""
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
