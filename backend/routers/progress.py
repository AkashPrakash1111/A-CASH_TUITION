"""
GET /progress/me — everything the student "My Progress" page shows, computed
here in one request from the real tables. Nothing in the response is a
placeholder: if there is no data for a figure it is null / empty, and the page
shows an honest empty state instead of an invented number.

What a student may see is the same as everywhere else: marks only appear once a
teacher has released them (exam status "Graded"; assignment "Reviewed" /
"Returned").
"""

from collections import defaultdict
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database.db import get_db
from models.academic import Assignment, AssignmentSubmission, Exam, ExamSubmission
from models.rewards import CashTransaction
from models.user import User, UserRole
from routers.exams import exam_visible_to_student
from routers.rewards import cash_totals, rank_for
from utils.audience import find_student, in_audience
from utils.deps import require_role

router = APIRouter(prefix="/progress", tags=["progress"])

RELEASED_ASSIGNMENT = ("Reviewed", "Returned")


def _num(value) -> float | None:
    try:
        return float(str(value).strip())
    except (TypeError, ValueError):
        return None


def _date(value) -> date | None:
    """Parse YYYY-MM-DD; reject junk like year 0066 that sits in old rows."""
    try:
        d = date.fromisoformat((value or "").strip()[:10])
    except ValueError:
        return None
    return d if d.year >= 2000 else None


def _pct(obtained, maximum) -> int | None:
    o, m = _num(obtained), _num(maximum)
    if o is None or not m or m <= 0:
        return None
    return round(min(max(o / m * 100, 0), 100))


def _grade(pct: int | None) -> str | None:
    if pct is None:
        return None
    for floor, letter in ((90, "A+"), (80, "A"), (70, "B+"), (60, "B"), (50, "C")):
        if pct >= floor:
            return letter
    return "D"


def _avg(values: list[int]) -> int | None:
    return round(sum(values) / len(values)) if values else None


