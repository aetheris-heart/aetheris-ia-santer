from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AetherisIABase(BaseModel):
    diagnostic: Optional[str] = None
    prediction: Optional[str] = None
    recommandations: Optional[str] = None
    score_confiance: Optional[float] = None


class AetherisIACreate(AetherisIABase):
    pass


class AetherisIAUpdate(AetherisIABase):
    pass


class AetherisIARead(AetherisIABase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        orm_mode = True
