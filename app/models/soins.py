from __future__ import annotations
from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship, Mapped
from api.database import Base


class SoinsInfirmier(Base):
    __tablename__ = "soins_infirmiers"
    __table_args__ = (
        Index("idx_soins_patient_date", "patient_id", "date"),
        Index("idx_soins_type", "type_soin"),
        {"extend_existing": True},  # ⚠️ doit être en dernier
    )

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)

    patient_id: Mapped[int] = Column(Integer, ForeignKey("patients.id"), nullable=False)

    type_soin: Mapped[str] = Column(String, nullable=False)
    acte: Mapped[str | None] = Column(String, nullable=True)
    observations: Mapped[str | None] = Column(Text, nullable=True)
    effectue_par: Mapped[str | None] = Column(String, nullable=True)

    date: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="soins")

    def __repr__(self) -> str:
        return f"<Soin #{self.id} patient={self.patient_id} type={self.type_soin} date={self.date.isoformat()}>"
