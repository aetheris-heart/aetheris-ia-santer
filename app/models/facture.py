from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class Facture(Base):
    __tablename__ = "factures"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)

    # 🔗 Liens avec patient et médecin
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medecin_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # 💰 Infos financières
    numero_facture = Column(String, unique=True, index=True, nullable=False)   # ex: FAC-2025-0001
    montant_ht = Column(Float, nullable=False)   # Montant HT
    taxe = Column(Float, default=0.0)            # TVA ou taxe
    montant_total = Column(Float, nullable=False)  # Montant TTC

    statut = Column(
        String, 
        default="en attente"
    )  # en attente | payé | partiel | annulé

    methode_paiement = Column(
        String, 
        nullable=True
    )  # CB, Espèces, Virement, Assurance
    
    reference_paiement = Column(
        String, 
        nullable=True, 
        unique=True
    )  # N° transaction (évite doublons paiements)

    # 📄 Infos supplémentaires
    description = Column(String, nullable=True)      
    notes_internes = Column(String, nullable=True)   # Staff only

    # 📅 Dates
    date_emission = Column(DateTime, default=datetime.utcnow, index=True)
    date_echeance = Column(DateTime, nullable=True)  
    date_paiement = Column(DateTime, nullable=True)

    # 🧾 Relations
    patient = relationship("Patient", back_populates="factures")
    medecin = relationship("User", lazy="joined")  # médecin lié
