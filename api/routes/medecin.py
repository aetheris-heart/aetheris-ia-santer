from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from api.database import get_db
from app import models
from api.schemas.medecin import MedecinRead, MedecinCreate, MedecinUpdate
from api.routes.auth import get_current_user

router = APIRouter(
    prefix="/medecins",
    tags=["Médecins"],
    dependencies=[Depends(get_current_user)]
)

# 🩺 Liste tous les médecins
@router.get("/", response_model=List[MedecinRead])
def get_all_medecins(db: Session = Depends(get_db)):
    medecins = db.query(models.Medecin).order_by(models.Medecin.id.desc()).all()
    if not medecins:
        raise HTTPException(status_code=404, detail="Aucun médecin trouvé")
    return medecins

# 🟢 Ajouter un médecin
@router.post("/", response_model=MedecinRead)
def create_medecin(medecin: MedecinCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Medecin).filter(models.Medecin.email == medecin.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Un médecin avec cet email existe déjà")

    new_medecin = models.Medecin(**medecin.dict())
    db.add(new_medecin)
    db.commit()
    db.refresh(new_medecin)
    return new_medecin

# 🟣 Obtenir un médecin par ID
@router.get("/{medecin_id}", response_model=MedecinRead)
def get_medecin(medecin_id: int, db: Session = Depends(get_db)):
    medecin = db.query(models.Medecin).filter(models.Medecin.id == medecin_id).first()
    if not medecin:
        raise HTTPException(status_code=404, detail="Médecin introuvable")
    return medecin

# 🟠 Modifier un médecin
@router.put("/{medecin_id}", response_model=MedecinRead)
def update_medecin(medecin_id: int, updates: MedecinUpdate, db: Session = Depends(get_db)):
    medecin = db.query(models.Medecin).filter(models.Medecin.id == medecin_id).first()
    if not medecin:
        raise HTTPException(status_code=404, detail="Médecin introuvable")

    for key, value in updates.dict(exclude_unset=True).items():
        setattr(medecin, key, value)

    db.commit()
    db.refresh(medecin)
    return medecin

# 🔴 Supprimer un médecin
@router.delete("/{medecin_id}")
def delete_medecin(medecin_id: int, db: Session = Depends(get_db)):
    medecin = db.query(models.Medecin).filter(models.Medecin.id == medecin_id).first()
    if not medecin:
        raise HTTPException(status_code=404, detail="Médecin introuvable")

    db.delete(medecin)
    db.commit()
    return {"message": "✅ Médecin supprimé avec succès"}
