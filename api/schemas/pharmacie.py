from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# 🔹 Champs communs
class PharmacieBase(BaseModel):
    nom: str
    forme: str
    dosage: Optional[str] = None
    description: Optional[str] = None

    quantite: Optional[int] = 0
    seuil_alerte: Optional[int] = 10
    date_peremption: Optional[datetime] = None

    lot: Optional[str] = None
    fournisseur: Optional[str] = None
    prix_achat: Optional[float] = None
    prix_vente: Optional[float] = None

    patient_id: Optional[int] = None
    medecin_id: Optional[int] = None

    statut: Optional[str] = "En stock"   # En stock, Rupture, Périmé, Réservé


# 🔹 Création
class PharmacieCreate(PharmacieBase):
    nom: str
    forme: str


# 🔹 Mise à jour
class PharmacieUpdate(PharmacieBase):
    pass


# 🔹 Réponse API
class PharmacieOut(PharmacieBase):
    id: int
    date_reception: datetime

    class Config:
        from_attributes = True   # ✅ important pour SQLAlchemy
