from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ImagerieBase(BaseModel):
    patient_id: int
    type_examen: str
    autre_examen: Optional[str] = None
    fichier_url: Optional[str] = None
    description: Optional[str] = None
    effectue_par: Optional[str] = None


class ImagerieCreate(ImagerieBase):
    pass


class ImagerieUpdate(BaseModel):
    type_examen: Optional[str] = None
    autre_examen: Optional[str] = None
    fichier_url: Optional[str] = None
    description: Optional[str] = None
    effectue_par: Optional[str] = None


class ImagerieRead(ImagerieBase):
    id: int
    date_examen: datetime

    class Config:
        orm_mode = True
