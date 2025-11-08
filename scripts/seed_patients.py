import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from api.database import SessionLocal, engine, Base
from app.models.patient import Patient
from app.models.analyse_ia import AnalyseIA
from app.models.synthese_ia import SyntheseIA
from datetime import datetime

# ⚡ Reset (optionnel)
# Base.metadata.drop_all(bind=engine)
# Base.metadata.create_all(bind=engine)

db: Session = SessionLocal()

patients_data = [
    {
        "nom": "Dupont",
        "prenom": "Jean",
        "age": 65,
        "sexe": "Homme",
        "rythme_cardiaque": 120,
        "spo2": 85.0,
        "temperature": 39.5,
        "traitement": "Antihypertenseurs",
        "groupe_sanguin": "A+",
        "allergies": "Pénicilline",
        "antecedents": "HTA, diabète",
    },
    {
        "nom": "Martin",
        "prenom": "Claire",
        "age": 52,
        "sexe": "Femme",
        "rythme_cardiaque": 90,
        "spo2": 95.0,
        "temperature": 37.8,
        "traitement": "Insuline",
        "groupe_sanguin": "O-",
        "allergies": "Aucune",
        "antecedents": "Diabète type 2",
    },
    {
        "nom": "Nguyen",
        "prenom": "Bao",
        "age": 40,
        "sexe": "Homme",
        "rythme_cardiaque": 130,
        "spo2": 80.0,
        "temperature": 40.2,
        "traitement": "Aucun",
        "groupe_sanguin": "B+",
        "allergies": "Iode",
        "antecedents": "Asthme",
    },
    {
        "nom": "Kouadio",
        "prenom": "Aïcha",
        "age": 28,
        "sexe": "Femme",
        "rythme_cardiaque": 78,
        "spo2": 99.0,
        "temperature": 36.7,
        "traitement": "Aucun",
        "groupe_sanguin": "AB+",
        "allergies": "Arachides",
        "antecedents": "Grossesse récente",
    },
    {
        "nom": "Rodriguez",
        "prenom": "Carlos",
        "age": 70,
        "sexe": "Homme",
        "rythme_cardiaque": 150,
        "spo2": 82.0,
        "temperature": 38.9,
        "traitement": "Bêta-bloquants",
        "groupe_sanguin": "O+",
        "allergies": "Sulfa",
        "antecedents": "Infarctus du myocarde",
    },
]

for pdata in patients_data:
    patient = Patient(**pdata)
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # Ajout Analyse IA
    analyse = AnalyseIA(
        patient_id=patient.id,
        diagnostic=f"Analyse initiale du patient {patient.nom}",
        prediction="⚠️ Risque élevé de complication cardio-respiratoire",
        plan="Surveillance rapprochée, mise sous O2, contrôle glycémie",
        recommendation="Informer le médecin de garde",
        created_at=datetime.utcnow(),
    )
    db.add(analyse)

    # Ajout Synthèse IA
    synthese = SyntheseIA(
        patient_id=patient.id,
        resume=f"Synthèse clinique pour {patient.nom} {patient.prenom}",
        recommandations="Hydratation, contrôle tension artérielle",
        risques="Tachycardie, hypoxémie",
        score_global=0.8,
        tags="cardio,urgence",
        created_at=datetime.utcnow(),
    )
    db.add(synthese)

    db.commit()

db.close()
print("✅ 5 patients insérés avec analyses IA et synthèses IA.")
