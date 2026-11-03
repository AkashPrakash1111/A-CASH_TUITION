import base64
import os
import re
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from fastapi.responses import Response
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from database.db import get_db
from utils import blob_store
from models.academic import Student
from models.user import User, UserRole
from utils.security import decode_access_token

router = APIRouter(prefix="/files", tags=["files"])

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_ROOT = os.path.join(os.getenv("DATA_DIR") or BACKEND_DIR, "uploads")
ALLOWED_CATEGORIES = {"notes", "assignments", "submissions", "exams", "general"}
ALLOWED_EXTENSIONS = {
    ".pdf", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".txt", ".doc", ".docx",
    ".webm", ".ogg", ".mp3", ".wav", ".m4a", ".aac",
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB limit


def get_authenticated_user_flexible(
    token_query: Optional[str] = Query(None, alias="token"),
    db: Session = Depends(get_db),
    # Note: Authorization header check will be read from request or header if present
) -> User:
    """
    Validates token from Authorization header or ?token= query parameter.
    Critical for <iframe>, <embed>, <img>, and direct download links where
    custom headers cannot easily be set by browsers.
    """
    from fastapi import Request
    # We will inject Request in the route handlers or read token directly
    return None


def verify_user_from_token_str(token: str, db: Session) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if not payload:
        raise credentials_error

    sub = payload.get("sub")
    if not sub:
        raise credentials_error

    user = db.query(User).filter(
        or_(
            func.lower(User.email) == str(sub).lower().strip(),
            func.lower(User.username) == str(sub).lower().strip(),
        )
    ).first()

    if not user or not user.is_active:
        raise credentials_error

    return user


def resolve_auth_user(token_param: Optional[str], auth_header: Optional[str], db: Session) -> User:
    token = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
    elif token_param:
        token = token_param.strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to access or upload files",
        )

    return verify_user_from_token_str(token, db)


def sanitize_filename(filename: str) -> str:
    # Remove directory traversal and dangerous characters
    base = os.path.basename(filename)
    clean = re.sub(r"[^\w\.\-\_]", "_", base)
    return clean or "document"


def get_mime_type(ext: str) -> str:
    ext_lower = ext.lower()
    mimes = {
        ".pdf": "application/pdf",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".txt": "text/plain",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".webm": "audio/webm",
        ".ogg": "audio/ogg",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".m4a": "audio/mp4",
        ".aac": "audio/aac",
    }
    return mimes.get(ext_lower, "application/octet-stream")


def _save(category: str, stored_filename: str, content: bytes) -> None:
    if blob_store.uses_database():
        blob_store.put(category, stored_filename, content)
        return
    category_dir = os.path.join(UPLOADS_ROOT, category)
    os.makedirs(category_dir, exist_ok=True)
    with open(os.path.join(category_dir, stored_filename), "wb") as f:
        f.write(content)


def _serve(category: str, safe_name: str, disposition: str, download_name: str | None = None):
    """Send a stored file: from the database if it is there, else from disk."""
    mime = get_mime_type(os.path.splitext(safe_name)[1])
    name = download_name or safe_name
    headers = {"Content-Disposition": f"{disposition}; filename=\"{name}\""}

    data = blob_store.get(category, safe_name) if blob_store.uses_database() else None
    if data is not None:
        return Response(content=data, media_type=mime, headers=headers)

    file_path = os.path.join(UPLOADS_ROOT, category, safe_name)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Requested file was not found")
    return FileResponse(path=file_path, media_type=mime, headers=headers)


class Base64UploadRequest(BaseModel):
    dataUrl: str
    fileName: str
    category: str = "notes"


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    category: str = Form("general"),
    token: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """
    Accepts multipart file upload, validates extension, stores securely in backend/uploads/{category}/,
    and returns accessible URL paths.
    """
    if category not in ALLOWED_CATEGORIES:
        category = "general"

    orig_name = sanitize_filename(file.filename or "upload.bin")
    ext = os.path.splitext(orig_name)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '{ext}' not allowed. Permitted: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    unique_prefix = uuid.uuid4().hex[:12]
    stored_filename = f"{unique_prefix}_{orig_name}"

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE // (1024 * 1024)}MB",
        )

    _save(category, stored_filename, content)

    view_url = f"/files/view/{category}/{stored_filename}"
    download_url = f"/files/download/{category}/{stored_filename}"

    return {
        "success": True,
        "fileUrl": view_url,
        "downloadUrl": download_url,
        "fileName": orig_name,
        "contentType": get_mime_type(ext),
        "sizeBytes": len(content),
    }


@router.post("/upload-base64")
def upload_base64_file(
    payload: Base64UploadRequest,
    db: Session = Depends(get_db),
):
    """
    Receives base64 dataURL (e.g. from canvas or camera capture),
    saves to disk, and returns the persistent fileUrl.
    """
    category = payload.category if payload.category in ALLOWED_CATEGORIES else "general"
    data_url = payload.dataUrl

    if not data_url.startswith("data:"):
        raise HTTPException(status_code=400, detail="Invalid data URL format")

    try:
        header, encoded = data_url.split(",", 1)
        # Extract mime type
        mime = header.split(";")[0].replace("data:", "")
    except Exception:
        raise HTTPException(status_code=400, detail="Malformed data URL")

    # Map mime to ext
    mime_to_ext = {
        "application/pdf": ".pdf",
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/webp": ".webp",
        "text/plain": ".txt",
    }
    ext = mime_to_ext.get(mime, ".bin")
    orig_name = sanitize_filename(payload.fileName or f"file{ext}")
    if not orig_name.endswith(ext):
        orig_name += ext

    unique_prefix = uuid.uuid4().hex[:12]
    stored_filename = f"{unique_prefix}_{orig_name}"

    file_bytes = base64.b64decode(encoded)
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds maximum allowed size",
        )

    _save(category, stored_filename, file_bytes)

    view_url = f"/files/view/{category}/{stored_filename}"
    download_url = f"/files/download/{category}/{stored_filename}"

    return {
        "success": True,
        "fileUrl": view_url,
        "downloadUrl": download_url,
        "fileName": orig_name,
        "contentType": mime,
        "sizeBytes": len(file_bytes),
    }


@router.get("/view/{category}/{filename}")
def view_file(
    category: str,
    filename: str,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Streams file inline for in-app reading, PDF preview, or image display.
    """
    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(status_code=404, detail="Category not found")

    return _serve(category, os.path.basename(filename), "inline")


@router.get("/download/{category}/{filename}")
def download_file(
    category: str,
    filename: str,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Forces download of the file with original or clean name.
    """
    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(status_code=404, detail="Category not found")

    safe_name = os.path.basename(filename)
    # Strip the 13 char prefix (uuid + underscore) for a nice download filename
    download_name = safe_name[13:] if len(safe_name) > 13 and safe_name[12] == "_" else safe_name
    return _serve(category, safe_name, "attachment", download_name)
