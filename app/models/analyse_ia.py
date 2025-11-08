from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Float, String, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class AnalyseIA(Base):
    __tablename__ = "analyses_ia"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    # 🧠 Diagnostic et contenu IA
    diagnostic = Column(Text, nullable=False)               # Diagnostic principal rédigé par l'IA
    prediction = Column(Text, nullable=True)                # Prédiction clinique ou évolution probable
    plan = Column(Text, nullable=True)                      # Plan thérapeutique ou de suivi
    recommendation = Column(Text, nullable=True)            # Recommandations spécifiques (nutrition, médication, repos, etc.)
    resume = Column(Text, nullable=True)                    # Résumé médical clair pour tableau de bord

    # ⚙️ Données contextuelles de l'analyse
    contexte = Column(Text, nullable=True)                  # Données patient intégrées à l'analyse (spo2, température, antécédents…)
    parametres_vitaux = Column(JSON, nullable=True)         # JSON des constantes vitales analysées (spo2, fc, tension, température)
    observations = Column(Text, nullable=True)              # Notes complémentaires IA (arguments médicaux, facteurs aggravants)
    antecedents_ia = Column(Text, nullable=True)            # Antécédents pris en compte par le moteur IA

    # ⚖️ Évaluation médicale et IA
    score_gravite = Column(Float, nullable=True)            # Score de gravité calculé par Aetheris (0-100)
    niveau_gravite = Column(String, nullable=True)          # Niveau ("Vert", "Jaune", "Orange", "Rouge")
    fiabilite_ia = Column(Float, nullable=True)             # Pourcentage de fiabilité estimée du raisonnement IA
    type_analyse = Column(String, nullable=True, default="Analyse clinique complète")
    langue = Column(String, nullable=True, default="fr")    # Langue utilisée par Aetheris pour la réponse
    mode = Column(String, nullable=True, default="auto")    # Mode : auto / manuel / supervision

    # 📊 Métadonnées IA
    moteur_ia = Column(String, default="Aetheris Medical Core v2.0")  # Version du moteur IA utilisé
    contexte_hopital = Column(String, nullable=True)        # Nom du service ou hôpital concerné
    reference_analyse = Column(String, nullable=True, unique=True)    # Identifiant unique de rapport
    fiabilite_medicale = Column(Float, nullable=True)       # Évaluation humaine de la qualité de l’analyse (si revue)
    commentaire_medecin = Column(Text, nullable=True)       # Commentaire du médecin relecteur

    # ⚠️ Mentions légales et audit
    disclaimer = Column(
        Text,
        nullable=False,
        default="⚠️ Analyse générée par Aetheris IA — nécessite validation par un professionnel de santé."
    )

    # 🕒 Suivi temporel
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 🔗 Relation avec le patient
    patient = relationship("Patient", back_populates="analyses_ia")
