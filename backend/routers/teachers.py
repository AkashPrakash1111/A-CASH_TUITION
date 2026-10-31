import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from database.db import get_db
from models.academic import Teacher
from models.user import User, UserRole
from schemas.academic import TeacherCreate, TeacherOut
from schemas.user import AvatarUpdate
from utils.security import hash_password
from utils.deps import get_current_user, require_role

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.get("", response_model=list[TeacherOut])
def list_teachers(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    teachers = db.query(Teacher).order_by(Teacher.created_at.desc()).all()
    user_ids = [t.user_id for t in teachers if t.user_id]
    users_by_id = {u.id: u for u in db.query(User).filter(User.id.in_(user_ids)).all()} if user_ids else {}
    users_by_name = {u.name.lower(): u for u in db.query(User).all()}

    out = []
    for t in teachers:
        item = TeacherOut.model_validate(t)
        linked_user = users_by_id.get(t.user_id) or users_by_name.get(t.name.lower())
        if linked_user:
            item.avatar_config = linked_user.avatar_config
            item.username = linked_user.username
            item.login_id = linked_user.username or linked_user.email
            if not item.email:
                item.email = linked_user.email
        out.append(item)
    return out


@router.post("", response_model=TeacherOut, status_code=201)
def create_teacher(
    payload: TeacherCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_role(UserRole.admin)),
):
    user_id = payload.user_id

    # If login credentials provided, create User account atomically
    if payload.password:
        if len(payload.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

        raw_id = payload.login_id or payload.username or payload.name.lower().replace(" ", "_")
        clean_identifier = raw_id.strip()
        clean_email = (payload.email or (clean_identifier if "@" in clean_identifier else f"{clean_identifier.lower()}@acash.local")).strip()

        existing = db.query(User).filter(
            or_(
                func.lower(User.email) == clean_email.lower(),
                func.lower(User.username) == clean_identifier.lower(),
            )
        ).first()

        if existing:
            user_id = existing.id
        else:
            new_user = User(
                name=payload.name.strip(),
                username=clean_identifier,
                email=clean_email,
                hashed_password=hash_password(payload.password),
                role=UserRole.teacher,
                is_active=True,
            )
            db.add(new_user)
            db.flush()
            user_id = new_user.id

    teacher_data = payload.model_dump(exclude={"login_id", "password", "username"})
    teacher_data["user_id"] = user_id
    teacher = Teacher(**teacher_data)
    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    item = TeacherOut.model_validate(teacher)
    if teacher.user_id:
        u = db.query(User).filter(User.id == teacher.user_id).first()
        if u:
            item.avatar_config = u.avatar_config
            item.username = u.username
            item.login_id = u.username or u.email
            if not item.email:
                item.email = u.email
    return item


@router.put("/{teacher_id}", response_model=TeacherOut)
def update_teacher(
    teacher_id: int,
    payload: TeacherCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_role(UserRole.admin)),
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    for key, value in payload.model_dump().items():
        setattr(teacher, key, value)

    db.commit()
    db.refresh(teacher)

    item = TeacherOut.model_validate(teacher)
    if teacher.user_id:
        u = db.query(User).filter_by(id=teacher.user_id).first()
        if u:
            item.avatar_config = u.avatar_config
    return item


@router.put("/{teacher_id}/avatar", response_model=TeacherOut)
def update_teacher_avatar(
    teacher_id: int,
    payload: AvatarUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_role(UserRole.admin)),
):
    """Admin-controlled endpoint to customize a teacher's canonical avatar."""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    user = None
    if teacher.user_id:
        user = db.query(User).filter_by(id=teacher.user_id).first()

    if not user and teacher.name:
        user = db.query(User).filter_by(name=teacher.name).first()

    if user:
        user.avatar_config = json.dumps(payload.config)
        db.commit()

    item = TeacherOut.model_validate(teacher)
    item.avatar_config = json.dumps(payload.config)
    return item


@router.delete("/{teacher_id}", status_code=204)
def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_role(UserRole.admin)),
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    db.delete(teacher)
    db.commit()
