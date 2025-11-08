from pydantic import BaseModel
from typing import Optional,List
from datetime import datetime


class PatientCritiqueBase(BaseModel):
    raison: str
    niveau_risque: Optional[float] = None
    statut: Optional[str] = "actif"


class PatientCritiqueCreate(PatientCritiqueBase):
    pass


class PatientCritiqueUpdate(BaseModel):
    raison: Optional[str] = None
    niveau_risque: Optional[float] = None
    statut: Optional[str] = None


class PatientCritiqueRead(PatientCritiqueBase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class DossierCritiqueRead(BaseModel):
    id: int
    nom: str
    prenom: str
    age: int
    email: Optional[str]
    telephone: Optional[str]
    adresse: Optional[str]
    pathologies: Optional[str]
    traitements: Optional[str]
    observations: Optional[str]
    alertes: List[str]
    date_creation: datetime
    analyse_ia: Optional[str]

    class Config:
        orm_mode = True


class EtatCliniqueRead(BaseModel):
    spo2: float
    rythme_cardiaque: int
    temperature: float
    created_at: datetime

    class Config:
        orm_mode = True