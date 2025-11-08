from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime


# =============================
# Base
# =============================
class PatientBase(BaseModel):
    nom: str
    prenom: Optional[str] = None
    date_naissance: Optional[date] = None
    sexe: Optional[str] = None
    age: Optional[int] = None
    traitement: Optional[str] = None
    email: Optional[EmailStr] = None
    adresse: Optional[str] = None
    telephone: Optional[str] = None
    groupe_sanguin: Optional[str] = None
    allergies: Optional[str] = None
    antecedents: Optional[str] = None
    spo2: Optional[int] = None
    temperature: Optional[float] = None
    rythme_cardiaque: Optional[int] = None


# =============================
# Création & Mise à jour
# =============================
class PatientCreate(PatientBase):
    pass


class PatientUpdate(PatientBase):
    pass


# =============================
# Sortie
# =============================
class PatientRead(PatientBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
