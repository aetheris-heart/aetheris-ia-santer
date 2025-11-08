from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy import func
from api.database import get_db
from api.routes.auth import get_current_user
from app.models.synthese_ia import SyntheseIA
from app.models.patient import Patient
from app.models.patient_critique import PatientCritique
from app.models.user import User
from api.schemas.synthese_ia import SyntheseIACreate, SyntheseIARead, SyntheseIAUpdate

router = APIRouter(prefix="/synthese-ia", tags=["Synthèse IA"])


# 🧩 Fonction utilitaire : formatage des tags
def _tags_to_str(tags: Optional[List[str]]) -> Optional[str]:
    if not tags:
        return None
    return ",".join(sorted(set(t.strip() for t in tags if t and t.strip())))


# 🧠 Liste globale de toutes les synthèses IA (vue Aetheris)
@router.get("/all", response_model=List[SyntheseIARead])
def get_all_syntheses(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    syntheses = (
        db.query(SyntheseIA)
        .order_by(desc(SyntheseIA.created_at))
        .limit(50)
        .all()
    )
    if not syntheses:
        raise HTTPException(status_code=404, detail="Aucune synthèse IA enregistrée")
    return syntheses


# ============================================================
# 💡 RECOMMANDATIONS IA — Routes dédiées
# ============================================================

@router.get("/recommandations/latest")
def get_latest_recommandation(db: Session = Depends(get_db)):
    """Retourne la dernière synthèse IA contenant des recommandations."""
    latest = (
        db.query(SyntheseIA)
        .filter(SyntheseIA.recommandations.isnot(None))
        .order_by(desc(SyntheseIA.created_at))
        .first()
    )

    if not latest:
        raise HTTPException(status_code=404, detail="Aucune recommandation IA récente.")

    patient = db.query(Patient).filter(Patient.id == latest.patient_id).first()

    return {
        "id": latest.id,
        "patient_id": latest.patient_id,
        "recommandations": latest.recommandations,
        "created_at": latest.created_at,
        "niveau_gravite": latest.niveau_gravite or "non spécifié",
        "patient": {
            "nom": patient.nom if patient else "Inconnu",
            "prenom": patient.prenom if patient else "",
        },
    }


@router.get("/recommandations/analyse-evolution")
def get_recommandation_evolution(db: Session = Depends(get_db)):
    """Retourne l’évolution du nombre de recommandations IA sur 7 jours."""
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    stats = (
        db.query(
            func.date(SyntheseIA.created_at).label("date"),
            func.count(SyntheseIA.id).label("count"),
        )
        .filter(SyntheseIA.recommandations.isnot(None))
        .filter(SyntheseIA.created_at >= seven_days_ago)
        .group_by(func.date(SyntheseIA.created_at))
        .order_by(func.date(SyntheseIA.created_at))
        .all()
    )

    return {
        "periode": f"{seven_days_ago.date()} → {datetime.utcnow().date()}",
        "evolution": [{"date": s.date, "nb_recommandations": s.count} for s in stats],
        "dernier_nombre": stats[-1].count if stats else 0,
        "variation": (
            stats[-1].count - stats[-2].count if len(stats) >= 2 else 0
        ),
    }




# ============================================================
# 🧠 ANOMALIES IA — Routes dédiées
# ============================================================


@router.get("/anomalies/latest")
def get_latest_anomalie(db: Session = Depends(get_db)):
    """Retourne la dernière synthèse IA contenant des anomalies détectées."""
    latest = (
        db.query(SyntheseIA)
        .filter(SyntheseIA.anomalies_detectees.isnot(None))
        .order_by(desc(SyntheseIA.created_at))
        .first()
    )

    if not latest:
        raise HTTPException(status_code=404, detail="Aucune anomalie IA détectée récemment.")

    patient = db.query(Patient).filter(Patient.id == latest.patient_id).first()

    return {
        "id": latest.id,
        "patient_id": latest.patient_id,
        "anomalies_detectees": latest.anomalies_detectees,
        "niveau_gravite": latest.niveau_gravite or "non spécifié",
        "created_at": latest.created_at,
        "resume": latest.resume or "",
        "patient": {
            "nom": patient.nom if patient else "Inconnu",
            "prenom": patient.prenom if patient else "",
        },
    }


@router.get("/anomalies/analyse-evolution")
def get_anomalie_evolution(db: Session = Depends(get_db)):
    """Retourne une statistique d'évolution du nombre d'anomalies IA sur 7 jours."""
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    anomalies_stats = (
        db.query(func.date(SyntheseIA.created_at).label("date"), func.count(SyntheseIA.id).label("count"))
        .filter(SyntheseIA.anomalies_detectees.isnot(None))
        .filter(SyntheseIA.created_at >= seven_days_ago)
        .group_by(func.date(SyntheseIA.created_at))
        .order_by(func.date(SyntheseIA.created_at))
        .all()
    )

    return {
        "periode": f"{seven_days_ago.date()} → {datetime.utcnow().date()}",
        "evolution": [{"date": a.date, "nb_anomalies": a.count} for a in anomalies_stats],
        "dernier_nombre": anomalies_stats[-1].count if anomalies_stats else 0,
        "variation": (
            anomalies_stats[-1].count - anomalies_stats[-2].count
            if len(anomalies_stats) >= 2 else 0
        ),
    }


# 📥 Créer une nouvelle synthèse IA pour un patient
@router.post("/{patient_id}", response_model=SyntheseIARead)
def creer_synthese(
    patient_id: int,
    data: SyntheseIACreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Vérification patient
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")

    # 🧹 Nettoyage automatique des données JSON (sécurité)
    if data.recommandations_ia:
        data.recommandations_ia = [
            r for r in data.recommandations_ia if isinstance(r, dict) and r
        ]

    # 🧠 Création de la synthèse IA
    obj = SyntheseIA(
        patient_id=patient_id,
        medecin_id=user.id,
        resume=data.resume,
        recommandations=data.recommandations,
        risques=data.risques,
        score_global=data.score_global,
        niveau_gravite=data.niveau_gravite,
        tags=_tags_to_str(data.tags),
        alertes_critiques=data.alertes_critiques,
        anomalies_detectees=data.anomalies_detectees,
        recommandations_ia=data.recommandations_ia,
        valide_par_humain=data.valide_par_humain,
        commentaire_medecin=data.commentaire_medecin,
    )

    db.add(obj)
    db.commit()
    db.refresh(obj)

    # ⚡ Détection automatique : patient critique si score > 0.7
    if data.score_global and data.score_global > 0.7:
        critique = PatientCritique(
            patient_id=patient_id,
            raison=f"Synthèse IA score {data.score_global:.2f} > 0.7",
            niveau_risque=min(1.0, data.score_global),
            statut="actif",
            created_at=datetime.utcnow(),
        )
        db.add(critique)
        db.commit()

    return obj


# 📤 Dernière synthèse IA d’un patient
@router.get("/{patient_id}/latest", response_model=Optional[SyntheseIARead])
def derniere_synthese(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    obj = (
        db.query(SyntheseIA)
        .filter(SyntheseIA.patient_id == patient_id)
        .order_by(desc(SyntheseIA.created_at))
        .first()
    )
    if not obj:
        return None  # ✅ au lieu d'une 404

    return obj



# 📜 Historique complet d’un patient
@router.get("/{patient_id}", response_model=List[SyntheseIARead])
def historique_syntheses(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    syntheses = (
        db.query(SyntheseIA)
        .filter(SyntheseIA.patient_id == patient_id)
        .order_by(desc(SyntheseIA.created_at))
        .all()
    )
    if not syntheses:
        raise HTTPException(status_code=404, detail="Aucune synthèse trouvée pour ce patient")
    return syntheses


# ✏️ Mise à jour d’une synthèse IA
@router.put("/{synthese_id}", response_model=SyntheseIARead)
def update_synthese(
    synthese_id: int,
    data: SyntheseIAUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    obj = db.query(SyntheseIA).filter(SyntheseIA.id == synthese_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Synthèse IA introuvable")

    payload = data.dict(exclude_unset=True)
    if "tags" in payload:
        payload["tags"] = _tags_to_str(payload["tags"])

    # 🧹 Nettoyage sécurité des recommandations IA
    if "recommandations_ia" in payload and payload["recommandations_ia"]:
        payload["recommandations_ia"] = [
            r for r in payload["recommandations_ia"] if isinstance(r, dict) and r
        ]

    for k, v in payload.items():
        setattr(obj, k, v)

    db.commit()
    db.refresh(obj)
    return obj


# 🗑️ Suppression d’une synthèse IA
@router.delete("/{synthese_id}")
def delete_synthese(
    synthese_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    obj = db.query(SyntheseIA).filter(SyntheseIA.id == synthese_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Synthèse IA introuvable")

    db.delete(obj)
    db.commit()
    return {"message": "Synthèse IA supprimée"}


# 🧩 Résumé global des dernières synthèses IA
@router.get("/{patient_id}/resume-global")
def resume_global_syntheses(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    syntheses = (
        db.query(SyntheseIA)
        .filter(SyntheseIA.patient_id == patient_id)
        .order_by(desc(SyntheseIA.created_at))
        .limit(5)
        .all()
    )
    if not syntheses:
        raise HTTPException(status_code=404, detail="Aucune synthèse trouvée")

    resume_combine = " | ".join([s.resume for s in syntheses if s.resume])
    moyenne_score = sum([s.score_global or 0 for s in syntheses]) / len(syntheses)

    return {
        "patient_id": patient_id,
        "resume_combine": resume_combine,
        "score_moyen": round(moyenne_score, 2),
        "analyse_par": "Aetheris Synthèse IA",
    }


# 📈 Analyse de l’évolution des scores IA
@router.get("/{patient_id}/analyse-evolution")
def analyse_evolution(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    syntheses = (
        db.query(SyntheseIA)
        .filter(SyntheseIA.patient_id == patient_id)
        .order_by(desc(SyntheseIA.created_at))
        .limit(10)
        .all()
    )

    if len(syntheses) < 2:
        return {"message": "Pas assez de données pour une analyse d’évolution"}

    dernier = syntheses[0].score_global or 0
    avant_dernier = syntheses[1].score_global or 0
    variation = round(dernier - avant_dernier, 2)

    alerte = None
    if variation > 0.15:
        alerte = "⚠️ Augmentation rapide du risque détectée"
    elif variation < -0.15:
        alerte = "✅ Amélioration notable détectée"

    return {
        "dernier_score": dernier,
        "variation": variation,
        "alerte": alerte,
        "analyse": "Analyse d’évolution IA Aetheris",
    }
