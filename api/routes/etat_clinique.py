from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from api.database import get_db
from app.models.patient import Patient
from app.models.etat_clinique import EtatClinique
from app.models.patient_critique import PatientCritique
from api.schemas.etat_clinique import (
    EtatCliniqueCreate,
    EtatCliniqueRead,
    EtatCliniqueUpdate,
)
from app.models.user import User
from api.routes.auth import get_current_user

router = APIRouter(prefix="/etatclinique", tags=["État Clinique"])


# ⚡ Vérification et mise à jour des patients critiques
def evaluer_patient_critique(
    db: Session, patient_id: int, spo2: float, temperature: float, rythme_cardiaque: int
):
    raisons = []
    niveau_risque = 0.0

    if spo2 is not None and spo2 < 90:
        raisons.append("SpO₂ < 90% (hypoxémie)")
        niveau_risque = max(niveau_risque, 0.9)

    if temperature is not None and temperature > 39:
        raisons.append("Fièvre critique > 39°C")
        niveau_risque = max(niveau_risque, 0.7)

    if rythme_cardiaque is not None and rythme_cardiaque > 120:
        raisons.append("Tachycardie > 120 bpm")
        niveau_risque = max(niveau_risque, 0.8)

    if rythme_cardiaque is not None and rythme_cardiaque < 40:
        raisons.append("Bradycardie sévère < 40 bpm")
        niveau_risque = max(niveau_risque, 0.85)

    # ⚠️ Si pas de raison → retirer du suivi critique
    if not raisons:
        crit = db.query(PatientCritique).filter(PatientCritique.patient_id == patient_id).first()
        if crit:
            db.delete(crit)
            db.commit()
        return

    # ⚠️ Sinon → créer ou mettre à jour
    crit = db.query(PatientCritique).filter(PatientCritique.patient_id == patient_id).first()
    if crit:
        crit.raison = ", ".join(raisons)
        crit.niveau_risque = niveau_risque
        crit.statut = "critique"
        crit.created_at = datetime.utcnow()
    else:
        crit = PatientCritique(
            patient_id=patient_id,
            raison=", ".join(raisons),
            niveau_risque=niveau_risque,
            statut="critique",
            created_at=datetime.utcnow(),
        )
        db.add(crit)

    db.commit()


# 📥 Ajouter un état clinique
@router.post("/{patient_id}", response_model=EtatCliniqueRead)
def ajouter_etat_clinique(
    patient_id: int,
    data: EtatCliniqueCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")

    etat = EtatClinique(patient_id=patient_id, **data.dict())
    db.add(etat)
    db.commit()
    db.refresh(etat)

    # ⚡ Évaluation automatique
    evaluer_patient_critique(db, patient_id, data.spo2, data.temperature, data.rythme_cardiaque)

    return etat


# 📤 Tous les états cliniques d’un patient
@router.get("/{patient_id}", response_model=List[EtatCliniqueRead])
def get_etats_cliniques(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.query(EtatClinique).filter(EtatClinique.patient_id == patient_id).all()


# ✏️ Mise à jour
@router.put("/{etat_id}", response_model=EtatCliniqueRead)
def update_etat_clinique(
    etat_id: int,
    data: EtatCliniqueUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    etat = db.query(EtatClinique).filter(EtatClinique.id == etat_id).first()
    if not etat:
        raise HTTPException(status_code=404, detail="État clinique introuvable")

    for k, v in data.dict(exclude_unset=True).items():
        setattr(etat, k, v)

    db.commit()
    db.refresh(etat)

    # ⚡ Réévaluation critique après update
    evaluer_patient_critique(db, etat.patient_id, etat.spo2, etat.temperature, etat.rythme_cardiaque)

    return etat


# 🗑️ Supprimer
@router.delete("/{etat_id}")
def delete_etat_clinique(
    etat_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    etat = db.query(EtatClinique).filter(EtatClinique.id == etat_id).first()
    if not etat:
        raise HTTPException(status_code=404, detail="État clinique introuvable")

    db.delete(etat)
    db.commit()
    return {"message": "État clinique supprimé"}


# 📤 Derniers états cliniques d’un patient
@router.get("/patient/{patient_id}", response_model=List[EtatCliniqueRead])
def get_etat_clinique_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    return (
        db.query(EtatClinique)
        .filter(EtatClinique.patient_id == patient_id)
        .order_by(EtatClinique.created_at.desc())
        .limit(50)
        .all()
    )
