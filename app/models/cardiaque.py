from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class CardiaqueData(Base):
    __tablename__ = "cardiaque_Data"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    frequence_cardiaque = Column(Float, nullable=True)        # bpm
    rythme = Column(String, nullable=True)                     # ex: sinusal, fibrillation
    tension_systolique = Column(Float, nullable=True)          # mmHg
    tension_diastolique = Column(Float, nullable=True)         # mmHg
    anomalies_detectees = Column(String, nullable=True)        # ex: extrasystoles
    alerte = Column(String, nullable=True)                     # ex: "tachycardie sévère"

    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient")
