from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base

class Biologie(Base):
    __tablename__ = "biologies"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    # Infos générales
    type_analyse = Column(String, nullable=False)          # Ex: "Glycémie", "NFS", "PCR"
    categorie = Column(String, default="Sang")             # Sang, Urine, Sérologie, Liquide céphalo-rachidien
    sous_categorie = Column(String, nullable=True)         # Biochimie, Hématologie, Microbiologie, Immunologie

    # Résultats
    resultats = Column(JSON, default={})                   # {"Glucose": "1.1 g/L", "Hémoglobine": "13 g/dL"}
    interpretation = Column(Text, nullable=True)           # Conclusion médicale
    fichier_url = Column(String, nullable=True)            # Fichier PDF ou image du compte rendu

    # Dates
    date_prescription = Column(DateTime, default=datetime.utcnow)  # Prescription du médecin
    date_prelevement = Column(DateTime, default=datetime.utcnow)   # Date prélèvement
    date_validation = Column(DateTime, nullable=True)              # Validation finale par biologiste

    # Utilisateurs impliqués
    prescripteur = Column(String, nullable=True)           # Médecin prescripteur
    effectue_par = Column(String, nullable=True)           # Infirmier préleveur
    laborantin = Column(String, nullable=True)             # Biologiste validateur

    # Statut
    etat = Column(String, default="En attente")            # En attente, En cours, Terminé, Validé, Urgent, Anormal

    # Relation patient
    patient = relationship("Patient", back_populates="biologies")
