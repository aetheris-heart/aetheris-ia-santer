import sys
import os
import random
from datetime import datetime
from sqlalchemy.orm import Session

# --- 🔧 Import du projet ---
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.database import SessionLocal
from app.models.patient import Patient
from app.models.cardiaque import CardiaqueData
from app.models.renal import RenalData
from app.models.digestive import DigestiveData
from app.models.metabolique import MetaboliqueData
from app.models.neurologique import NeurologiqueData
from app.models.pulmonary import PulmonaryData


# ------------------------------------------
# ⚙️ Fonction : générer des valeurs réalistes
# ------------------------------------------
def generate_vitals_for_patient(patient_id: int, db: Session):
    """Injecte automatiquement des données médicales réalistes pour un patient donné."""

    # 💓 Fonction cardiaque
    cardiaque = CardiaqueData(
        patient_id=patient_id,
        frequence_cardiaque=random.randint(60, 100),
        tension_systolique=random.randint(110, 140),
        tension_diastolique=random.randint(70, 90),
        anomalies_detectees=random.choice(["Aucune", "Arythmie légère", "Tachycardie"]),
        alerte=random.choice(["Aucune", "Tension élevée", "Fréquence instable"]),
        created_at=datetime.utcnow(),
    )
    db.add(cardiaque)

    # 🌬️ Fonction pulmonaire
    pulmonaire = PulmonaryData(
        patient_id=patient_id,
        spo2=random.randint(93, 100),
        frequence_respiratoire=random.randint(12, 20),
        anomalies_detectees=random.choice(["Aucune", "Hypoxie légère", "Apnée du sommeil"]),
        alerte=random.choice(["Aucune", "SpO₂ basse", "Rythme respiratoire instable"]),
        created_at=datetime.utcnow(),
    )
    db.add(pulmonaire)

    # 💧 Fonction rénale
    renal = RenalData(
        patient_id=patient_id,
        creatinine=random.uniform(0.7, 1.4),
        filtration_glomerulaire=random.randint(80, 120),
        anomalies_detectees=random.choice(["Aucune", "Insuffisance modérée", "Rétention"]),
        alerte=random.choice(["Aucune", "Surveillance requise", "Risque d'insuffisance"]),
        created_at=datetime.utcnow(),
    )
    db.add(renal)

    # 🍽️ Fonction digestive
    digestive = DigestiveData(
        patient_id=patient_id,
        acidite=random.uniform(1.0, 2.5),
        motricite=random.uniform(0.8, 1.2),
        inflammation=random.choice(["Aucune", "Légère", "Sévère"]),
        alerte=random.choice(["Aucune", "Inflammation détectée", "Acidité élevée"]),
        created_at=datetime.utcnow(),
    )
    db.add(digestive)

    # ⚡ Fonction métabolique
    metabolique = MetaboliqueData(
        patient_id=patient_id,
        glucose=random.randint(75, 130),
        insuline=random.uniform(4.0, 10.0),
        anomalies_detectees=random.choice(["Aucune", "Résistance à l’insuline", "Hyperglycémie"]),
        alerte=random.choice(["Aucune", "Glycémie haute", "Surveillance diabétique"]),
        created_at=datetime.utcnow(),
    )
    db.add(metabolique)

    # 🧠 Fonction neurologique
    neuro = NeurologiqueData(
        patient_id=patient_id,
        eeg=random.uniform(0.6, 1.2),
        stress_level=random.uniform(0.2, 0.9),
        concentration=random.uniform(60, 100),
        reponse_reflexe=random.uniform(150, 300),
        temperature_cerebrale=random.uniform(36.5, 37.5),
        alerte=random.choice(["Aucune", "Stress élevé", "Activité neuronale anormale"]),
        commentaire_ia=random.choice([
            "Activité cérébrale normale",
            "Surcharge cognitive détectée",
            "Légère instabilité émotionnelle",
            "Fonction cérébrale optimale"
        ]),
        created_at=datetime.utcnow(),
    )
    db.add(neuro)



# ------------------------------------------
# 🧠 Script principal
# ------------------------------------------
def inject_all_patients():
    db = SessionLocal()
    try:
        patients = db.query(Patient).all()
        if not patients:
            print("⚠️ Aucun patient trouvé dans la base. Exécute d'abord le script generate_patients.py")
            return

        print(f"🧬 Injection des données vitales pour {len(patients)} patient(s)...\n")
        for patient in patients:
            # Vérifie si des données existent déjà pour ce patient
            existing_cardio = db.query(CardiaqueData).filter_by(patient_id=patient.id).first()
            if existing_cardio:
                print(f"⏭️ Données déjà existantes pour {patient.nom} {patient.prenom} — passage.")
                continue

            generate_vitals_for_patient(patient.id, db)
            print(f"✅ Données vitales générées pour {patient.nom} {patient.prenom} (ID {patient.id})")

        db.commit()
        print("\n🌟 Toutes les fonctions vitales ont été injectées avec succès !")
    except Exception as e:
        db.rollback()
        print("❌ Erreur d’injection :", e)
    finally:
        db.close()


# ------------------------------------------
if __name__ == "__main__":
    inject_all_patients()
