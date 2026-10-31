import base64
import os
import re
import uuid
from typing import Optional, Tuple

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_ROOT = os.path.join(BACKEND_DIR, "uploads")


def sanitize_filename(filename: str) -> str:
    base = os.path.basename(filename)
    clean = re.sub(r"[^\w\.\-\_]", "_", base)
    return clean or "document"


def save_base64_file(data_url: str, category: str = "general", default_filename: str = "file") -> Tuple[str, str]:
    """
    Saves a base64 DataURL to disk under backend/uploads/{category}/
    Returns (file_url, safe_filename).
    """
    if not data_url or not data_url.startswith("data:"):
        return data_url, default_filename

    try:
        header, encoded = data_url.split(",", 1)
        mime = header.split(";")[0].replace("data:", "")
    except Exception:
        return data_url, default_filename

    mime_to_ext = {
        "application/pdf": ".pdf",
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/webp": ".webp",
        "text/plain": ".txt",
        "audio/webm": ".webm",
        "audio/ogg": ".ogg",
        "audio/mpeg": ".mp3",
        "audio/mp3": ".mp3",
        "audio/wav": ".wav",
        "audio/x-wav": ".wav",
        "audio/wave": ".wav",
        "audio/mp4": ".m4a",
        "audio/x-m4a": ".m4a",
        "audio/m4a": ".m4a",
        "audio/aac": ".aac",
    }
    ext = mime_to_ext.get(mime, ".pdf" if "pdf" in mime else ".png")

    clean_name = sanitize_filename(default_filename)
    if not any(clean_name.lower().endswith(e) for e in [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".txt", ".webm", ".ogg", ".mp3", ".wav", ".m4a", ".aac"]):
        clean_name += ext

    category_dir = os.path.join(UPLOADS_ROOT, category)
    os.makedirs(category_dir, exist_ok=True)

    unique_prefix = uuid.uuid4().hex[:12]
    stored_filename = f"{unique_prefix}_{clean_name}"
    target_path = os.path.join(category_dir, stored_filename)

    file_bytes = base64.b64decode(encoded)
    with open(target_path, "wb") as f:
        f.write(file_bytes)

    view_url = f"/files/view/{category}/{stored_filename}"
    return view_url, clean_name


def ensure_persistent_file_url(
    url_or_data: Optional[str], category: str = "general", filename: Optional[str] = None
) -> Tuple[Optional[str], Optional[str]]:
    """
    If url_or_data is a base64 string, saves to disk and returns (/files/view/..., filename).
    If it's already a URL or path, returns it unchanged.
    """
    if not url_or_data:
        return None, filename

    if url_or_data.startswith("data:"):
        view_url, clean_name = save_base64_file(url_or_data, category, filename or "document")
        return view_url, clean_name

    return url_or_data, filename
