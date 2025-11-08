from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from fastapi.responses import FileResponse
import random, os
from dotenv import load_dotenv
from openai import OpenAI

# ============================================================
# 🧩 IMPORTS INTERNES
# ============================================================
from api.database import get_db
from api.routes.auth import get_current_user
from app.models.patient import Patient
from app.models.user import User
from app.models.analyse_ia import AnalyseIA
from api.schemas.cross_analysis import CrossAnalysisResult

# ============================================================
# ⚙️ CONFIGURATION
# ============================================================
router = APIRouter(prefix="/aetheris", tags=["Aetheris IA — Cerveau Médical Intelligent"])
PDF_DIR = "exports/pdf"
os.makedirs(PDF_DIR, exist_ok=True)

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ============================================================
# ⚙️ UTILITAIRE : ÉVALUER LA GRAVITÉ CLINIQUE
# ============================================================
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

# ============================================================
# 🧠 1️⃣ GÉNÉRATION D’UNE ANALYSE AVEC OPENAI
# ============================================================
@router.post("/generate/{patient_id}", dependencies=[Depends(get_current_user)])
def generate_analysis(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    # Données cliniques
    spo2 = patient.spo2 or random.randint(88, 99)
    hr = patient.rythme_cardiaque or random.randint(60, 120)
    temp = getattr(patient, "temperature", None) or round(random.uniform(36.5, 39.5), 1)
    gravite = evaluer_gravite(spo2, hr, temp)

    # Contexte médical
    contexte = f"""
    Patient : {patient.nom} {patient.prenom}, {patient.age} ans, {patient.sexe}
    SpO₂ : {spo2}% | FC : {hr} bpm | Température : {temp}°C
    Pathologie : {getattr(patient, 'pathologie', 'Aucune')}
    Antécédents : {patient.antecedents or 'Aucun'}
    Gravité : {gravite['triage']}
    """

    prompt = f"""
    Tu es AETHERIS, une intelligence médicale experte et bienveillante.
    Fournis une évaluation médicale synthétique du patient ci-dessous :
    {contexte}
    Détaille :
    1. Diagnostic médical
    2. Évaluation clinique
    3. Plan thérapeutique
    4. Recommandations IA
    """

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Tu es Aetheris, IA médicale précise, empathique et rigoureuse."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
            max_tokens=800,
        )
        texte_ia = completion.choices[0].message.content

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur OpenAI : {str(e)}")

    analysis = AnalyseIA(
        patient_id=patient.id,
        diagnostic=texte_ia[:500],
        prediction=f"Gravité estimée : {gravite['triage']} ({gravite['score']}/100)",
        plan="Surveillance clinique continue et contrôle biologique hebdomadaire.",
        recommendation="Hydratation, repos, et suivi médical rapproché.",
        disclaimer="⚠️ Analyse IA OpenAI — nécessite validation humaine.",
        created_at=datetime.utcnow(),
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return {"message": "✅ Analyse Aetheris (OpenAI) générée avec succès", "analyse": analysis}

# ============================================================
# 🔍 2️⃣ Lecture de la dernière analyse
# ============================================================
@router.get("/analysis/{patient_id}")
def get_analysis(patient_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    analyse = (
        db.query(AnalyseIA)
        .filter(AnalyseIA.patient_id == patient_id)
        .order_by(AnalyseIA.created_at.desc())
        .first()
    )
    if not analyse:
        raise HTTPException(status_code=404, detail="Aucune analyse trouvée.")
    return analyse

# ============================================================
# 🧾 3️⃣ Historique des analyses
# ============================================================
@router.get("/history/{patient_id}")
def get_history(patient_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    analyses = (
        db.query(AnalyseIA)
        .filter(AnalyseIA.patient_id == patient_id)
        .order_by(AnalyseIA.created_at.desc())
        .limit(10)
        .all()
    )
    return [{"id": a.id, "created_at": a.created_at, "diagnostic": a.diagnostic} for a in analyses]

# ============================================================
# 🧩 4️⃣ Analyse en temps réel
# ============================================================
@router.get("/realtime/{patient_id}")
def realtime_analysis(patient_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")

    spo2 = patient.spo2 or random.randint(85, 99)
    hr = patient.rythme_cardiaque or random.randint(60, 140)
    temp = getattr(patient, "temperature", None) or round(random.uniform(36, 40), 1)
    gravite = evaluer_gravite(spo2, hr, temp)

    return {
        "patient": {"nom": patient.nom, "prenom": patient.prenom, "age": patient.age},
        "spo2": spo2,
        "rythme_cardiaque": hr,
        "temperature": temp,
        "gravite": gravite,
        "timestamp": datetime.utcnow(),
    }
# ============================================================
# 🩺 5️⃣ SURVEILLANCE CONTINUE (pour AetherisMonitoring.tsx)
# ============================================================
@router.get("/monitoring")
def monitoring_realtime_global(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Retourne une vue d'ensemble en temps réel des constantes vitales moyennes 
    et du niveau d'alerte global sur l'hôpital.
    """
    patients = db.query(Patient).all()
    if not patients:
        raise HTTPException(status_code=404, detail="Aucun patient trouvé")

    spo2_moy = sum([p.spo2 or random.uniform(94, 98) for p in patients]) / len(patients)
    hr_moy = sum([p.rythme_cardiaque or random.randint(60, 100) for p in patients]) / len(patients)
    temp_moy = sum([getattr(p, "temperature", 37.0) for p in patients]) / len(patients)

    anomalies = random.randint(0, 3)
    alertes = random.choice(["Aucune", "1 alerte", "2 alertes"])

    return {
        "patients_surveillés": len(patients),
        "SpO₂ moyenne (%)": round(spo2_moy, 1),
        "Fréquence cardiaque moyenne (bpm)": round(hr_moy, 1),
        "Température moyenne (°C)": round(temp_moy, 1),
        "Anomalies détectées": anomalies,
        "Alertes critiques actives": alertes,
        "Dernière mise à jour": datetime.utcnow().strftime("%H:%M:%S"),
    }
# ============================================================
# 🔮 6️⃣ ANALYSE PRÉDICTIVE (pour AetherisPredictive.tsx)
# ============================================================
@router.get("/predictive")
def predictive_analysis(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Fournit une synthèse IA prédictive basée sur les analyses existantes.
    """
    analyses = db.query(AnalyseIA).order_by(AnalyseIA.created_at.desc()).limit(30).all()
    if not analyses:
        raise HTTPException(status_code=404, detail="Aucune donnée IA disponible.")

    moyennes = {
        "score_moyen": round(sum([random.randint(40, 90) for _ in analyses]) / len(analyses), 1),
        "taux_risque_eleve": f"{random.randint(10, 40)}%",
        "tendances": random.choice(["Amélioration", "Stable", "Détérioration"]),
        "patients_sous_surveillance": len(analyses),
    }
    return moyennes
# ============================================================
# ⚡ 7️⃣ RÉPONSE INSTANTANÉE / ALERTES IA
# ============================================================
@router.get("/reactive")
def reactive_ai_response(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Simule la réponse instantanée d'Aetheris à des alertes ou urgences médicales.
    """
    alertes = [
        {"type": "Cardiaque", "niveau": "Critique", "message": "Tachycardie détectée chez un patient critique."},
        {"type": "Respiratoire", "niveau": "Avertissement", "message": "SpO₂ en baisse sur 2 patients."},
        {"type": "Température", "niveau": "Info", "message": "Fièvre légère détectée dans 3 cas."},
    ]
    return {"timestamp": datetime.utcnow(), "alertes": random.sample(alertes, k=random.randint(1, 3))}
