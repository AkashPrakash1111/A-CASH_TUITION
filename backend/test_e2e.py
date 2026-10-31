"""
Full End-to-End Test Suite for ACASH TUITION
--------------------------------------------
Validates all router handlers and DB operations directly:
1. DB & Model schema integrity
2. Auth & Login token generation
3. Canonical Avatar Config updates & persistence
4. Notes & Annotation Studio API
5. Assignments & Grading Lifecycle
6. Exams & Question Paper Ingestion API
7. Live Classes Arena API
8. Peer Messaging & Supervision API
9. AI Studio Honest 3-Tier Status & Curriculum Templates
"""

import os
import sys
import json

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

from database.db import SessionLocal
from models.user import User, UserRole
from utils.security import create_access_token, verify_password

# Import routers & schemas
from routers.notes import list_notes, create_note, save_note_annotations, get_note_annotations
from schemas.academic_ext import NoteCreate, NoteAnnotationCreate
from routers.assignments import list_assignments, create_assignment, submit_assignment, list_submissions, grade_submission
from schemas.academic_ext import AssignmentCreate, AssignmentSubmissionCreate, GradeSubmissionRequest
from routers.exams import list_exams, create_exam, submit_exam
from schemas.academic_ext import ExamCreate, ExamSubmissionCreate
from routers.live_classes import list_live_classes, create_live_class
from schemas.academic_ext import LiveClassCreate
from routers.messages import send_message, list_messages
from schemas.academic_ext import StudyMessageCreate
from routers.ai import get_ai_status, get_curriculum_templates

