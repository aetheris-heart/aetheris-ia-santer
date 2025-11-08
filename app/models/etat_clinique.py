from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class EtatClinique(Base):
    __tablename__ = "etat_clinique"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    # Signes vitaux
    spo2 = Column(Float, nullable=True)            # Saturation O2
    temperature = Column(Float, nullable=True)     # Température corporelle
    rythme_cardiaque = Column(Integer, nullable=True)  # Pulsations

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relation avec Patient
    patient = relationship("Patient", back_populates="etats_cliniques")
