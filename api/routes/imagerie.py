from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.database import get_db
from app.models.imagerie import Imagerie
from api.schemas.imagerie import ImagerieCreate, ImagerieUpdate, ImagerieRead
from typing import List

router = APIRouter(
    prefix="/imageries",
    tags=["Imageries"]
)


# ➕ Ajouter une imagerie
@router.post("/", response_model=ImagerieRead)
def create_imagerie(data: ImagerieCreate, db: Session = Depends(get_db)):
    imagerie = Imagerie(**data.dict())
    db.add(imagerie)
    db.commit()
    db.refresh(imagerie)
    return imagerie


# 📋 Liste des imageries
@router.get("/", response_model=List[ImagerieRead])
def list_imageries(db: Session = Depends(get_db)):
    return db.query(Imagerie).all()


# 👁️ Voir une imagerie par ID
@router.get("/{imagerie_id}", response_model=ImagerieRead)
def get_imagerie(imagerie_id: int, db: Session = Depends(get_db)):
    imagerie = db.query(Imagerie).filter(Imagerie.id == imagerie_id).first()
    if not imagerie:
        raise HTTPException(status_code=404, detail="Imagerie non trouvée")
    return imagerie


# ✏️ Modifier une imagerie
@router.put("/{imagerie_id}", response_model=ImagerieRead)
def update_imagerie(imagerie_id: int, data: ImagerieUpdate, db: Session = Depends(get_db)):
    imagerie = db.query(Imagerie).filter(Imagerie.id == imagerie_id).first()
    if not imagerie:
        raise HTTPException(status_code=404, detail="Imagerie non trouvée")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(imagerie, key, value)

    db.commit()
    db.refresh(imagerie)
    return imagerie


# ❌ Supprimer une imagerie
@router.delete("/{imagerie_id}")
def delete_imagerie(imagerie_id: int, db: Session = Depends(get_db)):
    imagerie = db.query(Imagerie).filter(Imagerie.id == imagerie_id).first()
    if not imagerie:
        raise HTTPException(status_code=404, detail="Imagerie non trouvée")

    db.delete(imagerie)
    db.commit()
    return {"detail": "✅ Imagerie supprimée avec succès"}
