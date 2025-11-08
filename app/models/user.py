from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)

    # 👤 Informations personnelles
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=True)
    sexe = Column(String, nullable=True)
    date_naissance = Column(DateTime, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    telephone = Column(String, nullable=True)
    adresse = Column(String, nullable=True)
    nationalite = Column(String, nullable=True)

    # 🔐 Authentification
    hashed_password = Column(String, nullable=False)
    reset_token = Column(String, nullable=True)
    reset_token_expiration = Column(DateTime, nullable=True)

    # 🩺 Informations professionnelles
    role = Column(String, default="Médecin")                  # Médecin, Infirmier, Admin, Technicien, IA, etc.
    grade = Column(String, nullable=True)                     # Chef de service, Interne, Spécialiste, etc.
    specialite_text = Column(String, nullable=True)
    specialite_id = Column(Integer, ForeignKey("specialites.id"), nullable=True)
    hopital = Column(String, nullable=True)
    departement = Column(String, nullable=True)
    diplome = Column(String, nullable=True)
    certifications = Column(Text, nullable=True)
    experience = Column(String, nullable=True)
    annees_experience = Column(Integer, nullable=True)
    statut = Column(String, default="Actif")                  # Actif / Suspendu / En congé / Retraité
    patients_suivis = Column(Integer, default=0)

    # 🧠 Données cognitives et IA
    niveau_confiance_ia = Column(Float, nullable=True, default=100.0)    # Taux de validation IA
    specialite_ia = Column(String, nullable=True)                        # Domaine d’expertise IA (Cardiaque, Neuro, etc.)
    score_fiabilite = Column(Float, nullable=True, default=95.0)         # Évaluation moyenne du praticien
    performance_mensuelle = Column(JSON, nullable=True)                  # Suivi mensuel d’activité (consultations, taux réussite IA)
    preferences_affichage = Column(JSON, nullable=True)                  # Thème, langue, notifications
    signature_numerique = Column(String, nullable=True)                  # Signature cryptée pour validations IA
    derniere_connexion = Column(DateTime, nullable=True)
    derniere_activite = Column(DateTime, nullable=True)

    # 🧾 Profil et réputation
    bio = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    est_admin = Column(Boolean, default=False)
    evaluation_moyenne = Column(Float, nullable=True)
    nombre_avis = Column(Integer, default=0)
    note_globale = Column(Float, default=5.0)
    disponibilite = Column(Boolean, default=True)
    statut_en_ligne = Column(String, default="Hors ligne")

    # 🕒 Audit
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 🔗 Relations avec les autres modules
    consultations = relationship("Consultation", back_populates="medecin", cascade="all, delete-orphan")
    hospitalisations = relationship("Hospitalisation", back_populates="medecin", cascade="all, delete-orphan")
    diagnostics = relationship("Diagnostic", back_populates="medecin", cascade="all, delete-orphan")
    rendezvous = relationship("RendezVous", back_populates="medecin", cascade="all, delete-orphan")
    prescriptions = relationship("Pharmacie", back_populates="medecin", cascade="all, delete-orphan")
    urgences_prises = relationship("Urgence", back_populates="medecin", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    # ... classe User ...
    visual_ia_settings = relationship(
        "VisualIASettings",  # <-- nom en string = évite les problèmes d’imports croisés
        back_populates="user",
        uselist=False
    )
    specialite = relationship("Specialite", back_populates="medecins")

    demandes_validees = relationship(
        "DemandeCompte",
        back_populates="valide_par",
        lazy="joined",
        cascade="all, delete-orphan"
    )

    # 🧩 Relations IA
    aetheris_analyses = relationship("AetherisIA", backref="medecin", lazy="dynamic")
def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"