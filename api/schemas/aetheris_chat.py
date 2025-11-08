from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ChatBase(BaseModel):
    patient_id: Optional[int] = None
    message: str


class ChatCreate(ChatBase):
    pass


class ChatRead(ChatBase):
    id: int
    user_id: int
    role: str
    created_at: datetime

    class Config:
        orm_mode = True
