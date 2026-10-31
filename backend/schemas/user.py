from datetime import datetime
from pydantic import BaseModel

from models.user import UserRole


class UserCreate(BaseModel):
    name: str
    email: str
    username: str | None = None
    password: str


class AdminCreateUser(BaseModel):
    name: str
    email: str
    username: str | None = None
    password: str
    role: UserRole = UserRole.student


class UserLogin(BaseModel):
    # Accepts email address OR alphanumeric Login ID (e.g. student_akash, teacher_physics)
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    username: str | None = None
    role: UserRole
    is_active: bool
    created_at: datetime
    avatar_config: str | None = None

    class Config:
        from_attributes = True  # allows returning a SQLAlchemy model directly


class AvatarUpdate(BaseModel):
    """
    Payload for PUT /auth/me/avatar. `config` holds whatever DiceBear
    options the character builder produced (style, seed, hair, colors,
    etc.) — stored as-is (serialized to JSON) rather than validated field
    by field, since the set of valid options differs per DiceBear style.
    """
    config: dict


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
