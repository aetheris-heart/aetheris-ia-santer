from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class AetherisChat(Base):
    __tablename__ = "aetheris_chat"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)   # médecin / soignant
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)  # optionnel
    role = Column(String, nullable=False)       # "user" ou "aetheris"
    message = Column(Text, nullable=False)      # contenu du message
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    patient = relationship("Patient")
