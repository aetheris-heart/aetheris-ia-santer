from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class Imagerie(Base):
    __tablename__ = "imageries"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    type_examen = Column(String, nullable=False)        # Examen choisi (radio, scanner, IRM, etc.)
    autre_examen = Column(String, nullable=True)        # Si examen non présent dans la liste
    fichier_url = Column(String, nullable=True)         # URL ou chemin du fichier stocké
    description = Column(Text, nullable=True)           # Rapport médical ou notes
    effectue_par = Column(String, nullable=True)        # Nom du radiologue ou technicien
    date_examen = Column(DateTime, default=datetime.utcnow)

    # Relation avec Patient
    patient = relationship("Patient", back_populates="imageries")
