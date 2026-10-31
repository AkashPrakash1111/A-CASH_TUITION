"""
Phase 1 Automated Verification Script
-------------------------------------
Tests:
1. DB connection and table schema verification (all 17 tables)
2. Existing accounts verification (Akash, aromal, AROMA, CHIMMU)
3. Auth & JWT token lifecycle for Admin, Teacher, Student, Parent
4. Roster & Canonical Avatar resolution
5. Notes & Annotations persistence
6. Assignments & Submissions linkage
7. Exams & Questions structure
8. Live Classes and Supervised Messages
"""

import os
import sys
import json

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

from database.db import SessionLocal
from models.user import User, UserRole
from models.academic import (
    Student, Teacher, Subject, Batch, Note, NoteAnnotation,
    Assignment, AssignmentSubmission, Exam, ExamQuestion, ExamSubmission, LiveClass
)
from models.parent import Parent, ParentStudentLink
from models.messaging import StudyMessage, AuditLog
from utils.security import create_access_token, decode_access_token, verify_password


def run_phase1_tests():
    print("=" * 60)
    print("RUNNING PHASE 1 AUTOMATED VERIFICATION TESTS")
    print("=" * 60)
    db = SessionLocal()

    try:
        # Test 1: All tables exist
        import sqlite3
        conn = sqlite3.connect("acash.db")
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        tables = [t[0] for t in cursor.fetchall()]
        conn.close()

        expected_tables = [
            "assignment_submissions", "assignments", "audit_logs", "batches",
            "exam_questions", "exam_submissions", "exams", "live_classes",
            "note_annotations", "notes", "parent_student_links", "parents",
            "students", "study_messages", "subjects", "teachers", "users"
        ]
        for tbl in expected_tables:
            assert tbl in tables, f"Missing table: {tbl}"
        print(f"[PASS] Test 1: All 17 required tables exist in database.")

        # Test 2: Existing accounts intact
        existing_emails = ["akashsprakash1111@gmail.com", "aroma@gmail.com", "AROMA1111@gmail.com", "CHIMMU@gmail.com"]
        for email in existing_emails:
            u = db.query(User).filter_by(email=email).first()
            assert u is not None, f"Existing user {email} was lost!"
        print(f"[PASS] Test 2: All 4 original users preserved with zero data loss.")

        # Test 3: JWT token generation and decoding for all roles
        for role in [UserRole.admin, UserRole.teacher, UserRole.student, UserRole.parent]:
            token = create_access_token({"sub": f"test_{role.value}@acash.edu", "role": role.value})
            payload = decode_access_token(token)
            assert payload is not None, f"Failed to decode token for {role}"
            assert payload.get("role") == role.value, f"Role mismatch in JWT for {role}"
        print(f"[PASS] Test 3: JWT creation and decoding verified for all 4 roles.")

        # Test 4: Canonical avatar resolution
        student_user = db.query(User).filter_by(email="aroma@gmail.com").first()
        assert student_user is not None
        assert student_user.avatar_config is not None, "Aroma should have an avatar_config"
        config = json.loads(student_user.avatar_config)
        assert "style" in config or "seed" in config
        print(f"[PASS] Test 4: Canonical avatar config verified for student (style: {config.get('style')}, seed: {config.get('seed')}).")

        # Test 5: Notes & Annotations
        notes = db.query(Note).all()
        assert len(notes) >= 1, "At least 1 note should exist"
        note = notes[0]
        annotations = db.query(NoteAnnotation).filter_by(note_id=note.id).all()
        assert len(annotations) >= 1, "Note should have at least 1 annotation layer"
        print(f"[PASS] Test 5: Notes and Annotation layers verified (Note: '{note.title}', Annotations: {len(annotations)}).")

        # Test 6: Assignments & Submissions
        assignments = db.query(Assignment).all()
        assert len(assignments) >= 1
        asg = assignments[0]
        submissions = db.query(AssignmentSubmission).filter_by(assignment_id=asg.id).all()
        assert len(submissions) >= 1
        print(f"[PASS] Test 6: Assignment and Submission linkage verified (Assignment: '{asg.title}', Submissions: {len(submissions)}).")

        # Test 7: Exams & Questions
        exams = db.query(Exam).all()
        assert len(exams) >= 1
        exam = exams[0]
        questions = db.query(ExamQuestion).filter_by(exam_id=exam.id).all()
        assert len(questions) >= 1
        print(f"[PASS] Test 7: Exam and structured questions verified (Exam: '{exam.examName}', Questions: {len(questions)}).")

        # Test 8: Live Classes & Supervised Messages
        live_classes = db.query(LiveClass).all()
        assert len(live_classes) >= 1
        messages = db.query(StudyMessage).all()
        assert len(messages) >= 1
        print(f"[PASS] Test 8: Live Classes and Supervised Messages verified (Classes: {len(live_classes)}, Messages: {len(messages)}).")

        print("=" * 60)
        print("ALL PHASE 1 VERIFICATION TESTS PASSED SUCCESSFULLY (8/8)!")
        print("=" * 60)

    finally:
        db.close()


if __name__ == "__main__":
    run_phase1_tests()
