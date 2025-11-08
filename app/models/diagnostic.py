from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class Diagnostic(Base):
    __tablename__ = "diagnostics"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)

    # 🔗 Relations principales
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medecin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=True)

    # 🧠 Données de diagnostic clinique et IA
    type = Column(String, nullable=False, default="Général")             # Ex : Cardiaque, Neurologique, Digestif, etc.
    sous_type = Column(String, nullable=True)                            # Ex : Arythmie, AVC ischémique, Ulcère gastrique
    resultat = Column(Text, nullable=True)                               # Analyse IA ou humaine détaillée
    details = Column(Text, nullable=True)                                # Description complète du diagnostic
    conclusion = Column(Text, nullable=True)                             # Résumé final compréhensible
    arguments_cliniques = Column(Text, nullable=True)                    # Raisonnement clinique justifiant le diagnostic
    hypotheses_differentielles = Column(Text, nullable=True)             # Autres diagnostics possibles
    recommandations = Column(Text, nullable=True)                        # Conseils ou prise en charge recommandée

    # ⚙️ Données médicales croisées
    constantes_vitales = Column(JSON, nullable=True)                     # SpO2, FC, TA, température, etc.
    donnees_biologiques = Column(JSON, nullable=True)                    # Examens de biologie pertinents
    donnees_imagerie = Column(JSON, nullable=True)                       # Résumés d’imagerie ou anomalies détectées
    donnees_visuelles_ia = Column(JSON, nullable=True)                   # Résultats d’analyse visuelle IA (VisualIA)
    donnees_historiques = Column(JSON, nullable=True)                    # Données issues d’anciennes consultations

    # ⚖️ Indicateurs IA
    score_confiance = Column(Float, nullable=True)                       # Niveau de confiance de l’IA (0–100)
    score_gravite = Column(Float, nullable=True)                         # Gravité clinique estimée (0–100)
    priorite = Column(String, default="Normale")                         # Urgent / Élevée / Normale
    niveau_risque = Column(String, default="Bas")                        # Bas / Modéré / Critique
    certitude_diagnostic = Column(Float, nullable=True)                  # Pourcentage de certitude clinique (0–100)
    fiabilite_ia = Column(Float, nullable=True)                          # Fiabilité du moteur IA (0–100)
    signature_ia = Column(String, default="Aetheris Core v3.0")          # Nom du moteur IA
    moteur_utilise = Column(String, nullable=True, default="GPT-4o")     # Modèle IA utilisé

    # 🌍 Métadonnées
    langue = Column(String, default="fr")                                # Langue du rapport IA
    source_donnee = Column(String, default="Aetheris")                   # Origine du diagnostic (IA / médecin / mixte)
    contexte_hopital = Column(String, nullable=True)                     # Service ou hôpital concerné
    analyse_reference = Column(String, nullable=True, unique=True)       # Identifiant unique du diagnostic

    # 🩺 Validation médicale
    valide_par_medecin = Column(Boolean, default=False)
    commentaire_medecin = Column(Text, nullable=True)
    note_fiabilite_medicale = Column(Float, nullable=True)

    # 🕒 Gestion du temps
    date_diagnostic = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 🔗 Relations
    patient = relationship("Patient", back_populates="diagnostics")
    medecin = relationship("User", back_populates="diagnostics")
    consultation = relationship("Consultation", back_populates="diagnostics")
