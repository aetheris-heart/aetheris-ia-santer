from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# =============================
# Base
# =============================
class HospitalisationBase(BaseModel):
    service: str
    chambre: Optional[str] = None
    lit: Optional[str] = None
    motif: Optional[str] = None
    observations: Optional[str] = None
    statut: Optional[str] = "en cours"


# =============================
# Création & Mise à jour
# =============================
class HospitalisationCreate(HospitalisationBase):
    patient_id: int  # ✅ on précise à quel patient l’hospitalisation est liée


class HospitalisationUpdate(BaseModel):
    service: Optional[str] = None
    chambre: Optional[str] = None
    lit: Optional[str] = None
    motif: Optional[str] = None
    observations: Optional[str] = None
    statut: Optional[str] = None
    date_sortie: Optional[datetime] = None


# =============================
# Sortie enrichie
# =============================
class HospitalisationRead(HospitalisationBase):
    id: int
    patient_id: int
    medecin_id: int
    date_entree: datetime
    date_sortie: Optional[datetime]

    # Champs enrichis pour le frontend
    patient_nom: Optional[str] = None
    patient_prenom: Optional[str] = None
    medecin_nom: Optional[str] = None

    class Config:
        orm_mode = True
