from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# =============================
# Base commune
# =============================
class FactureBase(BaseModel):
    patient_id: int
    medecin_id: Optional[int] = None

    numero_facture: str
    montant_ht: float
    taxe: Optional[float] = 0.0
    montant_total: float

    statut: Optional[str] = "en attente"  # en attente | payé | partiel | annulé
    methode_paiement: Optional[str] = None
    reference_paiement: Optional[str] = None

    description: Optional[str] = None
    notes_internes: Optional[str] = None

    date_emission: Optional[datetime] = datetime.utcnow()
    date_echeance: Optional[datetime] = None
    date_paiement: Optional[datetime] = None


# =============================
# Création
# =============================
class FactureCreate(FactureBase):
    """Schéma utilisé lors de la création d’une facture"""
    numero_facture: str  # obligatoire à la création


# =============================
# Mise à jour
# =============================
class FactureUpdate(BaseModel):
    montant_ht: Optional[float] = None
    taxe: Optional[float] = None
    montant_total: Optional[float] = None
    statut: Optional[str] = None
    methode_paiement: Optional[str] = None
    reference_paiement: Optional[str] = None
    description: Optional[str] = None
    notes_internes: Optional[str] = None
    date_echeance: Optional[datetime] = None
    date_paiement: Optional[datetime] = None


# =============================
# Lecture (Sortie)
# =============================
class FactureRead(FactureBase):
    id: int

    class Config:
        from_attributes = True
