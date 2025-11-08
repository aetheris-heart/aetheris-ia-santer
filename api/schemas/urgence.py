from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ==============================
# 🔹 BASE SCHEMA
# ==============================
class UrgenceBase(BaseModel):
    nom_patient: str
    prenom_patient: Optional[str] = None
    type_urgence: str
    description: Optional[str] = None
    niveau_gravite: Optional[str] = "Modérée"
    statut: Optional[str] = "En attente"
    equipe: Optional[str] = None
    lieu: Optional[str] = None
    moyen_transport: Optional[str] = None


# ===================================
# 🔹 Lecture (read-only)
# ===================================
class UrgenceRead(UrgenceBase):
    id: int
    patient_id: Optional[int] = None
    medecin_id: Optional[int] = None
    date_signalement: Optional[datetime] = None
    date_prise_en_charge: Optional[datetime] = None
    date_arrivee: Optional[datetime] = None
    date_resolution: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # ✅ Ajout d’un champ d’affichage lisible (non obligatoire)
    risque_vital_affiche: Optional[str] = None

    class Config:
        orm_mode = True

# ==============================
# 🔹 CREATE SCHEMA
# ==============================
class UrgenceCreate(UrgenceBase):
    patient_id: Optional[int] = None
    medecin_id: Optional[int] = None
    risque_vital: Optional[str] = None
    ambulance_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    analyse_ia: Optional[str] = None
    niveau_risque_ia: Optional[str] = None
    recommandation_ia: Optional[str] = None


# ==============================
# 🔹 UPDATE SCHEMA
# ==============================
class UrgenceUpdate(BaseModel):
    type_urgence: Optional[str] = None
    description: Optional[str] = None
    niveau_gravite: Optional[str] = None
    statut: Optional[str] = None
    equipe: Optional[str] = None
    lieu: Optional[str] = None
    moyen_transport: Optional[str] = None
    risque_vital: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    analyse_ia: Optional[str] = None
    niveau_risque_ia: Optional[str] = None
    recommandation_ia: Optional[str] = None


# ==============================
# 🔹 OUTPUT SCHEMA (manquant)
# ==============================
class UrgenceOut(UrgenceBase):
    id: int
    patient_id: Optional[int]
    medecin_id: Optional[int]
    risque_vital: Optional[str] = None
    ambulance_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    analyse_ia: Optional[str] = None
    niveau_risque_ia: Optional[str] = None
    recommandation_ia: Optional[str] = None
    date_signalement: Optional[datetime] = None
    date_prise_en_charge: Optional[datetime] = None
    date_resolution: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
