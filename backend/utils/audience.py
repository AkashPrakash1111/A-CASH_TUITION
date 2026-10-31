"""
Who may see something that a teacher published to a class or batch.

Shared by notes and assignments so both apply exactly the same rule:

  - the student must have a roster entry (no entry -> sees nothing)
  - the item must name a class, and it must be the student's class
  - if the item names a batch it must be the student's batch;
    an item with no batch is for every batch in that class

Anything unclear is hidden rather than shown.
"""

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.academic import Student
from models.user import User


def norm(value: str | None) -> str:
    return (value or "").strip().lower()


def find_student(db: Session, user: User) -> Student | None:
    """The roster entry for a logged-in student: linked by user_id, or by an
    unambiguous name match for older entries that were never linked."""
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if student:
        return student
    matches = db.query(Student).filter(func.lower(Student.name) == norm(user.name)).all()
    return matches[0] if len(matches) == 1 else None


def in_audience(class_name: str | None, batch: str | None, student: Student | None) -> bool:
    if student is None:
        return False

    wanted_class = norm(class_name)
    if not wanted_class or wanted_class != norm(student.className):
        return False

    wanted_batch = norm(batch)
    if wanted_batch and wanted_batch != norm(student.batch):
        return False

    return True
