from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class Radiologie(Base):
    __tablename__ = "radiologies"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    type_examen = Column(String, nullable=False)      # Radio, scanner, IRM
    fichier_url = Column(String, nullable=True)       # Lien vers image/PDF/DICOM
    rapport = Column(Text, nullable=True)             # Rapport humain
    analyse_ia = Column(Text, nullable=True)          # Rapport IA (JSON ou texte)
    statut_validation = Column(String, default="En attente")  # En attente, Validé, Refusé
    effectue_par = Column(String, nullable=True)      # Radiologue
    date_examen = Column(DateTime, default=datetime.utcnow)
    niveau_risque = Column(String, default="Faible")

    patient = relationship("Patient", back_populates="radiologies")
