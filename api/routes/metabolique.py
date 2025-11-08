from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime

from api.database import get_db
from app.models.metabolique import MetaboliqueData
from app.models.patient import Patient
from app.models.notification import Notification
from api.schemas.metabolique import MetaboliqueCreate, MetaboliqueRead, MetaboliqueUpdate
from app.models.user import User
from api.routes.auth import get_current_user

router = APIRouter(prefix="/metabolique", tags=["Fonction Métabolique"])


# 🧠 Analyse IA – Fonction métabolique
def analyser_metabolisme(glucose: float, insuline: float) -> dict:
    """
    Analyse IA Aetheris basée sur les valeurs de glucose et d'insuline.
    Retourne un dictionnaire avec niveau_risque, alerte et score_sante.
    """
    if glucose > 160 and insuline < 5:
        return {
            "niveau_risque": "Critique",
            "alerte": "⚠️ Hyperglycémie non compensée — risque de diabète sévère.",
            "score_sante": 25,
        }
    elif glucose > 130 or insuline < 6:
        return {
            "niveau_risque": "Élevé",
            "alerte": "Résistance à l’insuline détectée — surveillance requise.",
            "score_sante": 55,
        }
    elif 90 <= glucose <= 120 and 5 <= insuline <= 9:
        return {
            "niveau_risque": "Normal",
            "alerte": "Équilibre métabolique stable ✅",
            "score_sante": 90,
        }
    else:
        return {
            "niveau_risque": "Modéré",
            "alerte": "Légère variation métabolique — à suivre.",
            "score_sante": 70,
        }


# ⚙️ Utilitaire
def get_patient_or_404(db: Session, patient_id: int) -> Patient:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} introuvable.")
    return patient


# 📥 1️⃣ Création d'une donnée métabolique
@router.post("/{patient_id}", response_model=MetaboliqueRead)
def creer_donnee_metabolique(
    patient_id: int,
    data: MetaboliqueCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Crée une donnée métabolique et déclenche une analyse IA automatique."""
    patient = get_patient_or_404(db, patient_id)

    try:
        analyse = analyser_metabolisme(data.glucose, data.insuline)

        metabolique = MetaboliqueData(
            patient_id=patient.id,
            glucose=data.glucose,
            insuline=data.insuline,
            anomalies_detectees=analyse["alerte"],
            niveau_risque=analyse["niveau_risque"],
            score_sante=analyse["score_sante"],
            signature_ia="Aetheris IA",
            created_at=datetime.utcnow(),
        )

        db.add(metabolique)
        db.commit()
        db.refresh(metabolique)

        # 🔔 Notification IA Aetheris
        notification = Notification(
            user_id=user.id,
            patient_id=patient.id,
            titre="Alerte métabolique Aetheris IA",
            message=analyse["alerte"],
            type="alerte" if "⚠️" in analyse["alerte"] else "info",
            niveau=analyse["niveau_risque"],
            origine="Aetheris IA",
            created_at=datetime.utcnow(),
        )
        db.add(notification)
        db.commit()

        print(f"✅ Donnée métabolique créée pour patient ID {patient.id}")
        return metabolique

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur création donnée métabolique : {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création de la donnée métabolique.")


# 📤 2️⃣ Dernière donnée métabolique
@router.get("/{patient_id}/latest", response_model=MetaboliqueRead)
def derniere_donnee_metabolique(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Renvoie la dernière donnée métabolique pour un patient."""
    get_patient_or_404(db, patient_id)

    data = (
        db.query(MetaboliqueData)
        .filter(MetaboliqueData.patient_id == patient_id)
        .order_by(desc(MetaboliqueData.created_at))
        .first()
    )

    if not data:
        raise HTTPException(status_code=404, detail="Aucune donnée métabolique trouvée.")
    return data


# 📜 3️⃣ Historique complet
@router.get("/{patient_id}", response_model=List[MetaboliqueRead])
def historique_metabolique(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Renvoie tout l’historique métabolique du patient."""
    get_patient_or_404(db, patient_id)

    historiques = (
        db.query(MetaboliqueData)
        .filter(MetaboliqueData.patient_id == patient_id)
        .order_by(desc(MetaboliqueData.created_at))
        .all()
    )

    if not historiques:
        raise HTTPException(status_code=404, detail="Aucun historique métabolique trouvé.")
    return historiques


# ✏️ 4️⃣ Mise à jour d’une donnée métabolique
@router.put("/{metabolique_id}", response_model=MetaboliqueRead)
def modifier_metabolique(
    metabolique_id: int,
    data: MetaboliqueUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Met à jour une donnée métabolique et relance l’analyse IA."""
    obj = db.query(MetaboliqueData).filter(MetaboliqueData.id == metabolique_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Donnée métabolique introuvable.")

    try:
        # Réanalyse IA si valeurs changées
        glucose = data.glucose or obj.glucose
        insuline = data.insuline or obj.insuline
        analyse = analyser_metabolisme(glucose, insuline)

        obj.glucose = glucose
        obj.insuline = insuline
        obj.niveau_risque = analyse["niveau_risque"]
        obj.anomalies_detectees = analyse["alerte"]
        obj.score_sante = analyse["score_sante"]
        obj.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(obj)
        print(f"🧠 Donnée métabolique {metabolique_id} mise à jour avec analyse IA.")
        return obj

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur update métabolique : {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour de la donnée métabolique.")


# 🗑️ 5️⃣ Suppression
@router.delete("/{metabolique_id}")
def supprimer_metabolique(
    metabolique_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Supprime une donnée métabolique spécifique."""
    obj = db.query(MetaboliqueData).filter(MetaboliqueData.id == metabolique_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Donnée métabolique introuvable.")

    db.delete(obj)
    db.commit()
    print(f"🗑️ Donnée métabolique {metabolique_id} supprimée.")
    return {"message": f"Donnée métabolique {metabolique_id} supprimée avec succès."}
