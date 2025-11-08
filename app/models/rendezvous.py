from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class RendezVous(Base):
    __tablename__ = "rendezvous"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)

    # 🧩 Liens essentiels
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    medecin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # 🩺 Informations sur le rendez-vous
    motif = Column(String(255), nullable=False)                 # Ex: "Contrôle annuel", "Consultation urgente"
    statut = Column(String(50), default="planifié", nullable=False)  # planifié / confirmé / annulé / terminé
    date_rdv = Column(DateTime, nullable=False)
    lieu = Column(String(150), nullable=True)                   # Optionnel : ex "Salle 3 - Bloc B"
    notes = Column(String(500), nullable=True)                  # Commentaires médicaux ou administratifs

    # 📅 Suivi automatique
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 🔗 Relations
    patient = relationship("Patient", back_populates="rendezvous")
    medecin = relationship("User", back_populates="rendezvous")

    def __repr__(self):
        return f"<RendezVous(id={self.id}, patient={self.patient_id}, medecin={self.medecin_id}, statut='{self.statut}', date_rdv='{self.date_rdv}')>"
