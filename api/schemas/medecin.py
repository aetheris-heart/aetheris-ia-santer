from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


# ================================
# ⚙️  Base commune
# ================================
class MedecinBase(BaseModel):
    nom: str = Field(..., example="Ateba")
    prenom: str = Field(..., example="Ramsès")
    email: EmailStr = Field(..., example="ramses.ateba@aetheris.com")
    telephone: Optional[str] = Field(None, example="+32 472 123 456")
    specialite: Optional[str] = Field(None, example="Cardiologie")
    diplome: Optional[str] = Field(None, example="Doctorat en Médecine - ULiège")
    experience: Optional[str] = Field(None, example="8 ans d’expérience en soins intensifs")
    hopital: Optional[str] = Field(None, example="CHU Liège")
    role: Optional[str] = Field(default="Médecin")
    statut: Optional[str] = Field(default="Actif")
    photo_url: Optional[str] = Field(None, example="/assets/doctors/dr_ateba.png")
    bio: Optional[str] = Field(None, example="Spécialiste des troubles cardiaques complexes.")
    patients_suivis: Optional[int] = Field(default=0, example=42)


# ================================
# ➕ Création
# ================================
class MedecinCreate(MedecinBase):
    pass


# ================================
# ✏️ Mise à jour
# ================================
class MedecinUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    specialite: Optional[str] = None
    diplome: Optional[str] = None
    experience: Optional[str] = None
    hopital: Optional[str] = None
    role: Optional[str] = None
    statut: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    patients_suivis: Optional[int] = None


# ================================
# 📄 Lecture / Sortie
# ================================
class MedecinRead(MedecinBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "nom": "Ateba",
                "prenom": "Ramsès",
                "email": "ramses.ateba@aetheris.com",
                "specialite": "Cardiologie",
                "hopital": "CHU Liège",
                "role": "Médecin",
                "statut": "Actif",
                "created_at": "2025-10-05T10:30:00Z",
                "updated_at": "2025-10-05T10:35:00Z",
            }
        }
