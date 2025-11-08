# app/utils/email.py

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from dotenv import load_dotenv
import os

# Charger les variables d’environnement depuis le fichier .env
load_dotenv()

# Configuration de connexion au serveur mail
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT")),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=os.getenv("MAIL_STARTTLS") == "True",
    MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS") == "True",
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# Fonction générique pour envoyer un email de bienvenue (ou autre)
async def send_welcome_email(to_email: str, subject: str, body: str):
    message = MessageSchema(
        subject=subject,
        recipients=[EmailStr(to_email)],
        body=body,
        subtype="html"
    )
    mailer = FastMail(conf)
    await mailer.send_message(message)

# Fonction spécialisée pour envoyer un email d'urgence automatique
async def send_urgence_email(to_email: str, patient_nom: str, patient_prenom: str, description: str, niveau: str, statut: str):
    subject = f"🚨 URGENCE pour {patient_nom.upper()} {patient_prenom.upper()}"
    body = f"""
    <div style="font-family:Arial,sans-serif; padding:10px;">
        <h2 style="color:#d32f2f;">🚨 Alerte Urgence Médicale Aetheris</h2>
        <p><strong>Patient :</strong> {patient_nom} {patient_prenom}</p>
        <p><strong>Description :</strong> {description}</p>
        <p><strong>Niveau :</strong> {niveau}</p>
        <p><strong>Statut :</strong> {statut}</p>
        <hr>
        <p style="font-size:12px;color:gray;">Message envoyé automatiquement par l’intelligence artificielle Aetheris.</p>
    </div>
    """
    message = MessageSchema(
        subject=subject,
        recipients=[EmailStr(to_email)],
        body=body,
        subtype="html"
    )
    mailer = FastMail(conf)
    await mailer.send_message(message)
