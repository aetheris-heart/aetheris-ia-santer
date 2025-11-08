from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class Consultation(Base):
    __tablename__ = "consultations"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medecin_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 🩺 Détails cliniques essentiels
    motif = Column(String, nullable=False)                   # Motif principal de consultation
    symptomes = Column(Text, nullable=True)                  # Symptômes décrits par le patient
    signes_cliniques = Column(Text, nullable=True)            # Signes observés à l'examen
    diagnostic = Column(Text, nullable=True)                  # Diagnostic posé ou présumé
    diagnostic_secondaire = Column(Text, nullable=True)       # Autres hypothèses diagnostiques
    traitement = Column(Text, nullable=True)                  # Traitement prescrit
    prescriptions = Column(JSON, nullable=True)               # Détails des prescriptions (liste structurée)
    recommandations = Column(Text, nullable=True)             # Conseils du médecin
    suivi_prevu = Column(String, nullable=True)               # Délai ou type de suivi recommandé

    # ⚙️ Données médicales complémentaires
    constantes_vitales = Column(JSON, nullable=True)          # Température, tension, SpO₂, pouls, FR, etc.
    analyses_effectuees = Column(Text, nullable=True)         # Examens ou analyses demandées
    resultats_analyse = Column(JSON, nullable=True)           # Résultats ou synthèse d’examens (bio, imagerie)
    observations_medecin = Column(Text, nullable=True)        # Notes ou remarques supplémentaires
    niveau_gravite = Column(String, nullable=True)            # "Vert", "Jaune", "Orange", "Rouge"
    score_risque = Column(Float, nullable=True)               # Évaluation rapide du risque clinique (0-100)

    # 🧠 Intégration IA
    analyse_ia = Column(Text, nullable=True)                  # Analyse générée par Aetheris (résumé IA)
    score_confiance_ia = Column(Float, nullable=True)         # Confiance IA sur cette consultation (0-1)
    moteur_ia_utilise = Column(String, nullable=True)         # Nom du moteur IA (ex: Aetheris Core v3)
    lien_analyse_ia = Column(Integer, ForeignKey("aetheris_ia.id"), nullable=True)

    # 🕒 Gestion du temps
    date_consultation = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 💬 Administration / suivi
    commentaire = Column(Text, nullable=True)
    statut_consultation = Column(String, default="terminée")  # "en cours", "terminée", "reportée", etc.

    # 🔗 Relations
    patient = relationship("Patient", back_populates="consultations")
    medecin = relationship("User", back_populates="consultations")
    diagnostics = relationship("Diagnostic", back_populates="consultation", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="consultation", cascade="all, delete-orphan")

    # 🔗 Liaison IA complète
    aetheris_ia = relationship("AetherisIA", backref="consultations", lazy="joined")
from app.models.aetheris import AetherisIA  # ✅ ajoute ceci à la fin
