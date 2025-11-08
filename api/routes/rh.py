from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from api.database import get_db
from app.models.rh import Employe
from app.models.user import User
from app.models.medecin import Medecin
from api.schemas.rh import EmployeCreate, EmployeRead, EmployeUpdate
from api.routes.auth import get_current_user

router = APIRouter(
    prefix="/rh",
    tags=["Ressources Humaines"],
)

# ==========================================================
# ✅ Vérification du rôle administrateur
# ==========================================================
def require_admin(user: User):
    if not user or user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    return user


# ==========================================================
# 🩺 Liste des médecins (fusion Employés RH + Table Médecin)
# ==========================================================
from pydantic import BaseModel

class MedecinRHRead(BaseModel):
    id: int
    nom: str
    prenom: str
    email: str
    specialite: Optional[str]
    hopital: Optional[str]
    role: str
    statut: Optional[str]

    class Config:
        orm_mode = True


@router.get("/medecins", response_model=List[MedecinRHRead])
def list_medecins(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    📋 Retourne tous les médecins (issus de la table RH et de la table Medecin)
    Accessible uniquement aux administrateurs.
    """
    require_admin(current_user)

    
    # 🔹 Recherche plus robuste des médecins dans la table RH
    medecins_rh = db.query(Employe).filter(
        or_(
            func.lower(Employe.poste).like("%medecin%"),
            func.lower(Employe.role).like("%medecin%"),
        )
    ).all()

    # 🔹 Médecins enregistrés dans la table Medecin (ancienne table)
    medecins_table = db.query(Medecin).all()

    all_medecins = []

    # Fusion cohérente des deux sources
    for m in medecins_rh:
        all_medecins.append({
            "id": m.id,
            "nom": m.nom,
            "prenom": m.prenom,
            "email": m.email,
            "specialite": m.poste,
            "hopital": getattr(m, "service", None),
            "role": m.role,
            "statut": getattr(m, "statut", "Actif"),
        })

    for m in medecins_table:
        all_medecins.append({
            "id": m.id,
            "nom": m.nom,
            "prenom": m.prenom,
            "email": m.email,
            "specialite": getattr(m, "specialite", None),
            "hopital": getattr(m, "hopital", None),
            "role": getattr(m, "role", "Médecin"),
            "statut": getattr(m, "statut", "Actif"),
        })

    if not all_medecins:
        raise HTTPException(status_code=404, detail="Aucun médecin trouvé")

    return all_medecins


# ==========================================================
# 📋 Liste des employés avec filtres avancés
# ==========================================================
@router.get("/", response_model=List[EmployeRead])
def list_employes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    nom: Optional[str] = Query(None, description="Filtrer par nom"),
    prenom: Optional[str] = Query(None, description="Filtrer par prénom"),
    email: Optional[str] = Query(None, description="Filtrer par email"),
    service: Optional[str] = Query(None, description="Filtrer par service"),
    poste: Optional[str] = Query(None, description="Filtrer par poste"),
    type_contrat: Optional[str] = Query(None, description="Filtrer par type de contrat"),
    statut: Optional[str] = Query(None, description="Filtrer par statut"),
    salaire_min: Optional[float] = Query(None, description="Salaire minimum"),
    salaire_max: Optional[float] = Query(None, description="Salaire maximum"),
):
    require_admin(current_user)

    query = db.query(Employe)

    # ✅ Application dynamique des filtres
    if nom:
        query = query.filter(Employe.nom.ilike(f"%{nom}%"))
    if prenom:
        query = query.filter(Employe.prenom.ilike(f"%{prenom}%"))
    if email:
        query = query.filter(Employe.email.ilike(f"%{email}%"))
    if service:
        query = query.filter(Employe.service.ilike(f"%{service}%"))
    if poste:
        query = query.filter(Employe.poste.ilike(f"%{poste}%"))
    if type_contrat:
        query = query.filter(Employe.type_contrat == type_contrat)
    if statut:
        query = query.filter(Employe.statut == statut)
    if salaire_min is not None:
        query = query.filter(Employe.salaire >= salaire_min)
    if salaire_max is not None:
        query = query.filter(Employe.salaire <= salaire_max)

    return query.all()


# ==========================================================
# ➕ Créer un employé
# ==========================================================
@router.post("/", response_model=EmployeRead, status_code=201)
def create_employe(
    employe: EmployeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    if db.query(Employe).filter(Employe.email == employe.email).first():
        raise HTTPException(status_code=400, detail="Un employé avec cet email existe déjà")

    matricule = employe.matricule or f"EMP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    new_employe = Employe(
        matricule=matricule,
        **employe.dict(exclude={"matricule"})
    )

    db.add(new_employe)
    db.commit()
    db.refresh(new_employe)
    return new_employe


# ==========================================================
# 👀 Récupérer un employé
# ==========================================================
@router.get("/{employe_id}", response_model=EmployeRead)
def get_employe(
    employe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)
    employe = db.query(Employe).filter(Employe.id == employe_id).first()
    if not employe:
        raise HTTPException(status_code=404, detail="Employé introuvable")
    return employe


# ==========================================================
# ✏️ Modifier un employé
# ==========================================================
@router.put("/{employe_id}", response_model=EmployeRead)
def update_employe(
    employe_id: int,
    updates: EmployeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    employe = db.query(Employe).filter(Employe.id == employe_id).first()
    if not employe:
        raise HTTPException(status_code=404, detail="Employé introuvable")

    for key, value in updates.dict(exclude_unset=True).items():
        setattr(employe, key, value)

    db.commit()
    db.refresh(employe)
    return employe


# ==========================================================
# ❌ Supprimer un employé
# ==========================================================
@router.delete("/{employe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employe(
    employe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    employe = db.query(Employe).filter(Employe.id == employe_id).first()
    if not employe:
        raise HTTPException(status_code=404, detail="Employé introuvable")

    db.delete(employe)
    db.commit()
    return {"message": "✅ Employé supprimé avec succès"}
