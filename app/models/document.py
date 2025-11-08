from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class Document(Base):
    __tablename__ = "documents"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    titre = Column(String, nullable=False)              # Nom du document
    description = Column(Text, nullable=True)           # Détails ou notes
    fichier_url = Column(String, nullable=True)         # Lien ou chemin fichier
    type_document = Column(String, nullable=True)       # ex: "radiologie", "compte-rendu"

    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient")
