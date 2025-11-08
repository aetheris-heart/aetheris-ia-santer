from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from api.database import get_db
from api.schemas.soins import SoinCreate, SoinUpdate, SoinRead
from app.models.soins import SoinsInfirmier
from api.routes.auth import get_current_user  # ⚠️ adapte si ton chemin est différent


router = APIRouter(
    prefix="/soins",
    tags=["Soins Infirmiers"],
    responses={404: {"description": "Soin introuvable"}},
)


# 🔍 Utils
def get_soin_or_404(db: Session, soin_id: int) -> SoinsInfirmier:
    soin = db.query(SoinsInfirmier).filter(SoinsInfirmier.id == soin_id).first()
    if not soin:
        raise HTTPException(status_code=404, detail="Soin infirmier introuvable")
    return soin


# 📌 Lister les soins (avec filtres + pagination + tri)
@router.get("/", response_model=List[SoinRead])
def lister_soins(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
    patient_id: Optional[int] = Query(None, gt=0, description="Filtrer par patient ID"),
    type_soin: Optional[str] = Query(None, description="Filtrer par type de soin"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, gt=0, le=200),
    order_by: str = Query("date", description="Champ de tri (date, type_soin, id)"),
    order_dir: str = Query("desc", description="Ordre de tri (asc/desc)"),
):
    q = db.query(SoinsInfirmier)

    if patient_id:
        q = q.filter(SoinsInfirmier.patient_id == patient_id)
    if type_soin:
        q = q.filter(SoinsInfirmier.type_soin.ilike(f"%{type_soin}%"))

    order_col = {
        "date": SoinsInfirmier.date,
        "type_soin": SoinsInfirmier.type_soin,
        "id": SoinsInfirmier.id,
    }.get(order_by, SoinsInfirmier.date)

    q = q.order_by(desc(order_col) if order_dir.lower() == "desc" else asc(order_col))

    return q.offset(skip).limit(limit).all()


# 📌 Lire un soin par ID
@router.get("/{soin_id}", response_model=SoinRead)
def lire_soin(
    soin_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return get_soin_or_404(db, soin_id)


# 📌 Créer un soin
@router.post("/", response_model=SoinRead, status_code=status.HTTP_201_CREATED)
def creer_soin(
    data: SoinCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    soin = SoinsInfirmier(
        patient_id=data.patient_id,
        type_soin=data.type_soin,
        acte=data.acte,
        observations=data.observations,
        effectue_par=data.effectue_par or getattr(user, "nom", None),
        date=data.date,
    )
    db.add(soin)
    db.commit()
    db.refresh(soin)
    return soin


# 📌 Mettre à jour un soin
@router.put("/{soin_id}", response_model=SoinRead)
def maj_soin(
    soin_id: int,
    data: SoinUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    soin = get_soin_or_404(db, soin_id)

    update_fields = data.model_dump(exclude_unset=True)
    for k, v in update_fields.items():
        setattr(soin, k, v)

    db.commit()
    db.refresh(soin)
    return soin


# 📌 Supprimer un soin
@router.delete("/{soin_id}", status_code=status.HTTP_204_NO_CONTENT)
def supprimer_soin(
    soin_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    soin = get_soin_or_404(db, soin_id)
    db.delete(soin)
    db.commit()
    return
