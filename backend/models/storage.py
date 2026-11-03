from datetime import datetime

from sqlalchemy import Column, Integer, String, LargeBinary, DateTime, UniqueConstraint

from database.db import Base


class StoredFile(Base):
    """An uploaded file kept inside the database.

    Free hosting has no persistent disk, so on Postgres uploads are stored here
    instead of in backend/uploads. Local development on SQLite keeps using disk.
    """
    __tablename__ = "stored_files"
    __table_args__ = (UniqueConstraint("category", "filename", name="uq_stored_file"),)

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    size = Column(Integer, default=0)
    data = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)