from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text

from database.db import Base


class Student(Base):
    """
    Roster entry for a student — separate from their login account (User).
    `user_id` optionally links to the User created for their login, so
    later features (e.g. the student's own dashboard) can look up their
    class/batch without duplicating data. Nullable because older/edited
    entries may not always have this set.
    """
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    name = Column(String, nullable=False)
    className = Column(String, nullable=False)
    batch = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    dob = Column(String, nullable=True)
    parent = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    cash_balance = Column(Integer, default=100)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    name = Column(String, nullable=False)
    subject = Column(String, nullable=True)
    batch = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    qualification = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    className = Column(String, nullable=True)
    teacher = Column(String, nullable=True)
    description = Column(String, nullable=True)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)


class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    batchName = Column(String, nullable=False)
    className = Column(String, nullable=True)
    subject = Column(String, nullable=True)
    teacher = Column(String, nullable=True)
    days = Column(String, nullable=True)
    time = Column(String, nullable=True)
    capacity = Column(String, nullable=True)
    enrolled = Column(String, nullable=True)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    className = Column(String, nullable=True)
    subject = Column(String, nullable=True)
    batch = Column(String, nullable=True)
    topic = Column(String, nullable=True)
    unit = Column(String, nullable=True)
    type = Column(String, default="pdf")  # pdf | image | text | doc
    fileName = Column(String, nullable=True)
    fileUrl = Column(String, nullable=True)
    textContent = Column(Text, nullable=True)
    uploadedBy = Column(String, default="Teacher")
    uploader_id = Column(Integer, nullable=True)  # User.id
    teacher_id = Column(Integer, nullable=True)   # Teacher.id
    status = Column(String, default="Published")
    # "class" = published by staff to a class/batch (the default, and what every
    # older row means); "private" = a student's own upload, visible only to them.
    visibility = Column(String, default="class", server_default="class")
    created_at = Column(DateTime, default=datetime.utcnow)


class NoteAnnotation(Base):
    __tablename__ = "note_annotations"

    id = Column(Integer, primary_key=True, index=True)
    note_id = Column(Integer, nullable=False, index=True)
    author_id = Column(Integer, nullable=True)    # User.id
    author_name = Column(String, nullable=True)
    annotation_data = Column(Text, nullable=False)  # JSON strokes/shapes/text/colors
    is_whiteboard = Column(Boolean, default=False)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    className = Column(String, nullable=True)
    subject = Column(String, nullable=True)
    batch = Column(String, nullable=True)
    dueDate = Column(String, nullable=True)
    maxMarks = Column(String, nullable=True)
    fileName = Column(String, nullable=True)
    fileUrl = Column(String, nullable=True)
    teacher_id = Column(Integer, nullable=True)   # Teacher.id
    createdBy = Column(String, default="Teacher")
    # JSON list of {name, type, url}: the photos / PDFs / audio the teacher attached.
    # fileUrl/fileName above are kept (= first attachment) for older code.
    attachmentsJson = Column(Text, nullable=True)
    status = Column(String, default="Active")     # Active | Overdue | Closed
    created_at = Column(DateTime, default=datetime.utcnow)


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, nullable=False, index=True)
    student_id = Column(Integer, nullable=False, index=True)  # Student.id
    student_name = Column(String, nullable=False)
    batch = Column(String, nullable=True)
    fileUrl = Column(String, nullable=True)
    fileName = Column(String, nullable=True)
    textContent = Column(Text, nullable=True)
    # JSON list of {name, type, url}: the student's photos / PDFs / voice recordings.
    attachmentsJson = Column(Text, nullable=True)
    status = Column(String, default="Submitted")  # Submitted | Late | Reviewed | Returned
    marksObtained = Column(String, nullable=True)
    feedback = Column(Text, nullable=True)
    correctionData = Column(Text, nullable=True)
    questionMarksJson = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    graded_at = Column(DateTime, nullable=True)


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    examName = Column(String, nullable=False)
    examType = Column(String, default="Unit Test")  # Unit Test | Mid Term | Final Term | Surprise Test
    description = Column(Text, nullable=True)
    className = Column(String, nullable=True)
    subject = Column(String, nullable=True)
    batch = Column(String, nullable=True)
    examDate = Column(String, nullable=True)
    startTime = Column(String, nullable=True)
    duration = Column(String, nullable=True)  # minutes
    maxMarks = Column(String, nullable=True)
    passingMarks = Column(String, nullable=True)
    questionPaperUrl = Column(String, nullable=True)
    creationMethod = Column(String, default="manual")  # manual | ocr_image | mcq
    extractionStatus = Column(String, default="verified")  # pending_review | verified
    teacher_id = Column(Integer, nullable=True)  # Teacher.id
    isPublished = Column(Boolean, default=True)
    status = Column(String, default="Upcoming")  # Upcoming | Ongoing | Completed
    created_at = Column(DateTime, default=datetime.utcnow)


class ExamQuestion(Base):
    __tablename__ = "exam_questions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, nullable=False, index=True)
    questionText = Column(Text, nullable=False)
    questionType = Column(String, default="mcq")  # mcq | subjective
    optionsJson = Column(Text, nullable=True)     # JSON array: ["Option A", "Option B", ...]
    correctAnswer = Column(String, nullable=True)
    marks = Column(String, default="1")
    explanation = Column(Text, nullable=True)
    sortOrder = Column(Integer, default=0)


class ExamSubmission(Base):
    __tablename__ = "exam_submissions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, nullable=False, index=True)
    student_id = Column(Integer, nullable=False, index=True)  # Student.id
    student_name = Column(String, nullable=False)
    answersJson = Column(Text, nullable=True)       # JSON dict: {question_id: selected_option}
    answerSheetUrl = Column(String, nullable=True)  # scanned photo/pdf/camera capture
    audioUrl = Column(String, nullable=True)        # audio recording / voice explanation
    textContent = Column(Text, nullable=True)       # written answers/derivation
    attachmentsJson = Column(Text, nullable=True)   # JSON list of {name, type, url}
    marksObtained = Column(String, nullable=True)
    feedback = Column(Text, nullable=True)
    correctionData = Column(Text, nullable=True)     # JSON serialized annotation layers
    questionMarksJson = Column(Text, nullable=True)  # JSON question-wise marks breakdown
    status = Column(String, default="Submitted")    # In Progress | Submitted | Draft Graded | Graded
    started_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    graded_at = Column(DateTime, nullable=True)


class LiveClass(Base):
    __tablename__ = "live_classes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    subject = Column(String, nullable=True)
    className = Column(String, nullable=True)
    batch = Column(String, nullable=True)
    teacher_id = Column(Integer, nullable=True)  # Teacher.id
    teacherName = Column(String, nullable=True)
    scheduledDate = Column(String, nullable=True)
    startTime = Column(String, nullable=True)
    endTime = Column(String, nullable=True)
    meetingLink = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String, default="Upcoming")  # Upcoming | Live Now | Ended
    created_at = Column(DateTime, default=datetime.utcnow)
