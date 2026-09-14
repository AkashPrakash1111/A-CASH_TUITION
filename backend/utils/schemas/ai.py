from typing import Any
from pydantic import BaseModel


class AIGenerateRequest(BaseModel):
    tool: str
    inputs: dict[str, Any]


class AIGenerateResponse(BaseModel):
    content: str
