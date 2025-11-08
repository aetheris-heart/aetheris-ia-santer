import os

import sys
import random
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


# ✅ Ajout du chemin racine du projet
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)


from app.models.synthese_ia import SyntheseIA
from app.models.patient import Patient
from app.models.user import User
from api.database import Base, get_db

# ======================================================
# ⚙️ CONFIGURATION
# ======================================================
DB_URL = "sqlite:///./test.db"  # adapte si tu utilises PostgreSQL ou autre
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ======================================================
# 📊 GÉNÉRATION DE DONNÉES SYNTHÈSE IA
# ======================================================
GRAVITES = ["vert", "jaune", "orange", "rouge"]

RESUMES = [
    "Analyse cardiaque stable, légère variation du rythme détectée.",
    "Légère élévation de la pression artérielle observée.",
    "Activité cérébrale normale, stress modéré détecté.",
    "Fonction rénale légèrement altérée, surveillance recommandée.",
    "Données métaboliques cohérentes avec une glycémie stable.",
    "Présence d’anomalies digestives mineures, inflammation à surveiller."
]

RECOMMANDATIONS = [
    "Hydratation régulière et repos conseillé.",
    "Suivi médical hebdomadaire requis.",
    "Poursuite du traitement actuel sans modification.",
    "Contrôle sanguin recommandé dans 48h.",
    "Consultation spécialisée en cardiologie suggérée."
]


def generate_synthese(patient_id: int, medecin_id: int):
    score = round(random.uniform(0.2, 0.95), 2)
    niveau = (
        "rouge" if score > 0.8
        else "orange" if score > 0.6
        else "jaune" if score > 0.4
        else "vert"
    )

    return SyntheseIA(
        patient_id=patient_id,
        medecin_id=medecin_id,
        resume=random.choice(RESUMES),
        recommandations=random.choice(RECOMMANDATIONS),
        risques="Fatigue, Stress, Hypertension" if score > 0.7 else "Aucun risque critique",
        score_global=score,
        niveau_gravite=niveau,
        tags="IA,Aetheris,Diagnostic",
        alertes_critiques="Risque accru" if score > 0.75 else None,
        anomalies_detectees="Déséquilibre détecté" if score > 0.6 else None,
        recommandations_ia=[{"action": "Contrôle médical", "priorité": "moyenne"}],
        valide_par_humain=True,
        commentaire_medecin="Analyse validée par le Dr Aetheris",
        created_at=datetime.utcnow() - timedelta(days=random.randint(0, 15)),
    )


def main():
    db = SessionLocal()
    try:
        patients = db.query(Patient).limit(5).all()
        medecin = db.query(User).first()

        if not patients or not medecin:
            print("❌ Aucun patient ou médecin trouvé. Vérifie la base.")
            return

        print(f"👩‍⚕️ Médecin : {medecin.nom} {medecin.prenom}")
        print(f"👥 {len(patients)} patients trouvés, insertion en cours...")

        for patient in patients:
            nb = random.randint(1, 3)
            for _ in range(nb):
                synth = generate_synthese(patient.id, medecin.id)
                db.add(synth)

        db.commit()
        print("✅ Synthèses IA insérées avec succès !")

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur : {e}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
