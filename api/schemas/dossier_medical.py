from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ✅ Base commune
class DossierMedicalBase(BaseModel):
    resume: Optional[str] = None
    antecedents: Optional[str] = None
    traitements: Optional[str] = None
    allergies: Optional[str] = None
    notes: Optional[str] = None

    pathologies: Optional[str] = None
    examens: Optional[str] = None
    imageries: Optional[str] = None
    chirurgies: Optional[str] = None
    vaccinations: Optional[str] = None
    habitudes_vie: Optional[str] = None

    statut: Optional[str] = "actif"     # actif | archivé | en cours
    est_critique: Optional[bool] = False


# ✅ Création d’un dossier
class DossierMedicalCreate(DossierMedicalBase):
    patient_id: int


# ✅ Mise à jour partielle
class DossierMedicalUpdate(DossierMedicalBase):
    pass


# ✅ Lecture / sortie
class DossierMedicalRead(DossierMedicalBase):
    id: int
    patient_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
