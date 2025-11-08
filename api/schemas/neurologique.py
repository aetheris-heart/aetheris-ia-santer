from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NeurologiqueBase(BaseModel):
    eeg: Optional[float] = None
    stress_level: Optional[float] = None
    anomalies_detectees: Optional[str] = None
    alerte: Optional[str] = None


class NeurologiqueCreate(NeurologiqueBase):
    pass


class NeurologiqueUpdate(NeurologiqueBase):
    pass


class NeurologiqueRead(NeurologiqueBase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        orm_mode = True
