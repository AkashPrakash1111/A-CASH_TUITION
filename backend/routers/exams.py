import json
import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database.db import get_db
from models.academic import Exam, ExamQuestion, ExamSubmission, Student, Teacher
from models.user import User, UserRole
from schemas.academic_ext import (
    BulkQuestionParseRequest,
    ExamCreate,
    ExamOut,
    ExamQuestionCreate,
    ExamQuestionOut,
    ExamSubmissionCreate,
    ExamSubmissionOut,
    ExamGradeUpdate,
)
from utils.deps import get_current_user, require_role
from utils.file_storage import ensure_persistent_file_url

router = APIRouter(prefix="/exams", tags=["exams"])


def _norm_target(value: str | None) -> str:
    """'CLASS 7', 'class-7' and '7' all compare equal."""
    text = re.sub(r"[^a-z0-9]+", "", (value or "").lower())
    return text[5:] if text.startswith("class") and len(text) > 5 else text


def _hide_answers(questions: list[ExamQuestionOut]) -> list[ExamQuestionOut]:
    """Students must never receive the answer key in the API response."""
    for q in questions:
        q.correctAnswer = None
        q.explanation = None
    return questions


def _student_view_of_submission(submission: ExamSubmission) -> ExamSubmissionOut:
    """
    Students only see marks, feedback and the teacher's markings once the
    teacher has sent the result back (status "Graded"). A saved draft
    ("Draft Graded") stays private to the teacher.
    """
    out = ExamSubmissionOut.model_validate(submission)
    if submission.status != "Graded":
        out.marksObtained = None
        out.feedback = None
        out.correctionData = None
        out.questionMarksJson = None
        if submission.status == "Draft Graded":
            out.status = "Submitted"
    return out


def exam_visible_to_student(exam: Exam, student: Student | None) -> bool:
    """
    The admin form has one "class / batch" picker that fills BOTH className and
    batch, so requiring both to equal the student's class AND batch hid exams
    from students whose batch is named differently from their class. An exam
    is visible when any of its targets matches the student's class or batch.
    """
    if student is None:
        return True
    targets = {_norm_target(exam.className), _norm_target(exam.batch)} - {""}
    if not targets:
        return True  # not targeted at anyone in particular
    mine = {_norm_target(student.className), _norm_target(student.batch)} - {""}
    return bool(targets & mine)


def parse_bulk_questions_text(text: str) -> list[dict]:
    """
    Parses Markdown/plain-text AI generated questions.
    Extracts question text, MCQ options (A-D), correct answer, marks, explanation.
    """
    if not text or not text.strip():
        return []

    lines = [line.strip() for line in text.replace("\r\n", "\n").split("\n")]
    questions = []
    current_q = None

    def finalize_current():
        if current_q and current_q["questionText"].strip():
            if len(current_q["options"]) >= 2:
                current_q["questionType"] = "mcq"
                current_q["optionsJson"] = json.dumps(current_q["options"])
            else:
                current_q["questionType"] = "text"
                current_q["optionsJson"] = "[]"
            questions.append(current_q)

    q_start_regex = re.compile(
        r"^(?:#{1,4}\s*)?(?:\*{0,2})?(?:Question|Q\.?|Q\s*)?\s*(\d+)[\.\:\-\)]\s*(.*)",
        re.IGNORECASE,
    )
    opt_regex = re.compile(
        r"^(?:[-*•]\s*)?(?:\*{0,2})?\(?([A-Fa-f])\)?[.:\)]\s*(?:\*{0,2})?\s*(.*)"
    )
    ans_regex = re.compile(
        r"^(?:\*{0,2})?(?:Correct\s+Answer|Answer|Ans)\s*[:\-.]?\s*(?:\*{0,2})?\s*(.*)",
        re.IGNORECASE,
    )
    marks_regex = re.compile(
        r"(?:\[|\()?(?:Marks?|Points?)\s*[:\-.]?\s*(\d+)(?:\s*marks?)?(?:\]|\))?",
        re.IGNORECASE,
    )
    exp_regex = re.compile(
        r"^(?:\*{0,2})?(?:Explanation|Solution|Rationale)\s*[:\-.]?\s*(?:\*{0,2})?\s*(.*)",
        re.IGNORECASE,
    )

    state = "NONE"

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue

        q_match = q_start_regex.match(line)
        if q_match:
            finalize_current()
            q_num = q_match.group(1)
            q_body = q_match.group(2).strip()
            q_body = re.sub(r"^\*{1,2}|\*{1,2}$", "", q_body).strip()
            current_q = {
                "question_number": int(q_num) if q_num.isdigit() else len(questions) + 1,
                "questionText": q_body,
                "options": [],
                "optionsJson": "[]",
                "correctAnswer": "",
                "marks": "1",
                "explanation": "",
                "questionType": "mcq",
            }
            state = "IN_Q_TEXT"
            continue

        if current_q is None:
            current_q = {
                "question_number": len(questions) + 1,
                "questionText": line,
                "options": [],
                "optionsJson": "[]",
                "correctAnswer": "",
                "marks": "1",
                "explanation": "",
                "questionType": "mcq",
            }
            state = "IN_Q_TEXT"
            continue

        m_match = marks_regex.search(line)
        if m_match and ("mark" in line.lower() or "point" in line.lower()):
            current_q["marks"] = m_match.group(1)
            if len(line) < 25:
                continue

        ans_match = ans_regex.match(line)
        if ans_match:
            ans_val = ans_match.group(1).strip()
            ans_val = re.sub(r"^\*{1,2}|\*{1,2}$", "", ans_val).strip()
            letter_match = re.match(r"\(?([A-Da-d])\)?", ans_val)
            if letter_match:
                current_q["correctAnswer"] = letter_match.group(1).upper()
            else:
                current_q["correctAnswer"] = ans_val
            state = "IN_ANS"
            continue

        exp_match = exp_regex.match(line)
        if exp_match:
            current_q["explanation"] = exp_match.group(1).strip()
            state = "IN_EXP"
            continue

        opt_match = opt_regex.match(line)
        if opt_match and state != "IN_EXP":
            opt_letter = opt_match.group(1).upper()
            opt_text = opt_match.group(2).strip()
            opt_text = re.sub(r"^\*{1,2}|\*{1,2}$", "", opt_text).strip()
            current_q["options"].append(f"{opt_letter}) {opt_text}")
            state = "IN_OPT"
            continue

        if state == "IN_EXP":
            current_q["explanation"] += " " + line
        elif state == "IN_OPT" and current_q["options"]:
            current_q["options"][-1] += " " + line
        elif state == "IN_Q_TEXT":
            current_q["questionText"] += "\n" + line

    finalize_current()
    return questions


