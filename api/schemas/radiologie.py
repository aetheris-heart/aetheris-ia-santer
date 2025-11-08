from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RadiologieBase(BaseModel):
    patient_id: int
    type_examen: str
    fichier_url: Optional[str] = None
    rapport: Optional[str] = None
    analyse_ia: Optional[str] = None
    statut_validation: Optional[str] = "En attente"
    effectue_par: Optional[str] = None
    niveau_risque: Optional[str] = "Non défini"  # ✅ Ajout important


class RadiologieCreate(RadiologieBase):
    pass


class RadiologieUpdate(BaseModel):
    type_examen: Optional[str] = None
    fichier_url: Optional[str] = None
    rapport: Optional[str] = None
    analyse_ia: Optional[str] = None
    statut_validation: Optional[str] = None
    effectue_par: Optional[str] = None
    niveau_risque: Optional[str] = None  # ✅ ajouté aussi ici


class RadiologieRead(RadiologieBase):
    id: int
    date_examen: datetime

    class Config:
        orm_mode = True
