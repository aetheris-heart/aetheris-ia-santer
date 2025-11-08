from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime

from api.database import get_db
from api.schemas.notification import NotificationCreate, NotificationRead, NotificationUpdate
from app.models.notification import Notification
from app.models.user import User
from api.routes.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


# 🧠 1️⃣ Créer une notification (automatique ou manuelle)
@router.post("/", response_model=NotificationRead)
def create_notification(
    notif: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Créer une nouvelle notification IA / système / médecin"""
    obj = Notification(
        titre=notif.titre,
        message=notif.message,
        type=notif.type or "info",
        niveau=notif.niveau or "Normal",
        origine=notif.origine or "Aetheris IA",
        lu=False,
        user_id=notif.user_id or current_user.id,
        patient_id=notif.patient_id,
        consultation_id=notif.consultation_id,
        created_at=datetime.utcnow(),
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


# 📬 2️⃣ Récupérer les notifications filtrées
@router.get("/", response_model=List[NotificationRead])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    type: Optional[str] = Query(None, description="Filtrer par type (info, alerte, critique)"),
    niveau: Optional[str] = Query(None, description="Filtrer par niveau (Bas, Modéré, Élevé, Critique)"),
    patient_id: Optional[int] = Query(None, description="Filtrer par patient ID"),
    non_lues: Optional[bool] = Query(False, description="Afficher uniquement les non-lues"),
):
    """Lister toutes les notifications du médecin connecté, filtrables"""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    if type:
        query = query.filter(Notification.type == type)
    if niveau:
        query = query.filter(Notification.niveau == niveau)
    if patient_id:
        query = query.filter(Notification.patient_id == patient_id)
    if non_lues:
        query = query.filter(Notification.lu.is_(False))

    notifications = query.order_by(
        desc(Notification.niveau == "Critique"),  # 🔥 priorité aux critiques
        desc(Notification.created_at)
    ).all()

    return notifications


# 🧩 3️⃣ Récupérer les notifications liées à un patient
@router.get("/patient/{patient_id}", response_model=List[NotificationRead])
def get_patient_notifications(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lister les notifications liées à un patient"""
    return (
        db.query(Notification)
        .filter(Notification.patient_id == patient_id)
        .order_by(desc(Notification.created_at))
        .all()
    )


# ✏️ 4️⃣ Marquer comme lue / modifier
@router.put("/{notif_id}", response_model=NotificationRead)
def update_notification(
    notif_id: int,
    update: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification introuvable")

    for key, value in update.dict(exclude_unset=True).items():
        setattr(notif, key, value)

    notif.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(notif)
    return notif


# 🗑️ 5️⃣ Supprimer une notification
@router.delete("/{notif_id}")
def delete_notification(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification introuvable")

    db.delete(notif)
    db.commit()
    return {"message": f"🗑️ Notification #{notif_id} supprimée avec succès ✅"}
