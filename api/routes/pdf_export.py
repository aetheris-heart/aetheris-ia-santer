from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from io import BytesIO
import os
import qrcode
from matplotlib import pyplot as plt
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Table, TableStyle
from reportlab.lib.units import cm

from api.database import get_db
from api.routes.auth import get_current_user
from app.models.patient import Patient
from app.models.user import User
from app.models.facture import Facture
from app.models.analyse_ia import AnalyseIA
from app.models.dossier_medical import DossierMedical
from app import models

router = APIRouter(prefix="/pdf", tags=["PDF Export"])
PDF_DIR = "exports/pdf"
os.makedirs(PDF_DIR, exist_ok=True)

# ============================================================
# 🧠 1️⃣ Rapport d’analyse IA Aetheris
# ============================================================
@router.get("/analysis/{patient_id}/export")
def export_pdf_analysis(patient_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")

    analyse = (
        db.query(AnalyseIA)
        .filter(AnalyseIA.patient_id == patient_id)
        .order_by(desc(AnalyseIA.created_at))
        .first()
    )
    if not analyse:
        raise HTTPException(status_code=404, detail="Aucune analyse IA trouvée pour ce patient")

    filename = f"{PDF_DIR}/Analyse_Aetheris_{patient.nom}_{patient.prenom}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.pdf"
    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4

    # --- Bandeau bleu ---
    c.setFillColor(colors.HexColor("#1e3a8a"))
    c.rect(0, height - 80, width, 80, stroke=0, fill=1)

    logo_path = "assets/logo_aetheris.png"
    if os.path.exists(logo_path):
        c.drawImage(logo_path, 40, height - 70, width=90, height=50, mask="auto")

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(150, height - 45, "RAPPORT D’ANALYSE IA — AETHERIS")
    c.setFont("Helvetica", 11)
    c.drawString(150, height - 65, f"Dr {user.nom}  |  {datetime.now().strftime('%d/%m/%Y %H:%M')}")

    y = height - 120
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(50, y, f"👤 Patient : {patient.prenom} {patient.nom} ({patient.age or '?'} ans, {patient.sexe or '-'})")

    y -= 30
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Diagnostic :")
    y -= 15
    c.setFont("Helvetica", 11)
    c.drawString(70, y, analyse.diagnostic or "—")

    y -= 30
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Prédictions & Risques :")
    y -= 15
    c.setFont("Helvetica", 11)
    for line in (analyse.prediction or "—").split("\n"):
        c.drawString(70, y, f"- {line}")
        y -= 15

    y -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Plan de prise en charge :")
    y -= 15
    c.setFont("Helvetica", 11)
    for step in (analyse.plan or "—").split("\n"):
        c.drawString(70, y, f"- {step}")
        y -= 15

    y -= 20
    c.setFont("Helvetica-Oblique", 10)
    c.setFillColor(colors.grey)
    c.drawString(50, 40, "Signature numérique : AETHERIS IA Santé — Validation médicale requise.")
    c.save()
    return FileResponse(filename, media_type="application/pdf", filename=os.path.basename(filename))


# ============================================================
# 💳 2️⃣ Export PDF Facture Médicale
# ============================================================
@router.get("/facture/{facture_id}")
def export_facture_pdf(facture_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    facture = db.query(Facture).filter(Facture.id == facture_id).first()
    if not facture:
        raise HTTPException(status_code=404, detail="Facture introuvable")

    patient = facture.patient
    medecin = facture.medecin
    filename = f"{PDF_DIR}/Facture_Aetheris_{facture.id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.pdf"
    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4

    c.setFillColor(colors.HexColor("#0f172a"))
    c.rect(0, height - 80, width, 80, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, height - 50, "FACTURE MÉDICALE — AETHERIS")

    y = height - 120
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(50, y, f"Patient : {patient.prenom} {patient.nom}")
    y -= 25
    c.drawString(50, y, f"Médecin : {medecin.nom if medecin else '—'} ({medecin.specialite if medecin else '—'})")
    y -= 35
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Détails de la Facture :")
    y -= 20
    c.setFont("Helvetica", 11)
    data = [
        ["Numéro", facture.numero_facture],
        ["Date émission", facture.date_emission.strftime("%d/%m/%Y") if facture.date_emission else "—"],
        ["Montant HT", f"{facture.montant_ht:.2f} €"],
        ["Taxe", f"{facture.taxe:.2f} €"],
        ["Total TTC", f"{facture.montant_total:.2f} €"],
        ["Statut", facture.statut],
        ["Paiement", facture.methode_paiement or "—"],
    ]
    for k, v in data:
        c.drawString(70, y, f"{k} : {v}")
        y -= 15

    c.setFont("Helvetica-Oblique", 10)
    c.setFillColor(colors.grey)
    c.drawString(50, 40, "Signature numérique : AETHERIS IA Santé")
    c.save()
    return FileResponse(filename, media_type="application/pdf", filename=os.path.basename(filename))


# ============================================================
# 📚 3️⃣ Historique complet des analyses IA
# ============================================================
@router.get("/analysis/{patient_id}/export-history")
def export_analysis_history(patient_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")

    analyses = (
        db.query(AnalyseIA)
        .filter(AnalyseIA.patient_id == patient_id)
        .order_by(desc(AnalyseIA.created_at))
        .all()
    )
    if not analyses:
        raise HTTPException(status_code=404, detail="Aucune analyse IA trouvée")

    filename = f"{PDF_DIR}/Historique_Aetheris_{patient.nom}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.pdf"
    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 18)
    c.setFillColor(colors.HexColor("#1e3a8a"))
    c.drawCentredString(width / 2, height - 50, f"Historique d’Analyses IA — {patient.prenom} {patient.nom}")
    c.setFillColor(colors.black)

    y = height - 100
    for i, a in enumerate(analyses, start=1):
        if y < 150:
            c.showPage()
            y = height - 100
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, f"Analyse #{i} — {a.created_at.strftime('%d/%m/%Y %H:%M')}")
        y -= 20
        c.setFont("Helvetica", 11)
        c.drawString(70, y, f"Diagnostic : {a.diagnostic or '—'}")
        y -= 15
        c.drawString(70, y, f"Prédiction : {a.prediction or '—'}")
        y -= 15
        c.drawString(70, y, f"Plan : {a.plan or '—'}")
        y -= 25

    c.setFont("Helvetica-Oblique", 10)
    c.setFillColor(colors.grey)
    c.drawString(50, 40, "Signature numérique : AETHERIS IA Santé")
    c.save()
    return FileResponse(filename, media_type="application/pdf", filename=os.path.basename(filename))
# ============================================================
# 🧬 4️⃣ Export PDF Synthèse IA (SyntheseDetail.tsx)
# ============================================================
@router.get("/synthese/{patient_id}/export")
def export_synthese_ia_pdf(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    from app.models.synthese_ia import SyntheseIA  # import local pour éviter boucles

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")

    synthese = (
        db.query(SyntheseIA)
        .filter(SyntheseIA.patient_id == patient_id)
        .order_by(desc(SyntheseIA.created_at))
        .first()
    )
    if not synthese:
        raise HTTPException(status_code=404, detail="Aucune synthèse IA trouvée pour ce patient")

    # 📄 Nom de fichier
    filename = f"{PDF_DIR}/Synthese_Aetheris_{patient.nom}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.pdf"
    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4

    # 🟦 Bandeau supérieur
    c.setFillColor(colors.HexColor("#1e3a8a"))
    c.rect(0, height - 80, width, 80, stroke=0, fill=1)

    logo_path = "assets/logo_aetheris.png"
    if os.path.exists(logo_path):
        c.drawImage(logo_path, 40, height - 70, width=90, height=50, mask="auto")

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(150, height - 45, "RAPPORT DE SYNTHÈSE IA — AETHERIS")
    c.setFont("Helvetica", 11)
    c.drawString(150, height - 65, f"Dr {user.nom} | {datetime.now().strftime('%d/%m/%Y %H:%M')}")

    # 👤 Infos patient
    y = height - 120
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(50, y, f"👤 Patient : {patient.prenom} {patient.nom} ({patient.age or '?'} ans, {patient.sexe or '-'})")

    # 📊 Score et gravité
    y -= 30
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Score global IA :")
    c.setFont("Helvetica", 11)
    c.drawString(180, y, f"{(synthese.score_global or 0) * 100:.1f}%")

    y -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Niveau de gravité :")
    c.setFont("Helvetica", 11)
    c.drawString(180, y, synthese.niveau_gravite or "—")

    # 🧠 Résumé clinique
    y -= 40
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Résumé clinique IA :")
    y -= 20
    c.setFont("Helvetica", 11)
    for line in (synthese.resume or "—").split("\n"):
        c.drawString(70, y, line)
        y -= 15

    # ⚠️ Alertes & Anomalies
    y -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Alertes critiques :")
    y -= 20
    c.setFont("Helvetica", 11)
    alertes = synthese.alertes_critiques
    if isinstance(alertes, str):
        alertes = [alertes]
    for a in (alertes or ["Aucune alerte détectée."]):
        c.drawString(70, y, f"- {a}")
        y -= 15

    y -= 10
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Anomalies détectées :")
    y -= 20
    c.setFont("Helvetica", 11)
    anomalies = synthese.anomalies_detectees
    if isinstance(anomalies, str):
        anomalies = [anomalies]
    for a in (anomalies or ["Aucune anomalie détectée."]):
        c.drawString(70, y, f"- {a}")
        y -= 15

    # 🧩 Recommandations IA
    y -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Recommandations IA :")
    y -= 20
    c.setFont("Helvetica", 11)
    if synthese.recommandations_ia:
        try:
            for r in synthese.recommandations_ia:
                if isinstance(r, dict):
                    c.drawString(70, y, f"• [{r.get('urgence', 'Standard')}] {r.get('texte', '')}")
                else:
                    c.drawString(70, y, f"• {r}")
                y -= 15
        except Exception:
            c.drawString(70, y, "Erreur de parsing recommandations.")
            y -= 15
    else:
        c.drawString(70, y, "Aucune recommandation enregistrée.")
        y -= 15

    # 🕓 Footer
    c.setFont("Helvetica-Oblique", 10)
    c.setFillColor(colors.grey)
    c.drawString(50, 40, "Signature numérique : AETHERIS IA Santé — Rapport généré automatiquement.")
    c.save()

    return FileResponse(filename, media_type="application/pdf", filename=os.path.basename(filename))
