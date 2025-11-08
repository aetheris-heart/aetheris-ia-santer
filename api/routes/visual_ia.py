import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import os
from app import models
from api.database import get_db
from api.routes.auth import get_current_user
from app.models.visual_ia import VisualIA
from api.schemas.visual_ia import VisualIACreate, VisualIAUpdate, VisualIAOut
from pydantic import BaseModel, Field

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/modules-ia", tags=["Visual IA"])

# 🧠 Schéma Pydantic pour validation
class VisualIASettingsSchema(BaseModel):
    autoMode: bool = Field(default=True, description="Mode d’analyse automatique")
    confidenceThreshold: int = Field(default=90, ge=70, le=99, description="Seuil minimal de confiance IA")
    refreshInterval: int = Field(default=15, ge=5, le=120, description="Fréquence de mise à jour (secondes)")
    darkMode: bool = Field(default=True, description="Mode d’affichage sombre ou clair")
    iaStatus: str = Field(default="active", description="Statut IA (active / standby)")


# ➕ Ajouter une analyse visuelle
@router.post("/visual", response_model=VisualIAOut)
def create_visual(
    data: VisualIACreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    analyse = VisualIA(**data.dict())
    db.add(analyse)
    db.commit()
    db.refresh(analyse)
    return analyse

# 📂 Upload fichier lié
@router.post("/visual/upload", response_model=VisualIAOut)
def upload_visual(
    patient_id: int,
    diagnostic: str,
    domaine: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    analyse = VisualIA(
        patient_id=patient_id,
        diagnostic=diagnostic,
        domaine=domaine,
        file_path=file.filename,
        date=datetime.utcnow(),
    )
    db.add(analyse)
    db.commit()
    db.refresh(analyse)
    return analyse

# 📋 Liste historique
@router.get("/visual-history", response_model=List[VisualIAOut])
def get_history(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    return db.query(VisualIA).order_by(VisualIA.date.desc()).all()

# 🔍 Détail par ID
# 🧠 Route premium : détails enrichis d'une analyse IA visuelle
@router.get("/visual-detail/{id}")
def get_visual_detail(id: int, db: Session = Depends(get_db)):
    # 🔍 Recherche de l’analyse IA
    analyse = db.query(models.VisualIA).filter(models.VisualIA.id == id).first()
    if not analyse:
        raise HTTPException(status_code=404, detail="Analyse IA introuvable")

    # 🧠 Recherche du patient associé
    patient = db.query(models.Patient).filter(models.Patient.id == analyse.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient associé introuvable")

    # 🧮 Calcul dynamique du niveau de confiance IA
    base_confiance = 88
    if analyse.domaine:
        domaine = analyse.domaine.lower()
        if domaine == "radiologie":
            base_confiance += 5
        elif domaine in ["cardiaque", "neurologique"]:
            base_confiance += 3
    if "masse" in analyse.diagnostic.lower() or "suspicion" in analyse.diagnostic.lower():
        base_confiance -= 5
    confiance = max(70, min(99, base_confiance))

    # 🩻 Interprétation automatique du diagnostic
    diag = analyse.diagnostic.lower()
    if "masse" in diag:
        interpretation = (
            "Présence possible d’une masse suspecte détectée par Aetheris IA. "
            "Un examen complémentaire (IRM, scanner, ou biopsie) est recommandé."
        )
    elif "fracture" in diag:
        interpretation = (
            "Fracture identifiée par Aetheris IA. Vérifier l’alignement osseux et planifier un suivi chirurgical si nécessaire."
        )
    elif "pneumonie" in diag:
        interpretation = (
            "Signes compatibles avec une pneumonie détectée par Aetheris IA. "
            "Un traitement antibiotique ou une imagerie de contrôle peut être envisagé."
        )
    else:
        interpretation = (
            "Aucune anomalie majeure détectée. Suivi clinique standard conseillé."
        )

    # 💡 Recommandations IA personnalisées
    recommandations = []
    if analyse.domaine and analyse.domaine.lower() == "radiologie":
        recommandations.append("➡️ Comparer avec les examens radiologiques antérieurs du patient.")
    if patient.age and patient.age > 60:
        recommandations.append("⚠️ Surveillance renforcée recommandée en raison de l’âge du patient.")
    if "masse" in diag:
        recommandations.append("🧬 Biopsie ou analyse histologique à envisager pour confirmation.")
    elif "pneumonie" in diag:
        recommandations.append("💊 Suivi clinique rapproché et traitement approprié à initier.")
    else:
        recommandations.append("✅ Aucun suivi urgent nécessaire à ce stade.")

    # 🔥 Niveau de gravité
    if "masse" in diag:
        niveau_gravite = "🔴 Critique"
    elif "suspicion" in diag or "fracture" in diag:
        niveau_gravite = "🟠 Modérée"
    else:
        niveau_gravite = "🟢 Stable"

    # 🧾 Résumé enrichi
    resume = {
        "analyse_id": analyse.id,
        "patient_id": analyse.patient_id,
        "nom_patient": patient.nom,
        "prenom_patient": patient.prenom,
        "age": patient.age,
        "domaine": analyse.domaine,
        "diagnostic": analyse.diagnostic,
        "interpretation": interpretation,
        "recommandations": recommandations,
        "confiance_ia": f"{confiance}%",
        "niveau_gravite": niveau_gravite,
        "analyse_effectuee_par": "🧠 Aetheris Visual Intelligence Core v3.0",
        "file_path": analyse.file_path,
        "date_analyse": analyse.date.strftime("%d/%m/%Y %H:%M"),
    }

    # ✅ Retour JSON clair et complet
    return {
        "status": "success",
        "message": "Analyse IA récupérée avec succès.",
        "data": resume
    }
@router.get("/visual-settings", response_model=VisualIASettingsSchema)
def get_visual_ia_settings(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    🔎 Récupère les réglages personnels du moteur Aetheris Visual IA
    pour l'utilisateur connecté. Renvoie des valeurs par défaut si aucun réglage n'existe encore.
    """
    settings = (
        db.query(models.VisualIASettings)
        .filter(models.VisualIASettings.user_id == current_user.id)
        .first()
    )

    if not settings:
        return VisualIASettingsSchema()

    return VisualIASettingsSchema(
        autoMode=settings.autoMode,
        confidenceThreshold=settings.confidenceThreshold,
        refreshInterval=settings.refreshInterval,
        darkMode=settings.darkMode,
        iaStatus=settings.iaStatus,
    )


# ==========================================================
# 💾 PUT – Sauvegarder ou mettre à jour les réglages Visual IA
# ==========================================================
@router.put("/visual-settings", response_model=dict)
def update_visual_ia_settings(
    payload: VisualIASettingsSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    💾 Sauvegarde ou met à jour les réglages Visual IA pour l'utilisateur connecté.
    """
    settings = (
        db.query(models.VisualIASettings)
        .filter(models.VisualIASettings.user_id == current_user.id)
        .first()
    )

    # 🔧 Création si inexistante
    if not settings:
        settings = models.VisualIASettings(user_id=current_user.id)
        db.add(settings)

    # 🧠 Mise à jour dynamique
    for field, value in payload.dict().items():
        setattr(settings, field, value)

    settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(settings)

    return {
        "status": "✅ Succès",
        "message": "Les paramètres Visual IA ont été enregistrés avec succès.",
        "data": {
            "autoMode": settings.autoMode,
            "confidenceThreshold": settings.confidenceThreshold,
            "refreshInterval": settings.refreshInterval,
            "darkMode": settings.darkMode,
            "iaStatus": settings.iaStatus,
            "updated_at": settings.updated_at,
            "user_id": settings.user_id,
        },
        "metadata": {
            "engine": "Aetheris Visual Intelligence Core v3.0",
            "last_modified_by": f"{current_user.nom} {current_user.prenom}",
        },
    }

   

# ✏️ Modifier
@router.put("/visual/{id}", response_model=VisualIAOut)
def update_visual(
    id: int,
    data: VisualIAUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    analyse = db.query(VisualIA).filter(VisualIA.id == id).first()
    if not analyse:
        raise HTTPException(status_code=404, detail="Analyse IA introuvable")
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(analyse, key, value)
    db.commit()
    db.refresh(analyse)
    return analyse

# ❌ Supprimer
@router.delete("/visual/{id}")
def delete_visual(id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    analyse = db.query(VisualIA).filter(VisualIA.id == id).first()
    if not analyse:
        raise HTTPException(status_code=404, detail="Analyse IA introuvable")
    db.delete(analyse)
    db.commit()
    return {"message": "✅ Analyse IA supprimée"}
