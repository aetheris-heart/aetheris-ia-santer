# app/api/routes/websockets.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
import asyncio

from api.database import get_db
from app import models

router = APIRouter(prefix="/ws", tags=["WebSockets Médicaux"])

# =========================
# 🧠 CARDIAQUE EN TEMPS RÉEL
# =========================
@router.websocket("/cardiaque/{patient_id}")
async def cardiac_realtime(websocket: WebSocket, patient_id: int, db: Session = Depends(get_db)):
    await websocket.accept()
    print(f"✅ WebSocket cardiaque connectée pour patient {patient_id}")
    try:
        last_id = None
        while True:
            last_record = (
                db.query(models.CardiaqueData)
                .filter(models.CardiaqueData.patient_id == patient_id)
                .order_by(desc(models.CardiaqueData.created_at))
                .first()
            )
            if last_record and last_record.id != last_id:
                last_id = last_record.id
                await websocket.send_json({
                    "frequence_cardiaque": last_record.frequence_cardiaque,
                    "tension_systolique": last_record.tension_systolique,
                    "tension_diastolique": last_record.tension_diastolique,
                    "alerte": last_record.alerte
                })
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        print(f"❌ WebSocket cardiaque déconnectée pour patient {patient_id}")


# =========================
# 🧫 RÉNALE EN TEMPS RÉEL
# =========================
@router.websocket("/renal/{patient_id}")
async def renal_realtime(websocket: WebSocket, patient_id: int, db: Session = Depends(get_db)):
    await websocket.accept()
    print(f"✅ WebSocket rénale connectée pour patient {patient_id}")
    try:
        last_id = None
        while True:
            last_record = (
                db.query(models.RenalData)
                .filter(models.RenalData.patient_id == patient_id)
                .order_by(desc(models.RenalData.created_at))
                .first()
            )
            if last_record and last_record.id != last_id:
                last_id = last_record.id
                await websocket.send_json({
                    "average_creatinine": last_record.average_creatinine,
                    "average_urea": last_record.average_urea,
                    "alerte": last_record.alerte
                })
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        print(f"❌ WebSocket rénale déconnectée pour patient {patient_id}")


# =========================
# 🧬 MÉTABOLIQUE EN TEMPS RÉEL
# =========================
@router.websocket("/metabolique/{patient_id}")
async def metabolic_realtime(websocket: WebSocket, patient_id: int, db: Session = Depends(get_db)):
    await websocket.accept()
    print(f"✅ WebSocket métabolique connectée pour patient {patient_id}")
    try:
        last_id = None
        while True:
            last_record = (
                db.query(models.MetaboliqueData)
                .filter(models.MetaboliqueData.patient_id == patient_id)
                .order_by(desc(models.MetaboliqueData.created_at))
                .first()
            )
            if last_record and last_record.id != last_id:
                last_id = last_record.id
                await websocket.send_json({
                    "glucose": last_record.glucose,
                    "insuline": last_record.insuline,
                    "alerte": last_record.alerte
                })
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        print(f"❌ WebSocket métabolique déconnectée pour patient {patient_id}")


# =========================
# 🫁 PULMONAIRE EN TEMPS RÉEL
# =========================
@router.websocket("/pulmonary/{patient_id}")
async def pulmonary_realtime(websocket: WebSocket, patient_id: int, db: Session = Depends(get_db)):
    await websocket.accept()
    print(f"✅ WebSocket pulmonaire connectée pour patient {patient_id}")
    try:
        last_id = None
        while True:
            last_record = (
                db.query(models.PulmonaryData)
                .filter(models.PulmonaryData.patient_id == patient_id)
                .order_by(desc(models.PulmonaryData.created_at))
                .first()
            )
            if last_record and last_record.id != last_id:
                last_id = last_record.id
                await websocket.send_json({
                    "spo2": last_record.spo2,
                    "frequence_respiratoire": last_record.frequence_respiratoire,
                    "alerte": last_record.alerte
                })
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        print(f"❌ WebSocket pulmonaire déconnectée pour patient {patient_id}")


# =========================
# 🍽️ DIGESTIVE EN TEMPS RÉEL
# =========================
@router.websocket("/digestive/{patient_id}")
async def digestive_realtime(websocket: WebSocket, patient_id: int, db: Session = Depends(get_db)):
    await websocket.accept()
    print(f"✅ WebSocket digestive connectée pour patient {patient_id}")
    try:
        last_id = None
        while True:
            last_record = (
                db.query(models.DigestiveData)
                .filter(models.DigestiveData.patient_id == patient_id)
                .order_by(desc(models.DigestiveData.created_at))
                .first()
            )
            if last_record and last_record.id != last_id:
                last_id = last_record.id
                await websocket.send_json({
                    "acidite": last_record.acidite,
                    "motricite": last_record.motricite,
                    "inflammation": last_record.inflammation,
                    "alerte": last_record.alerte
                })
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        print(f"❌ WebSocket digestive déconnectée pour patient {patient_id}")


# =========================
# 🧠 NEUROLOGIQUE EN TEMPS RÉEL
# =========================
@router.websocket("/neurologique/{patient_id}")
async def neurological_realtime(websocket: WebSocket, patient_id: int, db: Session = Depends(get_db)):
    await websocket.accept()
    print(f"✅ WebSocket neurologique connectée pour patient {patient_id}")
    try:
        last_id = None
        while True:
            last_record = (
                db.query(models.NeurologiqueData)
                .filter(models.NeurologiqueData.patient_id == patient_id)
                .order_by(desc(models.NeurologiqueData.created_at))
                .first()
            )
            if last_record and last_record.id != last_id:
                last_id = last_record.id
                await websocket.send_json({
                    "eeg": last_record.eeg,
                    "stress_level": last_record.stress_level,
                    "alerte": last_record.alerte
                })
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        print(f"❌ WebSocket neurologique déconnectée pour patient {patient_id}")
