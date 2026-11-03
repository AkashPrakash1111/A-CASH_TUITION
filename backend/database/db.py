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

# DATA_DIR is where the SQLite file and uploads live. Locally it is the backend
# folder; in production point it at a persistent disk so data survives restarts.
DATA_DIR = os.path.abspath(os.getenv("DATA_DIR") or os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.makedirs(DATA_DIR, exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL") or (
    "sqlite:///./acash.db" if not os.getenv("DATA_DIR") else f"sqlite:///{DATA_DIR}/acash.db"
)
# Some hosts hand out postgres:// URLs; SQLAlchemy wants postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# check_same_thread is only needed for SQLite (not used for Postgres/MySQL)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# Serverless Postgres (Neon, Supabase) closes idle connections. pre_ping checks a
# connection before using it and quietly replaces a dead one; recycle retires old ones.
pool_args = {} if DATABASE_URL.startswith("sqlite") else {"pool_pre_ping": True, "pool_recycle": 280, "pool_size": 5, "max_overflow": 5}

engine = create_engine(DATABASE_URL, connect_args=connect_args, **pool_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a DB session and always closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
