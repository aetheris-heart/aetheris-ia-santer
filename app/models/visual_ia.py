from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base

# ==========================================================
# 🧠 TABLE PRINCIPALE : ANALYSES VISUELLES IA
# ==========================================================
class VisualIA(Base):
    """
    Table contenant toutes les analyses visuelles générées
    automatiquement par le moteur Aetheris Visual Intelligence.
    """
    __tablename__ = "visual_ia"
    __table_args__ = {"extend_existing": True}

    # 🔑 Identifiant unique
    id = Column(Integer, primary_key=True, index=True)

    # 🔗 Relation patient
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    # 🧠 Données IA
    diagnostic = Column(String, nullable=False)
    domaine = Column(String, nullable=True)          # Ex: radiologie, cardiaque, neurologique...
    file_path = Column(String, nullable=True)        # Chemin vers l’image (scan, radio)
    date = Column(DateTime, default=datetime.utcnow)

    # 🔗 Relation vers le patient
    patient = relationship("Patient", back_populates="analyses_visuelles")

    def __repr__(self):
        return f"<VisualIA(id={self.id}, patient={self.patient_id}, domaine={self.domaine})>"


# ==========================================================
# ⚙️ TABLE DES RÉGLAGES VISUAL IA
# ==========================================================
class VisualIASettings(Base):
    """
    Table stockant les préférences et paramètres du moteur IA
    pour chaque utilisateur (médecin, admin, technicien).
    """
    __tablename__ = "visual_ia_settings"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # ⚙️ Réglages IA
    autoMode = Column(Boolean, default=True)              # Mode d’analyse automatique
    confidenceThreshold = Column(Integer, default=90)     # Seuil de confiance minimal (70–99)
    refreshInterval = Column(Integer, default=15)         # Intervalle d’analyse en secondes
    darkMode = Column(Boolean, default=True)              # Thème visuel
    iaStatus = Column(String, default="active")           # Statut : active / standby

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 🔗 Relation avec l'utilisateur
    user = relationship("User", back_populates="visual_ia_settings")

    def __repr__(self):
        return f"<VisualIASettings(user_id={self.user_id}, iaStatus={self.iaStatus})>"
