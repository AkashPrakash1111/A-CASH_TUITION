"""
Single source of truth for the database connection.

Uses SQLite by default (zero setup, a single .db file). Switching to
Postgres later only requires changing DATABASE_URL in .env — no other
code changes needed, since SQLAlchemy abstracts the driver differences.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./acash.db")

# check_same_thread is only needed for SQLite (not used for Postgres/MySQL)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a DB session and always closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
