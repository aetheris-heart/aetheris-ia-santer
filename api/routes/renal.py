from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Any
from datetime import datetime

from api.database import get_db
from app.models.renal import RenalData
from app.models.patient import Patient
from app.models.user import User
from api.routes.auth import get_current_user
from api.schemas.renal import RenalCreate, RenalRead, RenalUpdate

router = APIRouter(prefix="/renal", tags=["Fonction Rénale"])


# 🧠 Analyse IA Aetheris — Fonction rénale
def analyse_ia_renale(creatinine: float, filtration: float = None, uree: float = None) -> Dict[str, Any]:
    """
    Analyse IA de la fonction rénale basée sur les valeurs cliniques.
    Retourne un dict : niveau_risque, alerte, score_sante, commentaire_ia
    """
    niveau_risque = "Normal"
    alerte = "Fonction rénale stable ✅"
    score_sante = 100
    commentaire = ""

    # ⚠️ Analyse de la créatinine
    if creatinine is not None:
        if creatinine > 1.3:
            niveau_risque = "Élevé"
            alerte = "⚠️ Créatinine élevée — possible insuffisance rénale."
            score_sante -= 30
        elif creatinine < 0.7:
            niveau_risque = "Modéré"
            alerte = "ℹ️ Créatinine basse — possible déshydratation."
            score_sante -= 10

    # 💧 Analyse de la filtration glomérulaire
    if filtration is not None:
        if filtration < 60:
            niveau_risque = "Critique"
            alerte = "🚨 Filtration glomérulaire très basse — risque de défaillance rénale."
            score_sante -= 50
        elif filtration < 80:
            niveau_risque = "Élevé"
            alerte = "⚠️ Filtration glomérulaire réduite — fonction rénale altérée."
            score_sante -= 25

    # 🧪 Analyse de l’urée (si présente)
    if uree is not None:
        if uree > 45:
            niveau_risque = "Élevé"
            alerte = "⚠️ Urée sanguine élevée — trouble métabolique suspecté."
            score_sante -= 20

    # 🩺 Synthèse IA
    score_sante = max(0, min(100, score_sante))
    commentaire = (
        f"Analyse automatique Aetheris IA réalisée le "
        f"{datetime.now().strftime('%d/%m/%Y à %H:%M')}."
    )

    return {
        "niveau_risque": niveau_risque,
        "alerte": alerte,
        "score_sante": score_sante,
        "commentaire_ia": commentaire,
    }


# ⚙️ Vérifie si le patient existe
def get_patient_or_404(db: Session, patient_id: int) -> Patient:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} introuvable.")
    return patient


# 📥 1️⃣ Création d’une donnée rénale
@router.post("/{patient_id}", response_model=RenalRead)
def creer_renal(
    patient_id: int,
    data: RenalCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Crée une donnée rénale et exécute une analyse IA automatique."""
    patient = get_patient_or_404(db, patient_id)

    try:
        analyse = analyse_ia_renale(data.creatinine, data.filtration_glomerulaire, getattr(data, "uree", None))

        renal = RenalData(
            patient_id=patient.id,
            creatinine=data.creatinine,
            filtration_glomerulaire=data.filtration_glomerulaire,
            uree=getattr(data, "uree", None),
            niveau_risque=analyse["niveau_risque"],
            alerte=analyse["alerte"],
            score_sante=analyse["score_sante"],
            commentaire_ia=analyse["commentaire_ia"],
            created_at=datetime.utcnow(),
        )

        db.add(renal)
        db.commit()
        db.refresh(renal)

        print(f"✅ Donnée rénale créée pour patient ID {patient.id}")
        return renal

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur création donnée rénale : {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création de la donnée rénale.")


# 📤 2️⃣ Dernière donnée rénale
@router.get("/{patient_id}/latest", response_model=RenalRead)
def derniere_donnee_renale(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Récupère la dernière donnée rénale du patient."""
    get_patient_or_404(db, patient_id)

    obj = (
        db.query(RenalData)
        .filter(RenalData.patient_id == patient_id)
        .order_by(desc(RenalData.created_at))
        .first()
    )

    if not obj:
        raise HTTPException(status_code=404, detail="Aucune donnée rénale trouvée.")

    analyse = analyse_ia_renale(obj.creatinine, obj.filtration_glomerulaire, getattr(obj, "uree", None))
    return {**obj.__dict__, **analyse}


# 📜 3️⃣ Historique complet
@router.get("/{patient_id}", response_model=List[RenalRead])
def historique_renal(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Renvoie l’historique complet des données rénales du patient."""
    get_patient_or_404(db, patient_id)

    data = (
        db.query(RenalData)
        .filter(RenalData.patient_id == patient_id)
        .order_by(desc(RenalData.created_at))
        .all()
    )

    return [{**obj.__dict__, **analyse_ia_renale(obj.creatinine, obj.filtration_glomerulaire, getattr(obj, "uree", None))} for obj in data]


# ✏️ 4️⃣ Mise à jour d’une donnée rénale
@router.put("/{renal_id}", response_model=RenalRead)
def update_renal(
    renal_id: int,
    data: RenalUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Met à jour une donnée rénale et relance une analyse IA complète."""
    obj = db.query(RenalData).filter(RenalData.id == renal_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Donnée rénale introuvable.")

    try:
        for k, v in data.dict(exclude_unset=True).items():
            setattr(obj, k, v)

        analyse = analyse_ia_renale(obj.creatinine, obj.filtration_glomerulaire, getattr(obj, "uree", None))
        obj.niveau_risque = analyse["niveau_risque"]
        obj.alerte = analyse["alerte"]
        obj.score_sante = analyse["score_sante"]
        obj.commentaire_ia = analyse["commentaire_ia"]
        obj.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(obj)
        print(f"💧 Donnée rénale {renal_id} mise à jour avec succès.")
        return obj

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur update rénale : {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour de la donnée rénale.")


# 🗑️ 5️⃣ Suppression d’une donnée rénale
@router.delete("/{renal_id}")
def supprimer_renal(
    renal_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Supprime une donnée rénale spécifique."""
    obj = db.query(RenalData).filter(RenalData.id == renal_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Donnée rénale introuvable.")

    db.delete(obj)
    db.commit()
    print(f"🗑️ Donnée rénale {renal_id} supprimée.")
    return {"message": f"Donnée rénale {renal_id} supprimée avec succès."}
