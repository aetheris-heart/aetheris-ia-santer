from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# ============================================================
# 🧱 Base commune (héritée par Create, Update, Out)
# ============================================================
class AmbulanceBase(BaseModel):
    immatriculation: str = Field(..., example="AB-101-CD")
    etat: Optional[str] = Field("Disponible", example="Disponible")
    chauffeur: Optional[str] = Field(None, example="Robert Leach")
    equipe: Optional[str] = Field(None, example="Équipe A")
    latitude: Optional[float] = Field(None, example=3.8759)
    longitude: Optional[float] = Field(None, example=11.5201)
    vitesse: Optional[float] = Field(None, example=65.4, description="Vitesse actuelle (km/h)")
    carburant: Optional[str] = Field(None, example="75%", description="Niveau de carburant ou type")
    mission_actuelle: Optional[str] = Field(None, example="Transport patient critique")
    niveau_priorite: Optional[str] = Field("Normale", example="Urgente")
    destination: Optional[str] = Field(None, example="Hôpital Central de Yaoundé")


# ============================================================
# ➕ Création d’une ambulance
# ============================================================
class AmbulanceCreate(AmbulanceBase):
    urgence_id: Optional[int] = Field(None, description="ID de l’urgence liée")
    date_mise_service: Optional[datetime] = Field(None, example="2025-11-03T08:00:00Z")


# ============================================================
# ✏️ Mise à jour d’une ambulance
# ============================================================
class AmbulanceUpdate(BaseModel):
    etat: Optional[str] = None
    chauffeur: Optional[str] = None
    equipe: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    vitesse: Optional[float] = None
    carburant: Optional[str] = None
    mission_actuelle: Optional[str] = None
    niveau_priorite: Optional[str] = None
    destination: Optional[str] = None
    urgence_id: Optional[int] = None


# ============================================================
# 🔍 Lecture / Affichage d’une ambulance
# ============================================================
class AmbulanceOut(AmbulanceBase):
    id: int
    urgence_id: Optional[int]
    date_mise_service: Optional[datetime]
    derniere_mission: Optional[datetime]
    last_update: Optional[datetime]
    date_creation: Optional[datetime]

    class Config:
        orm_mode = True
