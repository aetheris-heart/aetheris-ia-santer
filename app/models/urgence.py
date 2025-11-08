from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class Urgence(Base):
    __tablename__ = "urgences"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)

    # 🧍‍♂️ Informations patient
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    nom_patient = Column(String(100), nullable=False)
    prenom_patient = Column(String(100), nullable=True)
    age = Column(Integer, nullable=True)
    sexe = Column(String(10), nullable=True)

    # 🚨 Données d'urgence
    type_urgence = Column(String(120), nullable=False)  # Cardiaque, Traumatisme, etc.
    description = Column(Text, nullable=True)
    niveau_gravite = Column(String(50), default="Modérée")  # Faible, Modérée, Critique
    statut = Column(String(50), default="En attente")        # En attente, En cours, Résolue
    risque_vital = Column(Boolean, default=False)

    # 🩺 Prise en charge médicale
    medecin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    equipe = Column(String(255), nullable=True)
    moyen_transport = Column(String(100), nullable=True)  # Ambulance, Hélico, Autre
    ambulance_id = Column(Integer, ForeignKey("ambulances.id"), nullable=True)
    lieu = Column(String(255), nullable=True)

    # 🕒 Horodatage complet
    date_signalement = Column(DateTime, default=datetime.utcnow)
    date_prise_en_charge = Column(DateTime, nullable=True)
    date_arrivee = Column(DateTime, nullable=True)
    date_resolution = Column(DateTime, nullable=True)

    # 📍 Coordonnées GPS
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # 🧠 Analyse IA Aetheris
    analyse_ia = Column(Text, nullable=True)
    niveau_risque_ia = Column(String(50), nullable=True)
    recommandation_ia = Column(Text, nullable=True)

    # ==============================
    # 🔗 Relations explicites
    # ==============================
    patient = relationship("Patient", back_populates="urgences", lazy="joined", foreign_keys=[patient_id])
    medecin = relationship("User", back_populates="urgences_prises", lazy="joined", foreign_keys=[medecin_id])
    ambulance = relationship("Ambulance", back_populates="urgences_associees", lazy="joined", foreign_keys=[ambulance_id])

    # 🕰️ Traçabilité
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Urgence #{self.id} — {self.type_urgence} ({self.niveau_gravite})>"
