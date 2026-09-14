from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json

from database.db import get_db
from models.user import User, UserRole
from schemas.user import UserCreate, AdminCreateUser, UserLogin, UserOut, AvatarUpdate, Token
from utils.security import hash_password, verify_password, create_access_token
from utils.deps import get_current_user, require_role

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """Public self-registration. Always creates a student account — there is
    no way to become admin through this endpoint, by design."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = User(
        name=payload.name,
        email=payload.email,
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
    """
    Lets an already-logged-in admin create a new account — most commonly a
    student login, e.g. from the Students page. Requires a valid admin JWT
    (checked by require_role above) — a student token, or no token, is
    rejected before this function body even runs.
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    # Same error for "no such user" and "wrong password" on purpose —
    # this avoids leaking which emails are registered.
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been disabled")

    token = create_access_token(data={"sub": user.email, "role": user.role.value})

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
