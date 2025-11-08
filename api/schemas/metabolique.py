from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MetaboliqueBase(BaseModel):
    glucose: Optional[float] = None
    insuline: Optional[float] = None
    cholesterol: Optional[float] = None
    anomalies_detectees: Optional[str] = None
    alerte: Optional[str] = None


class MetaboliqueCreate(MetaboliqueBase):
    pass


class MetaboliqueUpdate(MetaboliqueBase):
    pass


class MetaboliqueRead(MetaboliqueBase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        orm_mode = True
