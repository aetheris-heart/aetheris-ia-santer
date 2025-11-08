from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PulmonaryBase(BaseModel):
    spo2: Optional[float] = None
    frequence_respiratoire: Optional[float] = None  # ✅ Était int → devient float
    volume_expiratoire: Optional[float] = None
    anomalies_detectees: Optional[str] = None
    alerte: Optional[str] = None

class PulmonaryCreate(PulmonaryBase):
    pass

class PulmonaryUpdate(PulmonaryBase):
    pass

class PulmonaryRead(PulmonaryBase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        orm_mode = True
