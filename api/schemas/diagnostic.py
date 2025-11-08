from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# =============================
# Base
# =============================
class DiagnosticBase(BaseModel):
    type: str
    resultat: Optional[str] = None                 # 🧠 Résumé principal IA
    details: Optional[str] = None                  # 🧩 Détails techniques / analyse
    conclusion: Optional[str] = None               # ✅ Conclusion clinique
    score_confiance: Optional[float] = None        # 📊 Score IA (0–100)
    priorite: Optional[str] = "Normale"            # 🔴 Urgent / ⚠️ Élevée / 🟢 Normale
    niveau_risque: Optional[str] = "Bas"           # 🔥 Bas / Modéré / Critique
    signature_ia: Optional[str] = "Aetheris IA"    # ✍️ Marque IA
    commentaire_medecin: Optional[str] = None      # 💬 Commentaire du médecin


# =============================
# Création & Mise à jour
# =============================
class DiagnosticCreate(DiagnosticBase):
    patient_id: int
    medecin_id: int
    consultation_id: Optional[int] = None


class DiagnosticUpdate(BaseModel):
    type: Optional[str] = None
    resultat: Optional[str] = None
    details: Optional[str] = None
    conclusion: Optional[str] = None
    score_confiance: Optional[float] = None
    priorite: Optional[str] = None
    niveau_risque: Optional[str] = None
    signature_ia: Optional[str] = None
    commentaire_medecin: Optional[str] = None


# =============================
# Sortie
# =============================
class DiagnosticRead(DiagnosticBase):
    id: int
    patient_id: int
    medecin_id: int
    consultation_id: Optional[int] = None
    date_diagnostic: datetime
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
