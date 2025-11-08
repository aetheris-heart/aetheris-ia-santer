from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Float, String, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class AetherisIA(Base):
    __tablename__ = "aetheris_ia"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    specialite_id = Column(Integer, ForeignKey("specialites.id"), nullable=True)

    # 🧠 Diagnostic et analyse clinique
    diagnostic = Column(Text, nullable=True)                    # Diagnostic principal proposé par Aetheris
    raisonnement_medical = Column(Text, nullable=True)           # Raisonnement clinique détaillé (argumentation médicale)
    hypotheses_differentielles = Column(Text, nullable=True)     # Diagnostiques différentiels envisagés
    prediction = Column(Text, nullable=True)                     # Évolution probable, pronostic, risques détectés
    recommandations = Column(Text, nullable=True)                # Conseils IA précis (traitement, repos, nutrition, etc.)
    plan_prise_en_charge = Column(Text, nullable=True)           # Plan médical proposé
    resume_global = Column(Text, nullable=True)                  # Résumé synthétique clair et humain

    # ⚙️ Données contextuelles et médicales intégrées
    contexte_clinique = Column(Text, nullable=True)              # Description contextuelle de l’état du patient
    parametres_vitaux = Column(JSON, nullable=True)              # Constantes vitales du patient analysées
    resultats_biologiques = Column(JSON, nullable=True)          # Résultats de biologie pertinents utilisés par Aetheris
    resultats_imagerie = Column(JSON, nullable=True)             # Résumés de radiologie / imagerie exploités
    observations_medecin = Column(Text, nullable=True)           # Notes du praticien associées à l'analyse
    donnees_ia_brutes = Column(JSON, nullable=True)              # Données internes brutes générées par l'IA (poids de décision, pattern, etc.)

    # ⚖️ Évaluation IA et métriques de confiance
    score_confiance = Column(Float, nullable=True)               # Niveau de confiance de l’IA (0-1)
    score_gravite = Column(Float, nullable=True)                 # Gravité clinique évaluée par Aetheris (0-100)
    niveau_gravite = Column(String, nullable=True)               # "Vert", "Jaune", "Orange", "Rouge"
    fiabilite_ia = Column(Float, nullable=True)                  # Fiabilité globale du modèle IA (0-100)
    certitude_diagnostic = Column(Float, nullable=True)          # Probabilité la plus élevée parmi les hypothèses (0-100)
    precision_modele = Column(Float, nullable=True)              # Score global du moteur d’analyse utilisé (utile pour calibration IA)
    moteur_utilise = Column(String, default="Aetheris Medical Engine v3.0")

    # 🔍 Gestion des langues et du contexte
    langue_analyse = Column(String, default="fr")                # Langue utilisée pour l'analyse
    contexte_hopital = Column(String, nullable=True)             # Contexte institutionnel ou département hospitalier
    mode_generation = Column(String, default="auto")             # "auto" (automatique), "manuel", "supervision"

    # 🩺 Validation médicale humaine
    approuve_par_medecin = Column(Boolean, default=False)
    commentaire_medecin = Column(Text, nullable=True)
    note_fiabilite_medicale = Column(Float, nullable=True)       # Évaluation humaine du diagnostic IA

    # 🕒 Horodatage complet
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ⚠️ Mentions légales et contexte IA
    disclaimer = Column(
        Text,
        nullable=False,
        default="⚠️ Analyse générée par Aetheris IA — doit être validée par un professionnel de santé."
    )

    # 🔗 Relation avec le patient
    patient = relationship("Patient", backref="aetheris_analyses")
