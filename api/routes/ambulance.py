from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime

from api.database import get_db
from api.routes.auth import get_current_user
from app.models.ambulance import Ambulance
from api.schemas.ambulance import AmbulanceCreate, AmbulanceUpdate, AmbulanceOut
from app.models.user import User

router = APIRouter(prefix="/ambulances", tags=["🚑 Gestion Ambulances"])


# ============================================================
# 🔒 Vérification des rôles
# ============================================================
def check_permissions(user: User):
    if user.role not in ["admin", "urgentiste", "ambulancier"]:
        raise HTTPException(status_code=403, detail="Accès refusé à ce module")
    return user


# ============================================================
# ➕ Créer une ambulance
# ============================================================
@router.post("/", response_model=AmbulanceOut)
def create_ambulance(
    data: AmbulanceCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    check_permissions(user)
    ambulance = Ambulance(**data.dict(), date_creation=datetime.utcnow())
    db.add(ambulance)
    db.commit()
    db.refresh(ambulance)
    return ambulance




# ============================================================
# 🛰️ Suivi des positions en temps réel
# ============================================================
@router.get("/positions", summary="📡 Suivi GPS intelligent en temps réel")
def get_ambulance_positions(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    check_permissions(user)

    # Récupération des ambulances actives uniquement
    ambulances = db.query(Ambulance).filter(Ambulance.etat != "Hors service").all()

    results = []
    for amb in ambulances:
        # 🕒 Calcul du temps écoulé depuis la dernière mise à jour
        last_update = amb.last_update or amb.date_creation
        temps_depuis_update = (datetime.utcnow() - last_update).total_seconds()

        # 🔋 Calcul de la fraîcheur du signal GPS
        gps_status = (
            "🟢 Signal actif" if temps_depuis_update < 30
            else "🟡 Signal faible" if temps_depuis_update < 120
            else "🔴 Signal perdu"
        )

        # ⚙️ Analyse IA du statut d’activité
        if amb.etat == "En mission":
            etat_ia = "🚨 En intervention"
        elif amb.etat == "Maintenance":
            etat_ia = "🛠️ En maintenance"
        elif amb.etat == "Disponible":
            etat_ia = "✅ Disponible"
        else:
            etat_ia = "⚫ Inconnu"

        # 📊 Préparation des données enrichies
        results.append({
            "id": amb.id,
            "immatriculation": amb.immatriculation,
            "latitude": amb.latitude,
            "longitude": amb.longitude,
            "etat": amb.etat,
            "etat_ia": etat_ia,
            "gps_status": gps_status,
            "chauffeur": amb.chauffeur or "Non assigné",
            "vitesse": amb.vitesse or 0.0,
            "carburant": amb.carburant or "N/A",
            "derniere_maj": last_update.isoformat(),
            "mission_actuelle": amb.mission_actuelle or "Aucune mission",
            "icon": _get_ambulance_icon(amb.etat, gps_status),
        })

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "nb_ambulances": len(results),
        "positions": results
    }


# ============================================================
# 🧠 Fonction IA : Déterminer l’icône selon le statut
# ============================================================
def _get_ambulance_icon(etat: str, gps_status: str) -> str:
    """
    Retourne l’icône à afficher sur la carte selon l’état et le signal GPS.
    Exemple : 🚑 pour mission, 🟢 pour dispo, 🟡 pour maintenance, etc.
    """
    if "🔴" in gps_status:
        return "🛰️"
    if etat == "En mission":
        return "🚨"
    if etat == "Disponible":
        return "🚑"
    if etat == "Maintenance":
        return "⚙️"
    return "❓"
# ============================================================
# 📋 Lister toutes les ambulances
# ============================================================
@router.get("/", response_model=List[AmbulanceOut])
def list_ambulances(
    statut: Optional[str] = Query(None, description="Filtrer par statut"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    check_permissions(user)
    query = db.query(Ambulance)
    if statut:
        query = query.filter(Ambulance.etat == statut)
    return query.order_by(desc(Ambulance.id)).all()


# ============================================================
# 🔍 Détails d’une ambulance
# ============================================================
@router.get("/{ambulance_id}", response_model=AmbulanceOut)
def get_ambulance(
    ambulance_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    check_permissions(user)
    ambulance = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance introuvable")
    return ambulance


# ============================================================
# ✏️ Modifier une ambulance
# ============================================================
@router.put("/{ambulance_id}", response_model=AmbulanceOut)
def update_ambulance(
    ambulance_id: int,
    data: AmbulanceUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    check_permissions(user)
    ambulance = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance introuvable")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(ambulance, key, value)

    ambulance.last_update = datetime.utcnow()
    db.commit()
    db.refresh(ambulance)
    return ambulance


# ============================================================
# ❌ Supprimer une ambulance
# ============================================================
@router.delete("/{ambulance_id}")
def delete_ambulance(
    ambulance_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    check_permissions(user)
    ambulance = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance introuvable")

    db.delete(ambulance)
    db.commit()
    return {"message": "✅ Ambulance supprimée avec succès"}




# ============================================================
# 🚨 Assigner une mission à une ambulance
# ============================================================
@router.post("/{ambulance_id}/assigner")
def assigner_mission(
    ambulance_id: int,
    mission: str = Query(..., description="Description de la mission"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    check_permissions(user)
    ambulance = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance introuvable")

    ambulance.etat = "En mission"
    ambulance.mission_actuelle = mission
    ambulance.derniere_mission = datetime.utcnow()
    db.commit()
    db.refresh(ambulance)
    return {"message": f"🚑 Ambulance {ambulance.immatriculation} assignée à la mission : {mission}"}


# ============================================================
# 🧠 IA – Analyse du parc d’ambulances
# ============================================================
@router.get("/analyse/etat")
def analyse_parc_ambulances(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    check_permissions(user)
    total = db.query(func.count(Ambulance.id)).scalar()
    dispo = db.query(func.count(Ambulance.id)).filter(Ambulance.etat == "Disponible").scalar()
    mission = db.query(func.count(Ambulance.id)).filter(Ambulance.etat == "En mission").scalar()
    maintenance = db.query(func.count(Ambulance.id)).filter(Ambulance.etat == "Maintenance").scalar()

    taux_dispo = round((dispo / total) * 100, 2) if total > 0 else 0

    return {
        "total_ambulances": total,
        "disponibles": dispo,
        "en_mission": mission,
        "maintenance": maintenance,
        "taux_disponibilite": f"{taux_dispo}%",
        "message_ia": "🚨 Parc opérationnel optimal" if taux_dispo > 70 else "⚠️ Renforcez le parc d’ambulances"
    }
