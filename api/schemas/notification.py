from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# =============================
# 🧩 Base commune
# =============================
class NotificationBase(BaseModel):
    titre: str
    message: str
    type: Optional[str] = "info"               # info, alerte, critique, systeme
    niveau: Optional[str] = "Normal"           # Bas, Modéré, Élevé, Critique
    origine: Optional[str] = "Aetheris IA"     # Source : IA, médecin, système


# =============================
# ✳️ Création
# =============================
class NotificationCreate(NotificationBase):
    user_id: Optional[int] = None
    patient_id: Optional[int] = None
    consultation_id: Optional[int] = None


# =============================
# ✏️ Mise à jour
# =============================
class NotificationUpdate(BaseModel):
    lu: Optional[bool] = None
    niveau: Optional[str] = None
    message: Optional[str] = None


# =============================
# 📤 Lecture / Réponse API
# =============================
class NotificationRead(NotificationBase):
    id: int
    user_id: Optional[int] = None
    patient_id: Optional[int] = None
    consultation_id: Optional[int] = None
    lu: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
