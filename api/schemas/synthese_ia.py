from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime


# 🟢 Base commune
class SyntheseIABase(BaseModel):
    resume: str = Field(..., description="Résumé clinique généré par l’IA Aetheris")
    recommandations: Optional[str] = Field(None, description="Conseils ou conduites à tenir")
    risques: Optional[str] = Field(None, description="Risques identifiés par l'IA")
    score_global: Optional[float] = Field(None, description="Score global de risque (0-1)")
    niveau_gravite: Optional[str] = Field(
        None, description="Niveau de gravité (vert, jaune, orange, rouge)"
    )

    tags: Optional[List[str]] = Field(None, description="Mots-clés liés à la synthèse")
    alertes_critiques: Optional[str] = Field(None, description="Alertes critiques détectées")
    anomalies_detectees: Optional[str] = Field(None, description="Anomalies ou signaux inhabituels")
    recommandations_ia: Optional[List[dict]] = Field(
        None, description="Recommandations IA structurées"
    )

    valide_par_humain: Optional[bool] = Field(False, description="Validée par un médecin humain ?")
    commentaire_medecin: Optional[str] = Field(
        None, description="Commentaire du médecin validateur"
    )


# 🟡 Création
class SyntheseIACreate(SyntheseIABase):
    pass


# 🟠 Mise à jour
class SyntheseIAUpdate(BaseModel):
    resume: Optional[str] = None
    recommandations: Optional[str] = None
    risques: Optional[str] = None
    score_global: Optional[float] = None
    niveau_gravite: Optional[str] = None
    tags: Optional[List[str]] = None
    alertes_critiques: Optional[str] = None
    anomalies_detectees: Optional[str] = None
    recommandations_ia: Optional[List[dict]] = None
    valide_par_humain: Optional[bool] = None
    commentaire_medecin: Optional[str] = None


# 🔵 Lecture / Réponse
class SyntheseIARead(SyntheseIABase):
    id: int
    patient_id: int
    medecin_id: Optional[int] = None
    created_at: datetime

    # ✅ Conversion automatique de "cardio,fatigue,suivi" → ["cardio", "fatigue", "suivi"]
    @field_validator("tags", mode="before")
    def parse_tags(cls, value):
        if isinstance(value, str):
            return [t.strip() for t in value.split(",") if t.strip()]
        return value

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "patient_id": 3,
                "medecin_id": 1,
                "resume": "Risque cardiaque accru détecté, possible hypertension évolutive.",
                "recommandations": "Surveillance tensionnelle quotidienne, bilan sanguin sous 48h.",
                "risques": "Hypertension, tachycardie",
                "score_global": 0.82,
                "niveau_gravite": "rouge",
                "tags": ["cardio", "urgence"],
                "alertes_critiques": "SpO₂ < 88%",
                "anomalies_detectees": "Électrocardiogramme irrégulier",
                "recommandations_ia": [
                    {"type": "médical", "message": "Contrôle ECG urgent"},
                    {"type": "suivi", "message": "Hydratation et repos strict"},
                ],
                "valide_par_humain": True,
                "commentaire_medecin": "Synthèse confirmée par Dr. ATEBA",
                "created_at": "2025-10-13T15:42:10Z",
            }
        }
