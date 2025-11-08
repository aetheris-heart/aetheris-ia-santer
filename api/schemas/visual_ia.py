from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class VisualIABase(BaseModel):
    patient_id: int
    diagnostic: str
    domaine: Optional[str] = None
    file_path: Optional[str] = None

class VisualIACreate(VisualIABase):
    pass

class VisualIAUpdate(BaseModel):
    diagnostic: Optional[str] = None
    domaine: Optional[str] = None
    file_path: Optional[str] = None

class VisualIAOut(VisualIABase):
    id: int
    date: datetime

    class Config:
        orm_mode = True
