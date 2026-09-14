from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models.academic import Teacher
from models.user import UserRole
from schemas.academic import TeacherCreate, TeacherOut
from utils.deps import require_role

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.get("", response_model=list[TeacherOut])
def list_teachers(db: Session = Depends(get_db), _admin=Depends(require_role(UserRole.admin))):
    return db.query(Teacher).order_by(Teacher.created_at.desc()).all()


@router.post("", response_model=TeacherOut, status_code=201)
def create_teacher(payload: TeacherCreate, db: Session = Depends(get_db), _admin=Depends(require_role(UserRole.admin))):
    teacher = Teacher(**payload.model_dump())
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher


@router.put("/{teacher_id}", response_model=TeacherOut)
def update_teacher(teacher_id: int, payload: TeacherCreate, db: Session = Depends(get_db), _admin=Depends(require_role(UserRole.admin))):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    for key, value in payload.model_dump().items():
        setattr(teacher, key, value)

    db.commit()
    db.refresh(teacher)
    return teacher


@router.delete("/{teacher_id}", status_code=204)
def delete_teacher(teacher_id: int, db: Session = Depends(get_db), _admin=Depends(require_role(UserRole.admin))):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    db.delete(teacher)
    db.commit()
