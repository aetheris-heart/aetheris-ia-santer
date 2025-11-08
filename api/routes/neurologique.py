from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime

from api.database import get_db
from app.models.neurologique import NeurologiqueData
from app.models.patient import Patient
from api.schemas.neurologique import NeurologiqueCreate, NeurologiqueRead, NeurologiqueUpdate
from app.models.user import User
from api.routes.auth import get_current_user

router = APIRouter(prefix="/neurologique", tags=["Fonction Neurologique"])


# 🧠 Analyse IA Aetheris – Fonction neurologique
def analyse_ia_neuro(eeg: float, stress_level: float) -> dict:
    """
    Analyse IA des paramètres neurologiques :
    Retourne un dict : niveau_risque, alerte, score_sante, commentaire_ia
    """
    if eeg < 40 or stress_level > 85:
        return {
            "niveau_risque": "Critique",
            "alerte": "🚨 Activité cérébrale anormale — stress neurologique majeur.",
            "score_sante": 25,
            "commentaire_ia": "Risque élevé de surcharge cognitive ou trouble neuronal aigu.",
        }
    elif eeg < 55 or stress_level > 70:
        return {
            "niveau_risque": "Élevé",
            "alerte": "⚠️ Réduction de l’activité cérébrale ou stress élevé.",
            "score_sante": 55,
            "commentaire_ia": "Aetheris IA détecte une altération modérée du système nerveux.",
        }
    elif 60 <= eeg <= 90 and stress_level <= 60:
        return {
            "niveau_risque": "Normal",
            "alerte": "Activité cérébrale stable ✅",
            "score_sante": 90,
            "commentaire_ia": "Aetheris confirme un équilibre neurophysiologique optimal.",
        }
    else:
        return {
            "niveau_risque": "Modéré",
            "alerte": "Variation légère de l’activité neuronale.",
            "score_sante": 70,
            "commentaire_ia": "Surveillance conseillée pour détecter toute évolution future.",
        }


# 🧩 Utilitaire : Vérifie que le patient existe
def get_patient_or_404(db: Session, patient_id: int) -> Patient:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} introuvable.")
    return patient


# 📥 1️⃣ Création d’une donnée neurologique
@router.post("/{patient_id}", response_model=NeurologiqueRead)
def creer_donnee_neuro(
    patient_id: int,
    data: NeurologiqueCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Crée une donnée neurologique avec analyse IA automatique."""
    patient = get_patient_or_404(db, patient_id)

    try:
        analyse = analyse_ia_neuro(data.eeg, data.stress_level)

        neuro = NeurologiqueData(
            patient_id=patient.id,
            eeg=data.eeg,
            stress_level=data.stress_level,
            niveau_risque=analyse["niveau_risque"],
            alerte=analyse["alerte"],
            score_sante=analyse["score_sante"],
            commentaire_ia=analyse["commentaire_ia"],
            created_at=datetime.utcnow(),
        )

        db.add(neuro)
        db.commit()
        db.refresh(neuro)

        print(f"✅ Donnée neurologique créée pour patient ID {patient.id}")
        return neuro

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur création neurologique : {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la création des données neurologiques.")


# 📤 2️⃣ Dernière donnée neurologique
@router.get("/{patient_id}/latest", response_model=NeurologiqueRead)
def derniere_donnee_neuro(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Récupère la dernière donnée neurologique enregistrée pour un patient."""
    get_patient_or_404(db, patient_id)

    neuro = (
        db.query(NeurologiqueData)
        .filter(NeurologiqueData.patient_id == patient_id)
        .order_by(desc(NeurologiqueData.created_at))
        .first()
    )

    if not neuro:
        raise HTTPException(status_code=404, detail="Aucune donnée neurologique trouvée.")
    return neuro


# 📜 3️⃣ Historique complet
@router.get("/{patient_id}", response_model=List[NeurologiqueRead])
def historique_neuro(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Renvoie l’historique complet des données neurologiques."""
    get_patient_or_404(db, patient_id)

    historiques = (
        db.query(NeurologiqueData)
        .filter(NeurologiqueData.patient_id == patient_id)
        .order_by(desc(NeurologiqueData.created_at))
        .all()
    )

    if not historiques:
        raise HTTPException(status_code=404, detail="Aucun historique neurologique trouvé.")
    return historiques


# ✏️ 4️⃣ Mise à jour d’une donnée neurologique
@router.put("/{neuro_id}", response_model=NeurologiqueRead)
def modifier_neuro(
    neuro_id: int,
    data: NeurologiqueUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Met à jour une donnée neurologique et relance l’analyse IA."""
    obj = db.query(NeurologiqueData).filter(NeurologiqueData.id == neuro_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Donnée neurologique introuvable.")

    try:
        for k, v in data.dict(exclude_unset=True).items():
            setattr(obj, k, v)

        # Réanalyse IA Aetheris
        analyse = analyse_ia_neuro(obj.eeg, obj.stress_level)
        obj.niveau_risque = analyse["niveau_risque"]
        obj.alerte = analyse["alerte"]
        obj.score_sante = analyse["score_sante"]
        obj.commentaire_ia = analyse["commentaire_ia"]
        obj.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(obj)
        print(f"🧠 Donnée neurologique {neuro_id} mise à jour avec analyse IA.")
        return obj

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur update neurologique : {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la mise à jour des données neurologiques.")


# 🗑️ 5️⃣ Suppression
@router.delete("/{neuro_id}")
def supprimer_neuro(
    neuro_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Supprime une donnée neurologique spécifique."""
    obj = db.query(NeurologiqueData).filter(NeurologiqueData.id == neuro_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Donnée neurologique introuvable.")

    db.delete(obj)
    db.commit()
    print(f"🗑️ Donnée neurologique {neuro_id} supprimée.")
    return {"message": f"Donnée neurologique {neuro_id} supprimée avec succès."}
