"""
One-time migration: adds the avatar_config column to the existing users
table, without touching any existing accounts or data.

Run this once:

    python migrate_add_avatar.py

Safe to run more than once — it checks whether the column already exists
before trying to add it.
"""

from sqlalchemy import text
from database.db import engine


def main():
    with engine.connect() as conn:
        existing_columns = [
            row[1] for row in conn.execute(text("PRAGMA table_info(users)"))
        ]

        if "avatar_config" in existing_columns:
            print("avatar_config column already exists — nothing to do.")
            return

        conn.execute(text("ALTER TABLE users ADD COLUMN avatar_config TEXT"))
        conn.commit()
        print("Added avatar_config column to users table.")


if __name__ == "__main__":
    main()
