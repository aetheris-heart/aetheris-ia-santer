from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime
from typing import List, Optional

from api.database import get_db
from api.routes.auth import get_current_user
from app.models.urgence import Urgence
from app.models.patient import Patient
from app.models.user import User
from api.schemas.urgence import UrgenceCreate, UrgenceUpdate, UrgenceRead

router = APIRouter(prefix="/urgences", tags=["Urgences Médicales"])

# ============================================================
# 🚑 1️⃣ Créer une urgence médicale
# ============================================================
@router.post("/", response_model=UrgenceRead)
def creer_urgence(
    data: UrgenceCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Crée une nouvelle urgence médicale :
    - Liaison automatique au médecin connecté
    - Génération IA du niveau de risque et d'une recommandation
    - Prise en compte des coordonnées GPS si fournies
    """
    patient = None
    if data.patient_id:
        patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient introuvable")

    # ⚡ Analyse IA Aetheris (pré-analyse automatique)
    niveau_risque_ia = data.niveau_risque_ia or (
        "Critique" if data.niveau_gravite and data.niveau_gravite.lower() == "critique" else "Modéré"
    )
    analyse_ia = f"Analyse IA Aetheris : situation évaluée comme {niveau_risque_ia.lower()}."
    recommandation_ia = data.recommandation_ia or (
        "Transfert immédiat vers unité de soins intensifs"
        if niveau_risque_ia == "Critique"
        else "Surveillance continue et diagnostic approfondi recommandé."
    )

    urgence = Urgence(
        patient_id=data.patient_id,
        nom_patient=data.nom_patient,
        prenom_patient=data.prenom_patient,
        type_urgence=data.type_urgence,
        description=data.description,
        niveau_gravite=data.niveau_gravite,
        statut=data.statut or "En attente",
        medecin_id=user.id,
        equipe=data.equipe,
        lieu=data.lieu,
        moyen_transport=data.moyen_transport,
        age=data.age,
        sexe=data.sexe,
        risque_vital=data.risque_vital or False,
        ambulance_id=data.ambulance_id,
        date_signalement=datetime.utcnow(),
        date_arrivee=data.date_arrivee,
        latitude=data.latitude,
        longitude=data.longitude,
        analyse_ia=analyse_ia,
        niveau_risque_ia=niveau_risque_ia,
        recommandation_ia=recommandation_ia,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(urgence)
    db.commit()
    db.refresh(urgence)
    return urgence


# ============================================================
# 🔍 2️⃣ Liste ou filtrage des urgences
# ============================================================
@router.get("/", response_model=List[UrgenceRead])
def lister_urgences(
    statut: Optional[str] = None,
    niveau_gravite: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Retourne toutes les urgences avec filtres facultatifs (statut, gravité)."""
    query = db.query(Urgence)
    if statut:
        query = query.filter(Urgence.statut == statut)
    if niveau_gravite:
        query = query.filter(Urgence.niveau_gravite == niveau_gravite)

    urgences = query.order_by(desc(Urgence.date_signalement)).all()

    # ✅ Conversion lisible pour le frontend (Oui/Non)
    for u in urgences:
        u.risque_vital_affiche = "Oui" if u.risque_vital else "Non"

    return urgences


# ============================================================
# 📍 3️⃣ Détails d’une urgence spécifique
# ============================================================
@router.get("/{urgence_id}", response_model=UrgenceRead)
def get_urgence(
    urgence_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Retourne toutes les informations d'une urgence spécifique."""
    urgence = db.query(Urgence).filter(Urgence.id == urgence_id).first()
    if not urgence:
        raise HTTPException(status_code=404, detail="Urgence introuvable")

    # ✅ Conversion bool -> texte pour affichage clair
    urgence.risque_vital_affiche = "Oui" if urgence.risque_vital else "Non"
    return urgence


# ============================================================
# 🔄 4️⃣ Mise à jour d’une urgence
# ============================================================
@router.put("/{urgence_id}", response_model=UrgenceRead)
def update_urgence(
    urgence_id: int,
    data: UrgenceUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Met à jour le statut, la gravité ou les infos IA d’une urgence."""
    urgence = db.query(Urgence).filter(Urgence.id == urgence_id).first()
    if not urgence:
        raise HTTPException(status_code=404, detail="Urgence introuvable")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(urgence, key, value)
    urgence.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(urgence)
    urgence.risque_vital_affiche = "Oui" if urgence.risque_vital else "Non"
    return urgence


# ============================================================
# 📊 5️⃣ Statistiques globales pour le Dashboard Urgences
# ============================================================
@router.get("/stats/global")
def stats_globales(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Retourne les statistiques globales sur les urgences pour le dashboard."""
    total = db.query(func.count(Urgence.id)).scalar() or 0
    en_attente = db.query(func.count()).filter(Urgence.statut == "En attente").scalar() or 0
    en_cours = db.query(func.count()).filter(Urgence.statut == "En cours").scalar() or 0
    resolues = db.query(func.count()).filter(Urgence.statut == "Résolue").scalar() or 0
    critiques = db.query(func.count()).filter(Urgence.niveau_gravite == "Critique").scalar() or 0
    vitales = db.query(func.count()).filter(Urgence.risque_vital == True).scalar() or 0

    return {
        "total": total,
        "en_attente": en_attente,
        "en_cours": en_cours,
        "resolues": resolues,
        "critiques": critiques,
        "vitales": vitales,
    }


# ============================================================
# ❌ 6️⃣ Suppression d’une urgence
# ============================================================
@router.delete("/{urgence_id}")
def supprimer_urgence(
    urgence_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Supprime une urgence définitivement."""
    urgence = db.query(Urgence).filter(Urgence.id == urgence_id).first()
    if not urgence:
        raise HTTPException(status_code=404, detail="Urgence introuvable")

    db.delete(urgence)
    db.commit()
    return {"message": "✅ Urgence supprimée avec succès"}
