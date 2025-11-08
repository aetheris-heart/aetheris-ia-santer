from sqlalchemy import Column, Integer, String
from api.database import Base

class Medecin(Base):
    __tablename__ = "medecins"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=True)
    email = Column(String, nullable=False, unique=True)
    telephone = Column(String, nullable=True)
    specialite = Column(String, nullable=True)
    hopital = Column(String, nullable=True)
    role = Column(String, default="Médecin")
    statut = Column(String, default="Actif")
    bio = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
