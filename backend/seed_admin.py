"""
Run this once to create your own admin account:

    python seed_admin.py

You will be prompted for name, email, and password.
"""

import getpass

from database.db import SessionLocal, Base, engine
from models.user import User, UserRole
from utils.security import hash_password

Base.metadata.create_all(bind=engine)


def main():
    db = SessionLocal()
    try:
        name = input("Admin name: ").strip()
        email = input("Admin email: ").strip().lower()
        password = getpass.getpass("Admin password: ")

        if db.query(User).filter(User.email == email).first():
            print(f"A user with email {email} already exists. Aborting.")
            return

        admin = User(
            name=name,
            email=email,
            hashed_password=hash_password(password),
            role=UserRole.admin,
        )
        db.add(admin)
        db.commit()
        print(f"Admin account created: {email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
