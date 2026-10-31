"""
ACASH Idempotent Development Seeder
-----------------------------------
Safe, additive-only test fixtures for local development.
GUARANTEE: NEVER deletes, truncates, or resets existing data.
Checks for existing records before inserting any row.
"""

import json
import os
import sys
from datetime import datetime, timedelta

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

from database.db import SessionLocal
from models.user import User, UserRole
from models.academic import (
    Student, Teacher, Subject, Batch, Note, NoteAnnotation,
    Assignment, AssignmentSubmission, Exam, ExamQuestion, ExamSubmission, LiveClass
)
from models.parent import Parent, ParentStudentLink
from models.messaging import StudyMessage
from utils.security import hash_password


def seed_dev_data():
    print("=" * 60)
    print("ACASH TUTION - IDEMPOTENT DEV FIXTURES SEEDER")
    print("=" * 60)

    db = SessionLocal()
    try:
        # 1. Teacher User & Faculty Linkage
        teacher_email = "teacher.priya@acash.edu"
        teacher_user = db.query(User).filter_by(email=teacher_email).first()
        if not teacher_user:
            teacher_user = User(
                name="Priya Sharma",
                email=teacher_email,
                hashed_password=hash_password("Teacher@123"),
                role=UserRole.teacher,
                avatar_config=json.dumps({
                    "style": "adventurer",
                    "seed": "priya-sharma",
                    "hair": "long05",
                    "hairColor": "2c1b18",
                    "skinColor": "d08b5b",
                    "eyes": "variant07",
                    "eyebrows": "variant04",
                    "backgroundColor": "b6e3f4"
                }),
            )
            db.add(teacher_user)
            db.commit()
            db.refresh(teacher_user)
            print(f"[Seed] Created Teacher User: {teacher_email}")
        else:
            print(f"[Seed] Teacher User already exists: {teacher_email}")

        # Link Teacher profile in roster to teacher_user
        teacher_profile = db.query(Teacher).filter_by(name="Priya Sharma").first()
        if teacher_profile:
            if not teacher_profile.user_id:
                teacher_profile.user_id = teacher_user.id
                db.commit()
                print("[Seed] Linked Teacher profile 'Priya Sharma' to User account.")
        else:
            teacher_profile = Teacher(
                user_id=teacher_user.id,
                name="Priya Sharma",
                subject="Physics",
                phone="9876543210",
                email=teacher_email,
                qualification="M.Sc Physics, B.Ed",
                experience="8 Years",
                status="Active"
            )
            db.add(teacher_profile)
            db.commit()
            db.refresh(teacher_profile)
            print("[Seed] Created Teacher profile 'Priya Sharma'.")

        # 2. Link existing student aromal to User if needed
        aromal_user = db.query(User).filter_by(email="aroma@gmail.com").first()
        if aromal_user:
            aromal_student = db.query(Student).filter_by(name="aromal").first()
            if aromal_student and not aromal_student.user_id:
                aromal_student.user_id = aromal_user.id
                db.commit()
                print("[Seed] Linked Student 'aromal' to User ID.")
            elif not aromal_student:
                aromal_student = Student(
                    user_id=aromal_user.id,
                    name="aromal",
                    className="10",
                    batch="Morning Science",
                    gender="Male",
                    parent="Anita Nair",
                    phone="9447123456",
                    status="Active"
                )
                db.add(aromal_student)
                db.commit()
                db.refresh(aromal_student)
                print("[Seed] Created Student roster entry for 'aromal'.")

        # 3. Parent User & Linkage
        parent_email = "parent.anita@acash.edu"
        parent_user = db.query(User).filter_by(email=parent_email).first()
        if not parent_user:
            parent_user = User(
                name="Anita Nair",
                email=parent_email,
                hashed_password=hash_password("Parent@123"),
                role=UserRole.parent,
                avatar_config=json.dumps({
                    "style": "adventurer",
                    "seed": "anita-nair",
                    "backgroundColor": "ffd5dc"
                }),
            )
            db.add(parent_user)
            db.commit()
            db.refresh(parent_user)
            print(f"[Seed] Created Parent User: {parent_email}")

        parent_profile = db.query(Parent).filter_by(name="Anita Nair").first()
        if not parent_profile:
            parent_profile = Parent(
                user_id=parent_user.id,
                name="Anita Nair",
                email=parent_email,
                phone="9447123456",
                relation="Mother",
                status="Active"
            )
            db.add(parent_profile)
            db.commit()
            db.refresh(parent_profile)
            print("[Seed] Created Parent profile 'Anita Nair'.")

        # Link parent to aromal if aromal exists
        student_rec = db.query(Student).first()
        if student_rec and parent_profile:
            link_exists = db.query(ParentStudentLink).filter_by(
                parent_id=parent_profile.id, student_id=student_rec.id
            ).first()
            if not link_exists:
                link = ParentStudentLink(
                    parent_id=parent_profile.id,
                    student_id=student_rec.id,
                    relationship_type="Mother",
                    verified=True
                )
                db.add(link)
                db.commit()
                print(f"[Seed] Created ParentStudentLink between parent {parent_profile.name} and student {student_rec.name}.")

        # 4. Sample Notes
        note_title = "Electromagnetism & Magnetic Flux Notes"
        if not db.query(Note).filter_by(title=note_title).first():
            note = Note(
                title=note_title,
                description="Comprehensive unit breakdown with diagrams and key formulas for Class 10.",
                className="10",
                subject="Physics",
                batch="Morning Science",
                topic="Electromagnetism",
                unit="Unit 3",
                type="pdf",
                fileName="physics_flux_unit3.pdf",
                fileUrl="https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf",
                textContent="Key Principles:\n1. Magnetic flux density B is measured in Tesla (T).\n2. Faraday's Law states induced EMF is proportional to rate of change of flux.\n3. Lenz's Law dictates the direction of induced current opposes change.",
                uploadedBy="Priya Sharma",
                uploader_id=teacher_user.id,
                teacher_id=teacher_profile.id if teacher_profile else None,
                status="Published"
            )
            db.add(note)
            db.commit()
            db.refresh(note)

            # Sample Annotation on this note
            sample_anno = NoteAnnotation(
                note_id=note.id,
                author_id=teacher_user.id,
                author_name="Priya Sharma",
                annotation_data=json.dumps([
                    {"type": "pen", "color": "#008388", "size": 3, "points": [{"x": 40, "y": 80}, {"x": 120, "y": 95}, {"x": 180, "y": 80}]},
                    {"type": "highlight", "color": "rgba(254, 240, 138, 0.45)", "size": 18, "points": [{"x": 30, "y": 140}, {"x": 260, "y": 140}]},
                    {"type": "text", "text": "Important for Final Exam!", "x": 50, "y": 190, "color": "#dc2626", "size": 16}
                ]),
                is_whiteboard=False,
                version=1
            )
            db.add(sample_anno)
            db.commit()
            print(f"[Seed] Created sample Note: '{note_title}' with annotation layer.")

        # 5. Sample Assignment
        asg_title = "Kinematics & Projectile Motion Quest"
        if not db.query(Assignment).filter_by(title=asg_title).first():
            assignment = Assignment(
                title=asg_title,
                description="Solve problems 1 through 10 from Section B. Show all free-body diagrams and step-by-step vector calculations.",
                className="10",
                subject="Physics",
                batch="Morning Science",
                dueDate=(datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d"),
                maxMarks="25",
                fileName="kinematics_worksheet.pdf",
                fileUrl="https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf",
                teacher_id=teacher_profile.id if teacher_profile else None,
                createdBy="Priya Sharma",
                status="Active"
            )
            db.add(assignment)
            db.commit()
            db.refresh(assignment)

            # Sample submission
            if student_rec:
                submission = AssignmentSubmission(
                    assignment_id=assignment.id,
                    student_id=student_rec.id,
                    student_name=student_rec.name,
                    batch=student_rec.batch or "Morning Science",
                    textContent="Completed problems 1-10. Range equation R = (u^2 * sin(2θ)) / g verified in question 4.",
                    fileUrl="https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf",
                    fileName="aromal_kinematics_sol.pdf",
                    status="Submitted",
                    marksObtained="23",
                    feedback="Exceptional work on the projectile vector decomposition! Keep it up."
                )
                db.add(submission)
                db.commit()
            print(f"[Seed] Created sample Assignment: '{asg_title}'.")

        # 6. Sample Exam (with MCQs and Subjective questions)
        exam_title = "Physics Mid-Term Assessment"
        if not db.query(Exam).filter_by(examName=exam_title).first():
            exam = Exam(
                examName=exam_title,
                examType="Mid Term",
                description="Official mid-term examination covering Units 1, 2, and 3. Ensure answers are submitted within the 60-minute duration.",
                className="10",
                subject="Physics",
                batch="Morning Science",
                examDate=(datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"),
                startTime="10:00",
                duration="60",
                maxMarks="40",
                passingMarks="16",
                creationMethod="mcq",
                extractionStatus="verified",
                teacher_id=teacher_profile.id if teacher_profile else None,
                isPublished=True,
                status="Upcoming"
            )
            db.add(exam)
            db.commit()
            db.refresh(exam)

            q1 = ExamQuestion(
                exam_id=exam.id,
                questionText="What is the SI unit of magnetic flux density?",
                questionType="mcq",
                optionsJson=json.dumps(["Weber (Wb)", "Tesla (T)", "Henry (H)", "Gauss (G)"]),
                correctAnswer="Tesla (T)",
                marks="2",
                explanation="1 Tesla = 1 Weber per square meter.",
                sortOrder=1
            )
            q2 = ExamQuestion(
                exam_id=exam.id,
                questionText="State Lenz's Law and explain how it demonstrates conservation of energy.",
                questionType="subjective",
                marks="5",
                explanation="The direction of the induced current is always such that its magnetic field opposes the change in magnetic flux that produced it.",
                sortOrder=2
            )
            q3 = ExamQuestion(
                exam_id=exam.id,
                questionText="A ray of light passes from glass into air. What happens to its speed and wavelength?",
                questionType="mcq",
                optionsJson=json.dumps([
                    "Speed increases, wavelength increases",
                    "Speed decreases, wavelength decreases",
                    "Speed increases, wavelength remains constant",
                    "Speed decreases, wavelength increases"
                ]),
                correctAnswer="Speed increases, wavelength increases",
                marks="2",
                explanation="Air has a lower refractive index than glass; both velocity and wavelength increase, frequency remains constant.",
                sortOrder=3
            )
            db.add_all([q1, q2, q3])
            db.commit()
            print(f"[Seed] Created sample Exam: '{exam_title}' with 3 structured questions.")

        # 7. Sample Live Class
        live_title = "Live Masterclass: Wave Optics & Quantum Introduction"
        if not db.query(LiveClass).filter_by(title=live_title).first():
            live_class = LiveClass(
                title=live_title,
                subject="Physics",
                className="10",
                batch="Morning Science",
                teacher_id=teacher_profile.id if teacher_profile else None,
                teacherName="Priya Sharma",
                scheduledDate=datetime.now().strftime("%Y-%m-%d"),
                startTime="17:00",
                endTime="18:30",
                meetingLink="https://meet.google.com/aca-tuti-onw",
                description="Interactive live demonstration of Young's Double Slit Experiment and wave-particle duality basics.",
                status="Upcoming"
            )
            db.add(live_class)
            db.commit()
            print(f"[Seed] Created sample Live Class: '{live_title}'.")

        # 8. Sample Study Message
        if aromal_user and db.query(User).filter(User.id != aromal_user.id).first():
            other_user = db.query(User).filter(User.id != aromal_user.id).first()
            if not db.query(StudyMessage).first():
                msg = StudyMessage(
                    sender_user_id=aromal_user.id,
                    recipient_user_id=other_user.id,
                    sender_name=aromal_user.name,
                    recipient_name=other_user.name,
                    subject_tag="Physics Chapter 3",
                    content="Hey! Did you check out Priya Ma'am's notes on Lenz's Law? Let's review question 2 together before the exam.",
                    is_read=True
                )
                db.add(msg)
                db.commit()
                print("[Seed] Created sample Study Message.")

        print("=" * 60)
        print("DEV FIXTURES SEED COMPLETED SUCCESSFULLY.")
        print("Existing data was preserved. Zero records overwritten.")
        print("=" * 60)

    finally:
        db.close()


if __name__ == "__main__":
    seed_dev_data()
