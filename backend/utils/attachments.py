"""
Validating, storing and reading the files attached to an assignment or to a
student's answer (photos, PDFs, voice recordings).

The browser sends each file as a data URL. Everything is checked HERE, on the
server, so a hand-made request can't smuggle in another file type or an
oversized upload.
"""

import base64
import json
import os

from fastapi import HTTPException

from utils.file_storage import ensure_persistent_file_url

MAX_FILE_BYTES = 25 * 1024 * 1024
MAX_ATTACHMENTS = 8

KIND_MIMES = {
    "image": {"image/png", "image/jpeg", "image/jpg", "image/webp"},
    "pdf": {"application/pdf"},
    "audio": {
        "audio/webm",
        "audio/ogg",
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/x-wav",
        "audio/wave",
        "audio/mp4",
        "audio/x-m4a",
        "audio/m4a",
        "audio/aac",
    },
}

EXT_KIND = {
    ".png": "image", ".jpg": "image", ".jpeg": "image", ".webp": "image",
    ".pdf": "pdf",
    ".webm": "audio", ".ogg": "audio", ".mp3": "audio", ".wav": "audio",
    ".m4a": "audio", ".aac": "audio",
}

_KIND_LABEL = {"image": "a JPG, PNG or WEBP image", "pdf": "a PDF", "audio": "an audio file"}


def kind_from_name(name: str | None) -> str:
    ext = os.path.splitext((name or "").lower())[1]
    return EXT_KIND.get(ext, "file")


def _field(item, key):
    return item.get(key) if isinstance(item, dict) else getattr(item, key, None)


def process_attachments(items, category: str) -> list[dict]:
    """
    Validate a list of {name, type, url} items and store any new files.
    Returns the list to keep: [{"name", "type", "url"}] with url = "/files/view/...".

    An item whose url is already a stored file of this category (the edit
    screen sends existing attachments back) is kept as is. Anything else that
    isn't a valid data URL is refused.
    """
    items = list(items or [])
    if len(items) > MAX_ATTACHMENTS:
        raise HTTPException(status_code=400, detail=f"You can attach up to {MAX_ATTACHMENTS} files")

    stored = []
    for item in items:
        kind = (_field(item, "type") or "").lower()
        url = _field(item, "url") or ""
        name = _field(item, "name") or "file"

        if kind not in KIND_MIMES:
            raise HTTPException(status_code=400, detail="Unsupported attachment type")

        if url.startswith("data:"):
            if "," not in url:
                raise HTTPException(status_code=400, detail="That file couldn't be read")
            header, encoded = url.split(",", 1)
            mime = header[5:].split(";")[0].lower()

            if mime not in KIND_MIMES[kind]:
                raise HTTPException(status_code=400, detail=f"'{name}' isn't {_KIND_LABEL[kind]}")

            # base64 is 4/3 the size of the file: refuse before decoding anything
            if len(encoded) * 3 // 4 > MAX_FILE_BYTES:
                raise HTTPException(status_code=413, detail=f"'{name}' is larger than 25 MB")

            try:
                base64.b64decode(encoded, validate=True)
            except Exception:
                raise HTTPException(status_code=400, detail=f"'{name}' couldn't be read")

            view_url, clean_name = ensure_persistent_file_url(url, category, name)
            stored.append({"name": clean_name or name, "type": kind, "url": view_url})

        elif url.startswith(f"/files/view/{category}/") and ".." not in url and "\\" not in url:
            stored.append({"name": name, "type": kind, "url": url})

        else:
            raise HTTPException(status_code=400, detail="Invalid attachment")

    return stored


def dump(attachments: list[dict]) -> str | None:
    return json.dumps(attachments) if attachments else None


def parse_attachments(raw: str | None, legacy_url: str | None = None, legacy_name: str | None = None) -> list[dict]:
    """Stored attachments, falling back to the old single-file columns so
    assignments created before this feature still show their file."""
    if raw:
        try:
            data = json.loads(raw)
            if isinstance(data, list):
                return [
                    {"name": a.get("name"), "type": a.get("type") or kind_from_name(a.get("url")), "url": a.get("url", "")}
                    for a in data
                    if isinstance(a, dict) and a.get("url")
                ]
        except ValueError:
            pass

    if legacy_url:
        return [{
            "name": legacy_name,
            "type": kind_from_name(legacy_url) if kind_from_name(legacy_url) != "file" else kind_from_name(legacy_name),
            "url": legacy_url,
        }]
    return []
