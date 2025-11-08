from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RenalBase(BaseModel):
    creatinine: Optional[float] = None
    dfg: Optional[float] = None
    uree: Optional[float] = None
    anomalies_detectees: Optional[str] = None
    alerte: Optional[str] = None


class RenalCreate(RenalBase):
    pass


class RenalUpdate(RenalBase):
    pass


class RenalRead(RenalBase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        orm_mode = True
