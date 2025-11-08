from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List
import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from api.database import get_db
from app.models.analyse_ia import AnalyseIA
from app.models.patient import Patient
from app.models.user import User
from api.schemas.analyse_ia import AnalyseIACreate, AnalyseIARead, AnalyseIAUpdate
from api.routes.auth import get_current_user

router = APIRouter(prefix="/analyse-ia", tags=["Analyse IA"])

PDF_DIR = "exports/pdf"
os.makedirs(PDF_DIR, exist_ok=True)

# ============================================================
# 🧠 8. ROUTE HYBRIDE — ANALYSE EXISTANTE OU GÉNÉRATION AUTOMATIQUE
# ============================================================
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def evaluer_gravite(spo2: float | None, hr: int | None, temp: float | None):
    score, niveau, triage = 0, "vert", "Patient stable"
    if spo2 is not None:
        if spo2 < 85: score += 40; niveau, triage = "rouge", "Hypoxémie sévère"
        elif spo2 < 90: score += 25; niveau, triage = "orange", "Hypoxémie modérée"
        elif spo2 < 94: score += 10; niveau, triage = "jaune", "Saturation limite"
    if hr is not None:
        if hr > 140 or hr < 40: score += 40; niveau, triage = "rouge", "Instabilité hémodynamique"
        elif hr > 120: score += 25; niveau, triage = "orange", "Tachycardie sévère"
        elif hr > 100: score += 10; niveau, triage = "jaune", "Tachycardie modérée"
    if temp is not None:
        if temp > 40 or temp < 35: score += 35; niveau, triage = "rouge", "Hyper/hypothermie critique"
        elif temp >= 39: score += 20; niveau, triage = "orange", "Fièvre élevée"
        elif temp >= 38: score += 10; niveau, triage = "jaune", "Hyperthermie légère"
    if score == 0:
        niveau, triage = "vert", "Stable"
    return {"score": min(score, 100), "level": niveau, "triage": triage}


@router.get("/analysis-or-generate/{patient_id}")
def analysis_or_generate(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    ✅ Retourne la dernière analyse d’un patient ou en génère une nouvelle via OpenAI si elle n’existe pas.
    """
    # Vérifie si une analyse existe déjà
    analyse_existante = (
        db.query(AnalyseIA)
        .filter(AnalyseIA.patient_id == patient_id)
        .order_by(desc(AnalyseIA.created_at))
        .first()
    )

    if analyse_existante:
        return {"message": "Analyse existante trouvée", "analyse": analyse_existante}

    # Sinon, crée une nouvelle analyse via OpenAI
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    # Données cliniques de base
    spo2 = patient.spo2 or 96
    hr = patient.rythme_cardiaque or 78
    temp = getattr(patient, "temperature", None) or 37.1
    gravite = evaluer_gravite(spo2, hr, temp)

    # Contexte pour GPT-4o
    prompt = f"""
    Tu es AETHERIS, une IA médicale experte en diagnostic et analyse clinique.
    Fournis une évaluation médicale synthétique pour le patient suivant :
    Nom : {patient.nom} {patient.prenom}, Âge : {patient.age} ans, Sexe : {patient.sexe}
    SpO₂ : {spo2}% | Fréquence cardiaque : {hr} bpm | Température : {temp}°C
    Gravité estimée : {gravite['triage']}
    """

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Tu es Aetheris, IA médicale hospitalière experte et bienveillante."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
            max_tokens=700,
        )
        texte_ia = completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur OpenAI : {str(e)}")

    # Sauvegarde en base
    nouvelle_analyse = AnalyseIA(
        patient_id=patient.id,
        diagnostic=texte_ia[:500],
        prediction=f"Gravité estimée : {gravite['triage']} ({gravite['score']}/100)",
        plan="Surveillance clinique continue et contrôle biologique hebdomadaire.",
        recommendation="Hydratation, repos et suivi médical rapproché.",
        disclaimer="Analyse automatique générée par Aetheris (OpenAI).",
        created_at=datetime.utcnow(),
    )

    db.add(nouvelle_analyse)
    db.commit()
    db.refresh(nouvelle_analyse)

    return {"message": "Nouvelle analyse générée automatiquement", "analyse": nouvelle_analyse}

# ============================================================
# 🧠 1. Création manuelle d’analyse IA
# ============================================================
@router.post("/{patient_id}", response_model=AnalyseIARead)
def creer_analyse(
    patient_id: int,
    data: AnalyseIACreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")

    obj = AnalyseIA(patient_id=patient_id, **data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj





# ============================================================
# 📊 3. Statistiques globales IA
# ============================================================
@router.get("/global/risks")
def global_risks(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    analyses = db.query(AnalyseIA).all()
    if not analyses:
        raise HTTPException(status_code=404, detail="Aucune analyse trouvée")

    nb_eleve = sum(1 for a in analyses if a.score >= 70)
    nb_modere = sum(1 for a in analyses if 40 <= a.score < 70)
    nb_faible = sum(1 for a in analyses if a.score < 40)

    return {
        "total_analyses": len(analyses),
        "risque_eleve": nb_eleve,
        "risque_modere": nb_modere,
        "risque_faible": nb_faible,
    }


# ============================================================
# 📜 4. Historique par patient
# ============================================================
@router.get("/{patient_id}", response_model=List[AnalyseIARead])
def historique_analyses(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(AnalyseIA)
        .filter(AnalyseIA.patient_id == patient_id)
        .order_by(desc(AnalyseIA.created_at))
        .all()
    )


# ============================================================
# 📤 5. Dernière analyse
# ============================================================
@router.get("/{patient_id}/latest", response_model=AnalyseIARead)
def derniere_analyse(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    obj = (
        db.query(AnalyseIA)
        .filter(AnalyseIA.patient_id == patient_id)
        .order_by(desc(AnalyseIA.created_at))
        .first()
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Aucune analyse trouvée")
    return obj


# ============================================================
# ✏️ 6. Mise à jour d’une analyse
# ============================================================
@router.put("/{analyse_id}", response_model=AnalyseIARead)
def update_analyse(
    analyse_id: int,
    data: AnalyseIAUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    obj = db.query(AnalyseIA).filter(AnalyseIA.id == analyse_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Analyse IA introuvable")

    for k, v in data.dict(exclude_unset=True).items():
        setattr(obj, k, v)

    db.commit()
    db.refresh(obj)
    return obj


# ============================================================
# 🗑️ 7. Suppression
# ============================================================
@router.delete("/{analyse_id}")
def delete_analyse(
    analyse_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    obj = db.query(AnalyseIA).filter(AnalyseIA.id == analyse_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Analyse IA introuvable")

    db.delete(obj)
    db.commit()
    return {"message": "Analyse IA supprimée"}


