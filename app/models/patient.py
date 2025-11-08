from sqlalchemy import Column, Integer, String, Date, DateTime, Float, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class Patient(Base):
    __tablename__ = "patients"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)

    # 🧍‍♂️ Informations personnelles
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=True)
    sexe = Column(String, nullable=True)
    date_naissance = Column(Date, nullable=True)
    age = Column(Integer, nullable=True)

    # 📞 Coordonnées et contact
    email = Column(String, unique=True, nullable=True)
    telephone = Column(String, nullable=True)
    adresse = Column(String, nullable=True)
    contact_urgence = Column(String, nullable=True)
    relation_contact = Column(String, nullable=True)  # ex: mère, frère, etc.

    # 💉 Informations médicales de base
    groupe_sanguin = Column(String, nullable=True)
    allergies = Column(Text, nullable=True)
    antecedents = Column(Text, nullable=True)
    traitement = Column(Text, nullable=True)
    pathologie = Column(Text, nullable=True)

    # ⚙️ Constantes vitales dynamiques
    temperature = Column(Float, nullable=True)
    rythme_cardiaque = Column(Float, nullable=True)
    spo2 = Column(Float, nullable=True)
    frequence_respiratoire = Column(Float, nullable=True)
    tension_systolique = Column(Float, nullable=True)
    tension_diastolique = Column(Float, nullable=True)
    mbp = Column(Float, nullable=True)  # Pression artérielle moyenne

    # ⚖️ Données morphologiques
    poids = Column(Float, nullable=True)
    taille = Column(Float, nullable=True)
    imc = Column(Float, nullable=True)  # Calcul automatique possible côté backend

    # 🧠 Statut clinique global
    statut_clinique = Column(String, default="Stable")
    etat_conscience = Column(String, nullable=True)  # Alerte / Normal / Somnolent
    douleur = Column(Integer, nullable=True)  # échelle de 0 à 10
    observation_medecin = Column(Text, nullable=True)
    observation_infirmiere = Column(Text, nullable=True)

    # 🧬 Données IA
    score_risque_ia = Column(Float, nullable=True)
    niveau_gravite = Column(String, nullable=True)
    commentaire_ia = Column(Text, nullable=True)

    # 🕒 Gestion temporelle
    dernier_suivi = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ✅ Statut administratif
    actif = Column(Boolean, default=True)
    hospitalise = Column(Boolean, default=False)
    en_urgence = Column(Boolean, default=False)

    # 🔗 Relations avec les autres entités médicales
    consultations = relationship("Consultation", back_populates="patient", cascade="all, delete-orphan")
    diagnostics = relationship("Diagnostic", back_populates="patient", cascade="all, delete-orphan")
    cardiaque_data = relationship("CardiaqueData", back_populates="patient", cascade="all, delete-orphan")
    pulmonary_data = relationship("PulmonaryData", back_populates="patient", cascade="all, delete-orphan")
    neurologique_data = relationship("NeurologiqueData", back_populates="patient", cascade="all, delete-orphan")
    digestive_data = relationship("DigestiveData", back_populates="patient", cascade="all, delete-orphan")
    metabolique_data = relationship("MetaboliqueData", back_populates="patient", cascade="all, delete-orphan")
    renal_data = relationship("RenalData", back_populates="patient", cascade="all, delete-orphan")

    biologies = relationship("Biologie", back_populates="patient", cascade="all, delete-orphan")
    pharmacies = relationship("Pharmacie", back_populates="patient", cascade="all, delete-orphan")
    imageries = relationship("Imagerie", back_populates="patient", cascade="all, delete-orphan")
    radiologies = relationship("Radiologie", back_populates="patient", cascade="all, delete-orphan")
    hospitalisations = relationship("Hospitalisation", back_populates="patient", cascade="all, delete-orphan")
    soins = relationship("SoinsInfirmier", back_populates="patient", cascade="all, delete-orphan")
    
    factures = relationship("Facture", back_populates="patient", cascade="all, delete-orphan")
    urgences = relationship("Urgence", back_populates="patient", cascade="all, delete-orphan")
    etats_cliniques = relationship("EtatClinique", back_populates="patient", cascade="all, delete-orphan")
    rendezvous = relationship("RendezVous", back_populates="patient", cascade="all, delete-orphan")
    dossier_medical = relationship("DossierMedical", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    analyses_visuelles = relationship("VisualIA", back_populates="patient", cascade="all, delete-orphan")
    analyses_ia = relationship("AnalyseIA", back_populates="patient", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="patient", cascade="all, delete-orphan")
    
    blocs_operatoires= relationship(
    "BlocOperatoire",
    back_populates="patient",
    cascade="all, delete-orphan"
)
