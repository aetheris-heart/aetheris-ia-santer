from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# =============================
# 🧠 Base commune (User & Médecin)
# =============================
class UserBase(BaseModel):
    nom: str
    prenom: Optional[str] = None
    email: EmailStr

    # 🔐 Auth & Rôle
    role: Optional[str] = "Médecin"
    statut: Optional[str] = "Actif"

    # 💼 Informations professionnelles
    telephone: Optional[str] = None
    specialite: Optional[str] = None
    diplome: Optional[str] = None
    experience: Optional[str] = None
    hopital: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    patients_suivis: Optional[int] = 0

    # ⚙️ Statut de compte
    is_active: Optional[bool] = True
    is_verified: Optional[bool] = False


# =============================
# 🧩 Création
# =============================
class UserCreate(UserBase):
    password: str


# =============================
# 🔑 Connexion
# =============================
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# =============================
# ✏️ Mise à jour
# =============================
class UserUpdate(UserBase):
    password: Optional[str] = None  # Optionnel pour ne pas forcer le changement


# =============================
# 📤 Sortie
# =============================
class UserOut(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

    @classmethod
    def from_orm(cls, obj):
        """
        Convertit automatiquement la relation SQLAlchemy 'specialite'
        en nom de spécialité texte.
        """
        data = obj.__dict__.copy()
        if "specialite" in data and data["specialite"] is not None:
            try:
                data["specialite"] = getattr(data["specialite"], "nom", str(data["specialite"]))
            except Exception:
                data["specialite"] = str(data["specialite"])
        return super().model_validate(data)
