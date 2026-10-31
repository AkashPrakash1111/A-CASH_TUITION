from datetime import datetime
from pydantic import BaseModel, field_validator


# ---- Note Schemas ----

class NoteCreate(BaseModel):
    title: str
    description: str | None = ""
    className: str | None = None
    class_name: str | None = None
    subject: str | None = None
    batch: str | None = None
    topic: str | None = None
    unit: str | None = None
    type: str = "pdf"
    file_type: str | None = None
    fileName: str | None = None
    file_name: str | None = None
    fileUrl: str | None = None
    file_url: str | None = None
    textContent: str | None = None
    text_content: str | None = None
    uploadedBy: str | None = "Teacher"
    uploader_id: int | None = None
    teacher_id: int | None = None
    status: str = "Published"


class NoteOut(NoteCreate):
    id: int
    visibility: str | None = "class"
    created_at: datetime

    class Config:
        from_attributes = True


class StudentUploadOut(NoteOut):
    """A student's own upload as staff see it: the class and batch are read
    from the student's roster entry right now, not frozen at upload time."""
    studentId: int | None = None


class MyNoteCreate(BaseModel):
    """A student's own upload. Deliberately has no class/batch/status fields:
    the server decides those, so a student can't publish to anyone else."""
    title: str
    description: str | None = ""
    subject: str | None = None
    type: str = "text"  # pdf | image | text | link
    fileName: str | None = None
    fileUrl: str | None = None  # data URL for pdf/image, http(s) address for link
    textContent: str | None = None


class NoteAnnotationCreate(BaseModel):
    note_id: int
    annotation_data: str  # JSON payload of drawing strokes & shapes
    is_whiteboard: bool = False
    version: int = 1


class NoteAnnotationOut(NoteAnnotationCreate):
    id: int
    author_id: int | None = None
    author_name: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Assignment Schemas ----

class AttachmentIn(BaseModel):
    """A file the browser sends: `url` is a data URL for a new file, or the
    stored /files/view/... path of a file that is being kept."""
    name: str | None = None
    type: str  # image | pdf | audio
    url: str


class AttachmentOut(BaseModel):
    name: str | None = None
    type: str
    url: str


class AssignmentCreate(BaseModel):
    title: str
    description: str | None = ""
    className: str | None = None
    subject: str | None = None
    batch: str | None = None
    dueDate: str | None = None
    due_date: str | None = None
    maxMarks: str | None = None
    max_marks: str | None = None
    fileName: str | None = None
    file_name: str | None = None
    fileUrl: str | None = None
    file_url: str | None = None
    attachments: list[AttachmentIn] | None = None
    teacher_id: int | None = None
    createdBy: str | None = "Teacher"
    status: str = "Active"


class AssignmentOut(AssignmentCreate):
    id: int
    created_at: datetime
    attachments: list[AttachmentOut] = []
    submission_text: str | None = None
    submission_attachments: list[AttachmentOut] = []
    submitted_at: datetime | None = None
    submissions_count: int = 0
    is_submitted: bool = False
    submission_id: int | None = None
    submission_status: str | None = None
    submission_file_url: str | None = None
    marks_obtained: str | None = None
    marksObtained: str | None = None
    feedback: str | None = None
    correctionData: str | None = None
    questionMarksJson: str | None = None
    subject_name: str | None = None

    class Config:
        from_attributes = True


class AssignmentSubmissionCreate(BaseModel):
    fileUrl: str | None = None
    file_url: str | None = None
    fileName: str | None = None
    file_name: str | None = None
    textContent: str | None = None
    submission_text: str | None = None
    attachments: list[AttachmentIn] | None = None
    batch: str | None = None


class AssignmentGradeUpdate(BaseModel):
    marksObtained: str | None = None
    feedback: str | None = None
    status: str = "Reviewed"
    correctionData: str | None = None
    questionMarksJson: str | None = None


