from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SoinBase(BaseModel):
    patient_id: int = Field(..., gt=0, description="ID du patient concerné")
    type_soin: str = Field(..., min_length=2, description="Type de soin (injection, pansement, perfusion, etc.)")
    acte: Optional[str] = Field(None, description="Nom précis de l’acte infirmier")
    observations: Optional[str] = Field(None, description="Notes ou remarques de l’infirmier")
    effectue_par: Optional[str] = Field(None, description="Nom de l’infirmier ayant effectué le soin")
    date: Optional[datetime] = Field(None, description="Date et heure du soin (par défaut: maintenant)")


class SoinCreate(SoinBase):
    """Données nécessaires pour créer un soin infirmier"""
    pass


class SoinUpdate(BaseModel):
    """Champs modifiables lors d’une mise à jour"""
    type_soin: Optional[str] = Field(None, min_length=2)
    acte: Optional[str] = None
    observations: Optional[str] = None
    effectue_par: Optional[str] = None
    date: Optional[datetime] = None


class SoinRead(SoinBase):
    """Données retournées au frontend"""
    id: int = Field(..., description="ID unique du soin")

    class Config:
        from_attributes = True  # permet de lire directement un objet SQLAlchemy
