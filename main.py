from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os
# =============================
# Initialisation de l'app
# =============================
app = FastAPI(
    title="Aetheris IA Santé",
    description="Plateforme médicale intelligente - API",
    version="2.0.0",
)

# ============================================================
# ⚙️ CORS — Configuration universelle (Render + Vercel)
# ============================================================
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

app = FastAPI(title="Aetheris IA Santé")

# ✅ Autorise temporairement toutes les origines (test de production)
# On resserrera ensuite quand tout fonctionne.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # autorise tout
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Import DB
from api.database import Base, engine, SessionLocal
from app import models  # ✅ charge tous les modèles via app/models/__init__.py

load_dotenv()

# Import des routes
from api.routes import auth, patient, etat_clinique, consultation, diagnostic, rendezvous, dossier_medical,neurologique, bloc_operatoire, urgence, visual_ia, finance
from api.routes.auth import get_password_hash
from api.routes import admin
from api.routes import aetheris
from api.routes import synthese_ia
from api.routes import user
from api.routes import dashboard
from api.routes import patient_critique
from api.routes import document
from api.routes import cardiaque
from api.routes import pulmonary
from api.routes import digestive
from api.routes import metabolique
from api.routes import renal
from api.routes import aetheris_chat
from api.routes import biologie
from api.routes import pharmacie
from api.routes import imagerie
from api.routes import radiologie
from api.routes import hospitalisation
from api.routes import soins
from api.routes import facture
from api.routes import rh
from api.routes import notification
from api.routes import pdf_export
from api.routes import ambulance
from api.routes import specialite
from api.routes import user
from api.routes import analyse_ia
from api.routes import aetheris_chat







# ============================
# Routes
# =============================
app.include_router(auth.router)
app.include_router(patient.router)
app.include_router(etat_clinique.router)
app.include_router(consultation.router)
app.include_router(diagnostic.router)
app.include_router(rendezvous.router)
app.include_router(dossier_medical.router)
app.include_router(admin.router)
app.include_router(aetheris.router)
app.include_router(synthese_ia.router)
app.include_router(analyse_ia.router)
app.include_router(dashboard.router)
app.include_router(patient_critique.router)
app.include_router(document.router)
app.include_router(cardiaque.router)
app.include_router(pulmonary.router)
app.include_router(neurologique.router)
app.include_router(digestive.router)
app.include_router(metabolique.router)
app.include_router(renal.router)
app.include_router(aetheris_chat.router)
app.include_router(biologie.router)
app.include_router(pharmacie.router)
app.include_router(imagerie.router)
app.include_router(radiologie.router)
app.include_router(hospitalisation.router)
app.include_router(bloc_operatoire.router)
app.include_router(soins.router)
app.include_router(facture.router)
app.include_router(rh.router)
app.include_router(notification.router)
app.include_router(pdf_export.router)
app.include_router(urgence.router)
app.include_router(finance.router)
app.include_router(ambulance.router)
app.include_router(specialite.router)
app.include_router(visual_ia.router)
app.include_router(user.router)
app.include_router(aetheris_chat.router)

from api.routes import websockets
app.include_router(websockets.router)


# =============================
# Root Endpoint
# =============================
@app.get("/")
def root():
    return {
        "status": "✅ API Aetheris IA Santé opérationnelle",
        "version": "1.0.0",
    }


# =============================
# Création auto des tables
# =============================
Base.metadata.create_all(bind=engine)


# =============================
# Création d’utilisateurs par défaut au démarrage
# =============================
from app.models.specialite import Specialite

def get_or_create_specialite(db: Session, nom: str):
    """Créer ou récupérer une spécialité par son nom"""
    specialite = db.query(Specialite).filter(Specialite.nom == nom).first()
    if not specialite:
        specialite = Specialite(nom=nom)
        db.add(specialite)
        db.commit()
        db.refresh(specialite)
    return specialite


def create_default_users():
    db: Session = SessionLocal()
    try:
        # ✅ Utilisateur générique
        default_email = "acces@aetheris.com"
        user = db.query(models.User).filter(models.User.email == default_email).first()
        if not user:
            default_user = models.User(
                nom="Accès",
                prenom="Générique",
                email=default_email,
                hashed_password=get_password_hash("motdepasse123"),
                role="acces",
                specialite_id=None,   # pas de spécialité
                is_active=True,
                is_verified=True,
            )
            db.add(default_user)

        # ✅ Super administrateur
        admin_email = "superadmin@aetheris.com"
        admin = db.query(models.User).filter(models.User.email == admin_email).first()
        if not admin:
            spec = get_or_create_specialite(db, "Administration")
            superadmin = models.User(
                nom="Admin",
                prenom="Suprême",
                email=admin_email,
                hashed_password=get_password_hash("admin123"),
                role="admin",
                specialite_id=spec.id,  # ✅ relation propre avec la table spécialités
                is_active=True,
                is_verified=True,
            )
            db.add(superadmin)

        db.commit()
        print("✅ Utilisateurs par défaut créés : acces@aetheris.com et superadmin@aetheris.com")

    finally:
        db.close()


# Appelé automatiquement au démarrage
create_default_users()
