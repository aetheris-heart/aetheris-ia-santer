from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base

class Employe(Base):
    __tablename__ = "employes"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    matricule = Column(String, unique=True, index=True, nullable=False)  # Identifiant interne
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    telephone = Column(String, nullable=True)
    adresse = Column(String, nullable=True)
    sexe = Column(String, nullable=True)  # M / F / Autre
    date_naissance = Column(DateTime, nullable=True)

    poste = Column(String, nullable=True)
    role = Column(String, nullable=False)             # Médecin, infirmier, admin, etc.
    service = Column(String, nullable=True)           # Service d’affectation
    type_contrat = Column(String, default="CDI")      # CDI, CDD, stage...
    niveau_etude = Column(String, nullable=True)
    experience = Column(Integer, nullable=True)       # années d’expérience

    salaire = Column(Float, nullable=True)
    prime = Column(Float, default=0)
    devise = Column(String, default="EUR")
    iban = Column(String, nullable=True)
    assurance_sante = Column(String, nullable=True)

    statut = Column(String, default="actif")          # actif, congé, retraité, etc.
    date_embauche = Column(DateTime, default=datetime.utcnow)
    date_sortie = Column(DateTime, nullable=True)
    motif_sortie = Column(String, nullable=True)

    manager_id = Column(Integer, ForeignKey("employes.id"), nullable=True)

    # Relations
    manager = relationship("Employe", remote_side=[id], backref="subordonnes")
