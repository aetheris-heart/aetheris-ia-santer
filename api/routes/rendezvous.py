from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from api.database import get_db
from app.models.rendezvous import RendezVous
from api.schemas.rendezvous import RendezVousCreate, RendezVousRead, RendezVousUpdate
from app.models.user import User
from api.routes.auth import get_current_user

router = APIRouter(prefix="/rendezvous", tags=["Rendez-vous"])


# 🟢 Créer un rendez-vous
@router.post("/", response_model=RendezVousRead)
def create_rendezvous(
    data: RendezVousCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    from app.models.patient import Patient
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    rdv = RendezVous(
        patient_id=data.patient_id,
        medecin_id=user.id,
        motif=data.motif,
        statut=data.statut or "planifié",
        date_rdv=data.date_rdv,
        lieu=getattr(data, "lieu", None),
        notes=getattr(data, "notes", None),
    )
    db.add(rdv)
    db.commit()
    db.refresh(rdv)
    return rdv


# 🟣 Liste globale des rendez-vous
@router.get("/", response_model=List[RendezVousRead])
def list_rendezvous(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(RendezVous).order_by(RendezVous.date_rdv.desc()).all()


# 🔵 Liste des rendez-vous d’un patient
@router.get("/patient/{patient_id}", response_model=List[RendezVousRead])
def list_rendezvous_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    rdvs = (
        db.query(RendezVous)
        .filter(RendezVous.patient_id == patient_id)
        .order_by(RendezVous.date_rdv.desc())
        .all()
    )
    if not rdvs:
        raise HTTPException(status_code=404, detail="Aucun rendez-vous trouvé pour ce patient")
    return rdvs


# 🟠 Liste des rendez-vous d’un médecin
@router.get("/medecin/{medecin_id}", response_model=List[RendezVousRead])
def list_rendezvous_medecin(
    medecin_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    rdvs = (
        db.query(RendezVous)
        .filter(RendezVous.medecin_id == medecin_id)
        .order_by(RendezVous.date_rdv.desc())
        .all()
    )
    if not rdvs:
        raise HTTPException(status_code=404, detail="Aucun rendez-vous trouvé pour ce médecin")
    return rdvs


# 🔍 Détail d’un rendez-vous
@router.get("/{rdv_id}", response_model=RendezVousRead)
def get_rendezvous(
    rdv_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    rdv = db.query(RendezVous).filter(RendezVous.id == rdv_id).first()
    if not rdv:
        raise HTTPException(status_code=404, detail="Rendez-vous introuvable")
    return rdv


# ✏️ Modifier un rendez-vous
@router.put("/{rdv_id}", response_model=RendezVousRead)
def update_rendezvous(
    rdv_id: int,
    data: RendezVousUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    rdv = db.query(RendezVous).filter(RendezVous.id == rdv_id).first()
    if not rdv:
        raise HTTPException(status_code=404, detail="Rendez-vous introuvable")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(rdv, key, value)

    rdv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(rdv)
    return rdv


# 🗑️ Supprimer un rendez-vous
@router.delete("/{rdv_id}")
def delete_rendezvous(
    rdv_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    rdv = db.query(RendezVous).filter(RendezVous.id == rdv_id).first()
    if not rdv:
        raise HTTPException(status_code=404, detail="Rendez-vous introuvable")

    db.delete(rdv)
    db.commit()
    return {"message": "Rendez-vous supprimé avec succès"}
