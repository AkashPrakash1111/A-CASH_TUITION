from fastapi import APIRouter, Depends, HTTPException, status
import base64

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from database.db import get_db
from models.academic import Batch, Note, NoteAnnotation, Student, Teacher
from models.user import User, UserRole
from schemas.academic_ext import (
    MyNoteCreate,
    NoteReviewIn,
    NoteCreate,
    NoteOut,
    StudentUploadOut,
    NoteAnnotationCreate,
    NoteAnnotationOut,
)
from utils.audience import find_student, norm
from utils.deps import get_current_user, require_role
from utils.file_storage import ensure_persistent_file_url
from utils.attachments import process_attachments, dump as dump_attachments
from datetime import datetime

router = APIRouter(prefix="/notes", tags=["notes"])


# Shared with assignments so notes and assignments apply the same audience rule.
_norm = norm
_find_student = find_student


MAX_UPLOAD_BYTES = 25 * 1024 * 1024
MAX_PRIVATE_NOTES = 200
ALLOWED_DATA_MIMES = {
    "pdf": {"application/pdf"},
    "image": {"image/png", "image/jpeg", "image/jpg", "image/webp"},
}


def is_private(note: Note) -> bool:
    """A student's own upload. Stored as visibility == "private" meaning "not
    shared with other students": the owner and staff (admin/teacher) can open
    it, no other student can."""
    return (note.visibility or "class") == "private"


def is_staff(user: User) -> bool:
    return user.role in (UserRole.admin, UserRole.teacher)


def can_open_private(note: Note, user: User) -> bool:
    return _owns(note, user) or is_staff(user)


def _owns(note: Note, user: User) -> bool:
    return note.uploader_id is not None and note.uploader_id == user.id


def student_can_see(note: Note, student: Student | None) -> bool:
    """
    Who may a student read a note? Only when ALL of this holds:
      - the note is Published
      - the student has a roster entry (no entry -> sees nothing)
      - the note names a class, and it is the student's class
      - if the note names a batch, it is the student's batch;
        a note with no batch is shared with the whole class

    Anything unclear is hidden: a note with no class, or a student with no
    class, matches nobody.
    """
    if is_private(note):
        # Private uploads never go through class/batch sharing at all.
        return False

    if note.status != "Published" or student is None:
        return False

    note_class = _norm(note.className)
    if not note_class or note_class != _norm(student.className):
        return False

    note_batch = _norm(note.batch)
    if note_batch and note_batch != _norm(student.batch):
        return False

    return True


@router.get("", response_model=list[NoteOut])
def list_notes(
    className: str | None = None,
    subject: str | None = None,
    batch: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Private student uploads are never part of the shared list, for anyone.
    query = (
        db.query(Note)
        .filter(or_(Note.visibility.is_(None), Note.visibility != "private"))
        .order_by(Note.created_at.desc())
    )

    if className:
        query = query.filter(Note.className == className)
    if subject:
        query = query.filter(Note.subject == subject)
    if batch:
        query = query.filter(Note.batch == batch)

    notes = query.all()

    if current_user.role == UserRole.student:
        student = _find_student(db, current_user)
        notes = [n for n in notes if student_can_see(n, student)]

    return notes


@router.get("/student-uploads", response_model=list[StudentUploadOut])
def list_student_uploads(
    className: str | None = None,
    batch: str | None = None,
    subject: str | None = None,
    db: Session = Depends(get_db),
    _staff: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    """Admin/teacher: everything students have uploaded for themselves, newest
    first, tagged with each student's CURRENT class and batch."""
    notes = (
        db.query(Note)
        .filter(Note.visibility == "private")
        .order_by(Note.created_at.desc())
        .all()
    )

    owner_ids = {n.uploader_id for n in notes if n.uploader_id}
    students = (
        {s.user_id: s for s in db.query(Student).filter(Student.user_id.in_(owner_ids)).all()}
        if owner_ids
        else {}
    )

    result = []
    for n in notes:
        st = students.get(n.uploader_id)
        cls = st.className if st else n.className
        bat = st.batch if st else None

        if className and _norm(cls) != _norm(className):
            continue
        if batch and _norm(bat) != _norm(batch):
            continue
        if subject and _norm(n.subject) != _norm(subject):
            continue

        item = StudentUploadOut.model_validate(n)
        item.className = cls
        item.batch = bat
        item.studentId = st.id if st else None
        result.append(item)

    return result


@router.get("/mine", response_model=list[NoteOut])
def list_my_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.student)),
):
    """A student's own private uploads."""
    return (
        db.query(Note)
        .filter(Note.uploader_id == current_user.id, Note.visibility == "private")
        .order_by(Note.created_at.desc())
        .all()
    )


