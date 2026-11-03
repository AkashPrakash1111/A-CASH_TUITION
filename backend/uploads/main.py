from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text
import os
from dotenv import load_dotenv

from database.db import Base, engine
from routers import auth as auth_router
from routers import students as students_router
from routers import teachers as teachers_router
from routers import subjects as subjects_router
from routers import batches as batches_router
from routers import notes as notes_router
from routers import assignments as assignments_router
from routers import exams as exams_router
from routers import live_classes as live_classes_router
from routers import messages as messages_router
from routers import ai as ai_router
from routers import files as files_router
from routers import rewards as rewards_router
from routers import parents as parents_router
from routers import progress as progress_router

# Import all models here so Base.metadata knows about them before create_all runs.
from models import user  # noqa: F401
from models import academic  # noqa: F401
from models import parent  # noqa: F401
from models import messaging  # noqa: F401
from models import rewards  # noqa: F401
from models import storage  # noqa: F401

load_dotenv()

Base.metadata.create_all(bind=engine)


def apply_schema_upgrades():
    """
    create_all() only creates MISSING TABLES; it never adds a column to a table
    that already exists. When a model gains a column, an older acash.db would
    fail on every query touching that table. This adds such columns on startup,
    keeping all existing rows. Safe to run on every start.
    """
    with engine.begin() as conn:
        tables = inspect(conn).get_table_names()

        if "notes" in tables:
            note_columns = {c["name"] for c in inspect(conn).get_columns("notes")}
            if "visibility" not in note_columns:
                conn.execute(text("ALTER TABLE notes ADD COLUMN visibility VARCHAR DEFAULT 'class'"))
                conn.execute(text("UPDATE notes SET visibility = 'class' WHERE visibility IS NULL"))

        if "assignments" in tables:
            cols = {c["name"] for c in inspect(conn).get_columns("assignments")}
            if "attachmentsJson" not in cols:
                conn.execute(text("ALTER TABLE assignments ADD COLUMN attachmentsJson TEXT"))
                # Older assignments were saved with batch = class name (e.g. batch "10"
                # for class "10") because the form had no batch picker. Treat those as
                # "every batch in the class", or students in a real batch would never
                # see them. Runs once, together with the column.
                conn.execute(text(
                    "UPDATE assignments SET batch = NULL "
                    "WHERE batch IS NOT NULL AND lower(trim(batch)) = lower(trim(COALESCE(className, '')))"
                ))

        if "assignment_submissions" in tables:
            cols = {c["name"] for c in inspect(conn).get_columns("assignment_submissions")}
            if "attachmentsJson" not in cols:
                conn.execute(text("ALTER TABLE assignment_submissions ADD COLUMN attachmentsJson TEXT"))

        if "students" in tables:
            cols = {c["name"] for c in inspect(conn).get_columns("students")}
            if "cash_balance" not in cols:
                conn.execute(text("ALTER TABLE students ADD COLUMN cash_balance INTEGER DEFAULT 100"))
                conn.execute(text("UPDATE students SET cash_balance = 100 WHERE cash_balance IS NULL"))

        if "exam_submissions" in tables:
            cols = {c["name"] for c in inspect(conn).get_columns("exam_submissions")}
            if "audioUrl" not in cols:
                conn.execute(text("ALTER TABLE exam_submissions ADD COLUMN audioUrl TEXT"))
            if "textContent" not in cols:
                conn.execute(text("ALTER TABLE exam_submissions ADD COLUMN textContent TEXT"))
            if "attachmentsJson" not in cols:
                conn.execute(text("ALTER TABLE exam_submissions ADD COLUMN attachmentsJson TEXT"))

        if "exams" in tables:
            cols = {c["name"] for c in inspect(conn).get_columns("exams")}
            if "questionPaperUrl" not in cols:
                conn.execute(text("ALTER TABLE exams ADD COLUMN questionPaperUrl TEXT"))


apply_schema_upgrades()

app = FastAPI(title="ACASH Digital Campus API", version="0.2.0")

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def unhandled_error(request: Request, exc: Exception):
    """
    An unhandled error normally produces a bare 500 with NO CORS headers, which
    the browser hides behind the unhelpful message "Failed to fetch". Answer
    with JSON plus CORS headers so the real problem shows up in the app.
    (The full traceback is still printed in the backend terminal.)
    """
    headers = {}
    origin = request.headers.get("origin")
    if origin and origin in origins:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": f"Server error: {type(exc).__name__}: {exc}"},
        headers=headers,
    )


app.include_router(auth_router.router)
app.include_router(students_router.router)
app.include_router(teachers_router.router)
app.include_router(subjects_router.router)
app.include_router(batches_router.router)
app.include_router(notes_router.router)
app.include_router(assignments_router.router)
app.include_router(exams_router.router)
app.include_router(live_classes_router.router)
app.include_router(messages_router.router)
app.include_router(ai_router.router)
app.include_router(files_router.router)
app.include_router(rewards_router.router)
app.include_router(parents_router.router)
app.include_router(progress_router.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "ACASH Tuition Portal API"}


def bootstrap_admin():
    """On a brand-new deployment there is nobody to log in as. If ADMIN_EMAIL and
    ADMIN_PASSWORD are set and no admin exists yet, create one. Harmless otherwise."""
    email = (os.getenv("ADMIN_EMAIL") or "").strip().lower()
    password = os.getenv("ADMIN_PASSWORD") or ""
    if not email or not password:
        return
    from database.db import SessionLocal
    from models.user import User, UserRole
    from utils.security import hash_password

    db = SessionLocal()
    try:
        if db.query(User).filter(User.role == UserRole.admin).first():
            return
        db.add(User(
            name=os.getenv("ADMIN_NAME", "Admin"),
            email=email,
            hashed_password=hash_password(password),
            role=UserRole.admin,
        ))
        db.commit()
        print(f"Created first admin account: {email}")
    finally:
        db.close()


bootstrap_admin()


# ---- Website -----------------------------------------------------------------
# In production the built React app (frontend/dist) is copied to ./static and
# served from here, so the site and the API share one address. Routes above
# win; anything else is the single-page app (so refreshing /student/progress
# works). Locally, with no ./static folder, this does nothing.
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")

if os.path.isdir(STATIC_DIR):
    from fastapi import HTTPException
    from fastapi.responses import FileResponse

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa(full_path: str):
        candidate = os.path.realpath(os.path.join(STATIC_DIR, full_path))
        if full_path and candidate.startswith(os.path.realpath(STATIC_DIR) + os.sep) and os.path.isfile(candidate):
            headers = {"Cache-Control": "public, max-age=31536000, immutable"} if full_path.startswith("assets/") else {}
            return FileResponse(candidate, headers=headers)
        # Unknown file-looking paths are real 404s, not the app shell
        if "." in os.path.basename(full_path):
            raise HTTPException(status_code=404)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"), headers={"Cache-Control": "no-cache"})
else:
    @app.get("/")
    def root():
        return {"status": "ok", "service": "ACASH Tuition Portal API"}
