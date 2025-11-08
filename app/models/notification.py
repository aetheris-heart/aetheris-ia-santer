from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Boolean, Text, JSON, Float, Index
)
from sqlalchemy.orm import relationship
from api.database import Base


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = (
        Index("idx_notification_created_at", "created_at"),  # ⚡ optimisation tri
        {"extend_existing": True},  # ✅ doit être en dernier
    )
    id = Column(Integer, primary_key=True, index=True)

    # 🧠 Contenu principal
    titre = Column(String(200), nullable=False)                       # Titre visible
    message = Column(Text, nullable=False)                            # Contenu complet
    type = Column(String(50), default="info")                         # info, alerte, critique, réussite...
    niveau = Column(String(50), default="Normal")                     # Bas, Modéré, Élevé, Critique
    categorie = Column(String(100), nullable=True)                    # Cardiaque, Neurologique...
    origine = Column(String(100), default="Aetheris IA")              # Source IA / Médecin / Système
    priorite = Column(Integer, default=1)                             # 1=Faible → 4=Critique
    couleur = Column(String(20), nullable=True)                       # Couleur visuelle (ex: rouge/jaune/vert)
    statut = Column(String(50), default="non_lue")                    # ✅ Pour compatibilité avec ton code backend

    # 🔍 Contexte clinique enrichi
    contexte_clinique = Column(JSON, nullable=True)                   # Données vitales ou contexte
    gravite_score = Column(Float, nullable=True)                      # 0–100 (IA)
    niveau_auto = Column(String(50), nullable=True)                   # Déterminé automatiquement par IA
    fonction_concernee = Column(String(100), nullable=True)           # Cardiaque, Rénale, etc.

    # 🧩 Liens vers d'autres modules
    analyse_ia_id = Column(Integer, ForeignKey("analyses_ia.id"), nullable=True)
    diagnostic_id = Column(Integer, ForeignKey("diagnostics.id"), nullable=True)
    urgence_id = Column(Integer, ForeignKey("urgences.id"), nullable=True)
    rendezvous_id = Column(Integer, ForeignKey("rendezvous.id"), nullable=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id", ondelete="SET NULL"), nullable=True)

    # 🔗 Liens d’origine et de destination
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=True)

    # 📩 Statut et actions
    lu = Column(Boolean, default=False)
    lu_le = Column(DateTime, nullable=True)
    action_effectuee = Column(Boolean, default=False)
    action = Column(String(200), nullable=True)
    lien_frontend = Column(String(300), nullable=True)
    importance_medicale = Column(Float, default=1.0)

    # 🕓 Suivi temporel
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 🔗 Relations ORM
    user = relationship("User", back_populates="notifications")
    patient = relationship("Patient", back_populates="notifications", lazy="joined")
    consultation = relationship("Consultation", back_populates="notifications", lazy="joined")

    analyse_ia = relationship("AnalyseIA", backref="notifications", lazy="joined")
    diagnostic = relationship("Diagnostic", backref="notifications", lazy="joined")
    urgence = relationship("Urgence", backref="notifications", lazy="joined")

    def __repr__(self):
        return f"<Notification #{self.id} [{self.niveau}] - {self.titre}>"