class AssignmentSubmissionOut(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    student_name: str
    batch: str | None = None
    fileUrl: str | None = None
    fileName: str | None = None
    textContent: str | None = None
    attachments: list[AttachmentOut] = []
    status: str
    marksObtained: str | None = None
    feedback: str | None = None
    correctionData: str | None = None
    questionMarksJson: str | None = None
    submitted_at: datetime
    graded_at: datetime | None = None

    class Config:
        from_attributes = True


# ---- Exam Schemas ----

class ExamQuestionCreate(BaseModel):
    questionText: str
    questionType: str = "mcq"
    optionsJson: str | None = None  # e.g., '["A", "B", "C", "D"]'
    correctAnswer: str | None = None
    marks: str = "1"
    explanation: str | None = None
    sortOrder: int = 0


class ExamQuestionOut(ExamQuestionCreate):
    id: int
    exam_id: int

    class Config:
        from_attributes = True


class ExamCreate(BaseModel):
    examName: str | None = None
    title: str | None = None
    examType: str = "Unit Test"
    description: str | None = ""
    className: str | None = None
    subject: str | None = None
    batch: str | None = None
    examDate: str | None = None
    startTime: str | None = None
    duration: str | None = "60"
    maxMarks: str | None = "50"
    passingMarks: str | None = "20"
    questionPaperUrl: str | None = None
    creationMethod: str = "manual"
    extractionStatus: str = "verified"
    teacher_id: int | None = None
    isPublished: bool = True
    status: str = "Upcoming"
    questions: list[ExamQuestionCreate] = []

    def model_post_init(self, __context):
        if not self.examName and self.title:
            self.examName = self.title
        elif not self.title and self.examName:
            self.title = self.examName
        if not self.examName:
            # Written straight into __dict__ so it is NOT recorded as "provided
            # by the client": a partial update without a name must keep the
            # stored name instead of renaming the exam to this default.
            self.__dict__["examName"] = "Curriculum Exam"


class ExamOut(BaseModel):
    id: int
    examName: str
    examType: str
    description: str | None = None
    className: str | None = None
    subject: str | None = None
    batch: str | None = None
    examDate: str | None = None
    startTime: str | None = None
    duration: str | None = None
    maxMarks: str | None = None
    passingMarks: str | None = None
    questionPaperUrl: str | None = None
    creationMethod: str
    extractionStatus: str
    teacher_id: int | None = None
    isPublished: bool
    status: str
    created_at: datetime
    questions: list[ExamQuestionOut] = []
    # Student specific evaluation status
    is_submitted: bool = False
    submission_id: int | None = None
    submission_status: str | None = None
    submission_marks: str | None = None
    submission_feedback: str | None = None

    class Config:
        from_attributes = True


class BulkQuestionParseRequest(BaseModel):
    rawText: str
    content: str | None = None


class ExamSubmissionCreate(BaseModel):
    answersJson: str | None = None      # JSON string: {"q_1": "B", ...}
    answers_json: str | None = None
    answerSheetUrl: str | None = None   # uploaded scanned file / camera photo
    file_url: str | None = None
    answer_sheet_url: str | None = None
    audioUrl: str | None = None
    audio_url: str | None = None
    textContent: str | None = None
    text_content: str | None = None
    attachmentsJson: str | None = None
    attachments_json: str | None = None


class ExamGradeUpdate(BaseModel):
    marksObtained: str | None = None
    feedback: str | None = None
    status: str = "Graded"
    correctionData: str | None = None
    questionMarksJson: str | None = None


class ExamSubmissionOut(BaseModel):
    id: int
    exam_id: int
    student_id: int
    student_name: str
    answersJson: str | None = None
    answerSheetUrl: str | None = None
    audioUrl: str | None = None
    textContent: str | None = None
    attachmentsJson: str | None = None
    marksObtained: str | None = None
    feedback: str | None = None
    status: str
    correctionData: str | None = None
    questionMarksJson: str | None = None
    started_at: datetime
    submitted_at: datetime | None = None
    graded_at: datetime | None = None

    class Config:
        from_attributes = True


# ---- Live Class Schemas ----

def clean_meeting_link(value: str | None) -> str | None:
    """
    A link typed without "https://" (e.g. "meet.google.com/abc") is treated by the
    browser as a path on OUR site, so the student lands on a 404 page. Add the
    scheme, trim spaces, and refuse anything that is not an http(s) address.
    """
    if value is None:
        return None
    link = value.strip()
    if not link:
        return ""
    if "://" not in link:
        link = "https://" + link.lstrip("/")
    if not link.lower().startswith(("http://", "https://")) or " " in link or "." not in link:
        raise ValueError("Enter a valid meeting link, e.g. https://meet.google.com/abc-defg-hij")
    return link


class LiveClassCreate(BaseModel):
    title: str
    subject: str | None = None
    className: str | None = None
    batch: str | None = None  # empty = every batch of the class
    teacher_id: int | None = None
    teacherName: str | None = None
    scheduledDate: str | None = None
    startTime: str | None = None
    endTime: str | None = None
    meetingLink: str | None = None
    description: str | None = ""
    status: str = "Upcoming"

    @field_validator("meetingLink")
    @classmethod
    def _check_link(cls, v):
        return clean_meeting_link(v)


class LiveClassUpdate(BaseModel):
    """Every field optional: an edit changes only what it sends."""
    title: str | None = None
    subject: str | None = None
    className: str | None = None
    batch: str | None = None
    teacher_id: int | None = None
    teacherName: str | None = None
    scheduledDate: str | None = None
    startTime: str | None = None
    endTime: str | None = None
    meetingLink: str | None = None
    description: str | None = None
    status: str | None = None

    @field_validator("meetingLink")
    @classmethod
    def _check_link(cls, v):
        return clean_meeting_link(v)


class LiveClassOut(LiveClassCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Messaging & Audit Schemas ----

class StudyMessageCreate(BaseModel):
    recipient_user_id: int
    subject_tag: str | None = None
    content: str
    file_url: str | None = None


class StudyMessageOut(BaseModel):
    id: int
    sender_user_id: int
    recipient_user_id: int
    sender_name: str
    recipient_name: str
    subject_tag: str | None = None
    content: str
    file_url: str | None = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AuditLogOut(BaseModel):
    id: int
    actor_id: int | None = None
    actor_name: str | None = None
    actor_role: str | None = None
    action: str
    entity_type: str | None = None
    entity_id: str | None = None
    details_json: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
