from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime

from api.database import get_db
from app.models.digestive import DigestiveData
from app.models.patient import Patient
from api.schemas.digestive import DigestiveCreate, DigestiveRead, DigestiveUpdate
from app.models.user import User
from api.routes.auth import get_current_user

router = APIRouter(prefix="/digestive", tags=["Fonction Digestive"])

# 🧠 Analyse IA Aetheris – Fonction digestive
def analyse_ia_digestive(acidite: float, motricite: float, inflammation: float):
    """
    Analyse IA automatique de la fonction digestive :
    renvoie (niveau_risque, score_sante, alerte, commentaire)
    """
    # 🔢 Calcul du score global de santé digestive
    score = max(0, min(100,
        100
        - abs(acidite - 7.0) * 10
        - (100 - motricite) * 0.4
        - inflammation * 0.3
    ))

    if score >= 85:
        return "Normal", round(score, 1), None, "Fonction digestive stable et équilibrée."
    elif score >= 65:
        return (
            "Modéré",
            round(score, 1),
            "Surveillance recommandée — variations motrices légères.",
            "Aetheris IA détecte un déséquilibre mineur.",
        )
    elif score >= 45:
        return (
            "Élevé",
            round(score, 1),
            "⚠️ Hyperacidité ou inflammation digestive suspectée.",
            "Investigation gastro-intestinale recommandée.",
        )
    else:
        return (
            "Critique",
            round(score, 1),
            "🚨 Risque élevé d’ulcération ou d’inflammation chronique.",
            "Dysfonction digestive sévère détectée par Aetheris IA.",
        )


# ⚙️ Fonction utilitaire
def get_patient_or_404(db: Session, patient_id: int) -> Patient:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} introuvable.")
    return patient


# 📥 1️⃣ Création d'une donnée digestive
@router.post("/{patient_id}", response_model=DigestiveRead)
def creer_donnee_digestive(
    patient_id: int,
    data: DigestiveCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Crée une nouvelle donnée digestive avec analyse IA automatique."""
    patient = get_patient_or_404(db, patient_id)

    try:
        risque, score, alerte, commentaire = analyse_ia_digestive(
            data.acidite, data.motricite, data.inflammation
        )

        digestive = DigestiveData(
            patient_id=patient.id,
            acidite=data.acidite,
            motricite=data.motricite,
            inflammation=data.inflammation,
            niveau_risque=risque,
            score_sante=score,
            alerte=alerte,
            commentaire_ia=commentaire,
            created_at=datetime.utcnow(),
        )

        db.add(digestive)
        db.commit()
        db.refresh(digestive)

        print(f"✅ Donnée digestive créée pour patient ID {patient.id}")
        return digestive

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur création donnée digestive : {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la création des données digestives.")


# 📤 2️⃣ Récupération de la dernière donnée
@router.get("/{patient_id}/latest", response_model=DigestiveRead)
def derniere_donnee_digestive(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Récupère la dernière donnée digestive enregistrée pour un patient."""
    get_patient_or_404(db, patient_id)

    data = (
        db.query(DigestiveData)
        .filter(DigestiveData.patient_id == patient_id)
        .order_by(desc(DigestiveData.created_at))
        .first()
    )

    if not data:
        raise HTTPException(status_code=404, detail="Aucune donnée digestive trouvée.")
    return data


# 📜 3️⃣ Historique complet du patient
@router.get("/{patient_id}", response_model=List[DigestiveRead])
def historique_digestif(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Renvoie tout l’historique digestif du patient."""
    get_patient_or_404(db, patient_id)
    historiques = (
        db.query(DigestiveData)
        .filter(DigestiveData.patient_id == patient_id)
        .order_by(desc(DigestiveData.created_at))
        .all()
    )

    if not historiques:
        raise HTTPException(status_code=404, detail="Aucun historique digestif trouvé.")
    return historiques


# ✏️ 4️⃣ Mise à jour d’une donnée digestive
@router.put("/{digestive_id}", response_model=DigestiveRead)
def modifier_digestive(
    digestive_id: int,
    data: DigestiveUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Met à jour une donnée digestive et relance l’analyse IA."""
    obj = db.query(DigestiveData).filter(DigestiveData.id == digestive_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Donnée digestive introuvable.")

    try:
        for key, value in data.dict(exclude_unset=True).items():
            setattr(obj, key, value)

        # Mise à jour IA dynamique
        risque, score, alerte, commentaire = analyse_ia_digestive(
            obj.acidite, obj.motricite, obj.inflammation
        )
        obj.niveau_risque = risque
        obj.score_sante = score
        obj.alerte = alerte
        obj.commentaire_ia = commentaire
        obj.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(obj)
        print(f"🧠 Donnée digestive {digestive_id} mise à jour avec analyse IA.")
        return obj

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur update digestive : {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la mise à jour des données digestives.")


# 🗑️ 5️⃣ Suppression
@router.delete("/{digestive_id}")
def supprimer_digestive(
    digestive_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Supprime une donnée digestive spécifique."""
    obj = db.query(DigestiveData).filter(DigestiveData.id == digestive_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Donnée digestive introuvable.")

    db.delete(obj)
    db.commit()
    print(f"🗑️ Donnée digestive {digestive_id} supprimée.")
    return {"message": f"Donnée digestive {digestive_id} supprimée avec succès."}
