# app/utils/test_user.py
from __future__ import annotations

import logging
from typing import Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from api.database import SessionLocal
from app.models.user import User

log = logging.getLogger("startup")  # s'affiche dans uvicorn
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_or_update_admin(db: Optional[Session] = None) -> User:
    """
    Crée ou met à jour l'utilisateur ADMIN de test.
    - Email: test@cdmstore.com
    - Password: Ateba@2025!
    - Rôle: admin
    Affiche des logs visibles au démarrage.
    """
    email = "test@cdmstore.com"
    new_password = "Ateba@2025!"

    owns_session = False
    if db is None:
        db = SessionLocal()
        owns_session = True

    try:
        user = db.query(User).filter(User.email == email).first()

        if user is None:
            log.info("➕ Création de l'utilisateur test (ADMIN)...")
            user = User(
                nom="Docteur",
                prenom="Ramses",
                email=email,
                hashed_password=get_password_hash(new_password),
                specialite="Généraliste",
                photo_url=None,
                role="admin",
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()
                # si collision (unique email) pendant un multi-start, on relit puis on met à jour
                user = db.query(User).filter(User.email == email).first()
                if user is None:
                    raise
                log.info("⚠️ Collision email détectée, mise à jour du compte existant.")
        else:
            log.info("🔁 Utilisateur existant, mise à jour du mot de passe et du rôle (admin).")
            user.hashed_password = get_password_hash(new_password)
            user.role = "admin"
            user.is_active = True
            user.is_verified = True
            db.add(user)
            db.commit()

        db.refresh(user)
        log.info(f"✅ Admin prêt : {user.email} / {new_password}")
        return user

    except Exception as e:
        log.exception(f"❌ Échec création/mise à jour de l'admin : {e}")
        raise
    finally:
        if owns_session:
            db.close()


if __name__ == "__main__":
    # Exécution directe (utile en dev)
    create_or_update_admin()
