"""
One-time migration: adds the `visibility` column to the existing notes table
(needed for students' private uploads), keeping every existing note.
All existing notes become visibility = 'class', which is what they already were.

Run this once, from the backend folder, with the backend stopped:

    python migrate_add_note_visibility.py

Safe to run more than once.
"""

from sqlalchemy import text
from database.db import engine


def main():
    with engine.connect() as conn:
        columns = [row[1] for row in conn.execute(text("PRAGMA table_info(notes)"))]

        if not columns:
            print("No notes table yet - nothing to do. Start the backend once and it will be created with the column.")
            return

        if "visibility" in columns:
            print("visibility column already exists - nothing to do.")
            return

        conn.execute(text("ALTER TABLE notes ADD COLUMN visibility VARCHAR DEFAULT 'class'"))
        conn.execute(text("UPDATE notes SET visibility = 'class' WHERE visibility IS NULL"))
        conn.commit()
        print("Added visibility column to notes table. Existing notes kept as 'class'.")


if __name__ == "__main__":
    main()
