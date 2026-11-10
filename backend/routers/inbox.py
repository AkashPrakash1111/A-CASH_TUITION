"""
One place for staff to see everything students have handed in: assignments,
exams and personal note uploads, with filters (kind, class, batch, student,
subject, status). Each row carries the student's files and any marking already
done, so the marking studio can open straight from it.
"""
import json
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.db import get_db
from models.academic import (
    Assignment, AssignmentSubmission, Exam, ExamSubmission, Note, Student,
)
from models.user import User, UserRole
from utils.attachments import kind_from_name, parse_attachments
from utils.audience import norm
from utils.deps import require_role

router = APIRouter(prefix="/submissions", tags=["inbox"])

LIMIT_PER_KIND = 400


def _files(raw, url, name, audio=None) -> list[dict]:
    files = parse_attachments(raw, url, name)
    if audio and not any(f["url"] == audio for f in files):
        files.append({"name": "Voice answer", "type": "audio", "url": audio})
    return files


def _marked(correction: str | None) -> bool:
    try:
        data = json.loads(correction) if correction else None
    except ValueError:
        return False
    return bool(data)


@router.get("/inbox")
def inbox(
    kind: str | None = None,          # assignment | exam | note
    className: str | None = None,
    batch: str | None = None,
    studentId: int | None = None,
    subject: str | None = None,
    status: str | None = None,        # pending | reviewed
    db: Session = Depends(get_db),
    _staff: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    students = {s.id: s for s in db.query(Student).all()}
    by_user = {s.user_id: s for s in students.values() if s.user_id}
    items: list[dict] = []

    def student_bits(st: Student | None, fallback_name: str, fallback_batch=None):
        return {
            "studentId": st.id if st else None,
            "studentName": st.name if st else fallback_name,
            "studentPhone": st.phone if st else None,
            "className": st.className if st else None,
            "batch": st.batch if st else fallback_batch,
        }

    if kind in (None, "", "assignment"):
        assignments = {a.id: a for a in db.query(Assignment).all()}
        rows = (
            db.query(AssignmentSubmission)
            .order_by(AssignmentSubmission.submitted_at.desc())
            .limit(LIMIT_PER_KIND)
            .all()
        )
        for r in rows:
            a = assignments.get(r.assignment_id)
            st = students.get(r.student_id)
            items.append({
                "kind": "assignment",
                "id": r.id,
                "parentId": r.assignment_id,
                "title": a.title if a else "Assignment",
                "subject": a.subject if a else None,
                "maxMarks": a.maxMarks if a else None,
                "questionPaperUrl": None,
                **student_bits(st, r.student_name, r.batch),
                "submittedAt": r.submitted_at,
                "status": r.status,
                "reviewed": r.status in ("Reviewed", "Returned"),
                "marksObtained": r.marksObtained,
                "feedback": r.feedback,
                "textContent": r.textContent,
                "files": _files(r.attachmentsJson, r.fileUrl, r.fileName),
                "correctionData": r.correctionData,
                "questionMarksJson": r.questionMarksJson,
                "correctedPdfUrl": r.correctedPdfUrl,
                "marked": _marked(r.correctionData),
            })

    if kind in (None, "", "exam"):
        exams = {e.id: e for e in db.query(Exam).all()}
        rows = (
            db.query(ExamSubmission)
            .filter(ExamSubmission.status != "In Progress")
            .order_by(ExamSubmission.submitted_at.desc())
            .limit(LIMIT_PER_KIND)
            .all()
        )
        for r in rows:
            e = exams.get(r.exam_id)
            st = students.get(r.student_id)
            items.append({
                "kind": "exam",
                "id": r.id,
                "parentId": r.exam_id,
                "title": e.examName if e else "Exam",
                "subject": e.subject if e else None,
                "maxMarks": e.maxMarks if e else None,
                "questionPaperUrl": e.questionPaperUrl if e else None,
                **student_bits(st, r.student_name, e.batch if e else None),
                "submittedAt": r.submitted_at,
                "status": r.status,
                "reviewed": r.status == "Graded",
                "marksObtained": r.marksObtained,
                "feedback": r.feedback,
                "textContent": r.textContent,
                "files": _files(r.attachmentsJson, r.answerSheetUrl, None, r.audioUrl),
                "correctionData": r.correctionData,
                "questionMarksJson": r.questionMarksJson,
                "correctedPdfUrl": r.correctedPdfUrl,
                "marked": _marked(r.correctionData),
            })

    if kind in (None, "", "note"):
        rows = (
            db.query(Note)
            .filter(Note.visibility == "private")
            .order_by(Note.created_at.desc())
            .limit(LIMIT_PER_KIND)
            .all()
        )
        for r in rows:
            st = by_user.get(r.uploader_id)
            files = parse_attachments(r.attachmentsJson)
            if not files and r.fileUrl and r.type in ("image", "pdf"):
                files = [{"name": r.fileName, "type": r.type, "url": r.fileUrl}]
            items.append({
                "kind": "note",
                "id": r.id,
                "parentId": None,
                "title": r.title,
                "subject": r.subject,
                "maxMarks": None,
                "questionPaperUrl": None,
                **student_bits(st, r.uploadedBy or "Student"),
                "submittedAt": r.created_at,
                "status": r.reviewStatus or "Submitted",
                "reviewed": r.reviewStatus == "Reviewed",
                "marksObtained": None,
                "feedback": r.reviewFeedback,
                "textContent": r.textContent,
                "files": files,
                "correctionData": r.correctionData,
                "questionMarksJson": None,
                "correctedPdfUrl": r.correctedPdfUrl,
                "marked": _marked(r.correctionData),
            })

    def keep(i: dict) -> bool:
        if className and norm(i["className"]) != norm(className):
            return False
        if batch and norm(i["batch"]) != norm(batch):
            return False
        if studentId and i["studentId"] != studentId:
            return False
        if subject and norm(i["subject"]) != norm(subject):
            return False
        if status == "pending" and i["reviewed"]:
            return False
        if status == "reviewed" and not i["reviewed"]:
            return False
        return True

    items = [i for i in items if keep(i)]
    items.sort(key=lambda i: i["submittedAt"] or datetime.min, reverse=True)
    return items
