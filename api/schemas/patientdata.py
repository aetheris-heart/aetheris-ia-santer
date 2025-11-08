from pydantic import BaseModel
from typing import Optional


class PatientDataBase(BaseModel):
    nom: str
    prenom: str
    sexe: str
    age: int

    tension_arterielle: Optional[str] = None
    frequence_cardiaque: Optional[int] = None
    température: Optional[float] = None
    poids: Optional[float] = None
    taille: Optional[float] = None
    glycemie: Optional[float] = None
    creatinine: Optional[float] = None
    spo2: Optional[int] = None
    respiration: Optional[int] = None


class PatientDataCreate(PatientDataBase):
    pass


class PatientData(PatientDataBase):
    id: int

    class Config:
        from_attributes = True
