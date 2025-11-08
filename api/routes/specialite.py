from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from api.database import get_db
from api.routes.auth import get_current_user
from app.models.specialite import Specialite
from api.schemas.specialite import SpecialiteCreate, SpecialiteUpdate, SpecialiteOut

router = APIRouter(prefix="/specialites", tags=["Spécialités Médicales"])

# ➕ Créer une spécialité
@router.post("/", response_model=SpecialiteOut)
def create_specialite(data: SpecialiteCreate, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    specialite = Specialite(**data.dict())
    db.add(specialite)
    db.commit()
    db.refresh(specialite)
    return specialite

# 📋 Lister toutes les spécialités
@router.get("/", response_model=List[SpecialiteOut])
def list_specialites(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    return db.query(Specialite).all()

# 🔍 Voir une spécialité
@router.get("/{specialite_id}", response_model=SpecialiteOut)
def get_specialite(specialite_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    specialite = db.query(Specialite).filter(Specialite.id == specialite_id).first()
    if not specialite:
        raise HTTPException(status_code=404, detail="Spécialité introuvable")
    return specialite

# ✏️ Modifier une spécialité
@router.put("/{specialite_id}", response_model=SpecialiteOut)
def update_specialite(specialite_id: int, data: SpecialiteUpdate, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    specialite = db.query(Specialite).filter(Specialite.id == specialite_id).first()
    if not specialite:
        raise HTTPException(status_code=404, detail="Spécialité introuvable")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(specialite, key, value)
    db.commit()
    db.refresh(specialite)
    return specialite

# ❌ Supprimer une spécialité
@router.delete("/{specialite_id}")
def delete_specialite(specialite_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    specialite = db.query(Specialite).filter(Specialite.id == specialite_id).first()
    if not specialite:
        raise HTTPException(status_code=404, detail="Spécialité introuvable")
    db.delete(specialite)
    db.commit()
    return {"message": "✅ Spécialité supprimée avec succès"}
