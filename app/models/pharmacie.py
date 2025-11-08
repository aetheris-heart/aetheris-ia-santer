from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base

class Pharmacie(Base):
    __tablename__ = "pharmacies"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)

    # 🔹 Infos médicament
    nom = Column(String, nullable=False)                     # Ex: Paracétamol
    forme = Column(String, nullable=False)                   # Comprimé, Sirop, Injection
    dosage = Column(String, nullable=True)                   # 500mg, 1g/5ml, etc.
    description = Column(Text, nullable=True)                # Notes supplémentaires

    # 🔹 Gestion des stocks
    quantite = Column(Integer, default=0)                    # Quantité disponible
    seuil_alerte = Column(Integer, default=10)               # Seuil critique pour alerte
    date_peremption = Column(DateTime, nullable=True)        # Périssable ?

    # 🔹 Traçabilité
    lot = Column(String, nullable=True)                      # Numéro de lot
    fournisseur = Column(String, nullable=True)              # Fournisseur
    prix_achat = Column(Float, nullable=True)                # Prix d’achat unitaire
    prix_vente = Column(Float, nullable=True)                # Prix de vente (optionnel)

    date_reception = Column(DateTime, default=datetime.utcnow)

    # 🔹 Suivi prescriptions (optionnel → si on relie aux patients)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    medecin_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # 🔹 Statut
    statut = Column(String, default="En stock")              # En stock, Rupture, Périmé, Réservé

    # Relations
    patient = relationship("Patient", back_populates="pharmacies", lazy="joined")
    medecin = relationship("User", back_populates="prescriptions", lazy="joined")
