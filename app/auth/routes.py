from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from api.database import get_db
from app.models.user import User
from api.schemas.user import UserCreate, UserOut, UserResponse, PasswordChangeRequest
from app.security import verify_password, get_password_hash, create_access_token
from app.security import get_current_user


router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides")
    try:
        if not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur vérification mot de passe: {str(e)}")

    # ✅ Appel corrigé
    access_token = create_access_token(subject=user.email, uid=user.id, role=user.role)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/register", response_model=UserResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    user_exists = db.query(User).filter(User.email == user_data.email).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    hashed_pwd = get_password_hash(user_data.password)  # ✅ champ correct
    user = User(
        nom=user_data.nom,
        prenom=user_data.prenom,
        email=user_data.email,
        specialite=user_data.specialite,
        photo_url=user_data.photo_url,
        hashed_password=hashed_pwd  # ✅ champ du modèle
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/change-password")
def change_password(
    body: PasswordChangeRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(body.old_password, current_user.hashed_password):  # ✅ ici aussi
        raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")
    current_user.hashed_password = get_password_hash(body.new_password)  # ✅ update sécurisé
    db.commit()
    return {"message": "Mot de passe mis à jour avec succès ✅"}
