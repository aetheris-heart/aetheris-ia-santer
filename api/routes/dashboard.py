from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, desc
from datetime import datetime
from typing import List, Dict

from api.database import get_db
from api.routes.auth import get_current_user
from app.models import Patient, Consultation, Medecin, Diagnostic, User
from app.models.analyse_ia import AnalyseIA  # ✅ Pour synthèse IA

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# ======================================================
# 📈 STATISTIQUES GLOBALES
# ======================================================
@router.get("/stats/overview")
def stats_overview(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    try:
        total_patients = db.query(func.count(Patient.id)).scalar()
        total_medecins = db.query(func.count(Medecin.id)).scalar()
        total_consultations = db.query(func.count(Consultation.id)).scalar()
        total_alertes = db.query(func.count(Diagnostic.id)).scalar()

        derniers_patients = db.query(Patient).order_by(Patient.id.desc()).limit(5).all()
        derniers_medecins = db.query(Medecin).order_by(Medecin.id.desc()).limit(5).all()

        return {
            "patients_total": total_patients,
            "medecins_total": total_medecins,
            "consultations_total": total_consultations,
            "alertes_total": total_alertes,
            "derniers_patients": [
                {
                    "id": p.id,
                    "nom": p.nom,
                    "prenom": p.prenom,
                    "age": getattr(p, "age", None),
                    "email": getattr(p, "email", None)
                } for p in derniers_patients
            ],
            "derniers_medecins": [
                {
                    "id": m.id,
                    "nom": m.nom,
                    "prenom": m.prenom,
                    "specialite": getattr(m, "specialite", None)
                } for m in derniers_medecins
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de statistiques : {str(e)}")


# ======================================================
# 🔬 SYNTHÈSE IA (liée à la table SyntheseIA)
# ======================================================
from app.models.synthese_ia import SyntheseIA

@router.get("/synthese/{patient_id}")
def synthese_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    synthese = (
        db.query(SyntheseIA)
        .filter(SyntheseIA.patient_id == patient_id)
        .order_by(desc(SyntheseIA.created_at))
        .first()
    )
    if not synthese:
        raise HTTPException(status_code=404, detail="Aucune synthèse IA trouvée pour ce patient")

    return {
        "patient_id": patient_id,
        "score_global": synthese.score_global,
        "niveau_gravite": synthese.niveau_gravite,
        "resume": synthese.resume,
        "recommandations": synthese.recommandations,
        "created_at": synthese.created_at,
    }

# ======================================================
# 🧠 SYNTHÈSE IA GLOBALE
# ======================================================
@router.get("/synthese")
def synthese_globale(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    syntheses = (
        db.query(SyntheseIA)
        .order_by(desc(SyntheseIA.created_at))
        .limit(10)
        .all()
    )
    if not syntheses:
        raise HTTPException(status_code=404, detail="Aucune synthèse IA trouvée")

    return [
        {
            "id": s.id,
            "patient_id": s.patient_id,
            "score_global": s.score_global,
            "niveau_gravite": s.niveau_gravite,
            "resume": s.resume,
            "created_at": s.created_at,
        }
        for s in syntheses
    ]





# ======================================================
# 👩‍⚕️ MODULE SOINS INFIRMIERS (placeholder temporaire)
# ======================================================
@router.get("/stats/soins-infirmiers")
def stats_soins_infirmiers():
    return {
        "infirmiers_total": 8,
        "patients_suivis": 25,
        "soins_journaliers": 73,
        "alertes": 2,
        "commentaire": "Activité stable du service infirmier."
    }


# ======================================================
# 📈 PATIENTS PAR MOIS (compatible frontend)
# ======================================================
@router.get("/stats/patients-per-month")
def patients_per_month(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rows = (
        db.query(
            extract("year", Patient.created_at).label("year"),
            extract("month", Patient.created_at).label("month"),
            func.count(Patient.id).label("total"),
        )
        .group_by("year", "month")
        .order_by("year", "month")
        .all()
    )

    results = []
    for y, m, t in rows:
        mois = f"{int(m):02d}-{int(y)}"  # ex: "10-2025"
        results.append({"mois": mois, "total": int(t)})

    return results


# ======================================================
# 📊 CONSULTATIONS PAR MOIS (compatible frontend)
# ======================================================
@router.get("/stats/consultations-per-month")
def consultations_per_month(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rows = (
        db.query(
            extract("year", Consultation.date_consultation).label("year"),
            extract("month", Consultation.date_consultation).label("month"),
            func.count(Consultation.id).label("total"),
        )
        .group_by("year", "month")
        .order_by("year", "month")
        .all()
    )

    results = []
    for y, m, t in rows:
        mois = f"{int(m):02d}-{int(y)}"
        results.append({"mois": mois, "total": int(t)})

    return results

# ======================================================
# 🧠 FONCTIONS MÉDICALES GÉNÉRALES
# ======================================================
@router.get("/stats/cardiac")
def cardiac_stats():
    return {"frequence": 78, "rythme": "Régulier", "pression": "120/80", "alerte": None}

@router.get("/stats/pulmonary")
def pulmonary_stats():
    return {"spo2": 96, "frequence_respiratoire": 18, "alerte": None}

@router.get("/stats/renal")
def renal_stats():
    return {"creatinine": 1.1, "uree": 30, "debit_filtration": 90, "alerte": None}

@router.get("/stats/digestive")
def digestive_stats():
    return {"acidite": 3.5, "motricite": "Normale", "inflammation": False, "alerte": None}

@router.get("/stats/metabolic")
def metabolic_stats():
    return {"glucose": 95, "insuline": 12, "alerte": None}

@router.get("/stats/neurological")
def neurological_stats():
    return {"eeg": "Normal", "stress_level": "Modéré", "alerte": None}


# ======================================================
# 🚨 PATIENTS CRITIQUES (résumé)
# ======================================================
@router.get("/patients-critiques")
def patients_critiques(db: Session = Depends(get_db)):
    patients = db.query(Patient).order_by(Patient.created_at.desc()).limit(3).all()
    return [
        {
            "id": p.id,
            "nom": p.nom,
            "prenom": p.prenom,
            "age": p.age,
            "critique": True if p.age and p.age > 65 else False
        }
        for p in patients
    ]


# ======================================================
# 👁 HUMAN DIAGRAM (synthèse vitale)
# ======================================================
@router.get("/human")
def get_human_stats():
    return {
        "cardiaque": {"status": "normal", "valeur": "72 bpm"},
        "pulmonaire": {"status": "alerte", "valeur": "SpO₂ 90%"},
        "neurologique": {"status": "normal", "valeur": "EEG stable"},
        "renale": {"status": "critique", "valeur": "Créatinine ↑"},
        "digestive": {"status": "normal", "valeur": "Pas d’anomalie"},
        "metabolique": {"status": "normal", "valeur": "Glucose 1.1 g/L"},
    }
