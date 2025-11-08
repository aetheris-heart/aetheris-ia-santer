import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from api.database import get_db
from app.models.patient_critique import PatientCritique
from app.models.patient import Patient
from api.schemas.patient_critique import (
    PatientCritiqueCreate,
    PatientCritiqueRead,
    PatientCritiqueUpdate,
)
from app.models.user import User
from api.routes.auth import get_current_user
from services.aetheris_ia import AetherisIA
from api.schemas.patient_critique import DossierCritiqueRead
from app.models.etat_clinique import EtatClinique
from api.schemas.patient_critique import DossierCritiqueRead, EtatCliniqueRead
from datetime import datetime
router = APIRouter(prefix="/patients-critiques", tags=["Patients Critiques"])


# 📥 Ajouter un patient critique
@router.post("/{patient_id}", response_model=PatientCritiqueRead)
def ajouter_patient_critique(
    patient_id: int,
    data: PatientCritiqueCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")

    obj = PatientCritique(patient_id=patient_id, **data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


# 📤 Liste de tous les patients critiques
@router.get("/", response_model=List[PatientCritiqueRead])
def list_patients_critiques(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.query(PatientCritique).order_by(desc(PatientCritique.created_at)).all()


# 📤 Détails d’un patient critique
@router.get("/{critique_id}", response_model=PatientCritiqueRead)
def get_patient_critique(
    critique_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    obj = db.query(PatientCritique).filter(PatientCritique.id == critique_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Patient critique introuvable")
    return obj


# ✏️ Mise à jour
@router.put("/{critique_id}", response_model=PatientCritiqueRead)
def update_patient_critique(
    critique_id: int,
    data: PatientCritiqueUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    obj = db.query(PatientCritique).filter(PatientCritique.id == critique_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Patient critique introuvable")

    for k, v in data.dict(exclude_unset=True).items():
        setattr(obj, k, v)

    db.commit()
    db.refresh(obj)
    return obj


# 🗑️ Supprimer
@router.delete("/{critique_id}")
def delete_patient_critique(
    critique_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    obj = db.query(PatientCritique).filter(PatientCritique.id == critique_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Patient critique introuvable")

    db.delete(obj)
    db.commit()
    return {"message": "Patient critique supprimé"}

@router.get("/{patient_id}/dossier")
def get_dossier_patient_critique(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    critique = (
        db.query(PatientCritique)
        .filter(PatientCritique.patient_id == patient_id)
        .order_by(PatientCritique.created_at.desc())
        .first()
    )

    etats = (
        db.query(EtatClinique)
        .filter(EtatClinique.patient_id == patient_id)
        .order_by(EtatClinique.created_at.desc())
        .limit(50)
        .all()
    )

    return {
        "id": patient.id,
        "nom": patient.nom,
        "prenom": patient.prenom,
        "age": getattr(patient, "age", None),
        "email": getattr(patient, "email", ""),
        "telephone": getattr(patient, "telephone", ""),
        "adresse": getattr(patient, "adresse", ""),
        "pathologies": getattr(patient, "pathologies", ""),
        "traitements": getattr(patient, "traitements", ""),
        "observations": "",
        "alertes": [critique.raison] if critique else [],
        "date_creation": getattr(patient, "date_creation", datetime.utcnow()),
        "analyse_ia": "Analyse IA à venir...",
        "etat_clinique": etats,
    }

@router.get("/{patient_id}/etat-clinique", response_model=List[EtatCliniqueRead])
def get_etat_clinique_patient_critique(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")

    etats = (
        db.query(EtatClinique)
        .filter(EtatClinique.patient_id == patient_id)
        .order_by(EtatClinique.created_at.desc())
        .limit(50)  # on prend les 50 dernières mesures
        .all()
    )

    return list(reversed(etats)) 