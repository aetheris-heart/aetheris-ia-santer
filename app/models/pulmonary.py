from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class PulmonaryData(Base):
    __tablename__ = "pulmonary_data"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    spo2 = Column(Float, nullable=True)                        # Saturation oxygène %
    frequence_respiratoire = Column(Integer, nullable=True)    # Resp/min
    volume_expiratoire = Column(Float, nullable=True)          # VEMS (L)
    anomalies_detectees = Column(String, nullable=True)        # ex: dyspnée, apnée
    alerte = Column(String, nullable=True)                     # ex: "SpO2 critique < 90%"

    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient")
