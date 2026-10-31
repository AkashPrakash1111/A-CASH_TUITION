import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.db import get_db
from models.user import User, UserRole
from models.academic import Subject, Batch, Teacher, Student, Exam
from schemas.user import UserLogin, AvatarUpdate, Token
from schemas.academic import SubjectCreate, BatchCreate, TeacherCreate, StudentCreate
from schemas.academic_ext import ExamCreate
from utils.security import hash_password, verify_password, decode_access_token

from routers import auth, subjects, batches, teachers, students, exams

def run_tests():
    print("=" * 60)
    print("ACASH TUITION - COMPREHENSIVE END-TO-END VERIFICATION")
    print("=" * 60)

    db = next(get_db())

    # 1. Admin Verification & Login
    print("\n[Step 1] Verifying Admin Account & Login...")
    admin = db.query(User).filter(User.role == UserRole.admin).first()
    assert admin is not None, "Admin user must exist"
    print(f" -> Found Admin: {admin.name} ({admin.email})")

    # Set known password for test if needed
    admin.hashed_password = hash_password("adminpass123")
    admin.username = admin.email
    db.commit()

    token_res = auth.login(UserLogin(email=admin.email, password="adminpass123"), db=db)
    assert isinstance(token_res, Token)
    assert token_res.user.role == UserRole.admin
    payload = decode_access_token(token_res.access_token)
    assert payload["role"] == "admin"
    print(" -> Admin logged in successfully! JWT created with role: admin")

    # 2. Admin Avatar Customization
    print("\n[Step 2] Testing Admin Avatar Customization...")
    new_avatar_config = {
        "style": "adventurer",
        "seed": "MightyAdmin88",
        "hair": "short02",
        "hairColor": "1a1a1a"
    }
    updated_admin = auth.update_my_avatar(
        AvatarUpdate(config=new_avatar_config),
        db=db,
        current_user=admin
    )
    assert "MightyAdmin88" in updated_admin.avatar_config
    # Refresh from db to confirm persistence
    db.refresh(admin)
    assert "MightyAdmin88" in admin.avatar_config
    print(" -> Admin avatar updated & persisted in database:", admin.avatar_config)

    # 3. Create Subject "Physics"
    print("\n[Step 3] Testing Subject Creation ('Physics')...")
    # Check if Physics already exists or create
    existing_sub = db.query(Subject).filter(Subject.name == "Physics").first()
    if not existing_sub:
        sub_res = subjects.create_subject(
            SubjectCreate(
                name="Physics",
                className="Class 10",
                teacher="Dr. Raman",
                description="Core Physics course"
            ),
            db=db,
            _admin=admin
        )
        print(" -> Subject created! ID:", sub_res.id, "Name:", sub_res.name)
    else:
        print(" -> Subject 'Physics' already exists. ID:", existing_sub.id)

    # Verify subjects listing provides valid name field
    all_subs = subjects.list_subjects(db=db, _current_user=admin)
    physics_found = any(s.name == "Physics" for s in all_subs)
    assert physics_found, "Physics must be present in subjects list"
    print(f" -> Subject list verified ({len(all_subs)} subjects). Physics found.")

    # 4. Create Batch "Class 10 A"
    print("\n[Step 4] Testing Batch Creation ('Class 10 A')...")
    existing_batch = db.query(Batch).filter(Batch.batchName == "Class 10 A").first()
    if not existing_batch:
        batch_res = batches.create_batch(
            BatchCreate(
                batchName="Class 10 A",
                className="Class 10",
                subject="Physics",
                teacher="Dr. Raman",
                days="Mon, Wed, Fri",
                time="4:00 PM - 5:30 PM",
                capacity="30"
            ),
            db=db,
            _admin=admin
        )
        print(" -> Batch created! ID:", batch_res.id, "Name:", batch_res.batchName)
    else:
        print(" -> Batch 'Class 10 A' already exists. ID:", existing_batch.id)

    # 5. Create Teacher with custom alphanumeric Login ID
    print("\n[Step 5] Testing Teacher Creation with Login ID 'teacher_physics'...")
    # Clean up test user/teacher if rerun
    old_teacher_u = db.query(User).filter(User.username == "teacher_physics").first()
    if old_teacher_u:
        db.query(Teacher).filter(Teacher.user_id == old_teacher_u.id).delete()
        db.delete(old_teacher_u)
        db.commit()

    teacher_res = teachers.create_teacher(
        TeacherCreate(
            name="Dr. Raman",
            subject="Physics",
            batch="Class 10 A",
            phone="+91 9876543210",
            email="raman@acash.edu",
            qualification="Ph.D Physics",
            experience="10 Years",
            login_id="teacher_physics",
            password="teacherpass123",
            status="Active"
        ),
        db=db,
        _admin=admin
    )
    print(" -> Teacher created! ID:", teacher_res.id, "User ID:", teacher_res.user_id)
    assert teacher_res.user_id is not None, "Teacher must be linked to a User"
    assert teacher_res.login_id == "teacher_physics"
    assert not hasattr(teacher_res, "password"), "TeacherOut must never have password field"

    # Verify User record in DB
    teacher_user = db.query(User).filter(User.id == teacher_res.user_id).first()
    assert teacher_user is not None
    assert teacher_user.username == "teacher_physics"
    assert teacher_user.role == UserRole.teacher
    assert verify_password("teacherpass123", teacher_user.hashed_password)
    assert teacher_user.hashed_password != "teacherpass123"
    print(" -> Verified teacher password safely hashed with bcrypt in DB.")

    # 6. Test Teacher Login using alphanumeric Login ID
    print("\n[Step 6] Testing Teacher Login with 'teacher_physics'...")
    teacher_login = auth.login(
        UserLogin(email="teacher_physics", password="teacherpass123"),
        db=db
    )
    assert teacher_login.user.role == UserRole.teacher
    t_payload = decode_access_token(teacher_login.access_token)
    assert t_payload["role"] == "teacher"
    assert t_payload["sub"] == "teacher_physics"
    print(" -> Teacher logged in successfully! Role verified: teacher")

    # 7. Create Student with custom alphanumeric Login ID
    print("\n[Step 7] Testing Student Creation with Login ID 'student_akash'...")
    old_student_u = db.query(User).filter(User.username == "student_akash").first()
    if old_student_u:
        db.query(Student).filter(Student.user_id == old_student_u.id).delete()
        db.delete(old_student_u)
        db.commit()

    student_res = students.create_student(
        StudentCreate(
            name="Akash Sharma",
            className="Class 10",
            batch="Class 10 A",
            gender="Male",
            dob="2008-05-15",
            parent="Suresh Sharma",
            phone="+91 9123456789",
            login_id="student_akash",
            password="studentpass123",
            status="Active"
        ),
        db=db,
        _admin=admin
    )
    print(" -> Student created! ID:", student_res.id, "User ID:", student_res.user_id)
    assert student_res.user_id is not None, "Student must be linked to a User"
    assert student_res.login_id == "student_akash"
    assert not hasattr(student_res, "password"), "StudentOut must never have password field"

    # Verify Student User record in DB
    student_user = db.query(User).filter(User.id == student_res.user_id).first()
    assert student_user is not None
    assert student_user.username == "student_akash"
    assert student_user.role == UserRole.student
    assert verify_password("studentpass123", student_user.hashed_password)
    assert student_user.hashed_password != "studentpass123"
    print(" -> Verified student password safely hashed with bcrypt in DB.")

    # 8. Test Student Login using alphanumeric Login ID
    print("\n[Step 8] Testing Student Login with 'student_akash'...")
    student_login = auth.login(
        UserLogin(email="student_akash", password="studentpass123"),
        db=db
    )
    assert student_login.user.role == UserRole.student
    s_payload = decode_access_token(student_login.access_token)
    assert s_payload["role"] == "student"
    assert s_payload["sub"] == "student_akash"
    print(" -> Student logged in successfully! Role verified: student")

    # 9. Test Exam Creation with Subject 'Physics' and Batch 'Class 10 A'
    print("\n[Step 9] Testing Exam Creation with Subject 'Physics' and Batch 'Class 10 A'...")
    exam_res = exams.create_exam(
        ExamCreate(
            examName="Physics Mechanics Unit Test",
            examType="Unit Test",
            className="Class 10",
            subject="Physics",
            batch="Class 10 A",
            examDate="2026-10-25",
            duration="60",
            maxMarks="50",
            passingMarks="20",
            teacher_id=teacher_res.id
        ),
        db=db,
        current_user=teacher_user
    )
    assert exam_res.id is not None
    assert exam_res.subject == "Physics"
    assert exam_res.batch == "Class 10 A"
    print(" -> Exam created successfully! ID:", exam_res.id, "Exam Name:", exam_res.examName, "Subject:", exam_res.subject)

    print("\n" + "=" * 60)
    print("SUCCESS: ALL VERIFICATION CHECKS PASSED WITH 100% INTEGRITY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
