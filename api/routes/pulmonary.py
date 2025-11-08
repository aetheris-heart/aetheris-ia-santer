from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime

from api.database import get_db
from app.models.pulmonary import PulmonaryData
from app.models.patient import Patient
from api.schemas.pulmonary import PulmonaryCreate, PulmonaryRead, PulmonaryUpdate
from app.models.user import User
from api.routes.auth import get_current_user

router = APIRouter(prefix="/pulmonaire", tags=["Fonction Pulmonaire"])


# 🫁 Analyse IA Aetheris – Fonction pulmonaire
def analyse_ia_pulmonaire(spo2: float, frequence_respiratoire: float) -> dict:
    """
    Analyse IA Aetheris basée sur la saturation en oxygène (SpO₂)
    et la fréquence respiratoire. Retourne un dictionnaire.
    """
    if spo2 < 88 or frequence_respiratoire > 30:
        return {
            "niveau_risque": "Critique",
            "alerte": "🚨 Hypoxie sévère détectée — possible détresse respiratoire.",
            "score_sante": 25,
            "commentaire_ia": "Risque vital — intervention médicale immédiate recommandée.",
        }
    elif spo2 < 94 or frequence_respiratoire > 24:
        return {
            "niveau_risque": "Élevé",
            "alerte": "⚠️ Saturation en oxygène réduite — possible infection pulmonaire.",
            "score_sante": 55,
            "commentaire_ia": "Aetheris IA détecte une altération significative de la fonction respiratoire.",
        }
    elif 95 <= spo2 <= 100 and 12 <= frequence_respiratoire <= 20:
        return {
            "niveau_risque": "Normal",
            "alerte": "Fonction pulmonaire stable ✅",
            "score_sante": 90,
            "commentaire_ia": "Échanges gazeux efficaces, respiration dans les normes physiologiques.",
        }
    else:
        return {
            "niveau_risque": "Modéré",
            "alerte": "Variation légère de la fréquence ou de la saturation.",
            "score_sante": 70,
            "commentaire_ia": "Surveillance conseillée pour détecter une évolution pathologique éventuelle.",
        }


# ⚙️ Utilitaire : Vérification du patient
def get_patient_or_404(db: Session, patient_id: int) -> Patient:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} introuvable.")
    return patient


# 📥 1️⃣ Création d'une donnée pulmonaire
@router.post("/{patient_id}", response_model=PulmonaryRead)
def creer_donnee_pulmonaire(
    patient_id: int,
    data: PulmonaryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Crée une donnée pulmonaire et génère une analyse IA automatique."""
    patient = get_patient_or_404(db, patient_id)

    try:
        analyse = analyse_ia_pulmonaire(data.spo2, data.frequence_respiratoire)

        pulmo = PulmonaryData(
            patient_id=patient.id,
            spo2=data.spo2,
            frequence_respiratoire=data.frequence_respiratoire,
            niveau_risque=analyse["niveau_risque"],
            alerte=analyse["alerte"],
            score_sante=analyse["score_sante"],
            commentaire_ia=analyse["commentaire_ia"],
            created_at=datetime.utcnow(),
        )

        db.add(pulmo)
        db.commit()
        db.refresh(pulmo)

        print(f"✅ Donnée pulmonaire créée pour patient ID {patient.id}")
        return pulmo

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur création donnée pulmonaire : {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création des données pulmonaires.")


# 📤 2️⃣ Dernière donnée pulmonaire
@router.get("/{patient_id}/latest", response_model=PulmonaryRead)
def derniere_donnee_pulmonaire(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Récupère la dernière donnée pulmonaire enregistrée pour un patient."""
    get_patient_or_404(db, patient_id)

    data = (
        db.query(PulmonaryData)
        .filter(PulmonaryData.patient_id == patient_id)
        .order_by(desc(PulmonaryData.created_at))
        .first()
    )

    if not data:
        raise HTTPException(status_code=404, detail="Aucune donnée pulmonaire trouvée.")
    return data


# 📜 3️⃣ Historique complet
@router.get("/{patient_id}", response_model=List[PulmonaryRead])
def historique_pulmonaire(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Renvoie tout l’historique pulmonaire du patient."""
    get_patient_or_404(db, patient_id)

    historiques = (
        db.query(PulmonaryData)
        .filter(PulmonaryData.patient_id == patient_id)
        .order_by(desc(PulmonaryData.created_at))
        .all()
    )

    if not historiques:
        raise HTTPException(status_code=404, detail="Aucun historique pulmonaire trouvé.")
    return historiques


# ✏️ 4️⃣ Mise à jour d’une donnée pulmonaire
@router.put("/{pulmo_id}", response_model=PulmonaryRead)
def modifier_pulmonaire(
    pulmo_id: int,
    data: PulmonaryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Met à jour une donnée pulmonaire et relance l’analyse IA."""
    obj = db.query(PulmonaryData).filter(PulmonaryData.id == pulmo_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Donnée pulmonaire introuvable.")

    try:
        for k, v in data.dict(exclude_unset=True).items():
            setattr(obj, k, v)

        # Réanalyse IA Aetheris
        analyse = analyse_ia_pulmonaire(obj.spo2, obj.frequence_respiratoire)
        obj.niveau_risque = analyse["niveau_risque"]
        obj.alerte = analyse["alerte"]
        obj.score_sante = analyse["score_sante"]
        obj.commentaire_ia = analyse["commentaire_ia"]
        obj.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(obj)
        print(f"🫁 Donnée pulmonaire {pulmo_id} mise à jour avec analyse IA.")
        return obj

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur update pulmonaire : {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour des données pulmonaires.")


# 🗑️ 5️⃣ Suppression
@router.delete("/{pulmo_id}")
def supprimer_pulmonaire(
    pulmo_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Supprime une donnée pulmonaire spécifique."""
    obj = db.query(PulmonaryData).filter(PulmonaryData.id == pulmo_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Donnée pulmonaire introuvable.")

    db.delete(obj)
    db.commit()
    print(f"🗑️ Donnée pulmonaire {pulmo_id} supprimée.")
    return {"message": f"Donnée pulmonaire {pulmo_id} supprimée avec succès."}
