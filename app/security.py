# api/security.py
from __future__ import annotations

import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Iterable

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session

# --- DB ---
try:
    # Projet où les modèles sont sous app.models
    from app.models.user import User
except Exception:
    # Variante où les modèles sont à la racine
    from models.user import User  # type: ignore

try:
    from api.database import get_db
except Exception:
    # Variante si l'import diffère
    from database import get_db  # type: ignore


# =============================================================================
# CONFIG / CONSTANTES (env first, defaults ensuite)
# =============================================================================
SECRET_KEY: str = os.getenv("AUTH_SECRET_KEY") or os.getenv("SECRET_KEY", "change-this-in-prod")
ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")

ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))

# Important: doit pointer vers ta route de login
OAUTH2_TOKEN_URL: str = os.getenv("OAUTH2_TOKEN_URL", "/auth/login")

# Hash de mot de passe (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 bearer (option strict et optionnel)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=OAUTH2_TOKEN_URL, auto_error=True)
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl=OAUTH2_TOKEN_URL, auto_error=False)


# =============================================================================
# UTILS MOT DE PASSE
# =============================================================================
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# =============================================================================
# JWT: CREATION / DECODAGE / VALIDATION
# =============================================================================
def _utc_now() -> datetime:
    # Toujours timezone-aware
    return datetime.now(timezone.utc)


def create_access_token(
    subject: str,
    *,
    uid: Optional[int] = None,
    role: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[dict] = None,
) -> str:
    """
    subject: généralement l'email (sub)
    uid: id user (facultatif mais recommandé)
    role: rôle applicatif (admin, medecin, …)
    """
    to_encode = {
        "sub": subject,
        "type": "access",
        "iat": int(_utc_now().timestamp()),
        "jti": uuid.uuid4().hex,
    }
    if uid is not None:
        to_encode["uid"] = uid
    if role is not None:
        to_encode["role"] = role
    if extra_claims:
        to_encode.update(extra_claims)

    expire = _utc_now() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode["exp"] = expire

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(
    subject: str,
    *,
    uid: Optional[int] = None,
    role: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    to_encode = {
        "sub": subject,
        "type": "refresh",
        "iat": int(_utc_now().timestamp()),
        "jti": uuid.uuid4().hex,
    }
    if uid is not None:
        to_encode["uid"] = uid
    if role is not None:
        to_encode["role"] = role

    expire = _utc_now() + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode["exp"] = expire

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


def _validate_common_claims(payload: dict, expected_type: Optional[str] = None) -> None:
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")

    # Claims minimales
    if "sub" not in payload or "exp" not in payload or "iat" not in payload or "jti" not in payload:
        raise HTTPException(status_code=401, detail="Token incomplet")

    if expected_type and payload.get("type") != expected_type:
        raise HTTPException(status_code=401, detail="Type de token incorrect")

    # (Optionnel) tu peux vérifier ici une blacklist JTI si tu implémentes une table dédiée.
    # ex: if is_revoked_jti(payload["jti"]): raise HTTPException(401, "Token révoqué")


# =============================================================================
# AUTHENTIFICATION
# =============================================================================
def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user: Optional[User] = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_token_pair_for_user(user: User) -> dict:
    """
    Génère un couple (access, refresh) cohérent pour un utilisateur.
    """
    access = create_access_token(subject=user.email, uid=getattr(user, "id", None), role=getattr(user, "role", None))
    refresh = create_refresh_token(subject=user.email, uid=getattr(user, "id", None), role=getattr(user, "role", None))
    return {
        "token_type": "bearer",
        "access_token": access,
        "refresh_token": refresh,
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


def refresh_access_token(refresh_token: str, db: Session) -> str:
    payload = decode_token(refresh_token)
    _validate_common_claims(payload, expected_type="refresh")
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Token de rafraîchissement invalide")
    user: Optional[User] = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    # (Optionnel) vérifier si l'utilisateur est toujours actif/autorisé
    return create_access_token(subject=email, uid=getattr(user, "id", None), role=getattr(user, "role", None))


# =============================================================================
# DEPENDENCIES (à utiliser dans tes routes)
# =============================================================================
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)
    _validate_common_claims(payload, expected_type="access")
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Token invalide (sub manquant)")

    user: Optional[User] = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # (Optionnel) s'assurer que le compte est actif/vérifié
    if hasattr(user, "is_active") and not user.is_active:
        raise HTTPException(status_code=403, detail="Compte désactivé")
    if hasattr(user, "is_verified") and not user.is_verified:
        # Selon ta politique, tu peux interdire ou juste prévenir.
        pass

    return user


def get_current_user_optional(
    token: Optional[str] = Depends(optional_oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Retourne l'utilisateur si un token valide est présent, sinon None.
    Utile pour des routes publiques avec avantages si connecté.
    """
    if not token:
        return None
    payload = decode_token(token)
    try:
        _validate_common_claims(payload, expected_type="access")
    except HTTPException:
        return None
    email = payload.get("sub")
    if not email:
        return None
    return db.query(User).filter(User.email == email).first()


# --- Guards de rôles/états ----------------------------------------------------
def require_active_user(current_user: User = Depends(get_current_user)) -> User:
    if hasattr(current_user, "is_active") and not current_user.is_active:
        raise HTTPException(status_code=403, detail="Compte désactivé")
    return current_user


def require_verified_user(current_user: User = Depends(get_current_user)) -> User:
    if hasattr(current_user, "is_verified") and not current_user.is_verified:
        raise HTTPException(status_code=403, detail="Compte non vérifié")
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    return current_user


def require_roles(*roles: str):
    
    
    def _guard(current_user: User = Depends(get_current_user)) -> User:
        if getattr(current_user, "role", None) not in roles:
            raise HTTPException(status_code=403, detail="Accès refusé")
        if hasattr(current_user, "is_active") and not current_user.is_active:
            raise HTTPException(status_code=403, detail="Compte désactivé")
        return current_user
    return _guard
