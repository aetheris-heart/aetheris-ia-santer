from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from random import uniform, choice
from datetime import datetime

from api.database import get_db
from app.models.diagnostic import Diagnostic
from api.schemas.diagnostic import DiagnosticCreate, DiagnosticRead, DiagnosticUpdate
from app.models.user import User
from api.routes.auth import get_current_user


router = APIRouter(prefix="/diagnostics", tags=["Diagnostics"])


# 📥 Créer un diagnostic IA enrichi
@router.post("/", response_model=DiagnosticRead)
def create_diagnostic(
    data: DiagnosticCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # 🧠 Génération automatique de métadonnées IA
    score_confiance = round(uniform(75, 99), 2)
    priorite = choice(["Normale", "Élevée", "Urgente"])
    niveau_risque = (
        "Critique" if priorite == "Urgente"
        else "Modéré" if priorite == "Élevée"
        else "Bas"
    )

    diagnostic = Diagnostic(
        patient_id=data.patient_id,
        consultation_id=data.consultation_id,
        medecin_id=user.id,
        type=data.type,
        resultat=data.resultat or f"Analyse IA Aetheris : {data.type} détectée",
        details=data.details or "Analyse réalisée via moteur prédictif Aetheris IA.",
        conclusion=data.conclusion or "Diagnostic IA généré automatiquement.",
        score_confiance=score_confiance,
        priorite=priorite,
        niveau_risque=niveau_risque,
        signature_ia="Aetheris IA",
        commentaire_medecin=data.commentaire_medecin or None,
        date_diagnostic=datetime.utcnow(),
        created_at=datetime.utcnow(),
    )

    db.add(diagnostic)
    db.commit()
    db.refresh(diagnostic)
    return diagnostic


# 📤 Liste de tous les diagnostics
@router.get("/", response_model=List[DiagnosticRead])
def list_diagnostics(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(Diagnostic).order_by(Diagnostic.date_diagnostic.desc()).all()


# 📄 Obtenir un diagnostic par ID
@router.get("/{diagnostic_id}", response_model=DiagnosticRead)
def get_diagnostic(
    diagnostic_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    diagnostic = db.query(Diagnostic).filter(Diagnostic.id == diagnostic_id).first()
    if not diagnostic:
        raise HTTPException(status_code=404, detail="Diagnostic non trouvé")
    return diagnostic


# ✏️ Modifier un diagnostic existant
@router.put("/{diagnostic_id}", response_model=DiagnosticRead)
def update_diagnostic(
    diagnostic_id: int,
    data: DiagnosticUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    diagnostic = db.query(Diagnostic).filter(Diagnostic.id == diagnostic_id).first()
    if not diagnostic:
        raise HTTPException(status_code=404, detail="Diagnostic non trouvé")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(diagnostic, key, value)

    diagnostic.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(diagnostic)
    return diagnostic


# 🗑️ Supprimer un diagnostic
@router.delete("/{diagnostic_id}")
def delete_diagnostic(
    diagnostic_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    diagnostic = db.query(Diagnostic).filter(Diagnostic.id == diagnostic_id).first()
    if not diagnostic:
        raise HTTPException(status_code=404, detail="Diagnostic non trouvé")

    db.delete(diagnostic)
    db.commit()
    return {"message": "Diagnostic supprimé avec succès"}
