from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class AdminLog(Base):
    __tablename__ = "admin_logs"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)

    # 🔹 Infos utilisateur
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)

    # 🔹 Métier et rôle demandé
    specialite = Column(String(100), nullable=True)          # ex: "Cardiologie"
    role_demande = Column(String(50), default="medecin")     # medecin / admin / infirmier

    # 🔹 Statut de la demande
    statut = Column(String(50), default="en_attente")        # en_attente / valide / refuse
    commentaire_admin = Column(Text, nullable=True)          # notes internes du validateur

    # 🔹 Suivi
    date_demande = Column(DateTime, default=datetime.utcnow)
    date_validation = Column(DateTime, nullable=True)
    valide_par_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # 🔹 Relation avec l’admin validateur
    valide_par = relationship("User", back_populates="demandes_validees", lazy="joined")

