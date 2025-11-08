from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# ===================== DEMANDE COMPTE =====================

class DemandeCompteBase(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    specialite: Optional[str] = None
    role_demande: str = "medecin"


class DemandeCompteCreate(DemandeCompteBase):
    """Création d’une nouvelle demande de compte"""
    pass


class DemandeCompteRead(DemandeCompteBase):
    """Lecture d’une demande"""
    id: int
    statut: str
    date_demande: datetime
    date_validation: Optional[datetime] = None
    commentaire_admin: Optional[str] = None
    valide_par_id: Optional[int] = None

    class Config:
        from_attributes = True   # ✅ Pydantic v2 (remplace orm_mode)
# ===================== CRÉATION ADMIN =====================

class AdminCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    mot_de_passe: str    # ✅ renommé ici
    specialite: Optional[str] = None


# ===================== UTILISATEUR CRÉÉ =====================

class UserCreated(BaseModel):
    id: int
    email: EmailStr
    role: str
    specialite: Optional[str] = None

    class Config:
        from_attributes = True


# ===================== RÉPONSES =====================

class DemandeValidationResponse(BaseModel):
    message: str
    user: Optional[UserCreated] = None


class DemandeRefusResponse(BaseModel):
    message: str
    demande: DemandeCompteRead


# ===================== STATISTIQUES ADMIN =====================

class AdminStats(BaseModel):
    total_users: int
    total_patients: int
    total_consultations: int
    total_rendezvous: int
    demandes_en_attente: int
