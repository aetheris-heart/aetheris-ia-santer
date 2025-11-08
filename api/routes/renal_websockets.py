from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from api.database import get_db
from app import models  # ton dossier models contient les tables
import asyncio

router = APIRouter(prefix="/ws", tags=["WebSockets Médicaux Réels"])

# 🧩 Fonction rénale (vraie donnée en temps réel)
@router.websocket("/renal/{patient_id}")
async def renal_realtime(websocket: WebSocket, patient_id: int, db: Session = Depends(get_db)):
    await websocket.accept()
    print(f"✅ WebSocket rénale connectée pour patient {patient_id}")
    try:
        last_id = None
        while True:
            # Récupère la dernière entrée du patient dans la table rénale
            latest = (
                db.query(models.RenalData)
                .filter(models.RenalData.patient_id == patient_id)
                .order_by(desc(models.RenalData.created_at))
                .first()
            )

            if latest and latest.id != last_id:
                last_id = latest.id
                data = {
                    "patient_id": latest.patient_id,
                    "average_creatinine": latest.average_creatinine,
                    "average_urea": latest.average_urea,
                    "alerte": latest.alerte,
                    "timestamp": latest.created_at.isoformat(),
                }
                await websocket.send_json(data)

            await asyncio.sleep(5)
    except WebSocketDisconnect:
        print(f"❌ WebSocket rénale déconnectée (patient {patient_id})")
