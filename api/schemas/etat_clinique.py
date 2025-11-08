from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EtatCliniqueBase(BaseModel):
    spo2: Optional[float] = None
    temperature: Optional[float] = None
    rythme_cardiaque: Optional[int] = None


class EtatCliniqueCreate(EtatCliniqueBase):
    pass


class EtatCliniqueUpdate(EtatCliniqueBase):
    pass


class EtatCliniqueRead(EtatCliniqueBase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class EtatCliniqueRead(BaseModel):
    spo2: float
    rythme_cardiaque: int
    temperature: float
    created_at: datetime

    class Config:
        orm_mode = True