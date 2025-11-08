# ============================================================
# 🧠 AETHERIS CHAT — IA MÉDICALE CONNECTÉE À OPENAI
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from langdetect import detect
from dotenv import load_dotenv
from openai import OpenAI
import os

from api.database import get_db
from api.routes.auth import get_current_user
from app import models

# ============================================================
# ⚙️ CONFIGURATION ROUTEUR
# ============================================================
router = APIRouter(
    prefix="/aetheris/chat",
    tags=["Aetheris Chat — Dialogue Cognitif Médical (Cloud)"],
)

# Charger la clé OpenAI
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ============================================================
# 🧩 Modèle Pydantic pour la requête chat
# ============================================================
class ChatRequest(BaseModel):
    message: str
    patient_id: int | None = None

# ============================================================
# 🌍 Langues supportées (auto-détection)
# ============================================================
LANG_MAP = {
    "fr": "Français", "en": "English", "es": "Español", "pt": "Português",
    "de": "Deutsch", "it": "Italiano", "ar": "العربية", "sw": "Kiswahili", "zh": "中文",
}

# ============================================================
# 💬 1️⃣ Dialogue cognitif Aetheris (OpenAI)
# ============================================================
@router.post(
    "/ask",
    summary="Dialogue médical Aetheris Cloud (OpenAI)",
    operation_id="ask_aetheris_cloud_chat"
)
async def ask_aetheris(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    💠 AETHERIS : IA médicale connectée à OpenAI.
    Dialogue multilingue, empathique et rigoureux, avec contexte hospitalier.
    """
    try:
        # 🌐 Détection automatique de la langue
        try:
            lang_code = detect(data.message)
        except Exception:
            lang_code = "fr"
        langue = LANG_MAP.get(lang_code, "Français")

        # 🧱 Contexte patient
        patient_context = ""
        if data.patient_id:
            patient = db.query(models.Patient).filter(models.Patient.id == data.patient_id).first()
            if patient:
                patient_context = (
                    f"Patient : {patient.nom} {patient.prenom}, {patient.age} ans, {patient.sexe}. "
                    f"SpO₂ : {patient.spo2 or 'N/A'}% | "
                    f"Rythme cardiaque : {patient.rythme_cardiaque or 'N/A'} bpm | "
                    f"T° : {getattr(patient, 'temperature', 'N/A')}°C. "
                    f"Antécédents : {patient.antecedents or 'Aucun'}.\n"
                )

        # 🏥 Contexte hospitalier global
        total_patients = db.query(models.Patient).count()
        total_consultations = db.query(models.Consultation).count()
        total_alertes = (
            db.query(models.Notifications).count()
            if hasattr(models, "Notifications") else 0
        )
        global_context = (
            f"📊 Base hospitalière Aetheris : {total_patients} patients, "
            f"{total_consultations} consultations, {total_alertes} alertes actives.\n"
        )

        # 💾 Sauvegarde du message utilisateur
        db.add(models.AetherisChat(
            user_id=current_user.id,
            patient_id=data.patient_id,
            role="user",
            message=data.message,
            created_at=datetime.utcnow(),
        ))
        db.commit()

        # 🤖 Construction du prompt IA
        prompt = f"""
        Tu es AETHERIS, une intelligence médicale connectée à OpenAI.
        Tu parles {langue} et tu es connectée à une base hospitalière réelle.
        Contexte hospitalier :
        {global_context}
        {patient_context or 'Aucun contexte patient fourni.'}

        Message du médecin :
        {data.message}

        Réponds avec bienveillance, rigueur scientifique, et précision clinique.
        """

        # 🧠 Appel OpenAI
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Tu es Aetheris, une IA médicale experte et empathique."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
            max_tokens=800,
        )
        response_text = completion.choices[0].message.content

        # 💾 Sauvegarde de la réponse IA
        db.add(models.AetherisChat(
            user_id=current_user.id,
            patient_id=data.patient_id,
            role="aetheris",
            message=response_text,
            created_at=datetime.utcnow(),
        ))
        db.commit()

        return {
            "aetheris_response": response_text,
            "langue": langue,
            "context": {
                "patient": patient_context or None,
                "global": global_context,
            },
        }

    except Exception as e:
        print("❌ Erreur moteur Aetheris Chat :", e)
        raise HTTPException(status_code=500, detail=f"Erreur interne Aetheris Chat : {str(e)}")

# ============================================================
# 📜 2️⃣ Historique des conversations
# ============================================================
@router.get(
    "/history",
    summary="Historique des conversations Aetheris",
    operation_id="get_aetheris_cloud_chat_history"
)
def get_chat_history(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Retourne les 20 derniers messages échangés avec Aetheris."""
    messages = (
        db.query(models.AetherisChat)
        .filter(models.AetherisChat.user_id == current_user.id)
        .order_by(models.AetherisChat.created_at.asc())
        .limit(20)
        .all()
    )
    return [
        {
            "role": msg.role,
            "message": msg.message,
            "created_at": msg.created_at.isoformat(),
        }
        for msg in messages
    ]
