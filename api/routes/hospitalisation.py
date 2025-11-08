from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from api.database import get_db
from app.models.hospitalisation import Hospitalisation
from app.models.patient import Patient
from app.models.user import User
from api.schemas.hospitalisation import (
    HospitalisationCreate,
    HospitalisationRead,
    HospitalisationUpdate,
)
from api.routes.auth import get_current_user


router = APIRouter(prefix="/hospitalisations", tags=["Hospitalisations"])


# =============================
# Helper
# =============================
def build_hospitalisation_read(h: Hospitalisation) -> HospitalisationRead:
    return HospitalisationRead(
        id=h.id,
        patient_id=h.patient_id,
        medecin_id=h.medecin_id,
        service=h.service,
        chambre=h.chambre,
        lit=h.lit,
        motif=h.motif,
        observations=h.observations,
        statut=h.statut,
        date_entree=h.date_entree,
        date_sortie=h.date_sortie,
        patient_nom=h.patient.nom if h.patient else None,
        patient_prenom=h.patient.prenom if h.patient else None,
        medecin_nom=h.medecin.nom if h.medecin else None,
    )


# 📥 Créer une hospitalisation
@router.post("/", response_model=HospitalisationRead)
def creer_hospitalisation(
    data: HospitalisationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    print("📥 Nouvelle hospitalisation reçue :", data.dict())
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")

    hosp = Hospitalisation(
        patient_id=data.patient_id,
        medecin_id=user.id,
        service=data.service,
        chambre=data.chambre,
        lit=data.lit,
        motif=data.motif,
        observations=data.observations,
        statut=data.statut or "en cours",
    )
    db.add(hosp)
    db.commit()
    db.refresh(hosp)

    return build_hospitalisation_read(hosp)


# 📤 Liste des hospitalisations (tous patients)
@router.get("/", response_model=List[HospitalisationRead])
def list_all_hospitalisations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    hospitalisations = db.query(Hospitalisation).order_by(desc(Hospitalisation.date_entree)).all()
    return [build_hospitalisation_read(h) for h in hospitalisations]


# 📤 Liste des hospitalisations d’un patient
@router.get("/patient/{patient_id}", response_model=List[HospitalisationRead])
def list_hospitalisations_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    hospitalisations = (
        db.query(Hospitalisation)
        .filter(Hospitalisation.patient_id == patient_id)
        .order_by(desc(Hospitalisation.date_entree))
        .all()
    )
    return [build_hospitalisation_read(h) for h in hospitalisations]


# 📤 Détail d’une hospitalisation
@router.get("/{hosp_id}", response_model=HospitalisationRead)
def get_hospitalisation(
    hosp_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    hosp = db.query(Hospitalisation).filter(Hospitalisation.id == hosp_id).first()
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospitalisation introuvable")
    return build_hospitalisation_read(hosp)


# ✏️ Mise à jour
@router.put("/{hosp_id}", response_model=HospitalisationRead)
def update_hospitalisation(
    hosp_id: int,
    data: HospitalisationUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    hosp = db.query(Hospitalisation).filter(Hospitalisation.id == hosp_id).first()
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospitalisation introuvable")

    for k, v in data.dict(exclude_unset=True).items():
        setattr(hosp, k, v)

    db.commit()
    db.refresh(hosp)
    return build_hospitalisation_read(hosp)


# 🗑️ Supprimer
@router.delete("/{hosp_id}")
def delete_hospitalisation(
    hosp_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    hosp = db.query(Hospitalisation).filter(Hospitalisation.id == hosp_id).first()
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospitalisation introuvable")

    db.delete(hosp)
    db.commit()
    return {"message": "Hospitalisation supprimée", "id": hosp_id}
