from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from api.database import get_db
from app.models.consultation import Consultation
from api.schemas.consultation import ConsultationCreate, ConsultationRead, ConsultationUpdate
from app.models.user import User
from app.models.patient import Patient
from api.routes.auth import get_current_user

router = APIRouter(prefix="/consultations", tags=["Consultations"])


# Helper pour transformer un objet Consultation en ConsultationRead
def build_consultation_read(c: Consultation) -> ConsultationRead:
    return ConsultationRead(
        id=c.id,
        patient_id=c.patient_id,
        medecin_id=c.medecin_id,
        motif=c.motif,
        notes=c.notes,
        diagnostic=c.diagnostic,
        traitement=c.traitement,
        date_consultation=c.date_consultation,
        patient_nom=c.patient.nom if c.patient else None,
        patient_prenom=c.patient.prenom if c.patient else None,
        medecin_nom=c.medecin.nom if c.medecin else None,
    )


# 📥 Créer une consultation
@router.post("/", response_model=ConsultationRead)
def create_consultation(
    data: ConsultationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")

    consultation = Consultation(
        patient_id=data.patient_id,
        medecin_id=user.id,
        motif=data.motif,
        notes=data.notes,
        diagnostic=data.diagnostic,
        traitement=data.traitement,
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    # ✅ On renvoie un schéma enrichi
    return ConsultationRead(
        id=consultation.id,
        patient_id=consultation.patient_id,
        medecin_id=consultation.medecin_id,
        motif=consultation.motif,
        notes=consultation.notes,
        diagnostic=consultation.diagnostic,
        traitement=consultation.traitement,
        date_consultation=consultation.date_consultation,
        patient_nom=patient.nom,
        patient_prenom=patient.prenom,
        medecin_nom=user.nom
    )


# 📤 Liste des consultations
@router.get("/", response_model=List[ConsultationRead])
def list_consultations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    consultations = db.query(Consultation).all()
    return [build_consultation_read(c) for c in consultations]


# 📤 Consultation par ID
@router.get("/{consultation_id}", response_model=ConsultationRead)
def get_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    c = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Consultation non trouvée")

    return build_consultation_read(c)


# ✏️ Modifier une consultation
@router.put("/{consultation_id}", response_model=ConsultationRead)
def update_consultation(
    consultation_id: int,
    data: ConsultationUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    c = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Consultation non trouvée")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(c, key, value)

    db.commit()
    db.refresh(c)

    return build_consultation_read(c)


# 🗑️ Supprimer une consultation
@router.delete("/{consultation_id}", response_model=dict)
def delete_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    c = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Consultation non trouvée")

    db.delete(c)
    db.commit()

    # ✅ On retourne un message clair et l'ID supprimé
    return {
        "message": "Consultation supprimée avec succès",
        "id": consultation_id
    }
