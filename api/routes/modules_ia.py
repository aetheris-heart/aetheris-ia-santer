from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from api.database import get_db
from api.routes.auth import get_current_user
from app import models
from typing import Dict, Any

router = APIRouter(prefix="/modules-ia", tags=["Modules IA"])

# ============================================================
# ⚙️  ROUTE REELLE : RÉGLAGES DU MODULE VISUAL IA
# ============================================================
@router.get("/visual-settings")
def get_visual_ia_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Retourne les paramètres actuels du moteur Aetheris Vision IA.
    Ces réglages influencent le comportement du module visuel en temps réel.
    """

    # Exemple : on récupère les réglages dans une table dédiée (si elle existe)
    settings = db.query(models.VisualIASettings).first() if hasattr(models, "VisualIASettings") else None

    # Valeurs par défaut si aucune entrée n’existe
    if not settings:
        return {
            "engine": "Aetheris Vision Core",
            "version": "v3.2.1",
            "last_update": datetime.utcnow(),
            "confidence_threshold": 0.87,
            "auto_learning": True,
            "real_time_monitoring": True,
            "analysis_interval": "15s",
            "image_quality_filter": "HD",
            "anomaly_detection_mode": "DeepScan",
            "regions_monitored": ["thorax", "abdomen", "crâne"],
            "status": "active",
            "total_images_analyzed": db.query(models.VisualIA).count() if hasattr(models, "VisualIA") else 0,
        }

    # Sinon, on retourne les valeurs stockées
    return {
        "engine": settings.engine_name,
        "version": settings.engine_version,
        "last_update": settings.last_update,
        "confidence_threshold": settings.confidence_threshold,
        "auto_learning": settings.auto_learning,
        "real_time_monitoring": settings.real_time_monitoring,
        "analysis_interval": settings.analysis_interval,
        "image_quality_filter": settings.image_quality_filter,
        "anomaly_detection_mode": settings.anomaly_detection_mode,
        "regions_monitored": settings.regions_monitored.split(","),
        "status": settings.status,
        "total_images_analyzed": db.query(models.VisualIA).count() if hasattr(models, "VisualIA") else 0,
    }


# ============================================================
# 🔧 ROUTE POUR METTRE À JOUR LES RÉGLAGES
# ============================================================
@router.put("/visual-settings/update")
def update_visual_ia_settings(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Permet de modifier dynamiquement les réglages du moteur Aetheris IA Vision.
    Les modifications sont sauvegardées et immédiatement appliquées.
    """
    # Si modèle VisualIASettings existe :
    if hasattr(models, "VisualIASettings"):
        settings = db.query(models.VisualIASettings).first()
        if not settings:
            raise HTTPException(status_code=404, detail="Paramètres IA introuvables.")

        for key, value in payload.items():
            if hasattr(settings, key):
                setattr(settings, key, value)

        settings.last_update = datetime.utcnow()
        db.commit()
        db.refresh(settings)

        return {"message": "Réglages IA mis à jour avec succès", "data": payload}

    # Sinon, mode fallback simulé
    return {
        "message": "⚠️ Mode simulation : aucune table VisualIASettings trouvée.",
        "applied_changes": payload,
    }
