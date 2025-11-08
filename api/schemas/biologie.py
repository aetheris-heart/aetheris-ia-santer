from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

class BiologieBase(BaseModel):
    type_analyse: str
    categorie: Optional[str] = "Sang"
    sous_categorie: Optional[str] = None
    resultats: Optional[Dict[str, str]] = {}   # JSON sous forme dict clé:valeur
    interpretation: Optional[str] = None
    fichier_url: Optional[str] = None
    prescripteur: Optional[str] = None
    effectue_par: Optional[str] = None
    laborantin: Optional[str] = None
    etat: Optional[str] = "En attente"

class BiologieCreate(BiologieBase):
    patient_id: int

class BiologieUpdate(BiologieBase):
    pass

class BiologieOut(BiologieBase):
    id: int
    patient_id: int
    date_prescription: datetime
    date_prelevement: datetime
    date_validation: Optional[datetime] = None

    class Config:
        from_attributes = True
