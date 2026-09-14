from datetime import datetime
from pydantic import BaseModel, EmailStr

from models.user import UserRole


class UserCreate(BaseModel):
    """
    Payload for public self-registration (POST /auth/register).

    Deliberately has NO `role` field. Earlier versions accepted a role from
    the request body, which meant anyone could register as role="admin" by
    hand-crafting the request. The /auth/register endpoint now always
    creates a `student` account, no matter what — role escalation is only
    possible through /auth/admin/create-user, which requires an existing
    admin's token.
    """
    name: str
    email: EmailStr
    password: str


class AdminCreateUser(BaseModel):
    """
    Payload for POST /auth/admin/create-user — only usable by someone
    already logged in as admin. Lets the admin explicitly choose the role,
    e.g. to create a student login (most common) or a second admin account.
    """
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.student


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
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