@router.get("/me")
def my_progress(
    tz_offset: int = Query(0, ge=-840, le=840, description="Minutes east of UTC, so days roll over at the student's midnight"),
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.student)),
):
    student = find_student(db, user)
    if not student:
        raise HTTPException(status_code=404, detail="Your student profile hasn't been set up yet. Ask your teacher to add you to the roster.")

    shift = timedelta(minutes=tz_offset)
    today = (datetime.utcnow() + shift).date()

    def local_day(dt: datetime | None) -> date | None:
        return (dt + shift).date() if dt else None

    # ------------------------------------------------------------ assignments
    all_assignments = [
        a for a in db.query(Assignment).all() if in_audience(a.className, a.batch, student)
    ]
    subs_by_assignment = {
        s.assignment_id: s
        for s in db.query(AssignmentSubmission).filter_by(student_id=student.id).all()
    }
    submitted = reviewed = overdue = 0
    assignment_scores: list[int] = []
    results: list[dict] = []
    upcoming: list[dict] = []
    subject_stats: dict[str, dict] = defaultdict(
        lambda: {"scores": [], "assignments_total": 0, "assignments_done": 0, "exams_total": 0, "exams_done": 0}
    )

    for a in all_assignments:
        subject = (a.subject or "General").strip() or "General"
        stats = subject_stats[subject]
        stats["assignments_total"] += 1
        sub = subs_by_assignment.get(a.id)
        due = _date(a.dueDate)
        if sub:
            submitted += 1
            stats["assignments_done"] += 1
            if sub.status in RELEASED_ASSIGNMENT:
                reviewed += 1
                pct = _pct(sub.marksObtained, a.maxMarks)
                if pct is not None:
                    assignment_scores.append(pct)
                    stats["scores"].append(pct)
                    results.append({
                        "kind": "assignment", "id": a.id, "title": a.title, "subject": subject,
                        "obtained": _num(sub.marksObtained), "max": _num(a.maxMarks), "pct": pct,
                        "date": (sub.graded_at or sub.submitted_at).isoformat() if (sub.graded_at or sub.submitted_at) else None,
                    })
        elif (a.status or "").lower() != "closed":
            is_overdue = bool(due and due < today)
            overdue += is_overdue
            upcoming.append({
                "kind": "assignment", "id": a.id, "title": a.title, "subject": subject,
                "due": due.isoformat() if due else None,
                "days_left": (due - today).days if due else None,
                "overdue": is_overdue,
            })

    # ------------------------------------------------------------------ exams
    exams = [
        e for e in db.query(Exam).filter(Exam.isPublished == True).all()  # noqa: E712
        if exam_visible_to_student(e, student)
    ]
    exam_subs = {s.exam_id: s for s in db.query(ExamSubmission).filter_by(student_id=student.id).all()}
    exam_attempted = exam_graded = 0
    exam_scores: list[int] = []

    for e in exams:
        subject = (e.subject or "General").strip() or "General"
        stats = subject_stats[subject]
        stats["exams_total"] += 1
        sub = exam_subs.get(e.id)
        if sub:
            exam_attempted += 1
            stats["exams_done"] += 1
            if sub.status == "Graded":
                exam_graded += 1
                pct = _pct(sub.marksObtained, e.maxMarks)
                if pct is not None:
                    exam_scores.append(pct)
                    stats["scores"].append(pct)
                    results.append({
                        "kind": "exam", "id": e.id, "title": e.examName, "subject": subject,
                        "obtained": _num(sub.marksObtained), "max": _num(e.maxMarks), "pct": pct,
                        "date": (sub.graded_at or sub.submitted_at).isoformat() if (sub.graded_at or sub.submitted_at) else None,
                    })
        else:
            exam_date = _date(e.examDate)
            if exam_date is None or exam_date >= today:
                upcoming.append({
                    "kind": "exam", "id": e.id, "title": e.examName, "subject": subject,
                    "due": exam_date.isoformat() if exam_date else None,
                    "days_left": (exam_date - today).days if exam_date else None,
                    "overdue": False,
                })

    # --------------------------------------------------------------- activity
    activity: dict[date, int] = defaultdict(int)
    for s in subs_by_assignment.values():
        d = local_day(s.submitted_at)
        if d:
            activity[d] += 1
    for s in exam_subs.values():
        d = local_day(s.submitted_at)
        if d:
            activity[d] += 1

    # Current streak: consecutive active days up to today. If today has no
    # activity yet the streak is still alive until the day ends, so count from
    # yesterday.
    cursor = today if activity.get(today) else today - timedelta(days=1)
    current = 0
    while activity.get(cursor):
        current += 1
        cursor -= timedelta(days=1)

    longest = run = 0
    prev = None
    for d in sorted(activity):
        run = run + 1 if prev and (d - prev).days == 1 else 1
        longest = max(longest, run)
        prev = d

    heat_days = 28
    heatmap = [
        {"date": (today - timedelta(days=i)).isoformat(), "count": activity.get(today - timedelta(days=i), 0)}
        for i in range(heat_days - 1, -1, -1)
    ]

    # -------------------------------------------------------------- aggregates
    all_scores = assignment_scores + exam_scores
    overall = _avg(all_scores)

    subjects = sorted(
        (
            {
                "subject": name,
                "avg_pct": _avg(v["scores"]),
                "graded_count": len(v["scores"]),
                "assignments_done": v["assignments_done"],
                "assignments_total": v["assignments_total"],
                "exams_done": v["exams_done"],
                "exams_total": v["exams_total"],
            }
            for name, v in subject_stats.items()
        ),
        key=lambda x: (x["avg_pct"] is None, -(x["avg_pct"] or 0), x["subject"]),
    )

    results.sort(key=lambda r: r["date"] or "")
    upcoming.sort(key=lambda u: (u["due"] is None, u["due"] or ""))

    # ------------------------------------------------------------------- cash
    balance = student.cash_balance if student.cash_balance is not None else 0
    earned, spent = cash_totals(db, student.id)
    txs = (
        db.query(CashTransaction)
        .filter_by(student_id=student.id)
        .order_by(CashTransaction.created_at.desc())
        .limit(8)
        .all()
    )

    total_assign = len(all_assignments)
    return {
        "student": {"name": student.name, "className": student.className, "batch": student.batch},
        "today": today.isoformat(),
        "overall": {"avg_pct": overall, "grade": _grade(overall), "graded_count": len(all_scores)},
        "assignments": {
            "total": total_assign,
            "submitted": submitted,
            "pending": total_assign - submitted,
            "overdue": overdue,
            "reviewed": reviewed,
            "completion_pct": round(submitted / total_assign * 100) if total_assign else None,
            "avg_pct": _avg(assignment_scores),
        },
        "exams": {
            "total": len(exams),
            "attempted": exam_attempted,
            "graded": exam_graded,
            "avg_pct": _avg(exam_scores),
            "best_pct": max(exam_scores) if exam_scores else None,
        },
        "streak": {
            "current": current,
            "longest": longest,
            "active_today": bool(activity.get(today)),
            "active_days": len(activity),
        },
        "heatmap": heatmap,
        "subjects": subjects,
        "trend": results[-12:],
        "recent_results": list(reversed(results[-6:])),
        "upcoming": upcoming[:8],
        "cash": {
            "balance": balance,
            "earned": earned,
            "spent": spent,
            **rank_for(balance),
            "transactions": [
                {
                    "id": t.id, "amount": t.amount, "type": t.transaction_type,
                    "description": t.description,
                    "created_at": t.created_at.isoformat() if t.created_at else None,
                }
                for t in txs
            ],
        },
    }
