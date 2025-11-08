from sqlalchemy.orm import Session
from datetime import datetime
from api.database import SessionLocal
from app import models

def insert_radiologie_test():
    db: Session = SessionLocal()

    try:
        # Vérification ou création de deux patients tests
        patient1 = db.query(models.Patient).filter(models.Patient.nom == "Test").first()
        if not patient1:
            patient1 = models.Patient(
                nom="Test",
                prenom="Patient",
                age=45,
                sexe="Homme",
                email="patient1@test.com"
            )
            db.add(patient1)
            db.commit()
            db.refresh(patient1)

        patient2 = db.query(models.Patient).filter(models.Patient.nom == "Demo").first()
        if not patient2:
            patient2 = models.Patient(
                nom="Demo",
                prenom="Patiente",
                age=38,
                sexe="Femme",
                email="patient2@test.com"
            )
            db.add(patient2)
            db.commit()
            db.refresh(patient2)

        # 🔬 Insertion de 2 radiologies
        radio1 = models.VisualIA(
            patient_id=patient1.id,
            diagnostic="Suspicion pneumonie lobaire droite",
            file_path="radio_poumons_patient1.png",
            domaine="radiologie",
            date=datetime.now()
        )

        radio2 = models.VisualIA(
            patient_id=patient2.id,
            diagnostic="Anomalie détectée : masse abdominale suspecte",
            file_path="scanner_abdomen_patient2.png",
            domaine="radiologie",
            date=datetime.now()
        )

        db.add_all([radio1, radio2])
        db.commit()

        print("✅ Données de radiologie insérées avec succès !")
        print(f" - {patient1.nom} : {radio1.diagnostic}")
        print(f" - {patient2.nom} : {radio2.diagnostic}")

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors de l'insertion : {e}")

    finally:
        db.close()

if __name__ == "__main__":
    insert_radiologie_test()
