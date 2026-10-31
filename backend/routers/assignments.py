from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from database.db import get_db
from models.academic import Assignment, AssignmentSubmission, Batch, Teacher
from models.user import User, UserRole
from schemas.academic_ext import (
    AttachmentOut,
    AssignmentCreate,
    AssignmentOut,
    AssignmentSubmissionCreate,
    AssignmentSubmissionOut,
    AssignmentGradeUpdate,
)
from utils.attachments import dump, kind_from_name, parse_attachments, process_attachments
from utils.audience import find_student, in_audience, norm
from utils.deps import get_current_user, require_role

router = APIRouter(prefix="/assignments", tags=["assignments"])

NO_PROFILE = "Your student profile isn't set up yet. Ask your teacher to add you to a class."


# ---------------------------------------------------------------- helpers

def _parse_due(value: str | None) -> date | None:
    try:
        return date.fromisoformat((value or "").strip()[:10])
    except ValueError:
        return None


def _is_past_due(assignment: Assignment) -> bool:
    due = _parse_due(assignment.dueDate)
    return bool(due and date.today() > due)


def _validate_audience(db: Session, class_name: str | None, batch: str | None):
    """A class is required; a batch is optional but must exist in that class.
    Returns the cleaned (class, batch-or-None)."""
    class_name = (class_name or "").strip()
    batch = (batch or "").strip() or None

    if not class_name:
        raise HTTPException(status_code=400, detail="Choose a class for this assignment")

    if batch:
        found = (
            db.query(Batch)
            .filter(
                func.lower(Batch.batchName) == batch.lower(),
                func.lower(Batch.className) == class_name.lower(),
            )
            .first()
        )
        if not found:
            raise HTTPException(status_code=400, detail="That batch does not exist in the chosen class")

    return class_name, batch


def _legacy_to_attachments(file_url, file_name):
    """Older clients send one file as fileUrl/fileName instead of a list."""
    if not file_url:
        return []
    kind = "file"
    if file_url.startswith("data:"):
        mime = file_url[5:].split(";")[0].lower()
        kind = "pdf" if mime == "application/pdf" else "image" if mime.startswith("image/") else "audio" if mime.startswith("audio/") else "file"
    else:
        kind = kind_from_name(file_name or file_url)
    return [{"name": file_name, "type": kind, "url": file_url}]


def _atts(raw, legacy_url=None, legacy_name=None) -> list[AttachmentOut]:
    return [AttachmentOut(**a) for a in parse_attachments(raw, legacy_url, legacy_name)]


def _sub_out(sub: AssignmentSubmission) -> AssignmentSubmissionOut:
    item = AssignmentSubmissionOut.model_validate(sub)
    item.attachments = _atts(sub.attachmentsJson, sub.fileUrl, sub.fileName)
    return item


def _assignment_out(db: Session, a: Assignment, student=None) -> AssignmentOut:
    item = AssignmentOut.model_validate(a)
    item.attachments = _atts(a.attachmentsJson, a.fileUrl, a.fileName)
    item.due_date = a.dueDate
    item.max_marks = a.maxMarks
    item.subject_name = a.subject
    item.submissions_count = db.query(AssignmentSubmission).filter_by(assignment_id=a.id).count()

    if student:
        sub = (
            db.query(AssignmentSubmission)
            .filter_by(assignment_id=a.id, student_id=student.id)
            .first()
        )
        if sub:
            item.is_submitted = True
            item.submission_id = sub.id
            item.submission_status = sub.status
            item.submission_text = sub.textContent
            item.submission_attachments = _atts(sub.attachmentsJson, sub.fileUrl, sub.fileName)
            item.submitted_at = sub.submitted_at
            item.submission_file_url = sub.fileUrl
            # Marks and feedback only become visible once a teacher has reviewed it
            if sub.status in ("Reviewed", "Returned"):
                item.marks_obtained = sub.marksObtained
                item.marksObtained = sub.marksObtained
                item.feedback = sub.feedback
                item.correctionData = sub.correctionData
                item.questionMarksJson = sub.questionMarksJson
    return item


def _can_student_see(assignment: Assignment, student) -> bool:
    return in_audience(assignment.className, assignment.batch, student)


# ---------------------------------------------------------------- assignments

@router.get("", response_model=list[AssignmentOut])
def list_assignments(
    className: str | None = None,
    subject: str | None = None,
    batch: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Assignment).order_by(Assignment.created_at.desc())

    if className:
        query = query.filter(Assignment.className == className)
    if subject:
        query = query.filter(Assignment.subject == subject)
    if batch:
        query = query.filter(Assignment.batch == batch)

    assignments = query.all()

    student = None
    if current_user.role == UserRole.student:
        student = find_student(db, current_user)
        assignments = [a for a in assignments if _can_student_see(a, student)]

    return [_assignment_out(db, a, student) for a in assignments]


