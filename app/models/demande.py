from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base

class DemandeCompte(Base):
    __tablename__ = "demandes_compte"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    specialite = Column(String, nullable=True)
    role_demande = Column(String, default="medecin")  # médecin / admin
    statut = Column(String, default="en_attente")     # en_attente / valide / refuse
    date_demande = Column(DateTime, default=datetime.utcnow)
    commentaire_admin = Column(String, nullable=True)
    date_validation = Column(DateTime, nullable=True)

    valide_par_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    valide_par = relationship(
        "User",
        back_populates="demandes_validees",  # ✅ correction ici
        lazy="joined"
    )
