from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from api.database import get_db
from app.models.biologie import Biologie
from app.models.patient import Patient
from api.schemas.biologie import BiologieCreate, BiologieUpdate, BiologieOut
from api.routes.auth import get_current_user

router = APIRouter(
    prefix="/biologie",
    tags=["Biologie"]
)

# 📌 Récupérer toutes les analyses
@router.get("/", response_model=List[BiologieOut])
def get_all_biologies(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    return db.query(Biologie).all()

# 📌 Récupérer une analyse par ID
@router.get("/{biologie_id}", response_model=BiologieOut)
def get_biologie(biologie_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    biologie = db.query(Biologie).filter(Biologie.id == biologie_id).first()
    if not biologie:
        raise HTTPException(status_code=404, detail="Analyse non trouvée")
    return biologie

# 📌 Créer une nouvelle analyse
@router.post("/", response_model=BiologieOut)
def create_biologie(data: BiologieCreate, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    biologie = Biologie(
        patient_id=data.patient_id,
        type_analyse=data.type_analyse,
        categorie=data.categorie,
        sous_categorie=data.sous_categorie,
        resultats=data.resultats,
        interpretation=data.interpretation,
        fichier_url=data.fichier_url,
        prescripteur=data.prescripteur,
        effectue_par=data.effectue_par,
        laborantin=data.laborantin,
        etat=data.etat,
        date_prescription=datetime.utcnow(),
        date_prelevement=data.date_prelevement or datetime.utcnow()
    )
    db.add(biologie)
    db.commit()
    db.refresh(biologie)
    return biologie

# 📌 Modifier une analyse
@router.put("/{biologie_id}", response_model=BiologieOut)
def update_biologie(biologie_id: int, data: BiologieUpdate, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    biologie = db.query(Biologie).filter(Biologie.id == biologie_id).first()
    if not biologie:
        raise HTTPException(status_code=404, detail="Analyse non trouvée")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(biologie, key, value)

    # Si l'état passe à "Validé", ajouter la date de validation
    if data.etat and data.etat.lower() == "validé":
        biologie.date_validation = datetime.utcnow()

    db.commit()
    db.refresh(biologie)
    return biologie

# 📌 Supprimer une analyse
@router.delete("/{biologie_id}")
def delete_biologie(biologie_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    biologie = db.query(Biologie).filter(Biologie.id == biologie_id).first()
    if not biologie:
        raise HTTPException(status_code=404, detail="Analyse non trouvée")

    db.delete(biologie)
    db.commit()
    return {"message": "Analyse supprimée avec succès"}

# 📌 Récupérer toutes les analyses d’un patient
@router.get("/patient/{patient_id}", response_model=List[BiologieOut])
def get_biologies_by_patient(patient_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    return db.query(Biologie).filter(Biologie.patient_id == patient_id).all()

# 📌 Récupérer les analyses par catégorie (Sang, Urine, etc.)
@router.get("/categorie/{categorie}", response_model=List[BiologieOut])
def get_biologies_by_categorie(categorie: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    return db.query(Biologie).filter(Biologie.categorie == categorie).all()

# 📊 Statistiques biologiques
@router.get("/stats/global")
def get_biologie_stats(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    total = db.query(Biologie).count()
    en_attente = db.query(Biologie).filter(Biologie.etat == "En attente").count()
    valides = db.query(Biologie).filter(Biologie.etat == "Validé").count()
    urgents = db.query(Biologie).filter(Biologie.etat == "Urgent").count()
    return {
        "total": total,
        "en_attente": en_attente,
        "valides": valides,
        "urgents": urgents
    }
