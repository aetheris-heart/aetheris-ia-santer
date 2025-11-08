from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# =============================
# Base
# =============================
class ConsultationBase(BaseModel):
    motif: str
    notes: Optional[str] = None
    diagnostic: Optional[str] = None
    traitement: Optional[str] = None


# =============================
# Création & Mise à jour
# =============================
class ConsultationCreate(ConsultationBase):
    patient_id: int  # obligatoire


class ConsultationUpdate(BaseModel):
    motif: Optional[str] = None
    notes: Optional[str] = None
    diagnostic: Optional[str] = None
    traitement: Optional[str] = None


# =============================
# Sortie enrichie
# =============================
class ConsultationRead(ConsultationBase):
    id: int
    patient_id: int                # ✅ ajouté pour coller à la réponse backend
    medecin_id: int
    date_consultation: datetime

    # Champs enrichis (issus des relations)
    patient_nom: Optional[str] = None
    patient_prenom: Optional[str] = None
    medecin_nom: Optional[str] = None

    class Config:
        orm_mode = True
