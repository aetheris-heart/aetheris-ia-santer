from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import random

from api.database import get_db
from api.routes.auth import get_current_user
from app.models.user import User
from app.models.radiologie import Radiologie
from app.models.patient import Patient
from api.schemas.radiologie import RadiologieCreate, RadiologieUpdate, RadiologieRead

router = APIRouter(prefix="/radiologie", tags=["Radiologie IA"])


# ============================================================
# ⚡ FONCTION IA : Analyse locale simulant Aetheris IA Radiologie
# ============================================================
def analyser_image_radiologique(type_examen: str, fichier_url: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyse IA simulée d’un examen radiologique, sans appel externe.
    Fournit un rapport structuré cohérent avec le moteur Aetheris.
    """
    anomalies = []
    recommandations = []
    niveau_confiance = round(random.uniform(0.85, 0.98), 2)  # entre 85% et 98%
    resume = ""
    niveau_risque = "Faible"

    type_examen = type_examen.lower()

    # 🫁 Cas radio thoracique
    if "thorax" in type_examen or "poumon" in type_examen:
        anomalies = random.choice([
            ["Opacité basale droite suspecte"],
            ["Surcharge bronchique modérée"],
            ["Poumons clairs, sans anomalies"],
            ["Infiltrat discret du lobe inférieur gauche"]
        ])
        recommandations = [
            "Corréler avec la saturation en oxygène (SpO₂).",
            "Répéter l’examen dans 7 jours si symptômes persistants.",
            "Surveillance clinique."
        ]
        resume = "Analyse radiologique pulmonaire effectuée avec succès."
        niveau_risque = "Modéré" if "infiltrat" in anomalies[0].lower() else "Faible"

    # 🧠 Cas IRM cérébrale
    elif "cerveau" in type_examen or "irm" in type_examen:
        anomalies = random.choice([
            ["Aucune lésion visible"],
            ["Hyperintensité corticale mineure détectée"],
            ["Micro-ischémie frontale suspecte"]
        ])
        recommandations = [
            "Surveiller les signes neurologiques associés.",
            "Compléter par un électroencéphalogramme (EEG) si nécessaire."
        ]
        resume = "IRM cérébrale analysée automatiquement."
        niveau_risque = "Élevé" if "ischémie" in anomalies[0].lower() else "Faible"

    # 💀 Cas osseux / scanner
    elif "os" in type_examen or "scanner" in type_examen:
        anomalies = random.choice([
            ["Fracture non déplacée suspectée"],
            ["Densité osseuse normale"],
            ["Lésion bénigne identifiée"]
        ])
        recommandations = [
            "Immobilisation et contrôle radiologique dans 10 jours.",
            "Surveillance de la consolidation osseuse."
        ]
        resume = "Scanner osseux traité par Aetheris IA."
        niveau_risque = "Élevé" if "fracture" in anomalies[0].lower() else "Faible"

    # Autres cas
    else:
        anomalies = ["Analyse IA générique : aucune anomalie majeure détectée"]
        recommandations = ["Poursuivre le suivi clinique standard."]
        resume = "Analyse IA standard effectuée."

    return {
        "resume": resume,
        "niveau_risque": niveau_risque,
        "anomalies_detectees": anomalies,
        "confiance": niveau_confiance,
        "recommandations": recommandations,
        "analyse_par": "Aetheris IA Radiologie",
        "fichier_source": fichier_url or "Non spécifié",
        "horodatage": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
    }


# ============================================================
# ➕ AJOUTER UN EXAMEN RADIOLOGIQUE
# ============================================================
@router.post("/", response_model=RadiologieRead)
def creer_radiologie(
    data: RadiologieCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Crée un examen radiologique avec analyse IA automatique."""
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    try:
        analyse = analyser_image_radiologique(data.type_examen, data.fichier_url)

        # ✅ Exclure les champs générés automatiquement par Aetheris
        data_dict = data.dict(exclude={"analyse_ia", "niveau_risque"})

        # ✅ Création propre sans doublon
        radiologie = Radiologie(
            **data_dict,
            analyse_ia=json.dumps(analyse, ensure_ascii=False, indent=2),
            niveau_risque=analyse["niveau_risque"],
            date_examen=datetime.utcnow(),
        )

        db.add(radiologie)
        db.commit()
        db.refresh(radiologie)

        print(f"✅ Analyse IA radiologique créée pour patient {patient.nom} ({patient.id})")
        return radiologie

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors de la création radiologique : {e}")
        raise HTTPException(status_code=500, detail="Erreur interne Aetheris Radiologie IA.")

# ============================================================
# 📋 LISTER TOUS LES EXAMENS RADIOLOGIQUES (pour dashboard & cartes IA)
# ============================================================
@router.get("/", response_model=List[RadiologieRead])
def get_all_radiologies(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Retourne la liste complète de tous les examens radiologiques enregistrés,
    classés par date décroissante.
    """
    exams = db.query(Radiologie).order_by(desc(Radiologie.date_examen)).all()
    if not exams:
        raise HTTPException(status_code=404, detail="Aucun examen radiologique trouvé.")
    return exams


# ============================================================
# 👁️ OBTENIR UN EXAMEN RADIOLOGIQUE PAR ID
# ============================================================
@router.get("/{radiologie_id}", response_model=RadiologieRead)
def get_radiologie_by_id(
    radiologie_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Retourne les détails complets d’un examen radiologique spécifique.
    """
    rad = db.query(Radiologie).filter(Radiologie.id == radiologie_id).first()
    if not rad:
        raise HTTPException(status_code=404, detail="Examen radiologique introuvable.")
    return rad


# ============================================================
# 🧠 DERNIER EXAMEN RADIOLOGIQUE ENREGISTRÉ (pour cartes IA)
# ============================================================
@router.get("/latest", response_model=RadiologieRead)
def get_latest_radiologie(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Retourne le dernier examen radiologique enregistré dans la base.
    Utilisé par les cartes IA du dashboard.
    """
    latest = db.query(Radiologie).order_by(desc(Radiologie.date_examen)).first()
    if not latest:
        raise HTTPException(status_code=404, detail="Aucun examen radiologique disponible.")
    return latest


# ============================================================
# 🧍 EXAMENS RADIOLOGIQUES D’UN PATIENT SPÉCIFIQUE
# ============================================================
@router.get("/patient/{patient_id}", response_model=List[RadiologieRead])
def get_radiologies_by_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Retourne tous les examens radiologiques d’un patient donné,
    classés du plus récent au plus ancien.
    """
    exams = (
        db.query(Radiologie)
        .filter(Radiologie.patient_id == patient_id)
        .order_by(desc(Radiologie.date_examen))
        .all()
    )
    if not exams:
        raise HTTPException(status_code=404, detail="Aucun examen trouvé pour ce patient.")
    return exams



@router.get("/overview")
def radiologie_overview(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Retourne une synthèse globale des examens radiologiques.
    """
    total = db.query(Radiologie).count()
    valides = db.query(Radiologie).filter(Radiologie.statut_validation == "Validé").count()
    en_attente = db.query(Radiologie).filter(Radiologie.statut_validation == "En attente").count()
    risques_eleves = db.query(Radiologie).filter(Radiologie.niveau_risque == "Élevé").count()

    return {
        "total_examens": total,
        "examens_valides": valides,
        "en_attente": en_attente,
        "risques_eleves": risques_eleves,
        "taux_validation": round((valides / total * 100) if total else 0, 1),
        "taux_risque": round((risques_eleves / total * 100) if total else 0, 1),
    }


# ============================================================
# ✏️ MODIFIER UN EXAMEN RADIOLOGIQUE
# ============================================================
@router.put("/{radiologie_id}", response_model=RadiologieRead)
def modifier_radiologie(
    radiologie_id: int,
    data: RadiologieUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Met à jour un examen radiologique et relance l’analyse IA si besoin."""
    rad = db.query(Radiologie).filter(Radiologie.id == radiologie_id).first()
    if not rad:
        raise HTTPException(status_code=404, detail="Examen non trouvé")

    for k, v in data.dict(exclude_unset=True).items():
        setattr(rad, k, v)

    # 🔁 Relancer l’analyse IA si le type d’examen a changé
    if "type_examen" in data.dict(exclude_unset=True):
        analyse = analyser_image_radiologique(data.type_examen, getattr(rad, "fichier_url", None))
        rad.analyse_ia = json.dumps(analyse, ensure_ascii=False, indent=2)
        rad.niveau_risque = analyse["niveau_risque"]

    rad.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(rad)
    print(f"🩻 Examen radiologique {radiologie_id} mis à jour avec IA.")
    return rad


# ============================================================
# ❌ SUPPRIMER UN EXAMEN RADIOLOGIQUE
# ============================================================
@router.delete("/{radiologie_id}")
def supprimer_radiologie(
    radiologie_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Supprime un examen radiologique du dossier patient."""
    rad = db.query(Radiologie).filter(Radiologie.id == radiologie_id).first()
    if not rad:
        raise HTTPException(status_code=404, detail="Examen non trouvé")

    db.delete(rad)
    db.commit()
    print(f"🗑️ Examen radiologique {radiologie_id} supprimé.")
    return {"message": f"Examen radiologique {radiologie_id} supprimé avec succès."}
