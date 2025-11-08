from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# =============================
# 🧩 Base commune
# =============================
class RendezVousBase(BaseModel):
    motif: str = Field(..., example="Consultation de suivi post-opératoire")
    statut: Optional[str] = Field("planifié", example="planifié")
    date_rdv: datetime = Field(..., example="2025-10-15T10:30:00")
    lieu: Optional[str] = Field(None, example="Salle 3 - Bloc B")
    notes: Optional[str] = Field(None, example="Préparer les résultats d'analyse sanguine")

    class Config:
        from_attributes = True  # Pydantic v2 compatible
        json_schema_extra = {
            "example": {
                "motif": "Consultation annuelle",
                "statut": "planifié",
                "date_rdv": "2025-10-15T14:00:00",
                "lieu": "Cabinet 2",
                "notes": "Apporter dossier médical complet"
            }
        }


# =============================
# 🩺 Création & Mise à jour
# =============================
class RendezVousCreate(RendezVousBase):
    patient_id: int = Field(..., example=1)
    medecin_id: Optional[int] = Field(None, example=2)


class RendezVousUpdate(BaseModel):
    motif: Optional[str] = Field(None, example="Contrôle de tension artérielle")
    statut: Optional[str] = Field(None, example="confirmé")
    date_rdv: Optional[datetime] = Field(None, example="2025-10-20T09:00:00")
    lieu: Optional[str] = Field(None, example="Salle 5 - Bloc A")
    notes: Optional[str] = Field(None, example="Patient à jeun pour prise de sang")


# =============================
# 📤 Lecture (sortie API)
# =============================
class RendezVousRead(RendezVousBase):
    id: int
    patient_id: int
    medecin_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
