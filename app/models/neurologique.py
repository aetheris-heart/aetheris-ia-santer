from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from api.database import Base


class NeurologiqueData(Base):
    __tablename__ = "neurologique_data"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)

    # 🔗 Lien vers le patient
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)

    # 🧠 Données neurologiques principales
    eeg = Column(Float, nullable=True)  # Activité électrique cérébrale
    stress_level = Column(Float, nullable=True)  # Niveau de stress (0–100)
    concentration = Column(Float, nullable=True)  # Taux de concentration (0–100)
    reponse_reflexe = Column(Float, nullable=True)  # Temps de réponse moyen en ms
    temperature_cerebrale = Column(Float, nullable=True)  # Température cérébrale en °C

    # ⚠️ Informations IA
    alerte = Column(String, nullable=True)  # Message IA automatique
    commentaire_ia = Column(String, nullable=True)  # Explication IA Aetheris

    # 🕒 Horodatage
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 🔄 Relation avec le patient
    patient = relationship("Patient", back_populates="neurologique_data")