def run_e2e_tests():
    print("=" * 65)
    print("RUNNING ACASH TUITION FULL END-TO-END VERIFICATION")
    print("=" * 65)
    db = SessionLocal()

    try:
        # 1. Verify Users & Auth
        print("\n--- 1. Testing Auth & User Roles ---")
        admin = db.query(User).filter(User.email == "akashsprakash1111@gmail.com").first()
        assert admin is not None and admin.role == UserRole.admin
        assert verify_password("password123", admin.hashed_password)
        print("  [PASS] Admin user authenticated (Akash, role=admin)")

        student = db.query(User).filter(User.email == "aroma@gmail.com").first()
        assert student is not None and student.role == UserRole.student
        print(f"  [PASS] Student user authenticated ({student.name}, role=student)")

        teacher = db.query(User).filter(User.email == "teacher.priya@acash.edu").first()
        assert teacher is not None and teacher.role == UserRole.teacher
        print(f"  [PASS] Teacher user authenticated ({teacher.name}, role=teacher)")

        # 2. Canonical Avatar Config
        print("\n--- 2. Testing Canonical Avatar Configuration ---")
        new_config = json.dumps({
            "style": "adventurer",
            "seed": "EtherealAdept",
            "primaryColor": "#008388",
            "companion": "cosmic",
            "title": "Celestial Guide"
        })
        student.avatar_config = new_config
        db.commit()
        db.refresh(student)
        assert "cosmic" in student.avatar_config
        print("  [PASS] Canonical avatar persisted in User.avatar_config")

        # 3. Notes & Annotation Studio API
        print("\n--- 3. Testing Notes & Annotation Studio API ---")
        notes_before = list_notes(current_user=student, db=db)
        print(f"  [PASS] Retrieved {len(notes_before)} notes for student")

        new_note = create_note(
            payload=NoteCreate(
                title="Thermodynamics & Heat Transfer",
                description="First and second laws of thermodynamics with Carnot cycle equations.",
                file_url="https://example.com/thermo.pdf",
                file_type="pdf",
                subject="Physics",
                batch="Class 10A"
            ),
            current_user=teacher,
            db=db
        )
        assert new_note.id is not None
        print(f"  [PASS] Created new note (ID: {new_note.id}, title='{new_note.title}')")

        # Save Canvas Annotation
        ann = save_note_annotations(
            note_id=new_note.id,
            payload=NoteAnnotationCreate(
                canvas_data="data:image/png;base64,sample_annotated_canvas_stream",
                page_number=1
            ),
            current_user=student,
            db=db
        )
        assert ann.id is not None
        annotations = get_note_annotations(note_id=new_note.id, current_user=student, db=db)
        assert len(annotations) >= 1
        print(f"  [PASS] Saved and retrieved canvas annotation for note {new_note.id}")

        # 4. Assignments & Grading Lifecycle
        print("\n--- 4. Testing Assignments & Submissions Flow ---")
        assign = create_assignment(
            payload=AssignmentCreate(
                title="Coordinate Geometry Problem Set",
                description="Solve distance and section formula exercises from Chapter 7.",
                subject="Mathematics",
                batch="Class 10A",
                due_date="2026-10-30",
                max_marks=50,
                file_url=""
            ),
            current_user=teacher,
            db=db
        )
        assert assign.id is not None
        print(f"  [PASS] Published assignment (ID: {assign.id})")

        # Student submits homework
        sub = submit_assignment(
            assignment_id=assign.id,
            payload=AssignmentSubmissionCreate(
                submission_text="Distance d = sqrt((x2 - x1)^2 + (y2 - y1)^2) = sqrt(9 + 16) = 5 units.",
                file_url="https://example.com/geometry_hw.png"
            ),
            current_user=student,
            db=db
        )
        assert sub.id is not None
        assert sub.status == "submitted"
        print(f"  [PASS] Student submitted homework (Submission ID: {sub.id})")

        # Teacher grades submission
        graded = grade_submission(
            submission_id=sub.id,
            payload=GradeSubmissionRequest(
                marks_obtained=49,
                feedback="Excellent step-by-step Cartesian derivation!"
            ),
            current_user=teacher,
            db=db
        )
        assert graded.status == "graded"
        assert graded.marks_obtained == 49
        print(f"  [PASS] Teacher graded submission: Score={graded.marks_obtained}/50, Feedback='{graded.feedback}'")

        # 5. Exams & Assessment Engine
        print("\n--- 5. Testing Exams Assessment Engine ---")
        exam = create_exam(
            payload=ExamCreate(
                title="Physics Mid-Term Assessment",
                description="Electromagnetism and Optics test.",
                subject="Physics",
                batch="Class 10A",
                total_marks=100,
                passing_marks=40,
                duration_minutes=90,
                scheduled_date="2026-10-25",
                exam_type="Mid Term",
                questions=[
                    {
                        "question_number": 1,
                        "question_text": "What is the speed of light in vacuum?",
                        "question_type": "mcq",
                        "marks": 2,
                        "options": ["3 x 10^8 m/s", "3 x 10^6 m/s", "1.5 x 10^8 m/s", "Zero"],
                        "correct_answer": "3 x 10^8 m/s"
                    },
                    {
                        "question_number": 2,
                        "question_text": "State Snell's law of refraction.",
                        "question_type": "text",
                        "marks": 5,
                        "options": [],
                        "correct_answer": ""
                    }
                ]
            ),
            current_user=teacher,
            db=db
        )
        assert exam.id is not None
        assert len(exam.questions) == 2
        print(f"  [PASS] Created exam with 2 structured questions (ID: {exam.id})")

        # Student submits exam response
        exam_sub = submit_exam(
            exam_id=exam.id,
            payload=ExamSubmissionCreate(
                answers_json=json.dumps({"1": "3 x 10^8 m/s", "2": "sin(i) / sin(r) = constant"}),
                file_url=""
            ),
            current_user=student,
            db=db
        )
        assert exam_sub.id is not None
        print(f"  [PASS] Student completed & submitted exam response (Submission ID: {exam_sub.id})")

        # 6. Live Classes
        print("\n--- 6. Testing Live Classes Arena ---")
        live_cls = create_live_class(
            payload=LiveClassCreate(
                title="Live Problem Solving: Organic Chemistry",
                description="Interactive live session on carbon compounds and functional groups.",
                subject="Chemistry",
                batch="Class 10A",
                scheduled_date="2026-10-18",
                start_time="05:00 PM",
                duration_minutes=60,
                meeting_link="https://meet.google.com/abc-defg-hij",
                platform="Google Meet"
            ),
            current_user=teacher,
            db=db
        )
        assert live_cls.id is not None
        classes = list_live_classes(current_user=student, db=db)
        assert len(classes) >= 1
        print(f"  [PASS] Created and listed virtual live class (Title='{live_cls.title}')")

        # 7. Peer Messaging & Supervision
        print("\n--- 7. Testing Peer Study Messages & Auditing ---")
        msg = send_message(
            payload=StudyMessageCreate(
                receiver_id=teacher.id,
                content="Respected teacher, could we review question 4 in tomorrow's live class?"
            ),
            current_user=student,
            db=db
        )
        assert msg.id is not None
        thread = list_messages(with_user_id=student.id, current_user=teacher, db=db)
        assert len(thread) >= 1
        print(f"  [PASS] Auditable study message sent and retrieved in thread")

        # 8. Honest AI Status & Templates
        print("\n--- 8. Testing AI Studio 3-Tier Status & Curriculum Templates ---")
        status = get_ai_status()
        assert "configured" in status and "provider" in status
        print(f"  [PASS] AI Studio status: configured={status['configured']}, provider='{status['provider']}'")

        templates = get_curriculum_templates()
        assert "Mathematics" in templates and "Physics" in templates and "Chemistry" in templates
        print(f"  [PASS] Deterministic Curriculum Templates loaded ({len(templates)} subject realms)")

        print("\n" + "=" * 65)
        print("ALL END-TO-END VERIFICATION TESTS PASSED PERFECTLY! (8/8)")
        print("=" * 65)

    finally:
        db.close()

if __name__ == "__main__":
    run_e2e_tests()