@router.post("/parse-bulk-questions")
def parse_bulk_questions(
    payload: BulkQuestionParseRequest,
    _user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    """
    Parses pasted AI markdown or plain text exam question sheets into structured questions.
    """
    raw = payload.rawText or payload.content or ""
    parsed = parse_bulk_questions_text(raw)
    return {
        "success": True,
        "count": len(parsed),
        "questions": parsed,
    }


@router.get("", response_model=list[ExamOut])
def list_exams(
    className: str | None = None,
    subject: str | None = None,
    batch: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Exam).order_by(Exam.created_at.desc())
    student = None
    if current_user.role == UserRole.student:
        query = query.filter(Exam.isPublished == True)  # noqa: E712
        student = db.query(Student).filter_by(user_id=current_user.id).first()

    if className:
        query = query.filter(Exam.className == className)
    if subject:
        query = query.filter(Exam.subject == subject)
    if batch:
        query = query.filter(Exam.batch == batch)

    exams = query.all()
    if student:
        exams = [e for e in exams if exam_visible_to_student(e, student)]
    result = []
    for exam in exams:
        questions = (
            db.query(ExamQuestion)
            .filter_by(exam_id=exam.id)
            .order_by(ExamQuestion.sortOrder.asc())
            .all()
        )
        exam_dict = ExamOut.model_validate(exam)
        exam_dict.questions = [ExamQuestionOut.model_validate(q) for q in questions]
        if current_user.role == UserRole.student:
            _hide_answers(exam_dict.questions)

        if student:
            sub = (
                db.query(ExamSubmission)
                .filter_by(exam_id=exam.id, student_id=student.id)
                .first()
            )
            if sub:
                exam_dict.is_submitted = True
                exam_dict.submission_id = sub.id
                released = sub.status == "Graded"
                exam_dict.submission_status = sub.status if released else "Submitted"
                exam_dict.submission_marks = sub.marksObtained if released else None
                exam_dict.submission_feedback = sub.feedback if released else None

        result.append(exam_dict)
    return result


@router.post("", response_model=ExamOut, status_code=status.HTTP_201_CREATED)
def create_exam(
    payload: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    teacher_id = payload.teacher_id
    if current_user.role == UserRole.teacher and not teacher_id:
        t = db.query(Teacher).filter_by(user_id=current_user.id).first()
        if t:
            teacher_id = t.id

    exam = Exam(
        examName=payload.examName,
        examType=payload.examType,
        description=payload.description or "",
        className=payload.className,
        subject=payload.subject,
        batch=payload.batch,
        examDate=payload.examDate,
        startTime=payload.startTime,
        duration=payload.duration,
        maxMarks=payload.maxMarks,
        passingMarks=payload.passingMarks,
        questionPaperUrl=payload.questionPaperUrl,
        creationMethod=payload.creationMethod,
        extractionStatus=payload.extractionStatus,
        teacher_id=teacher_id,
        isPublished=payload.isPublished,
        status=payload.status,
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)

    # Insert nested questions
    created_questions = []
    for idx, q in enumerate(payload.questions):
        question = ExamQuestion(
            exam_id=exam.id,
            questionText=q.questionText,
            questionType=q.questionType,
            optionsJson=q.optionsJson,
            correctAnswer=q.correctAnswer,
            marks=q.marks,
            explanation=q.explanation,
            sortOrder=q.sortOrder if q.sortOrder else idx + 1,
        )
        db.add(question)
        created_questions.append(question)

    db.commit()
    for q in created_questions:
        db.refresh(q)

    out = ExamOut.model_validate(exam)
    out.questions = [ExamQuestionOut.model_validate(q) for q in created_questions]
    return out


@router.get("/{exam_id}", response_model=ExamOut)
def get_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    if _current_user.role == UserRole.student:
        student = db.query(Student).filter_by(user_id=_current_user.id).first()
        if not exam.isPublished or not exam_visible_to_student(exam, student):
            raise HTTPException(status_code=404, detail="Exam not found")

    questions = (
        db.query(ExamQuestion)
        .filter_by(exam_id=exam.id)
        .order_by(ExamQuestion.sortOrder.asc())
        .all()
    )
    out = ExamOut.model_validate(exam)
    out.questions = [ExamQuestionOut.model_validate(q) for q in questions]
    if _current_user.role == UserRole.student:
        _hide_answers(out.questions)
    return out


@router.put("/{exam_id}", response_model=ExamOut)
def update_exam(
    exam_id: int,
    payload: ExamCreate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # exclude_unset: a field the client did not send keeps its stored value.
    # Before, every omitted field was reset to the schema default (date, start
    # time, type, published flag ...), wiping parts of the exam on each edit.
    # "title" is only an alias of examName, not a column.
    for key, value in payload.model_dump(exclude={"questions", "title"}, exclude_unset=True).items():
        if key == "examName" and not value:
            continue
        setattr(exam, key, value)

    # Replace questions if provided
    if payload.questions:
        db.query(ExamQuestion).filter_by(exam_id=exam.id).delete()
        for idx, q in enumerate(payload.questions):
            question = ExamQuestion(
                exam_id=exam.id,
                questionText=q.questionText,
                questionType=q.questionType,
                optionsJson=q.optionsJson,
                correctAnswer=q.correctAnswer,
                marks=q.marks,
                explanation=q.explanation,
                sortOrder=q.sortOrder if q.sortOrder else idx + 1,
            )
            db.add(question)

    db.commit()
    db.refresh(exam)
    questions = (
        db.query(ExamQuestion)
        .filter_by(exam_id=exam.id)
        .order_by(ExamQuestion.sortOrder.asc())
        .all()
    )
    out = ExamOut.model_validate(exam)
    out.questions = [ExamQuestionOut.model_validate(q) for q in questions]
    return out


@router.delete("/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    db.query(ExamQuestion).filter_by(exam_id=exam_id).delete()
    db.query(ExamSubmission).filter_by(exam_id=exam_id).delete()
    db.delete(exam)
    db.commit()


# ---- Exam Submissions & Taking Engine ----

@router.post("/{exam_id}/submit", response_model=ExamSubmissionOut, status_code=status.HTTP_201_CREATED)
def submit_exam_attempt(
    exam_id: int,
    payload: ExamSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.student)),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    student = db.query(Student).filter_by(user_id=current_user.id).first()
    if not exam.isPublished or not exam_visible_to_student(exam, student):
        raise HTTPException(status_code=404, detail="Exam not found")
    student_id = student.id if student else current_user.id
    student_name = student.name if student else current_user.name

    submitted_answers = payload.answersJson or payload.answers_json
    submitted_sheet = payload.answerSheetUrl or payload.file_url or payload.answer_sheet_url
    submitted_audio = payload.audioUrl or payload.audio_url
    submitted_text = payload.textContent or payload.text_content
    submitted_attach = payload.attachmentsJson or payload.attachments_json

    clean_sheet_url, _ = ensure_persistent_file_url(
        submitted_sheet, "submissions", f"exam_{exam_id}_student_{student_id}"
    )

    clean_audio_url = None
    if submitted_audio:
        clean_audio_url, _ = ensure_persistent_file_url(
            submitted_audio, "submissions", f"exam_{exam_id}_audio_{student_id}"
        )

    submission = (
        db.query(ExamSubmission)
        .filter_by(exam_id=exam_id, student_id=student_id)
        .first()
    )

    is_new_submission = submission is None

    if submission and submission.status in ("Graded", "Draft Graded"):
        raise HTTPException(
            status_code=409,
            detail="This exam has already been marked, so it can no longer be resubmitted.",
        )

    if submission:
        submission.answersJson = submitted_answers or submission.answersJson
        submission.answerSheetUrl = clean_sheet_url or submission.answerSheetUrl
        submission.audioUrl = clean_audio_url or submission.audioUrl
        submission.textContent = submitted_text or submission.textContent
        submission.attachmentsJson = submitted_attach or submission.attachmentsJson
        submission.status = "Submitted"
        submission.submitted_at = datetime.utcnow()
    else:
        submission = ExamSubmission(
            exam_id=exam_id,
            student_id=student_id,
            student_name=student_name,
            answersJson=submitted_answers,
            answerSheetUrl=clean_sheet_url,
            audioUrl=clean_audio_url,
            textContent=submitted_text,
            attachmentsJson=submitted_attach,
            status="Submitted",
            started_at=datetime.utcnow(),
            submitted_at=datetime.utcnow(),
        )
        db.add(submission)

    db.commit()
    db.refresh(submission)

    # Award CASH once per exam, not again on every resubmission
    try:
        if not is_new_submission:
            return submission
        from routers.rewards import award_student_cash, get_or_create_config
        cfg = get_or_create_config(db)
        award_student_cash(
            db=db,
            student_id=student_id,
            amount=cfg.exam_cash,
            trans_type="exam_completion",
            description=f"Completed Exam: {exam.examName}",
            reference_id=exam.id,
            user_id=current_user.id,
        )
    except Exception as e:
        print(f"Notice: cash reward award skipped: {e}")

    return submission


@router.get("/{exam_id}/submissions", response_model=list[ExamSubmissionOut])
def list_exam_submissions(
    exam_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    return (
        db.query(ExamSubmission)
        .filter_by(exam_id=exam_id)
        .order_by(ExamSubmission.submitted_at.desc())
        .all()
    )


@router.get("/student/my-submissions", response_model=list[ExamSubmissionOut])
def get_my_exam_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.student)),
):
    student = db.query(Student).filter_by(user_id=current_user.id).first()
    student_id = student.id if student else current_user.id
    rows = (
        db.query(ExamSubmission)
        .filter_by(student_id=student_id)
        .order_by(ExamSubmission.submitted_at.desc())
        .all()
    )
    return [_student_view_of_submission(r) for r in rows]


@router.get("/submissions/{submission_id}", response_model=ExamSubmissionOut)
def get_exam_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    submission = db.query(ExamSubmission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if current_user.role == UserRole.student:
        student = db.query(Student).filter_by(user_id=current_user.id).first()
        student_id = student.id if student else current_user.id
        if submission.student_id != student_id:
            raise HTTPException(status_code=403, detail="You are not authorized to view this submission")
        return _student_view_of_submission(submission)

    return submission


@router.put("/submissions/{submission_id}/grade", response_model=ExamSubmissionOut)
def grade_exam_submission(
    submission_id: int,
    payload: ExamGradeUpdate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    submission = db.query(ExamSubmission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if payload.marksObtained is not None:
        submission.marksObtained = payload.marksObtained
    if payload.feedback is not None:
        submission.feedback = payload.feedback
    if payload.status:
        submission.status = payload.status
    if payload.correctionData is not None:
        submission.correctionData = payload.correctionData
    if payload.questionMarksJson is not None:
        submission.questionMarksJson = payload.questionMarksJson
    submission.graded_at = datetime.utcnow()

    db.commit()
    db.refresh(submission)

    # If student scored high (>= 90%), award high score bonus
    try:
        exam = db.query(Exam).filter(Exam.id == submission.exam_id).first()
        if exam and payload.marksObtained is not None:
            max_m = float(exam.maxMarks) if exam.maxMarks else 100.0
            obtained = float(payload.marksObtained)
            if max_m > 0 and (obtained / max_m) >= 0.90:
                from routers.rewards import award_student_cash, get_or_create_config
                cfg = get_or_create_config(db)
                award_student_cash(
                    db=db,
                    student_id=submission.student_id,
                    amount=cfg.high_score_cash,
                    trans_type="high_score_bonus",
                    description=f"High Score Honor (90%+) on Exam: {exam.examName}",
                    reference_id=exam.id,
                )
    except Exception as e:
        print(f"Notice: bonus cash skipped: {e}")

    return submission
