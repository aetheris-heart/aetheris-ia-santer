# app/models/bloc_operatoire.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base

class BlocOperatoire(Base):
    __tablename__ = "bloc_operatoire"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    type_intervention = Column(String, nullable=False)   
    chirurgien = Column(String, nullable=False)        

    assistant1 = Column(String, nullable=True)         
    assistant2 = Column(String, nullable=True)           
    assistant3 = Column(String, nullable=True)           
    assistant4 = Column(String, nullable=True)        

    date_intervention = Column(DateTime, default=datetime.utcnow)
    duree = Column(String, nullable=True)                
    compte_rendu = Column(Text, nullable=True)          
    statut = Column(String, default="programmé")       

    patient = relationship("Patient", back_populates="blocs_operatoires")
