from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# 🧩 Base commune
class FinanceBase(BaseModel):
    type_operation: str
    categorie: Optional[str] = None
    description: Optional[str] = None
    montant_ht: float
    taxe: float
    montant_total: float
    moyen_paiement: Optional[str] = None
    statut: Optional[str] = "enregistré"


# 🟢 Création
class FinanceCreate(FinanceBase):
    facture_id: Optional[int] = None
    medecin_id: Optional[int] = None


# 🟣 Lecture
class FinanceRead(FinanceBase):
    id: int
    date_operation: datetime
    facture_id: Optional[int] = None
    medecin_id: Optional[int] = None

    class Config:
        orm_mode = True


# 🟡 Mise à jour
class FinanceUpdate(BaseModel):
    description: Optional[str] = None
    montant_ht: Optional[float] = None
    taxe: Optional[float] = None
    montant_total: Optional[float] = None
    moyen_paiement: Optional[str] = None
    statut: Optional[str] = None
