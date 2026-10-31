from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
import json

from database.db import get_db
from models.user import User, UserRole
from schemas.user import UserCreate, AdminCreateUser, UserLogin, UserOut, AvatarUpdate, Token
from utils.security import hash_password, verify_password, create_access_token
from utils.deps import get_current_user, require_role

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    clean_identifier = (payload.username or payload.email).strip()
    clean_email = payload.email.strip() if "@" in payload.email else f"{clean_identifier.lower()}@acash.local"

    existing = db.query(User).filter(
        or_(
            func.lower(User.email) == clean_email.lower(),
            func.lower(User.username) == clean_identifier.lower(),
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email or username already exists")

    user = User(
        name=payload.name.strip(),
        username=clean_identifier,
        email=clean_email,
        hashed_password=hash_password(payload.password),
        role=UserRole.student,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/admin/create-user", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def admin_create_user(
    payload: AdminCreateUser,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.admin)),
):
    clean_identifier = (payload.username or payload.email).strip()
    clean_email = payload.email.strip() if "@" in payload.email else f"{clean_identifier.lower()}@acash.local"

    existing = db.query(User).filter(
        or_(
            func.lower(User.email) == clean_email.lower(),
            func.lower(User.username) == clean_identifier.lower(),
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email or username already exists")

    user = User(
        name=payload.name.strip(),
        username=clean_identifier,
        email=clean_email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    clean_id = payload.email.strip()
    user = db.query(User).filter(
        or_(
            func.lower(User.email) == clean_id.lower(),
            func.lower(User.username) == clean_id.lower(),
        )
    ).first()

    # Same error for "no such user" and "wrong password" on purpose —
    # this avoids leaking which accounts are registered.
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid login ID or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been disabled")

    token_sub = user.username or user.email
    token = create_access_token(data={"sub": token_sub, "role": user.role.value})

    return Token(access_token=token, user=user)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Lets the frontend verify a stored token is still valid and re-fetch user info on page reload."""
    return current_user


@router.put("/me/avatar", response_model=UserOut)
def update_my_avatar(payload: AvatarUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Any logged-in user (student or admin) can update their OWN avatar —
    there's no admin-only restriction here, since this is self-customization,
    not account management. A student can never edit anyone else's avatar
    because current_user always comes from their own token, not from a
    student ID passed in the request.
    """
    current_user.avatar_config = json.dumps(payload.config)
    db.commit()
    db.refresh(current_user)
    return current_user
