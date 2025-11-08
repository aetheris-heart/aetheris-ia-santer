from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class DossierMedical(Base):
    __tablename__ = "dossiers_medicaux"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)

    # 📝 Infos médicales
    resume = Column(Text, nullable=True)               # Résumé global du dossier
    antecedents = Column(Text, nullable=True)          # Antécédents médicaux
    traitements = Column(Text, nullable=True)          # Traitements en cours
    allergies = Column(Text, nullable=True)            # Allergies connues
    notes = Column(Text, nullable=True)                # Notes internes du staff

    # 📊 Données cliniques supplémentaires
    pathologies = Column(Text, nullable=True)          # Liste des pathologies
    examens = Column(Text, nullable=True)              # Examens effectués (NFS, IRM, etc.)
    imageries = Column(Text, nullable=True)            # Radiographies, scanners, IRM
    chirurgies = Column(Text, nullable=True)           # Antécédents chirurgicaux
    vaccinations = Column(Text, nullable=True)         # Vaccinations patient
    habitudes_vie = Column(Text, nullable=True)        # Tabac, alcool, activité physique, etc.

    # 📅 Dates importantes
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ✅ Suivi & statut
    statut = Column(String, default="actif")           # actif | archivé | en cours
    est_critique = Column(Boolean, default=False)      # Pour indiquer si le dossier est critique

    # 🔗 Relations
    patient = relationship("Patient", back_populates="dossier_medical")
