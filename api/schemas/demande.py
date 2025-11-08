from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class DemandeCompteBase(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    specialite: Optional[str] = None
    role_demande: Optional[str] = "medecin"


class DemandeCompteCreate(DemandeCompteBase):
    """Schéma utilisé pour créer une nouvelle demande côté frontend."""
    pass


class DemandeCompteOut(BaseModel):
    id: int
    nom: str
    prenom: str
    email: EmailStr
    specialite: Optional[str] = None
    role_demande: Optional[str] = None
    statut: str
    date_demande: datetime
    date_validation: Optional[datetime] = None
    commentaire_admin: Optional[str] = None
    valide_par_id: Optional[int] = None

    class Config:
        orm_mode = True