@router.post("/mine", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_my_note(
    payload: MyNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.student)),
):
    """A student adds a photo, PDF, typed note or link for their own use only."""
    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Give your note a title")

    note_type = (payload.type or "").lower()
    has_files = bool(payload.attachments)
    if has_files:
        note_type = "files"
    if note_type not in {"pdf", "image", "text", "link", "files"}:
        raise HTTPException(status_code=400, detail="Unsupported note type")

    owned = (
        db.query(func.count(Note.id))
        .filter(Note.uploader_id == current_user.id, Note.visibility == "private")
        .scalar()
    )
    if owned >= MAX_PRIVATE_NOTES:
        raise HTTPException(status_code=400, detail="You've reached the limit for personal uploads. Delete some first.")

    file_url = None
    file_name = payload.fileName
    text_content = None

    attachments_json = None
    if note_type == "files":
        stored = process_attachments(payload.attachments, "notes")
        if not stored:
            raise HTTPException(status_code=400, detail="Choose at least one file")
        attachments_json = dump_attachments(stored)
        file_url = stored[0]["url"]
        file_name = stored[0]["name"]
        text_content = (payload.textContent or "").strip() or None

    elif note_type == "text":
        text_content = (payload.textContent or "").strip()
        if not text_content:
            raise HTTPException(status_code=400, detail="Write something in your note")
        if len(text_content) > 100_000:
            raise HTTPException(status_code=400, detail="That note is too long")

    elif note_type == "link":
        link = (payload.fileUrl or "").strip()
        # Only web links. Anything else (javascript:, data:, file:) could run
        # code or leak local files when someone clicks it.
        if not (link.lower().startswith("http://") or link.lower().startswith("https://")) or " " in link:
            raise HTTPException(status_code=400, detail="Enter a full link starting with http:// or https://")
        if len(link) > 2000:
            raise HTTPException(status_code=400, detail="That link is too long")
        file_url = link
        file_name = None

    else:  # pdf | image
        data_url = payload.fileUrl or ""
        if not data_url.startswith("data:") or "," not in data_url:
            raise HTTPException(status_code=400, detail="Choose a file to upload")
        header, encoded = data_url.split(",", 1)
        mime = header[5:].split(";")[0].lower()
        if mime not in ALLOWED_DATA_MIMES[note_type]:
            allowed = "a PDF" if note_type == "pdf" else "a JPG, PNG or WEBP image"
            raise HTTPException(status_code=400, detail=f"That file isn't {allowed}")
        # base64 is 4/3 the size of the file; reject before decoding anything
        if len(encoded) * 3 // 4 > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="File is larger than 25 MB")
        try:
            base64.b64decode(encoded, validate=True)
        except Exception:
            raise HTTPException(status_code=400, detail="That file couldn't be read")
        file_url, file_name = ensure_persistent_file_url(data_url, "notes", file_name or title)

    student = _find_student(db, current_user)

    note = Note(
        title=title,
        description=(payload.description or "").strip(),
        className=student.className if student else None,
        subject=payload.subject,
        batch=None,
        type=note_type,
        fileName=file_name,
        fileUrl=file_url,
        textContent=text_content,
        attachmentsJson=attachments_json,
        uploadedBy=current_user.name,
        uploader_id=current_user.id,
        status="Published",
        visibility="private",
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.post("", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(
    payload: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    teacher_id = payload.teacher_id
    if current_user.role == UserRole.teacher and not teacher_id:
        teacher_rec = db.query(Teacher).filter_by(user_id=current_user.id).first()
        if teacher_rec:
            teacher_id = teacher_rec.id

    file_url = payload.fileUrl or payload.file_url
    file_name = payload.fileName or payload.file_name or payload.title
    note_type = payload.file_type or payload.type or "pdf"
    class_name = payload.className or payload.class_name
    text_content = payload.textContent or payload.text_content

    if not (class_name or "").strip():
        raise HTTPException(status_code=400, detail="Choose a class for these notes")

    batch_name = (payload.batch or "").strip() or None
    if batch_name:
        batch_row = (
            db.query(Batch)
            .filter(
                func.lower(Batch.batchName) == batch_name.lower(),
                func.lower(Batch.className) == class_name.strip().lower(),
            )
            .first()
        )
        if not batch_row:
            raise HTTPException(status_code=400, detail="That batch does not exist in the chosen class")

    # Persist fileUrl to disk if provided as base64 DataURL
    clean_file_url, clean_file_name = ensure_persistent_file_url(
        file_url, "notes", file_name
    )

    note = Note(
        title=payload.title,
        description=payload.description or "",
        className=class_name,
        subject=payload.subject,
        batch=batch_name,
        topic=payload.topic,
        unit=payload.unit,
        type=note_type,
        fileName=clean_file_name or file_name,
        fileUrl=clean_file_url,
        textContent=text_content,
        uploadedBy=payload.uploadedBy or current_user.name,
        uploader_id=current_user.id,
        teacher_id=teacher_id,
        status=payload.status,
        visibility="class",
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/{note_id}/review", response_model=NoteOut)
def review_student_upload(
    note_id: int,
    payload: NoteReviewIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    """Teacher/admin marks up a student's upload and sends it back: the drawn
    layer, a comment and (optionally) the flattened corrected PDF."""
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note or not is_private(note):
        raise HTTPException(status_code=404, detail="Upload not found")

    if payload.correctionData is not None:
        note.correctionData = payload.correctionData
    if payload.feedback is not None:
        note.reviewFeedback = payload.feedback
    if payload.correctedPdfUrl:
        url = payload.correctedPdfUrl
        if not url.startswith("/files/view/corrected/") or ".." in url:
            raise HTTPException(status_code=400, detail="Invalid corrected file")
        note.correctedPdfUrl = url
    note.reviewStatus = "Reviewed"
    note.reviewed_at = datetime.utcnow()
    note.reviewed_by = current_user.name
    db.commit()
    db.refresh(note)
    return note


@router.get("/{note_id}", response_model=NoteOut)
def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if is_private(note):
        # The owner and staff only. Other students get a 404 so it isn't
        # even confirmed to exist.
        if not can_open_private(note, current_user):
            raise HTTPException(status_code=404, detail="Note not found")
        return note

    if current_user.role == UserRole.student:
        if not student_can_see(note, _find_student(db, current_user)):
            # 404, not 403: don't confirm that a note exists to someone who can't see it
            raise HTTPException(status_code=404, detail="Note not found")

    return note


@router.put("/{note_id}", response_model=NoteOut)
def update_note(
    note_id: int,
    payload: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if is_private(note):
        raise HTTPException(status_code=404, detail="Note not found")

    # If teacher, verify ownership or administration
    if current_user.role == UserRole.teacher and note.uploader_id and note.uploader_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own notes")

    clean_file_url, clean_file_name = ensure_persistent_file_url(
        payload.fileUrl, "notes", payload.fileName or payload.title
    )

    for key, value in payload.model_dump().items():
        if key == "fileUrl" and clean_file_url:
            setattr(note, key, clean_file_url)
        elif key == "fileName" and clean_file_name:
            setattr(note, key, clean_file_name)
        else:
            setattr(note, key, value)

    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if is_private(note):
        # A student's upload can be deleted by its owner, or by an admin
        # (moderation). Teachers can view it but not remove it.
        if not (_owns(note, current_user) or current_user.role == UserRole.admin):
            raise HTTPException(
                status_code=403 if is_staff(current_user) else 404,
                detail="You do not have permission to perform this action" if is_staff(current_user) else "Note not found",
            )
    else:
        if current_user.role not in (UserRole.admin, UserRole.teacher):
            raise HTTPException(status_code=403, detail="You do not have permission to perform this action")
        if current_user.role == UserRole.teacher and note.uploader_id and note.uploader_id != current_user.id:
            raise HTTPException(status_code=403, detail="You can only delete your own notes")

    # Delete annotations associated with note
    db.query(NoteAnnotation).filter(NoteAnnotation.note_id == note_id).delete()
    db.delete(note)
    db.commit()


# ---- Annotations & Whiteboard ----

@router.get("/{note_id}/annotations", response_model=list[NoteAnnotationOut])
def get_note_annotations(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id).first()
    if note and is_private(note):
        if not can_open_private(note, current_user):
            raise HTTPException(status_code=404, detail="Note not found")
    elif current_user.role == UserRole.student:
        if not note or not student_can_see(note, _find_student(db, current_user)):
            raise HTTPException(status_code=404, detail="Note not found")

    return (
        db.query(NoteAnnotation)
        .filter(NoteAnnotation.note_id == note_id)
        .order_by(NoteAnnotation.created_at.desc())
        .all()
    )


@router.post("/{note_id}/annotations", response_model=NoteAnnotationOut, status_code=status.HTTP_201_CREATED)
def save_note_annotation(
    note_id: int,
    payload: NoteAnnotationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin, UserRole.teacher)),
):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note or is_private(note):
        raise HTTPException(status_code=404, detail="Note not found")

    annotation = NoteAnnotation(
        note_id=note_id,
        author_id=current_user.id,
        author_name=current_user.name,
        annotation_data=payload.annotation_data,
        is_whiteboard=payload.is_whiteboard,
        version=payload.version,
    )
    db.add(annotation)
    db.commit()
    db.refresh(annotation)
    return annotation
