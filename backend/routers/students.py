from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from database.db import get_db
from models.academic import Student
from models.user import User, UserRole
from schemas.academic import StudentCreate, StudentOut
from utils.security import hash_password
from utils.deps import get_current_user, require_role

router = APIRouter(prefix="/students", tags=["students"])


@router.get("", response_model=list[StudentOut])
def list_students(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    students = db.query(Student).order_by(Student.created_at.desc()).all()
    user_ids = [s.user_id for s in students if s.user_id]
    users_by_id = {u.id: u for u in db.query(User).filter(User.id.in_(user_ids)).all()} if user_ids else {}

    # Also map by name lowercase as fallback for legacy records
    users_by_name = {u.name.lower(): u for u in db.query(User).all()}

    out = []
    for s in students:
        item = StudentOut.model_validate(s)
        linked_user = users_by_id.get(s.user_id) or users_by_name.get(s.name.lower())
        if linked_user:
            item.avatar_config = linked_user.avatar_config
            item.email = linked_user.email
            item.username = linked_user.username
            item.login_id = linked_user.username or linked_user.email
        out.append(item)
    return out


@router.post("", response_model=StudentOut, status_code=201)
def create_student(
    payload: StudentCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_role(UserRole.admin)),
):
    user_id = payload.user_id

    # If login credentials provided, create User account atomically
    if payload.password:
        if len(payload.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

        raw_id = payload.login_id or payload.name.lower().replace(" ", "_")
        clean_identifier = raw_id.strip()
        clean_email = clean_identifier if "@" in clean_identifier else f"{clean_identifier.lower()}@acash.local"

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
                role=UserRole.student,
                is_active=True,
            )
            db.add(new_user)
            db.flush()
            user_id = new_user.id

    student_data = payload.model_dump(exclude={"login_id", "password"})
    student_data["user_id"] = user_id
    student = Student(**student_data)
    db.add(student)
    db.commit()
    db.refresh(student)

    item = StudentOut.model_validate(student)
    if student.user_id:
        u = db.query(User).filter(User.id == student.user_id).first()
        if u:
            item.avatar_config = u.avatar_config
            item.email = u.email
            item.username = u.username
            item.login_id = u.username or u.email
    return item


@router.put("/{student_id}", response_model=StudentOut)
def update_student(
    student_id: int,
    payload: StudentCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_role(UserRole.admin)),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    for key, value in payload.model_dump().items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)

    item = StudentOut.model_validate(student)
    if student.user_id:
        u = db.query(User).filter_by(id=student.user_id).first()
        if u:
            item.avatar_config = u.avatar_config
            item.email = u.email
    return item


@router.delete("/{student_id}", status_code=204)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_role(UserRole.admin)),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
