from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class RenalData(Base):
    __tablename__ = "renal_data"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    filtration_glomerulaire = Column(Float, nullable=True)
    creatinine = Column(Float, nullable=True)               # mg/dL
    clairance = Column(Float)
    dfg = Column(Float, nullable=True)                      # Débit de filtration glomérulaire (mL/min/1.73m²)
    uree = Column(Float, nullable=True)                     # mg/dL
    anomalies_detectees = Column(String, nullable=True)     # ex: insuffisance rénale
    alerte = Column(String, nullable=True)                  # ex: DFG critique < 30

    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient")
