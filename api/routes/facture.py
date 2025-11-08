from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from api.database import get_db
from app.models.facture import Facture
from app.models.patient import Patient
from app.models.user import User
from api.schemas.facture import FactureCreate, FactureRead, FactureUpdate
from api.routes.auth import get_current_user

router = APIRouter(
    prefix="/factures",
    tags=["Factures"],
)


# ✅ Vérifier que l’utilisateur est admin ou médecin
def require_admin_or_medecin(user: User):
    if not user or user.role not in ["admin", "medecin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs et médecins"
        )
    return user


# =============================
# 📋 Liste des factures avec filtres
# =============================
@router.get("/", response_model=List[FactureRead])
def list_factures(
    statut: Optional[str] = Query(None, description="Filtrer par statut"),
    patient_id: Optional[int] = Query(None, description="Filtrer par patient"),
    medecin_id: Optional[int] = Query(None, description="Filtrer par médecin"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin_or_medecin(current_user)

    query = db.query(Facture)

    if statut:
        query = query.filter(Facture.statut == statut)
    if patient_id:
        query = query.filter(Facture.patient_id == patient_id)
    if medecin_id:
        query = query.filter(Facture.medecin_id == medecin_id)

    return query.order_by(Facture.date_emission.desc()).all()


# =============================
# ➕ Créer une facture
# =============================
@router.post("/", response_model=FactureRead, status_code=201)
def create_facture(
    facture: FactureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin_or_medecin(current_user)

    # ✅ Vérifie patient existe
    patient = db.query(Patient).filter(Patient.id == facture.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    # ✅ Générer numéro de facture si absent
    numero_facture = facture.numero_facture
    if not numero_facture:
        last_facture = db.query(Facture).order_by(Facture.id.desc()).first()
        next_id = (last_facture.id + 1) if last_facture else 1
        numero_facture = f"FAC-{datetime.utcnow().year}-{next_id:04d}"

    new_facture = Facture(
        numero_facture=numero_facture,
        patient_id=facture.patient_id,
        medecin_id=facture.medecin_id,
        montant_ht=facture.montant_ht,
        taxe=facture.taxe or 0.0,
        montant_total=facture.montant_total,
        statut=facture.statut or "en attente",
        methode_paiement=facture.methode_paiement,
        reference_paiement=facture.reference_paiement,
        description=facture.description,
        notes_internes=facture.notes_internes,
        date_emission=facture.date_emission or datetime.utcnow(),
        date_echeance=facture.date_echeance,
        date_paiement=facture.date_paiement,
    )

    db.add(new_facture)
    db.commit()
    db.refresh(new_facture)

    return new_facture


# =============================
# 👀 Détail d’une facture
# =============================
@router.get("/{facture_id}", response_model=FactureRead)
def get_facture(
    facture_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin_or_medecin(current_user)

    facture = db.query(Facture).filter(Facture.id == facture_id).first()
    if not facture:
        raise HTTPException(status_code=404, detail="Facture introuvable")

    return facture


# =============================
# ✏️ Modifier une facture
# =============================
@router.put("/{facture_id}", response_model=FactureRead)
def update_facture(
    facture_id: int,
    updates: FactureUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin_or_medecin(current_user)

    facture = db.query(Facture).filter(Facture.id == facture_id).first()
    if not facture:
        raise HTTPException(status_code=404, detail="Facture introuvable")

    for key, value in updates.dict(exclude_unset=True).items():
        setattr(facture, key, value)

    db.commit()
    db.refresh(facture)
    return facture


# =============================
# ❌ Supprimer une facture
# =============================
@router.delete("/{facture_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_facture(
    facture_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin_or_medecin(current_user)

    facture = db.query(Facture).filter(Facture.id == facture_id).first()
    if not facture:
        raise HTTPException(status_code=404, detail="Facture introuvable")

    db.delete(facture)
    db.commit()
    return {"message": "✅ Facture supprimée avec succès"}
