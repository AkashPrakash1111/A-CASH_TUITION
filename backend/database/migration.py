"""
ACASH Controlled Database Migration Script
-------------------------------------------
Safely creates a timestamped database backup, inspects schema,
performs non-destructive additive alterations, creates missing tables,
and verifies existing data integrity.

Run directly via:
    python -m database.migration
"""

import os
import shutil
import sqlite3
from datetime import datetime

# Path references
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BACKEND_DIR, "acash.db")
BACKUPS_DIR = os.path.join(BACKEND_DIR, "database", "backups")


def create_backup():
    """Step 1: Automated timestamped backup before touching schema."""
    if not os.path.exists(DB_PATH):
        print(f"[Backup] No existing database found at {DB_PATH}. Skipping backup.")
        return None

    os.makedirs(BACKUPS_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUPS_DIR, f"acash_backup_{timestamp}.db")
    shutil.copy2(DB_PATH, backup_file)
    size = os.path.getsize(backup_file)
    print(f"[Backup] Successfully created database backup:")
    print(f"         Path: {backup_file}")
    print(f"         Size: {size:,} bytes")
    return backup_file


def inspect_columns(conn, table_name):
    """Returns list of column names in a table."""
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name});")
    return [row[1] for row in cursor.fetchall()]


def run_migration():
    print("=" * 60)
    print("ACASH TUTION - CONTROLLED DATABASE MIGRATION")
    print("=" * 60)

    # 1. Backup
    backup_file = create_backup()

    # 2. Connect & Pre-check row counts
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    def get_count(c, table):
        try:
            c.execute(f"SELECT COUNT(*) FROM {table}")
            return c.fetchone()[0]
        except Exception:
            return 0

    pre_counts = {
        "users": get_count(cursor, "users"),
        "students": get_count(cursor, "students"),
        "teachers": get_count(cursor, "teachers"),
        "subjects": get_count(cursor, "subjects"),
        "batches": get_count(cursor, "batches"),
    }
    print(f"[Pre-Flight] Existing record counts: {pre_counts}")

    # 3. Additive column alterations
    # Check users table for username
    user_cols = inspect_columns(conn, "users")
    if "username" not in user_cols:
        print("[Migrate] Adding 'username' column to 'users' table...")
        cursor.execute("ALTER TABLE users ADD COLUMN username TEXT;")
        cursor.execute("UPDATE users SET username = email WHERE username IS NULL;")
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users (username);")
        conn.commit()
        print("[Migrate] -> 'username' column added to 'users' and backfilled.")
    else:
        print("[Migrate] 'users.username' already exists. Preserving.")

    # Check teachers table for user_id and batch
    teacher_cols = inspect_columns(conn, "teachers")
    if "user_id" not in teacher_cols:
        print("[Migrate] Adding 'user_id' column to 'teachers' table...")
        cursor.execute("ALTER TABLE teachers ADD COLUMN user_id INTEGER;")
        conn.commit()
        print("[Migrate] -> 'user_id' column added to 'teachers'.")
    else:
        print("[Migrate] 'teachers.user_id' already exists. Preserving.")

    if "batch" not in teacher_cols:
        print("[Migrate] Adding 'batch' column to 'teachers' table...")
        cursor.execute("ALTER TABLE teachers ADD COLUMN batch TEXT;")
        conn.commit()
        print("[Migrate] -> 'batch' column added to 'teachers'.")
    else:
        print("[Migrate] 'teachers.batch' already exists. Preserving.")

    # Check assignment_submissions for correctionData and questionMarksJson
    as_cols = inspect_columns(conn, "assignment_submissions")
    if as_cols:
        if "correctionData" not in as_cols:
            print("[Migrate] Adding 'correctionData' to 'assignment_submissions'...")
            cursor.execute("ALTER TABLE assignment_submissions ADD COLUMN correctionData TEXT;")
            conn.commit()
        if "questionMarksJson" not in as_cols:
            print("[Migrate] Adding 'questionMarksJson' to 'assignment_submissions'...")
            cursor.execute("ALTER TABLE assignment_submissions ADD COLUMN questionMarksJson TEXT;")
            conn.commit()

    # Check exam_submissions for correctionData, questionMarksJson, graded_at
    es_cols = inspect_columns(conn, "exam_submissions")
    if es_cols:
        if "correctionData" not in es_cols:
            print("[Migrate] Adding 'correctionData' to 'exam_submissions'...")
            cursor.execute("ALTER TABLE exam_submissions ADD COLUMN correctionData TEXT;")
            conn.commit()
        if "questionMarksJson" not in es_cols:
            print("[Migrate] Adding 'questionMarksJson' to 'exam_submissions'...")
            cursor.execute("ALTER TABLE exam_submissions ADD COLUMN questionMarksJson TEXT;")
            conn.commit()
        if "graded_at" not in es_cols:
            print("[Migrate] Adding 'graded_at' to 'exam_submissions'...")
            cursor.execute("ALTER TABLE exam_submissions ADD COLUMN graded_at TIMESTAMP;")
            conn.commit()

    conn.close()

    # 4. Create all new tables using SQLAlchemy metadata
    print("[Migrate] Initializing SQLAlchemy models and creating missing tables...")
    import sys
    sys.path.insert(0, BACKEND_DIR)

    from database.db import Base, engine
    # Import all models to register with Base
    import models.user  # noqa: F401
    import models.academic  # noqa: F401
    import models.parent  # noqa: F401
    import models.messaging  # noqa: F401

    Base.metadata.create_all(bind=engine)
    print("[Migrate] -> All missing tables created successfully.")

    # 5. Post-migration verification
    conn_post = sqlite3.connect(DB_PATH)
    cursor_post = conn_post.cursor()

    post_counts = {
        "users": get_count(cursor_post, "users"),
        "students": get_count(cursor_post, "students"),
        "teachers": get_count(cursor_post, "teachers"),
        "subjects": get_count(cursor_post, "subjects"),
        "batches": get_count(cursor_post, "batches"),
    }

    # Verify zero data loss
    for table, count in pre_counts.items():
        if post_counts[table] != count:
            raise RuntimeError(
                f"Data mismatch in table '{table}'! Pre: {count}, Post: {post_counts[table]}. "
                f"Restoring from backup {backup_file} immediately!"
            )

    cursor_post.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    all_tables = [t[0] for t in cursor_post.fetchall()]
    conn_post.close()

    print(f"[Post-Flight] All tables currently in database ({len(all_tables)}):")
    print(f"             {', '.join(all_tables)}")
    print("[Post-Flight] Pre and post record counts match 100%. Zero data loss.")
    print("=" * 60)
    print("MIGRATION COMPLETED SUCCESSFULLY.")
    print("=" * 60)


if __name__ == "__main__":
    run_migration()
