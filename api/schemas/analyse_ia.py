from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AnalyseIABase(BaseModel):
    diagnostic: str
    prediction: Optional[str] = None
    plan: Optional[str] = None
    recommendation: Optional[str] = None
    disclaimer: Optional[str] = "⚠️ Analyse générée par Aetheris IA — nécessite validation médicale."


class AnalyseIACreate(AnalyseIABase):
    pass


class AnalyseIAUpdate(BaseModel):
    diagnostic: Optional[str] = None
    prediction: Optional[str] = None
    plan: Optional[str] = None
    recommendation: Optional[str] = None
    disclaimer: Optional[str] = None


class AnalyseIARead(AnalyseIABase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        orm_mode = True