@router.post("", response_model=AssignmentOut, status_code=status.HTTP_201_CREATED)
def create_assignment(
    payload: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Give the assignment a title")

    class_name, batch = _validate_audience(db, payload.className, payload.batch)

    teacher_id = payload.teacher_id
    if current_user.role == UserRole.teacher and not teacher_id:
        t = db.query(Teacher).filter_by(user_id=current_user.id).first()
        if t:
            teacher_id = t.id

    due_date = payload.dueDate or payload.due_date
    max_marks = str(payload.maxMarks or payload.max_marks or "")

    raw_items = payload.attachments
    if raw_items is None:
        raw_items = _legacy_to_attachments(payload.fileUrl or payload.file_url, payload.fileName or payload.file_name)
    attachments = process_attachments(raw_items, "assignments")

    assignment = Assignment(
        title=payload.title.strip(),
        description=payload.description or "",
        className=class_name,
        subject=payload.subject,
        batch=batch,
        dueDate=due_date,
        maxMarks=max_marks,
        fileName=attachments[0]["name"] if attachments else None,
        fileUrl=attachments[0]["url"] if attachments else None,
        attachmentsJson=dump(attachments),
        teacher_id=teacher_id,
        createdBy=payload.createdBy or current_user.name,
        status=payload.status,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return _assignment_out(db, assignment)


@router.get("/student/my-submissions", response_model=list[AssignmentSubmissionOut])
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.student)),
):
    student = find_student(db, current_user)
    if not student:
        return []
    rows = (
        db.query(AssignmentSubmission)
        .filter_by(student_id=student.id)
        .order_by(AssignmentSubmission.submitted_at.desc())
        .all()
    )
    return [_sub_out(s) for s in rows]


