from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from api.database import get_db
from api.schemas import dossier_medical as schemas
from api.routes.auth import get_current_user
from app import models

router = APIRouter(
    prefix="/dossiers",
    tags=["Dossiers Médicaux"],
    dependencies=[Depends(get_current_user)]  # ✅ Protégé par token
)

# 🟢 Créer un dossier médical manuellement
@router.post("/", response_model=schemas.DossierMedicalRead)
def create_dossier(dossier: schemas.DossierMedicalCreate, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == dossier.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    existing = db.query(models.DossierMedical).filter(models.DossierMedical.patient_id == dossier.patient_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Un dossier existe déjà pour ce patient")

    db_dossier = models.DossierMedical(**dossier.dict())
    db.add(db_dossier)
    db.commit()
    db.refresh(db_dossier)
    return db_dossier


# 🟢 Lister tous les dossiers — crée automatiquement ceux manquants
@router.get("/", response_model=List[schemas.DossierMedicalRead])
def list_dossiers(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """
    Retourne tous les dossiers médicaux.
    Si un patient n’a pas encore de dossier, il est automatiquement créé.
    """
    patients = db.query(models.Patient).all()
    dossiers = db.query(models.DossierMedical).all()

    # Indexation rapide des dossiers existants
    dossier_map = {d.patient_id: d for d in dossiers}

    for patient in patients:
        if patient.id not in dossier_map:
            new_dossier = models.DossierMedical(
                patient_id=patient.id,
                resume=f"Dossier automatique du patient {patient.prenom} {patient.nom}",
                antecedents="Non renseigné",
                traitements="Non renseigné",
                allergies="Non renseigné",
                notes="Créé automatiquement par le système Aetheris IA.",
            )
            db.add(new_dossier)
            db.commit()
            db.refresh(new_dossier)
            dossier_map[patient.id] = new_dossier

    return list(dossier_map.values())[skip: skip + limit]


# 🟢 Récupérer un dossier par ID
@router.get("/{dossier_id}", response_model=schemas.DossierMedicalRead)
def get_dossier(dossier_id: int, db: Session = Depends(get_db)):
    dossier = db.query(models.DossierMedical).filter(models.DossierMedical.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier introuvable")
    return dossier


# 🟢 Récupérer le dossier d’un patient (et le créer s’il n’existe pas)
@router.get("/patient/{patient_id}", response_model=schemas.DossierMedicalRead)
def get_dossier_by_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    dossier = db.query(models.DossierMedical).filter(models.DossierMedical.patient_id == patient_id).first()

    if not dossier:
        # Création automatique du dossier si inexistant
        dossier = models.DossierMedical(
            patient_id=patient_id,
            resume=f"Dossier créé automatiquement pour {patient.prenom} {patient.nom}",
            antecedents="Non renseigné",
            traitements="Non renseigné",
            allergies="Non renseigné",
            notes="Créé automatiquement par Aetheris IA.",
        )
        db.add(dossier)
        db.commit()
        db.refresh(dossier)

    return dossier


# 🟡 Mettre à jour un dossier
@router.put("/{dossier_id}", response_model=schemas.DossierMedicalRead)
def update_dossier(dossier_id: int, update_data: schemas.DossierMedicalUpdate, db: Session = Depends(get_db)):
    dossier = db.query(models.DossierMedical).filter(models.DossierMedical.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier introuvable")

    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(dossier, key, value)

    db.commit()
    db.refresh(dossier)
    return dossier


# 🔴 Supprimer un dossier
@router.delete("/{dossier_id}")
def delete_dossier(dossier_id: int, db: Session = Depends(get_db)):
    dossier = db.query(models.DossierMedical).filter(models.DossierMedical.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier introuvable")

    db.delete(dossier)
    db.commit()
    return {"detail": f"Dossier {dossier_id} supprimé avec succès"}
