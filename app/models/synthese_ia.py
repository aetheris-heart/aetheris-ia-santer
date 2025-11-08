from sqlalchemy import Column, Integer, Text, String, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class SyntheseIA(Base):
    __tablename__ = "syntheses_ia"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medecin_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Qui a validé la synthèse

    # 🧠 Contenu principal
    resume = Column(Text, nullable=False)              # Résumé clinique lisible
    recommandations = Column(Text, nullable=True)      # Conseils / conduites à tenir
    risques = Column(Text, nullable=True)              # Risques identifiés par IA
    score_global = Column(Float, nullable=True)        # Score de risque global (0-1)
    niveau_gravite = Column(String, nullable=True)     # ex: "vert", "jaune", "orange", "rouge"

    # 🏷 Métadonnées
    tags = Column(String, nullable=True)               # Mots-clés : "cardio,urgence"
    alertes_critiques = Column(Text, nullable=True)    # Ex: "SpO2 < 85% - Hypoxie sévère"
    anomalies_detectees = Column(Text, nullable=True)  # Ex: "ECG suspect d’arythmie"
    recommandations_ia = Column(JSON, nullable=True)   # Liste structurée [{"type": "...", "message": "..."}]

    # 🔒 Validation
    valide_par_humain = Column(Boolean, default=False) # Un médecin a validé la synthèse
    commentaire_medecin = Column(Text, nullable=True)  # Commentaire de validation

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    patient = relationship("Patient", backref="syntheses_ia")
    medecin = relationship("User", backref="syntheses_ia", lazy="joined")
