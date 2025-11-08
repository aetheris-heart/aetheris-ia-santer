from sqlalchemy import Column, Integer, ForeignKey, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class PatientCritique(Base):
    __tablename__ = "patients_critiques"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    raison = Column(String, nullable=False)              # Ex: "SpO2 < 90%", "Risque infarctus"
    niveau_risque = Column(Float, nullable=True)         # Score 0-1
    statut = Column(String, default="actif")             # actif, résolu, suivi
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient")
