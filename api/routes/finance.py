from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import Optional
from api.database import get_db
from api.schemas.finance import FinanceCreate
from app.models.user import User
from app.models.facture import Facture
from app.models.finance import Finance
router = APIRouter(prefix="/finance", tags=["Finance & Comptabilité"])

# ============================================================
# 🧱 Vérification des droits d’accès
# ============================================================
def require_admin(user: Optional[User]):
    """
    Vérifie que l'utilisateur est un administrateur ou un comptable.
    """
    if not user or user.role not in ["admin", "comptable"]:
        raise HTTPException(status_code=403, detail="Accès réservé à l’administration ou à la comptabilité.")
    return user


# ============================================================
# 📊 2️⃣ Statistiques globales (Dashboard Admin)
# ============================================================
@router.get("/stats")
def get_finance_stats(db: Session = Depends(get_db)):
    """
    Route publique pour le dashboard Admin — aucun token requis.
    """

    # 💰 Revenus = factures payées
    total_revenus = (
        db.query(func.sum(Facture.montant_total))
        .filter(Facture.statut == "payée")
        .scalar()
        or 0
    )

    # 💸 Dépenses = opérations Finance de type 'dépense'
    total_depenses = (
        db.query(func.sum(Finance.montant_total))
        .filter(Finance.type_operation == "dépense")
        .scalar()
        or 0
    )

    solde_global = total_revenus - total_depenses

    # 📈 Évolution sur 6 derniers mois
    six_mois = datetime.utcnow() - timedelta(days=180)
    evolution_data = (
        db.query(
            func.strftime("%Y-%m", Facture.date_emission).label("mois"),
            func.sum(Facture.montant_total).label("revenus"),
        )
        .filter(Facture.date_emission >= six_mois)
        .group_by("mois")
        .order_by("mois")
        .all()
    )

    evolution = [
        {"mois": e.mois, "revenus": round(e.revenus or 0, 2), "depenses": 0.0}
        for e in evolution_data
    ]

    return {
        "total_revenus": round(total_revenus, 2),
        "total_depenses": round(total_depenses, 2),
        "solde_global": round(solde_global, 2),
        "evolution": evolution,
    }


# ============================================================
# 💰 1️⃣ CRUD — Opérations financières
# ============================================================
@router.post("/")
def create_operation(
    data: FinanceCreate,
    db: Session = Depends(get_db),
):
    try:
        new_op = Finance(
            type_operation=data.type_operation,
            categorie=data.categorie,
            description=data.description,
            montant_ht=data.montant_ht,
            taxe=data.taxe,
            montant_total=data.montant_total,
            moyen_paiement=data.moyen_paiement,
            statut=data.statut or "enregistré",
            date_operation=datetime.utcnow(),
            facture_id=data.facture_id,
            medecin_id=data.medecin_id,
        )

        db.add(new_op)
        db.commit()
        db.refresh(new_op)

        return {
            "message": "✅ Opération enregistrée avec succès.",
            "operation": {
                "id": new_op.id,
                "type_operation": new_op.type_operation,
                "categorie": new_op.categorie,
                "description": new_op.description,
                "montant_total": new_op.montant_total,
                "statut": new_op.statut,
                "date_operation": new_op.date_operation,
            },
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erreur création opération : {str(e)}")


@router.get("/")
def get_all_operations(
    db: Session = Depends(get_db),
    
):
    
    return db.query(Finance).order_by(desc(Finance.date_operation)).all()


@router.get("/{op_id}")
def get_operation(
    op_id: int,
    db: Session = Depends(get_db),
    
):
    
    op = db.query(Finance).filter(Finance.id == op_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Opération introuvable.")
    return op


@router.put("/{op_id}")
def update_operation(
    op_id: int,
    data: dict,
    db: Session = Depends(get_db),
    
):
    
    op = db.query(Finance).filter(Finance.id == op_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Opération introuvable.")

    for key, value in data.items():
        if hasattr(op, key):
            setattr(op, key, value)
    db.commit()
    db.refresh(op)
    return {"message": "✅ Opération mise à jour avec succès.", "operation": op}


@router.delete("/{op_id}")
def delete_operation(
    op_id: int,
    db: Session = Depends(get_db),
    
):
    
    op = db.query(Finance).filter(Finance.id == op_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Opération introuvable.")
    db.delete(op)
    db.commit()
    return {"message": "🗑️ Opération supprimée avec succès."}







# ============================================================
# 🧠 3️⃣ Projection IA simplifiée
# ============================================================
@router.get("/prediction-ia")
def prediction_financiere_ia(db: Session = Depends(get_db)):
    """
    Analyse prédictive basique sur les flux financiers
    (accessible sans authentification pour le dashboard admin).
    """

    last_90_days = datetime.utcnow() - timedelta(days=90)
    data = (
        db.query(
            func.strftime("%Y-%m", Finance.date_operation).label("mois"),
            func.sum(Finance.montant_total).label("total"),
        )
        .filter(Finance.date_operation >= last_90_days)
        .group_by(func.strftime("%Y-%m", Finance.date_operation))
        .order_by("mois")
        .all()
    )

    valeurs = [r.total for r in data]
    moyenne = sum(valeurs) / len(valeurs) if valeurs else 0
    tendance = "hausse" if len(valeurs) > 1 and valeurs[-1] > valeurs[-2] else "baisse"
    prediction = moyenne * (1.1 if tendance == "hausse" else 0.95)

    return {
        "mois": [r.mois for r in data],
        "valeurs": [float(v) for v in valeurs],
        "tendance": tendance,
        "prediction_prochain_mois": round(prediction, 2),
        "analyse": "Projection IA des flux financiers hospitaliers",
    }



# ============================================================
# 💼 4️⃣ Bilan comptable global
# ============================================================
@router.get("/bilan")
def bilan_comptable(
    db: Session = Depends(get_db),
    
):
    

    total_ht = db.query(func.sum(Finance.montant_ht)).scalar() or 0
    total_taxe = db.query(func.sum(Finance.taxe)).scalar() or 0
    total_ttc = db.query(func.sum(Finance.montant_total)).scalar() or 0

    return {
        "periode": f"{datetime.utcnow().month}/{datetime.utcnow().year}",
        "recette_ht": round(float(total_ht), 2),
        "taxes": round(float(total_taxe), 2),
        "total_ttc": round(float(total_ttc), 2),
        "message": "💼 Bilan comptable global généré automatiquement par Aetheris IA Santé",
    }
