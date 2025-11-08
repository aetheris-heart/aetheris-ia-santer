from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime

from api.database import get_db
from app.models.cardiaque import CardiaqueData
from app.models.patient import Patient
from app.models.user import User
from api.schemas.cardiaque import CardiaqueCreate, CardiaqueRead, CardiaqueUpdate
from api.routes.auth import get_current_user


router = APIRouter(
    prefix="/cardiaque",
    tags=["Fonction Cardiaque"]
)

# 🧠 Utilitaire : Vérifie que le patient existe
def get_patient_or_404(db: Session, patient_id: int) -> Patient:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"⚠️ Patient {patient_id} introuvable")
    return patient


# 🩺 1️⃣ Création d’un enregistrement cardiaque
@router.post("/{patient_id}", response_model=CardiaqueRead)
def creer_donnees_cardiaques(
    patient_id: int,
    data: CardiaqueCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Ajoute une mesure cardiaque pour un patient."""
    patient = get_patient_or_404(db, patient_id)

    try:
        cardiaque = CardiaqueData(
            patient_id=patient.id,
            frequence_cardiaque=data.frequence_cardiaque,
            rythme=data.rythme or "Sinusal",
            tension_systolique=data.tension_systolique or 120.0,
            tension_diastolique=data.tension_diastolique or 80.0,
            anomalies_detectees=data.anomalies_detectees or "Aucune",
            alerte=data.alerte or "Stable",
            created_at=datetime.utcnow()
        )
        db.add(cardiaque)
        db.commit()
        db.refresh(cardiaque)

        print(f"✅ Données cardiaques ajoutées pour patient ID {patient.id}")
        return cardiaque

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors de la création cardiaque : {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la création des données cardiaques.")


# 📈 2️⃣ Récupération de la dernière mesure cardiaque
@router.get("/{patient_id}/latest", response_model=CardiaqueRead)
def obtenir_derniere_cardiaque(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Renvoie la dernière mesure cardiaque pour un patient."""
    get_patient_or_404(db, patient_id)

    cardiaque = (
        db.query(CardiaqueData)
        .filter(CardiaqueData.patient_id == patient_id)
        .order_by(desc(CardiaqueData.created_at))
        .first()
    )

    if not cardiaque:
        raise HTTPException(status_code=404, detail="Aucune donnée cardiaque trouvée pour ce patient.")
    return cardiaque


# 📜 3️⃣ Historique complet des mesures cardiaques
@router.get("/{patient_id}", response_model=List[CardiaqueRead])
def historique_cardiaque(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Renvoie tout l’historique cardiaque du patient."""
    get_patient_or_404(db, patient_id)
    data = (
        db.query(CardiaqueData)
        .filter(CardiaqueData.patient_id == patient_id)
        .order_by(desc(CardiaqueData.created_at))
        .all()
    )

    if not data:
        raise HTTPException(status_code=404, detail="Aucun historique cardiaque trouvé.")
    return data


# ✏️ 4️⃣ Mise à jour d’une mesure cardiaque
@router.put("/{cardiaque_id}", response_model=CardiaqueRead)
def modifier_cardiaque(
    cardiaque_id: int,
    data: CardiaqueUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Met à jour une mesure cardiaque existante."""
    cardiaque = db.query(CardiaqueData).filter(CardiaqueData.id == cardiaque_id).first()
    if not cardiaque:
        raise HTTPException(status_code=404, detail="Donnée cardiaque introuvable.")

    try:
        for k, v in data.dict(exclude_unset=True).items():
            setattr(cardiaque, k, v)
        cardiaque.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(cardiaque)
        print(f"🩺 Donnée cardiaque mise à jour pour ID {cardiaque.id}")
        return cardiaque
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur update cardiaque : {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la mise à jour des données cardiaques.")


# 🗑️ 5️⃣ Suppression d’une donnée cardiaque
@router.delete("/{cardiaque_id}")
def supprimer_cardiaque(
    cardiaque_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Supprime une donnée cardiaque."""
    cardiaque = db.query(CardiaqueData).filter(CardiaqueData.id == cardiaque_id).first()
    if not cardiaque:
        raise HTTPException(status_code=404, detail="Donnée cardiaque introuvable.")

    db.delete(cardiaque)
    db.commit()
    print(f"🗑️ Donnée cardiaque supprimée : ID {cardiaque.id}")
    return {"message": f"Donnée cardiaque {cardiaque.id} supprimée avec succès."}
