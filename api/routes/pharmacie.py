from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from api.database import get_db
from api.routes.auth import get_current_user
from app.models.pharmacie import Pharmacie
from api.schemas.pharmacie import PharmacieCreate, PharmacieUpdate, PharmacieOut

router = APIRouter(prefix="/pharmacie", tags=["Pharmacie"])


# ➕ Ajouter un médicament
@router.post("/", response_model=PharmacieOut)
def create_medicament(
    data: PharmacieCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    medicament = Pharmacie(**data.dict())
    db.add(medicament)
    db.commit()
    db.refresh(medicament)
    return medicament


# 📋 Lister tous les médicaments
@router.get("/", response_model=List[PharmacieOut])
def list_medicaments(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    return db.query(Pharmacie).all()


# 🔍 Voir un médicament par ID
@router.get("/{medicament_id}", response_model=PharmacieOut)
def get_medicament(
    medicament_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    medicament = db.query(Pharmacie).filter(Pharmacie.id == medicament_id).first()
    if not medicament:
        raise HTTPException(status_code=404, detail="Médicament introuvable")
    return medicament


# ✏️ Modifier un médicament
@router.put("/{medicament_id}", response_model=PharmacieOut)
def update_medicament(
    medicament_id: int,
    data: PharmacieUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    medicament = db.query(Pharmacie).filter(Pharmacie.id == medicament_id).first()
    if not medicament:
        raise HTTPException(status_code=404, detail="Médicament introuvable")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(medicament, key, value)

    db.commit()
    db.refresh(medicament)
    return medicament


# ❌ Supprimer un médicament
@router.delete("/{medicament_id}")
def delete_medicament(
    medicament_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    medicament = db.query(Pharmacie).filter(Pharmacie.id == medicament_id).first()
    if not medicament:
        raise HTTPException(status_code=404, detail="Médicament introuvable")

    db.delete(medicament)
    db.commit()
    return {"message": "✅ Médicament supprimé avec succès"}


# 🚨 Médicaments en alerte (rupture / périmés / seuil critique)
@router.get("/alertes", response_model=List[PharmacieOut])
def get_alertes(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    today = datetime.utcnow()

    alertes = db.query(Pharmacie).filter(
        (Pharmacie.quantite <= Pharmacie.seuil_alerte) |
        (Pharmacie.statut == "Rupture") |
        ((Pharmacie.date_peremption != None) & (Pharmacie.date_peremption < today))
    ).all()

    return alertes
