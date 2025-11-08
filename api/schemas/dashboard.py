from pydantic import BaseModel
from typing import List, Optional

# ----------------- Synthèse IA -----------------
class SyntheseResponse(BaseModel):
    alertes: List[str]
    anomalies: List[str]
    recommandations: List[str]

# ----------------- Pulmonaire -----------------
class PulmonaryStats(BaseModel):
    spo2: float
    respiration_rate: float
    spo2_history: List[float]
    zone_infectee: Optional[str] = None

# ----------------- Rénale -----------------
class RenalStats(BaseModel):
    dfg: int
    uree: float
    creatinine: float
    historique_dfg: List[int]
    alerte: Optional[str] = None

# ----------------- Métabolique -----------------
class GlucoseHistoryItem(BaseModel):
    time: str
    glucose: float

class MetabolicStats(BaseModel):
    glucose: float
    insulin: float
    history: List[GlucoseHistoryItem]

# ----------------- Cardiaque -----------------
class HeartRatePoint(BaseModel):
    time: str
    heart_rate: int

class HistoriqueCardiaque(BaseModel):
    date: str
    valeur: float

class CardiacStats(BaseModel):
    rythme_moyen: float
    rythme_dominant: str
    alertes_actuelles: List[str]
    historique: List[HistoriqueCardiaque]

# ----------------- Digestif -----------------
class AciditeHistoryItem(BaseModel):
    date: str
    valeur: float

class DigestiveStats(BaseModel):
    acidite: float
    motricite: float
    inflammation: float
    historique_acidite: List[AciditeHistoryItem]
    alerte: str

# ----------------- Administratif -----------------
class DailyUserTrend(BaseModel):
    date: str
    total: int

class AdminStats(BaseModel):
    total_users: int
    total_patients: int
    active_ai_modules: int
    active_sessions: int
    recent_errors: List[str]
    user_trend: List[DailyUserTrend]

# ----------------- Neurologique -----------------
class EEGHistory(BaseModel):
    time: str
    eeg: float

class NeurologicalHistory(BaseModel):
    time: str
    eeg: float

class NeurologicalStats(BaseModel):
    eeg: float
    stress_level: float
    history: List[EEGHistory]
