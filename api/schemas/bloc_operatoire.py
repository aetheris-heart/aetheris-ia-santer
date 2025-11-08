# api/schemas/bloc_operatoire.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BlocOperatoireBase(BaseModel):
    patient_id: int
    type_intervention: str
    chirurgien: str
    assistant1: Optional[str] = None
    assistant2: Optional[str] = None
    assistant3: Optional[str] = None
    assistant4: Optional[str] = None
    date_intervention: Optional[datetime] = None
    duree: Optional[str] = None
    compte_rendu: Optional[str] = None
    statut: Optional[str] = "programmé"

class BlocOperatoireCreate(BlocOperatoireBase):
    pass

class BlocOperatoireUpdate(BaseModel):
    type_intervention: Optional[str] = None
    chirurgien: Optional[str] = None
    assistant1: Optional[str] = None
    assistant2: Optional[str] = None
    assistant3: Optional[str] = None
    assistant4: Optional[str] = None
    date_intervention: Optional[datetime] = None
    duree: Optional[str] = None
    compte_rendu: Optional[str] = None
    statut: Optional[str] = None

class BlocOperatoireRead(BlocOperatoireBase):
    id: int
    class Config:
        orm_mode = True
