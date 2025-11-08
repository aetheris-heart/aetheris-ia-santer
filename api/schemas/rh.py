from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# =============================
# Base commune
# =============================
class EmployeBase(BaseModel):
    matricule: Optional[str] = None  # ✅ Généré automatiquement si non fourni
    nom: str
    prenom: str
    email: EmailStr
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    sexe: Optional[str] = None
    date_naissance: Optional[datetime] = None

    poste: Optional[str] = None
    role: Optional[str] = "Employé"   # ✅ Valeur par défaut
    service: Optional[str] = None
    type_contrat: Optional[str] = "CDI"
    niveau_etude: Optional[str] = None
    experience: Optional[int] = None

    salaire: Optional[float] = None
    prime: Optional[float] = 0
    devise: Optional[str] = "EUR"
    iban: Optional[str] = None
    assurance_sante: Optional[str] = None

    statut: Optional[str] = "actif"

# =============================
# Création
# =============================
class EmployeCreate(EmployeBase):
    pass

# =============================
# Mise à jour
# =============================
class EmployeUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    sexe: Optional[str] = None
    date_naissance: Optional[datetime] = None
    poste: Optional[str] = None
    role: Optional[str] = None
    service: Optional[str] = None
    type_contrat: Optional[str] = None
    niveau_etude: Optional[str] = None
    experience: Optional[int] = None
    salaire: Optional[float] = None
    prime: Optional[float] = None
    devise: Optional[str] = None
    iban: Optional[str] = None
    assurance_sante: Optional[str] = None
    statut: Optional[str] = None
    date_sortie: Optional[datetime] = None
    motif_sortie: Optional[str] = None
    manager_id: Optional[int] = None

# =============================
# Lecture
# =============================
class EmployeRead(EmployeBase):
    id: int
    date_embauche: datetime
    date_sortie: Optional[datetime] = None
    motif_sortie: Optional[str] = None
    manager_id: Optional[int] = None

    class Config:
        from_attributes = True
