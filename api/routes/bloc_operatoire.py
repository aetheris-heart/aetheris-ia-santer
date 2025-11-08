# api/routes/bloc_operatoire.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.database import get_db
from app.models.bloc_operatoire import BlocOperatoire
from api.schemas import bloc_operatoire as schemas
from typing import List

router = APIRouter(
    prefix="/bloc-operatoire",
    tags=["Bloc Opératoire"]
)

@router.post("/", response_model=schemas.BlocOperatoireRead)
def create_bloc(data: schemas.BlocOperatoireCreate, db: Session = Depends(get_db)):
    bloc = BlocOperatoire(**data.dict())
    db.add(bloc)
    db.commit()
    db.refresh(bloc)
    return bloc

@router.get("/", response_model=List[schemas.BlocOperatoireRead])
def list_blocs(db: Session = Depends(get_db)):
    return db.query(BlocOperatoire).all()

@router.get("/{bloc_id}", response_model=schemas.BlocOperatoireRead)
def get_bloc(bloc_id: int, db: Session = Depends(get_db)):
    bloc = db.query(BlocOperatoire).filter(BlocOperatoire.id == bloc_id).first()
    if not bloc:
        raise HTTPException(status_code=404, detail="Bloc opératoire introuvable")
    return bloc

@router.put("/{bloc_id}", response_model=schemas.BlocOperatoireRead)
def update_bloc(bloc_id: int, data: schemas.BlocOperatoireUpdate, db: Session = Depends(get_db)):
    bloc = db.query(BlocOperatoire).filter(BlocOperatoire.id == bloc_id).first()
    if not bloc:
        raise HTTPException(status_code=404, detail="Bloc opératoire introuvable")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(bloc, key, value)

    db.commit()
    db.refresh(bloc)
    return bloc

@router.delete("/{bloc_id}")
def delete_bloc(bloc_id: int, db: Session = Depends(get_db)):
    bloc = db.query(BlocOperatoire).filter(BlocOperatoire.id == bloc_id).first()
    if not bloc:
        raise HTTPException(status_code=404, detail="Bloc opératoire introuvable")

    db.delete(bloc)
    db.commit()
    return {"message": "Bloc opératoire supprimé"}
