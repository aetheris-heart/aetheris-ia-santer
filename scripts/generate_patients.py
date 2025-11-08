# scripts/generate_patients.py
import sys
import os
import random
from datetime import datetime
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from api.database import SessionLocal
from app import models

db = SessionLocal()

# 🧬 Données de base
noms = ["Koffi", "Diop", "Ateba", "Mubenga", "Traoré", "Ndong", "Kamdem", "Mulumba", "Essono", "Okeke"]
prenoms = ["Jean", "Amina", "Ramsès", "Sophie", "Ali", "Moussa", "Chantal", "Grace", "Luc", "Fatou"]

sexes = ["H", "F"]

def random_val(min_v, max_v):
    return round(random.uniform(min_v, max_v), 2)


print("🩺 Génération des patients en cours...")

for i in range(10):
    nom = noms[i]
    prenom = prenoms[i]
    age = random.randint(25, 80)
    sexe = random.choice(sexes)

    # 🧑‍⚕️ Création du patient
    patient = models.Patient(
        nom=nom,
        prenom=prenom,
        age=age,
        sexe=sexe,
        adresse=f"Rue {random.randint(1, 50)} Kinshasa",
        telephone=f"+24389{random.randint(1000000, 9999999)}",
        email=f"{prenom.lower()}.{nom.lower()}.{random.randint(1000,9999)}@hopitalaetheris.com",

    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # --- Données cliniques par fonction ---

    # 🫀 Cardiaque
    cardio = models.CardiaqueData(
        patient_id=patient.id,
        frequence_cardiaque=random_val(60, 110),
        tension_systolique=random_val(100, 140),
        tension_diastolique=random_val(60, 90),
        rythme=random.choice(["sinusal", "fibrillation", "tachycardie légère"]),
        anomalies_detectees=random.choice(["aucune", "extrasystoles", "arythmie", None]),
        alerte=None,
        created_at=datetime.now(),
        
)
    db.add(cardio)



    # 🫁 Pulmonaire
    pulmonaire = models.PulmonaryData(
        patient_id=patient.id,
        spo2=random_val(90, 100),
        frequence_respiratoire=random_val(12, 22),
        alerte=None,
        created_at=datetime.now(),
        
    )
    db.add(pulmonaire)

    # 💧 Rénale
    renale = models.RenalData(
        patient_id=patient.id,
        creatinine=random_val(60, 130),
        filtration_glomerulaire=random_val(80, 120),
        uree=random_val(2, 8),
        alerte=None,
        created_at=datetime.now(),
        
    )
    db.add(renale)

    # ⚕️ Digestive
    digestive = models.DigestiveData(
        patient_id=patient.id,
        acidite=random_val(1.2, 3.0),
        motricite=random_val(80, 120),
        inflammation=random.choice(["faible", "modérée", "forte"]),
        alerte=None,
        created_at=datetime.now(),
        
    )
    db.add(digestive)

    # 🧠 Neurologique
    neuro = models.NeurologiqueData(
        patient_id=patient.id,
        eeg=random_val(60, 90),
        stress_level=random_val(20, 80),
        concentration=random_val(60, 100),
        reponse_reflexe=random_val(250, 400),
        temperature_cerebrale=random_val(36.0, 37.8),
        alerte=None,
        commentaire_ia="activité cérébrale normale",
        created_at=datetime.now(),
        
    )
    db.add(neuro)

    # 🧬 Métabolique
    metabolique = models.MetaboliqueData(
        patient_id=patient.id,
        glucose=random_val(4.0, 6.0),
        insuline=random_val(5, 15),
        cholesterol=random_val(150, 220),
    
        alerte=None,
        created_at=datetime.now(),
        
    )
    db.add(metabolique)

    db.commit()

print("✅ 10 patients et leurs données cliniques ont été ajoutés avec succès !")
db.close()
