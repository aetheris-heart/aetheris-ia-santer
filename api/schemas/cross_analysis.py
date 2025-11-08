from pydantic import BaseModel
from typing import Optional

class CardiaqueData(BaseModel):
    frequence_cardiaque: Optional[int]
    alerte: str

class DigestiveData(BaseModel):
    temperature: Optional[float]
    alerte: str

class NeurologiqueData(BaseModel):
    spo2: Optional[float]
    alerte: str

class MetaboliqueData(BaseModel):
    glycemie: Optional[float]
    alerte: str

class PulmonaireData(BaseModel):
    frequence_respiratoire: Optional[int]
    alerte: str

class RenalData(BaseModel):
    creatinine: Optional[float]
    alerte: str

class CrossAnalysisResult(BaseModel):
    cardiaque: CardiaqueData
    digestive: DigestiveData
    neurologique: NeurologiqueData
    metabolique: MetaboliqueData
    pulmonaire: PulmonaireData
    renal: RenalData
