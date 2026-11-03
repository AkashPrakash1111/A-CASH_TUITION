"""
Where uploaded files are kept.

  * Postgres (production, free hosting): inside the database, table stored_files,
    because free web services lose their local disk on every restart.
  * SQLite (local development): on disk under uploads/, exactly as before.

Override with FILE_STORAGE=db or FILE_STORAGE=disk.
"""

import os

from database.db import DATABASE_URL, SessionLocal
from models.storage import StoredFile


def uses_database() -> bool:
    mode = (os.getenv("FILE_STORAGE") or "").lower()
    if mode in ("db", "disk"):
        return mode == "db"
    return not DATABASE_URL.startswith("sqlite")


def put(category: str, filename: str, content: bytes) -> None:
    db = SessionLocal()
    try:
        db.add(StoredFile(category=category, filename=filename, size=len(content), data=content))
        db.commit()
    finally:
        db.close()


def get(category: str, filename: str) -> bytes | None:
    db = SessionLocal()
    try:
        row = db.query(StoredFile).filter_by(category=category, filename=filename).first()
        return bytes(row.data) if row else None
    finally:
        db.close()