@router.get("/submissions/{submission_id}", response_model=AssignmentSubmissionOut)
def get_assignment_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    submission = db.query(AssignmentSubmission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if current_user.role == UserRole.student:
        student = find_student(db, current_user)
        if not student or submission.student_id != student.id:
            raise HTTPException(status_code=404, detail="Submission not found")

    return _sub_out(submission)


@router.put("/submissions/{submission_id}/grade", response_model=AssignmentSubmissionOut)
def grade_submission(
    submission_id: int,
    payload: AssignmentGradeUpdate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    submission = db.query(AssignmentSubmission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if payload.status not in ("Reviewed", "Returned"):
        raise HTTPException(status_code=400, detail="Status must be Reviewed or Returned")

    if payload.marksObtained is not None and str(payload.marksObtained).strip() != "":
        try:
            marks = float(payload.marksObtained)
        except ValueError:
            raise HTTPException(status_code=400, detail="Marks must be a number")

        assignment = db.query(Assignment).filter_by(id=submission.assignment_id).first()
        try:
            max_marks = float(assignment.maxMarks) if assignment and assignment.maxMarks else None
        except ValueError:
            max_marks = None

        if marks < 0 or (max_marks is not None and marks > max_marks):
            limit = f"between 0 and {assignment.maxMarks}" if max_marks is not None else "0 or more"
            raise HTTPException(status_code=400, detail=f"Marks must be {limit}")

        submission.marksObtained = str(payload.marksObtained).strip()

    if payload.feedback is not None:
        submission.feedback = payload.feedback
    if payload.correctionData is not None:
        submission.correctionData = payload.correctionData
    if payload.questionMarksJson is not None:
        submission.questionMarksJson = payload.questionMarksJson

    submission.status = payload.status
    submission.graded_at = datetime.utcnow()

    db.commit()
    db.refresh(submission)

    # Award bonus CASH on high score (>= 90%)
    try:
        if payload.marksObtained is not None:
            assignment = db.query(Assignment).filter_by(id=submission.assignment_id).first()
            max_m = float(assignment.maxMarks) if assignment and assignment.maxMarks else 100.0
            obtained = float(payload.marksObtained)
            if max_m > 0 and (obtained / max_m) >= 0.90:
                from routers.rewards import award_student_cash, get_or_create_config
                cfg = get_or_create_config(db)
                award_student_cash(
                    db=db,
                    student_id=submission.student_id,
                    amount=cfg.high_score_cash,
                    trans_type="high_score_bonus",
                    description=f"High Score Honor (90%+) on {assignment.title}",
                    reference_id=assignment.id,
                )
    except Exception as e:
        print(f"Notice: assignment bonus cash skipped: {e}")

    return _sub_out(submission)


@router.get("/{assignment_id}", response_model=AssignmentOut)
def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    student = None
    if current_user.role == UserRole.student:
        student = find_student(db, current_user)
        if not _can_student_see(assignment, student):
            raise HTTPException(status_code=404, detail="Assignment not found")

    return _assignment_out(db, assignment, student)


@router.put("/{assignment_id}", response_model=AssignmentOut)
def update_assignment(
    assignment_id: int,
    payload: AssignmentCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Give the assignment a title")

    class_name, batch = _validate_audience(db, payload.className, payload.batch)

    assignment.title = payload.title.strip()
    assignment.description = payload.description or ""
    assignment.className = class_name
    assignment.batch = batch
    assignment.subject = payload.subject

    due = payload.dueDate or payload.due_date
    if due is not None:
        assignment.dueDate = due
    marks = payload.maxMarks or payload.max_marks
    if marks is not None:
        assignment.maxMarks = str(marks)

    # Only change the status if the caller actually sent one (the edit form
    # doesn't, and an edit must not quietly re-open a closed assignment).
    if "status" in payload.model_fields_set:
        assignment.status = payload.status

    # attachments: None = leave as they are; a list (even empty) = replace
    raw_items = payload.attachments
    if raw_items is None and (payload.fileUrl or payload.file_url):
        raw_items = _legacy_to_attachments(payload.fileUrl or payload.file_url, payload.fileName or payload.file_name)
    if raw_items is not None:
        attachments = process_attachments(raw_items, "assignments")
        assignment.attachmentsJson = dump(attachments)
        assignment.fileName = attachments[0]["name"] if attachments else None
        assignment.fileUrl = attachments[0]["url"] if attachments else None

    db.commit()
    db.refresh(assignment)
    return _assignment_out(db, assignment)


@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    db.query(AssignmentSubmission).filter_by(assignment_id=assignment_id).delete()
    db.delete(assignment)
    db.commit()


# ---------------------------------------------------------------- submissions

@router.post("/{assignment_id}/submit", response_model=AssignmentSubmissionOut, status_code=status.HTTP_201_CREATED)
def submit_assignment(
    assignment_id: int,
    payload: AssignmentSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.student)),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    student = find_student(db, current_user)
    if not student:
        raise HTTPException(status_code=403, detail=NO_PROFILE)

    # Not in this student's class/batch: behave as if it doesn't exist
    if not _can_student_see(assignment, student):
        raise HTTPException(status_code=404, detail="Assignment not found")

    if norm(assignment.status) == "closed":
        raise HTTPException(status_code=400, detail="This assignment is closed")

    text = (payload.textContent or payload.submission_text or "").strip()
    if len(text) > 100_000:
        raise HTTPException(status_code=400, detail="That answer is too long")

    raw_items = payload.attachments
    if raw_items is None:
        raw_items = _legacy_to_attachments(payload.fileUrl or payload.file_url, payload.fileName or payload.file_name)

    if not text and not raw_items:
        raise HTTPException(
            status_code=400,
            detail="Add your answer: write something, or attach a photo, PDF or voice recording",
        )

    submission = (
        db.query(AssignmentSubmission)
        .filter_by(assignment_id=assignment_id, student_id=student.id)
        .first()
    )

    # Once graded it's final, unless the teacher sent it back ("Returned")
    if submission and submission.status == "Reviewed":
        raise HTTPException(status_code=400, detail="This has already been graded and can't be changed")

    is_new_submission = submission is None
    attachments = process_attachments(raw_items, "submissions")
    new_status = "Late" if _is_past_due(assignment) else "Submitted"

    if submission:
        submission.textContent = text or None
        submission.attachmentsJson = dump(attachments)
        submission.fileUrl = attachments[0]["url"] if attachments else None
        submission.fileName = attachments[0]["name"] if attachments else None
        submission.status = new_status
        submission.submitted_at = datetime.utcnow()
        submission.marksObtained = None
        submission.graded_at = None
    else:
        submission = AssignmentSubmission(
            assignment_id=assignment_id,
            student_id=student.id,
            student_name=student.name,
            batch=student.batch,
            fileUrl=attachments[0]["url"] if attachments else None,
            fileName=attachments[0]["name"] if attachments else None,
            attachmentsJson=dump(attachments),
            textContent=text or None,
            status=new_status,
        )
        db.add(submission)

    db.commit()
    db.refresh(submission)

    # Award CASH once per assignment, not again on every resubmission
    try:
        if not is_new_submission:
            return _sub_out(submission)
        from routers.rewards import award_student_cash, get_or_create_config
        cfg = get_or_create_config(db)
        award_student_cash(
            db=db,
            student_id=student.id,
            amount=cfg.assignment_cash,
            trans_type="assignment_turnin",
            description=f"Turned in Assignment: {assignment.title}",
            reference_id=assignment.id,
            user_id=current_user.id,
        )
    except Exception as e:
        print(f"Notice: assignment submission cash skipped: {e}")

    return _sub_out(submission)


@router.get("/{assignment_id}/submissions", response_model=list[AssignmentSubmissionOut])
def list_assignment_submissions(
    assignment_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    rows = (
        db.query(AssignmentSubmission)
        .filter_by(assignment_id=assignment_id)
        .order_by(AssignmentSubmission.submitted_at.desc())
        .all()
    )
    return [_sub_out(s) for s in rows]
