from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class DigestiveData(Base):
    __tablename__ = "digestive_data"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    acidite = Column(Float, nullable=True)                  # Niveau d’acidité gastrique (pH)
    motricite = Column(Float, nullable=True)                # Activité motrice (score)
    inflammation = Column(String, nullable=True)            # Ex: "gastrite", "colite"
    anomalies_detectees = Column(String, nullable=True)     # Autres anomalies
    alerte = Column(String, nullable=True)                  # Alerte IA

    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient")
