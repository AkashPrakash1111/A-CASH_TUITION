from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from database.db import Base, engine
from routers import auth as auth_router
from routers import students as students_router
from routers import teachers as teachers_router
from routers import subjects as subjects_router
from routers import batches as batches_router
from routers import ai as ai_router

# Import all models here so Base.metadata knows about them before create_all runs.
from models import user  # noqa: F401
from models import academic  # noqa: F401

load_dotenv()

# Creates tables that don't exist yet. Safe to call every startup — it never
# drops or alters existing tables. Once you move to Postgres in production,
# switch to Alembic migrations instead of relying on this for schema changes.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ACASH Tuition Portal API", version="0.1.0")

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(students_router.router)
app.include_router(teachers_router.router)
app.include_router(subjects_router.router)
app.include_router(batches_router.router)
app.include_router(ai_router.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "ACASH Tuition Portal API"}
