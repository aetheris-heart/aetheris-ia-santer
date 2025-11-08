from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class MetaboliqueData(Base):
    __tablename__ = "metabolique_data"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    glucose = Column(Float, nullable=True)                  # Glycémie (mg/dL)
    insuline = Column(Float, nullable=True)                 # Niveau d’insuline
    cholesterol = Column(Float, nullable=True)              # Cholestérol total
    anomalies_detectees = Column(String, nullable=True)     # Ex: "Hyperglycémie"
    alerte = Column(String, nullable=True)                  # Alerte IA

    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient")
