from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class Ambulance(Base):
    __tablename__ = "ambulances"
    __table_args__ = {"extend_existing": True}

    # ============================================================
    # 🆔 Identité et informations générales
    # ============================================================
    id = Column(Integer, primary_key=True, index=True)
    immatriculation = Column(String(50), unique=True, nullable=False)
    etat = Column(String(50), default="Disponible")  # Disponible | En mission | Maintenance | Hors service
    chauffeur = Column(String(100), nullable=True)
    equipe = Column(String(100), nullable=True)

    # ============================================================
    # 🌍 Localisation et données GPS
    # ============================================================
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    vitesse = Column(Float, nullable=True)  # km/h
    carburant = Column(String(20), nullable=True)  # Ex: "75%" ou "Diesel"
    derniere_maj = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ============================================================
    # 🚨 Mission et activité
    # ============================================================
    mission_actuelle = Column(Text, nullable=True)
    derniere_mission = Column(DateTime, nullable=True)
    niveau_priorite = Column(String(20), default="Normale")  # Urgente / Haute / Normale
    destination = Column(String(150), nullable=True)

    # ============================================================
    # ⚙️ Liaison avec la table des urgences (optionnelle)
    # ============================================================
    urgence_id = Column(Integer, ForeignKey("urgences.id"), nullable=True)
    
    urgences_associees = relationship("Urgence", back_populates="ambulance", foreign_keys="Urgence.ambulance_id")
    # ============================================================
    # 🕒 Dates système
    # ============================================================
    date_mise_service = Column(DateTime, default=datetime.utcnow)
    date_creation = Column(DateTime, default=datetime.utcnow)
    last_update = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ============================================================
    # 🧭 Représentation lisible (utile en debug / admin)
    # ============================================================
    def __repr__(self):
        return (
            f"<Ambulance(id={self.id}, immatriculation='{self.immatriculation}', "
            f"etat='{self.etat}', chauffeur='{self.chauffeur}', "
            f"latitude={self.latitude}, longitude={self.longitude}, "
            f"mission='{self.mission_actuelle}', carburant='{self.carburant}')>"
        )
