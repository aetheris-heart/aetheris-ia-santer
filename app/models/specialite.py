from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, JSON, func
from sqlalchemy.orm import relationship
from api.database import Base


class Specialite(Base):
    __tablename__ = "specialites"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)

    # 🧬 Informations de base
    nom = Column(String(100), unique=True, nullable=False)         # Exemple : Cardiologie, Neurologie, etc.
    description = Column(Text, nullable=True)                      # Description médicale et rôle du service
    icone = Column(String(50), nullable=True)                      # Exemple : ❤️, 🧠, 🫁...
    couleur = Column(String(20), nullable=True)                    # Couleur UI de la carte (ex: #e63946)

    # ⚙️ Informations structurelles
    domaine_medical = Column(String(100), nullable=True)           # Domaine : Médecine interne, Chirurgie, Urgences, etc.
    sous_domaine = Column(String(100), nullable=True)              # Sous-catégorie : Pédiatrie, Cardiologie interventionnelle...
    localisation_service = Column(String(100), nullable=True)      # Ex : Bâtiment B - Niveau 2
    nombre_lits = Column(Integer, nullable=True)                   # Capacité du service
    chef_service = Column(String(150), nullable=True)              # Nom du responsable
    est_critique = Column(Boolean, default=False)                  # True pour services vitaux (réa, urgence, cardio, neuro…)

    # 🧠 Données IA
    competences_ia = Column(JSON, nullable=True)                   # Liste des modules IA actifs (cardiaque, respiratoire, etc.)
    score_performance_ia = Column(Float, default=95.0)             # Taux moyen de fiabilité IA dans cette spécialité
    alertes_actives = Column(JSON, nullable=True)                  # Liste des types d’alertes propres à la spécialité
    taux_reussite_clinique = Column(Float, default=0.0)            # Évalué sur base de diagnostics validés
    precision_diagnostic_moyenne = Column(Float, default=0.0)      # Moyenne des diagnostics IA confirmés par médecins
    charge_travail = Column(Float, default=0.0)                    # Indice dynamique de charge du service (0-100)
    supervision_ia = Column(Boolean, default=True)                 # Active l’assistance IA pour ce service

    # 📊 Statistiques en temps réel
    statistiques_mensuelles = Column(JSON, nullable=True)          # Activité mensuelle : nb patients, alertes, succès IA, etc.
    taux_patient_satisfaits = Column(Float, default=0.0)           # % de satisfaction patients (feedback futur)
    nombre_medecins_actifs = Column(Integer, default=0)
    nombre_patients_suivis = Column(Integer, default=0)

    # 🕒 Suivi temporel
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # 🔗 Relations
    medecins = relationship("User", back_populates="specialite")

    # 🧩 Relations avec IA et diagnostics
    aetheris_analyses = relationship("AetherisIA", backref="specialite", lazy="dynamic")
