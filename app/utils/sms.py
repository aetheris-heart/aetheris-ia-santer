# app/utils/sms.py

from twilio.rest import Client
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration Twilio depuis les variables d'environnement
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def send_urgence_sms(to_number: str, message: str):
    """Envoie un SMS d'urgence via Twilio."""
    try:
        message = client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=to_number
        )
        return {"status": "success", "sid": message.sid}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def send_urgence(to_email: str, subject: str, body: str):
    """Envoie un email d'urgence."""
    from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
    from pydantic import EmailStr

    conf = ConnectionConfig(
        MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
        MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
        MAIL_FROM=os.getenv("MAIL_FROM"),
        MAIL_PORT=int(os.getenv("MAIL_PORT")),
        MAIL_SERVER=os.getenv("MAIL_SERVER"),
        MAIL_STARTTLS=os.getenv("MAIL_STARTTLS") == "True",
        MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS") == "True",
        USE_CREDENTIALS=True
    )

    message = MessageSchema(
        subject=subject,
        recipients=[EmailStr(to_email)],
        body=body,
        subtype="html"
    )

    fm = FastMail(conf)
    return fm.send_message(message)
