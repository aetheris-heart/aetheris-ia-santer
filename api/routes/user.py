from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from api.database import get_db
from app import models
from api.schemas.user import UserCreate, UserOut, UserUpdate

router = APIRouter(
    prefix="/users",
    tags=["Utilisateurs / Médecins"]
)


# =====================================================
# 🟢 Créer un utilisateur (Médecin ou autre)
# =====================================================
@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Crée un nouvel utilisateur (par défaut un médecin).
    Vérifie l'unicité de l'email et ajoute le compte à la base.
    """
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="❌ Un utilisateur avec cet email existe déjà."
        )

    # 🔐 Possibilité future de sécuriser le mot de passe
    # hashed_password = get_password_hash(user.password)
    hashed_password = user.password

    db_user = models.User(
        nom=user.nom.strip(),
        prenom=user.prenom.strip() if user.prenom else None,
        email=user.email.lower(),
        hashed_password=hashed_password,
        telephone=getattr(user, "telephone", None),
        specialite=getattr(user, "specialite", None),
        diplome=getattr(user, "diplome", None),
        experience=getattr(user, "experience", None),
        hopital=getattr(user, "hopital", None),
        role=user.role.capitalize() if user.role else "Médecin",
        statut=getattr(user, "statut", "Actif"),
        bio=getattr(user, "bio", None),
        photo_url=getattr(user, "photo_url", None),
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# =====================================================
# 🔵 Lister tous les utilisateurs (ou filtrer par rôle)
# =====================================================
@router.get("/", response_model=List[UserOut])
def get_all_users(
    role: Optional[str] = Query(None, description="Filtrer les utilisateurs par rôle"),
    statut: Optional[str] = Query(None, description="Filtrer par statut"),
    db: Session = Depends(get_db)
):
    """
    Retourne tous les utilisateurs ou filtre selon un rôle ou un statut :
    - /users → tous les utilisateurs
    - /users?role=medecin → seulement les médecins
    - /users?statut=actif → seulement les actifs
    """
    query = db.query(models.User)
    if role:
        query = query.filter(models.User.role.ilike(f"%{role}%"))
    if statut:
        query = query.filter(models.User.statut.ilike(f"%{statut}%"))
    return query.order_by(models.User.created_at.desc()).all()


# =====================================================
# 🩺 Lister uniquement les médecins
# =====================================================
@router.get("/medecins", response_model=List[UserOut])
def get_medecins(db: Session = Depends(get_db)):
    """
    Retourne uniquement les utilisateurs ayant un rôle de médecin.
    Utilisé par le module RH et le tableau de bord médical.
    """
    medecins = (
        db.query(models.User)
        .filter(models.User.role.ilike("%medecin%"))
        .order_by(models.User.created_at.desc())
        .all()
    )
    if not medecins:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aucun médecin trouvé.")
    return medecins


# =====================================================
# 🟣 Obtenir un utilisateur par ID
# =====================================================
@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Retourne les détails d’un utilisateur par son ID.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable ⚠️")
    return user


# =====================================================
# 🟠 Modifier un utilisateur
# =====================================================
@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    """
    Met à jour les informations d’un utilisateur existant.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable ⚠️")

    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


# =====================================================
# 🔴 Supprimer un utilisateur
# =====================================================
@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Supprime un utilisateur par son ID.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable ⚠️")

    db.delete(user)
    db.commit()
    return {"message": f"✅ Utilisateur {user.nom} supprimé avec succès."}
