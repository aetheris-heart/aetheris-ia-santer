import requests
from datetime import datetime
import random

# Ton token ici
TOKEN = "Bearer VOTRE_TOKEN_ICI"

# API base
BASE_URL = "http://127.0.0.1:8000"

# Liste d'examens d'imagerie fictifs
examens = [
    {"type": "Radiographie Thoracique", "url": "http://localhost:8000/static/images/radio_thorax1.png"},
    {"type": "IRM Cérébrale", "url": "http://localhost:8000/static/images/irm_cerveau1.png"},
    {"type": "Scanner Abdominal", "url": "http://localhost:8000/static/images/scanner_abdo1.png"},
    {"type": "Échographie Cardiaque", "url": "http://localhost:8000/static/images/echo_coeur1.png"},
]

# Pour les patients ID 1 et 2
for patient_id in [1, 2]:
    for exam in examens:
        payload = {
            "patient_id": patient_id,
            "type": exam["type"],
            "fichier_url": exam["url"],
            "date": datetime.now().isoformat()
        }

        response = requests.post(
            f"{BASE_URL}/imagerie/",
            headers={
                "Authorization": TOKEN,
                "Content-Type": "application/json"
            },
            json=payload
        )

        if response.status_code == 200:
            print(f"✅ Imagerie ajoutée pour patient {patient_id} : {exam['type']}")
        else:
            print(f"❌ Échec pour patient {patient_id} - {exam['type']} - Code {response.status_code}")
            print(response.text)
