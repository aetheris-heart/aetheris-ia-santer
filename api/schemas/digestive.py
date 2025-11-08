from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DigestiveBase(BaseModel):
    acidite: Optional[float] = None
    motricite: Optional[float] = None
    inflammation: Optional[str] = None
    anomalies_detectees: Optional[str] = None
    alerte: Optional[str] = None


class DigestiveCreate(DigestiveBase):
    pass


class DigestiveUpdate(DigestiveBase):
    pass


class DigestiveRead(DigestiveBase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        orm_mode = True

