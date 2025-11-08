from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class Finance(Base):
    __tablename__ = "finance"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    type_operation = Column(String(50), nullable=False)  # "revenu" / "dépense"
    categorie = Column(String(100), nullable=True)       # "consultation", "pharmacie", "salaire", etc.
    description = Column(Text, nullable=True)

    montant_ht = Column(Float, nullable=False, default=0.0)
    taxe = Column(Float, nullable=False, default=0.0)
    montant_total = Column(Float, nullable=False, default=0.0)

    date_operation = Column(DateTime, default=datetime.utcnow)
    moyen_paiement = Column(String(50), nullable=True)   # "carte", "espèces", "virement", etc.
    statut = Column(String(50), default="enregistré")    # "en attente", "validé", "annulé"

    # Liens avec d’autres tables (optionnels)
    facture_id = Column(Integer, ForeignKey("factures.id"), nullable=True)
    medecin_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    facture = relationship("Facture", backref="transactions_finance")
    medecin = relationship("User", backref="operations_finance")

    def __repr__(self):
        return f"<Finance(type={self.type_operation}, montant={self.montant_total})>"
