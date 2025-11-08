from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DocumentBase(BaseModel):
    titre: str
    description: Optional[str] = None
    fichier_url: Optional[str] = None
    type_document: Optional[str] = None


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    fichier_url: Optional[str] = None
    type_document: Optional[str] = None


class DocumentRead(DocumentBase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        orm_mode = True
