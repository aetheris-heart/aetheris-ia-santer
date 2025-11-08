from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CardiaqueBase(BaseModel):
    frequence_cardiaque: Optional[float] = None   # ✅ Était int → devient float
    rythme: Optional[str] = None
    tension_systolique: Optional[float] = None
    tension_diastolique: Optional[float] = None
    anomalies_detectees: Optional[str] = None
    alerte: Optional[str] = None

class CardiaqueCreate(CardiaqueBase):
    pass

class CardiaqueUpdate(CardiaqueBase):
    pass

class CardiaqueRead(CardiaqueBase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        orm_mode = True
