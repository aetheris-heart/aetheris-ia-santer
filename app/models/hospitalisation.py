from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class Hospitalisation(Base):
    __tablename__ = "hospitalisations"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medecin_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # 🔗 médecin créateur

    service = Column(String, nullable=False)            # Ex: Cardiologie, Urgences
    chambre = Column(String, nullable=True)             # Numéro chambre
    lit = Column(String, nullable=True)                 # Numéro lit
    motif = Column(String, nullable=True)               # Motif d’hospitalisation
    observations = Column(Text, nullable=True)          # Notes médicales
    statut = Column(String, default="en cours")         # en cours, terminé, annulé

    date_entree = Column(DateTime, default=datetime.utcnow)
    date_sortie = Column(DateTime, nullable=True)

    # 🔗 Relations
    patient = relationship("Patient", back_populates="hospitalisations")
    medecin = relationship("User", back_populates="hospitalisations")
    medecin_id = Column(Integer, ForeignKey("users.id"), nullable=False)