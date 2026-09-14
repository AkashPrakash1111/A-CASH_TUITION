from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models.academic import Student
from models.user import UserRole
from schemas.academic import StudentCreate, StudentOut
from utils.deps import require_role

router = APIRouter(prefix="/students", tags=["students"])


@router.get("", response_model=list[StudentOut])
def list_students(db: Session = Depends(get_db), _admin=Depends(require_role(UserRole.admin))):
    return db.query(Student).order_by(Student.created_at.desc()).all()


@router.post("", response_model=StudentOut, status_code=201)
def create_student(payload: StudentCreate, db: Session = Depends(get_db), _admin=Depends(require_role(UserRole.admin))):
    student = Student(**payload.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.put("/{student_id}", response_model=StudentOut)
def update_student(student_id: int, payload: StudentCreate, db: Session = Depends(get_db), _admin=Depends(require_role(UserRole.admin))):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    for key, value in payload.model_dump().items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}", status_code=204)
def delete_student(student_id: int, db: Session = Depends(get_db), _admin=Depends(require_role(UserRole.admin))):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
