import requests
import random
import time

API_URL = "http://localhost:8000/etatclinique/"

# Données des patients déjà enregistrés (2 ID connus)
patient_ids = [1, 2]

def generer_etat_clinique(patient_id):
    return {
        "patient_id": patient_id,
        "spo2": round(random.uniform(89, 99), 1),
        "temperature": round(random.uniform(36.0, 39.0), 1),
        "rythme_cardiaque": random.randint(60, 130)
    }

for patient_id in patient_ids:
    for _ in range(5):  # Injecte 5 données par patient
        data = generer_etat_clinique(patient_id)
        try:
            response = requests.post(API_URL, json=data)
            if response.status_code == 200:
                print(f"✅ Donnée ajoutée pour le patient {patient_id}")
            else:
                print(f"❌ Erreur pour le patient {patient_id} - Code {response.status_code}")
                print(f"➡️ Contenu brut : {response.text}")
        except Exception as e:
            print(f"❌ Exception pour le patient {patient_id}: {e}")
        time.sleep(0.5)  # Petite pause pour simuler des entrées réalistes
