from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SpecialiteBase(BaseModel):
    nom: str
    description: Optional[str] = None
    icone: Optional[str] = None
    couleur: Optional[str] = None

class SpecialiteCreate(SpecialiteBase):
    pass

class SpecialiteUpdate(BaseModel):
    nom: Optional[str]
    description: Optional[str]
    icone: Optional[str]
    couleur: Optional[str]

class SpecialiteOut(SpecialiteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True
