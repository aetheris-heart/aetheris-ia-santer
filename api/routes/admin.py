from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from api.database import get_db
from app.models.demande import DemandeCompte

from app.models.user import User
from api.routes.auth import get_password_hash, get_current_user

# Schemas
from api.schemas.admin import (
    AdminStats,
    DemandeCompteRead,
    DemandeValidationResponse,
    DemandeRefusResponse,
    UserCreated,
    AdminCreate,
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


# ✅ Vérifier que l'utilisateur est admin
def require_admin(user: User):
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    return user


# =============================
# 📊 Statistiques globales admin
# =============================
@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    # Comptage des utilisateurs
    total_users = db.query(User).count()

    # Comptage des patients, consultations et rendez-vous
    from app.models.patient import Patient
    from app.models.consultation import Consultation
    from app.models.rendezvous import RendezVous

    total_patients = db.query(Patient).count()
    total_consultations = db.query(Consultation).count()
    total_rendezvous = db.query(RendezVous).count()

    # Comptage des demandes de comptes
    demandes_en_attente = (
        db.query(DemandeCompte).filter(DemandeCompte.statut == "en_attente").count()
    )

    return AdminStats(
        total_users=total_users,
        total_patients=total_patients,
        total_consultations=total_consultations,
        total_rendezvous=total_rendezvous,
        demandes_en_attente=demandes_en_attente,
    )


# =============================
# 📥 Liste des demandes de comptes
# =============================
@router.get("/demandes", response_model=list[DemandeCompteRead])
def list_demandes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)
    return db.query(DemandeCompte).order_by(DemandeCompte.date_demande.desc()).all()


# =============================
# ✅ Valider une demande de compte
# =============================
@router.post("/valider/{demande_id}", response_model=DemandeValidationResponse)
def valider_demande(
    demande_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    demande = db.query(DemandeCompte).filter(DemandeCompte.id == demande_id).first()
    if not demande:
        raise HTTPException(status_code=404, detail="Demande introuvable")

    if demande.statut != "en_attente":
        raise HTTPException(status_code=400, detail="Cette demande a déjà été traitée")

    # Créer l'utilisateur associé
    new_user = User(
        nom=demande.nom,
        prenom=demande.prenom,
        email=demande.email,
        role=demande.role_demande,
        hashed_password=get_password_hash("changeme123"),  # ✅ mot de passe temporaire
        specialite=demande.specialite,
        is_verified=True,
    )

    db.add(new_user)

    # Mettre à jour la demande
    demande.statut = "valide"
    demande.date_validation = datetime.utcnow()
    demande.valide_par_id = current_user.id
    db.commit()
    db.refresh(new_user)

    return DemandeValidationResponse(
        message="✅ Demande validée et compte utilisateur créé",
        user=UserCreated.from_orm(new_user),
    )


# =============================
# ❌ Refuser une demande
# =============================
@router.post("/refuser/{demande_id}", response_model=DemandeRefusResponse)
def refuser_demande(
    demande_id: int,
    commentaire: str = "Demande refusée par l'administrateur",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    demande = db.query(DemandeCompte).filter(DemandeCompte.id == demande_id).first()
    if not demande:
        raise HTTPException(status_code=404, detail="Demande introuvable")

    if demande.statut != "en_attente":
        raise HTTPException(status_code=400, detail="Cette demande a déjà été traitée")

    demande.statut = "refuse"
    demande.commentaire_admin = commentaire
    demande.date_validation = datetime.utcnow()
    demande.valide_par_id = current_user.id

    db.commit()
    db.refresh(demande)

    return DemandeRefusResponse(
        message="❌ Demande refusée",
        demande=DemandeCompteRead.from_orm(demande),
    )


# =============================
# 🛡️ Créer un administrateur directement
# =============================
@router.post("/creer", response_model=UserCreated)
def creer_admin(
    data: AdminCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    # Vérifie si l'email existe déjà
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="Un utilisateur avec cet email existe déjà"
        )

    
    new_admin = User(
    nom=data.nom,
    prenom=data.prenom,
    email=data.email,
    hashed_password=get_password_hash(data.mot_de_passe),
    role="admin",
    specialite=data.specialite,
    is_active=True,
    is_verified=True,
)

    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return UserCreated.from_orm(new_admin)


# =============================
# 👥 Liste des administrateurs
# =============================
@router.get("/liste", response_model=list[UserCreated])
def liste_admins(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)
    return db.query(User).filter(User.role == "admin").all()
