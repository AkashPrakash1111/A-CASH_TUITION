from pydantic import BaseModel


class AIGenerateRequest(BaseModel):
    tool: str
    inputs: dict


class AIGenerateResponse(BaseModel):
    content: str
