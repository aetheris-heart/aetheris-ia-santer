from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from api.database import get_db
from app.models.document import Document
from app.models.patient import Patient
from api.schemas.document import DocumentCreate, DocumentRead, DocumentUpdate
from app.models.user import User
from api.routes.auth import get_current_user


router = APIRouter(prefix="/documents", tags=["Documents Médicaux"])


# 📥 Créer un document
@router.post("/{patient_id}", response_model=DocumentRead)
def creer_document(
    patient_id: int,
    data: DocumentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")

    obj = Document(patient_id=patient_id, **data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


# 📤 Liste des documents d’un patient
@router.get("/{patient_id}", response_model=List[DocumentRead])
def list_documents_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(Document)
        .filter(Document.patient_id == patient_id)
        .order_by(desc(Document.created_at))
        .all()
    )


# 📤 Détail d’un document
@router.get("/detail/{doc_id}", response_model=DocumentRead)
def get_document(
    doc_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    obj = db.query(Document).filter(Document.id == doc_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Document introuvable")
    return obj


# ✏️ Mise à jour
@router.put("/{doc_id}", response_model=DocumentRead)
def update_document(
    doc_id: int,
    data: DocumentUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    obj = db.query(Document).filter(Document.id == doc_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Document introuvable")

    for k, v in data.dict(exclude_unset=True).items():
        setattr(obj, k, v)

    db.commit()
    db.refresh(obj)
    return obj


# 🗑️ Supprimer
@router.delete("/{doc_id}")
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    obj = db.query(Document).filter(Document.id == doc_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Document introuvable")

    db.delete(obj)
    db.commit()
    return {"message": "Document supprimé"}
