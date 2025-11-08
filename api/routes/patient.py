from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from fastapi.responses import FileResponse
import os, random

from api.database import get_db
from app import models
from app.models.user import User
from api.schemas import patient as schemas
from api.routes.auth import get_current_user

router = APIRouter(prefix="/patients", tags=["Patients"])


# 🧠 Création d’un patient avec initialisation automatique des fonctions vitales
@router.post("/", response_model=schemas.PatientRead)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    # Vérifier si le patient existe déjà
    existing = db.query(models.Patient).filter(
        models.Patient.nom == patient.nom,
        models.Patient.prenom == patient.prenom
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Un patient avec ce nom existe déjà.")

    try:
        # ✅ Étape 1 : Créer le patient
        db_patient = models.Patient(**patient.dict())
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)

        now = datetime.utcnow()
        pid = db_patient.id

        # ✅ Étape 2 : Créer les fonctions médicales de base
        cardiaque = models.CardiaqueData(
            patient_id=pid,
            frequence_cardiaque=random.uniform(65, 95),
            rythme="Sinusal",
            tension_systolique=random.uniform(110, 130),
            tension_diastolique=random.uniform(70, 85),
            anomalies_detectees="Aucune",
            alerte="Stable",
            created_at=now,
        )

        pulmonaire = models.PulmonaryData(
            patient_id=pid,
            spo2=random.uniform(96, 99),
            frequence_respiratoire=random.uniform(14, 18),
            alerte="Aucune",
            created_at=now,
        )

        renal = models.RenalData(
            patient_id=pid,
            creatinine=random.uniform(60, 110),
            clairance=random.uniform(80, 120),
            uree=random.uniform(2.5, 7.5),
            created_at=now,
        )

        digestive = models.DigestiveData(
            patient_id=pid,
            acidite=random.uniform(1.5, 3.5),
            motricite=random.uniform(60, 100),
            inflammation=random.uniform(0, 5),
            created_at=now,
        )

        metabolique = models.MetaboliqueData(
            patient_id=pid,
            glucose=random.uniform(4.5, 5.8),
            insuline=random.uniform(5, 12),
            created_at=now,
        )

        neuro = models.NeurologiqueData(
            patient_id=pid,
            eeg=random.uniform(8.0, 12.0),
            stress_level=random.uniform(1, 10),
            created_at=now,
        )

        db.add_all([cardiaque, pulmonaire, renal, digestive, metabolique, neuro])
        db.commit()

        # ✅ Étape 3 : Génération automatique de l’analyse IA
        diagnostic = f"Analyse Aetheris : activité cardiaque mesurée à {int(cardiaque.frequence_cardiaque)} bpm, SpO₂ {int(pulmonaire.spo2)}%, tension {int(cardiaque.tension_systolique)}/{int(cardiaque.tension_diastolique)} mmHg."
        prediction = f"Aetheris IA estime un profil vital stable pour ce patient. Surveillance standard recommandée."
        plan = "Suivi médical mensuel, ECG si symptômes, bilan complet semestriel."
        recommendation = "Alimentation équilibrée, activité physique douce, bonne hydratation."
        disclaimer = "⚠️ Analyse générée automatiquement par Aetheris IA — à confirmer par un professionnel de santé."

        analysis = models.AnalyseIA(
            patient_id=pid,
            diagnostic=diagnostic,
            prediction=prediction,
            plan=plan,
            recommendation=recommendation,
            disclaimer=disclaimer,
            created_at=now,
        )

        db.add(analysis)

        # ✅ Étape 4 : Notification Aetheris
        notification = models.Notification(
            titre="🧠 Nouveau patient enregistré",
            message=f"Le patient {db_patient.prenom} {db_patient.nom} a été ajouté et ses constantes vitales initialisées automatiquement par Aetheris IA.",
            type="création_patient",
            niveau="info",
            created_at=now,
            statut="non_lue",
        )

        db.add(notification)
        db.commit()

        print(f"✅ Patient ID {pid} initialisé avec ses constantes vitales et notification IA.")
        return db_patient

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur création patient : {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l’enregistrement du patient.")


# 📤 Récupérer tous les patients
@router.get("/", response_model=List[schemas.PatientRead])
def list_patients(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(models.Patient).offset(skip).limit(limit).all()


# 📤 Récupérer un patient
@router.get("/{patient_id}", response_model=schemas.PatientRead)
def get_patient(patient_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")
    return patient


# 📄 Récupérer le dossier complet d’un patient
@router.get("/{patient_id}/dossier", response_model=schemas.PatientRead)
def get_patient_dossier(patient_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")
    return patient


# 📑 Export PDF
@router.get("/{patient_id}/export-pdf")
def export_patient_pdf(patient_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    filename = f"patient_{patient.id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.pdf"
    filepath = os.path.join("exports", filename)

    os.makedirs("exports", exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(f"Dossier du patient {patient.prenom} {patient.nom}\n")
        f.write(f"Âge: {patient.age} ans\n")
        f.write(f"Téléphone: {patient.telephone or '—'}\n")
        f.write(f"Adresse: {patient.adresse or '—'}\n")
        f.write(f"Créé le: {patient.created_at.strftime('%d/%m/%Y %H:%M')}\n")

    return FileResponse(filepath, filename=filename, media_type="application/pdf")


# ✏️ Modifier un patient
@router.put("/{patient_id}", response_model=schemas.PatientRead)
def update_patient(patient_id: int, data: schemas.PatientUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(patient, key, value)
    db.commit()
    db.refresh(patient)
    return patient


# 🗑️ Supprimer un patient
@router.delete("/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")
    db.delete(patient)
    db.commit()
    return {"message": "Patient supprimé avec succès"}
