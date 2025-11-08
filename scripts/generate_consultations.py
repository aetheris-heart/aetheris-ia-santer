import os
import sys
import random
from datetime import datetime, timedelta
from sqlalchemy import func

# --- Chemin du projet ---
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.database import SessionLocal
from app import models
from api.routes.auth import get_password_hash  # ✅ si ton projet a cette fonction (sinon on la retire)

db = SessionLocal()

print("🧠 Génération des consultations, diagnostics et alertes IA...\n")

# --- Listes de données aléatoires ---
motifs = [
    "Contrôle de routine", "Fatigue persistante", "Douleur thoracique",
    "Essoufflement", "Vertiges", "Maux de tête", "Fièvre",
    "Tremblements", "Anxiété", "Suivi post-opératoire"
]

diagnostics = [
    "Hypertension artérielle", "Hypotension légère", "Stress chronique",
    "Asthme contrôlé", "Trouble du sommeil", "Insuffisance rénale débutante",
    "Diabète de type 2", "Tachycardie bénigne", "Migraine", "Fatigue musculaire"
]

recommandations = [
    "Hydratation accrue", "Repos complet 48h", "Suivi ECG dans 1 semaine",
    "Contrôle glycémie quotidien", "Réduction du sel", "Reprise d’activité physique douce",
    "Consultation psychologique", "Suivi tension artérielle",
    "Ajustement du traitement", "Rendez-vous dans 3 jours"
]


# --- Fonction IA d’analyse ---
def detecter_alerte(patient_id):
    cardio = db.query(models.CardiaqueData).filter(models.CardiaqueData.patient_id == patient_id).first()
    pulm = db.query(models.PulmonaryData).filter(models.PulmonaryData.patient_id == patient_id).first()
    renale = db.query(models.RenalData).filter(models.RenalData.patient_id == patient_id).first()
    neuro = db.query(models.NeurologiqueData).filter(models.NeurologiqueData.patient_id == patient_id).first()

    alertes = []
    if cardio and cardio.frequence_cardiaque and cardio.frequence_cardiaque > 110:
        alertes.append("⚠️ Tachycardie détectée")
    if pulm and pulm.spo2 and pulm.spo2 < 90:
        alertes.append("⚠️ Hypoxie détectée (SpO₂ basse)")
    if renale and renale.creatinine and renale.creatinine > 120:
        alertes.append("⚠️ Risque d’insuffisance rénale")
    if neuro and neuro.stress_level and neuro.stress_level > 75:
        alertes.append("⚠️ Stress neurologique élevé")
    return alertes or ["✅ Aucune alerte critique détectée"]


# --- Trouver ou créer un médecin IA ---
medecin = (
    db.query(models.User)
    .filter(func.lower(models.User.role).like("%medecin%"))
    .first()
)

if not medecin:
    print("⚠️ Aucun médecin trouvé, création automatique de Dr Aetheris IA...")
    medecin = models.User(
        nom="Aetheris",
        prenom="IA",
        email="aetheris.ia@aetheris.com",
        hashed_password=get_password_hash("aetheris123"),  # remplace si nécessaire
        role="Médecin",
        specialite="Intelligence Artificielle",
        is_active=True,
        is_verified=True,
    )
    db.add(medecin)
    db.commit()
    db.refresh(medecin)

print(f"✅ Médecin assigné : Dr {medecin.nom} ({medecin.email})\n")


# --- Création des consultations ---
patients = db.query(models.Patient).all()
total_consult = 0
total_alertes = 0

for patient in patients:
    nb_consult = random.randint(1, 3)
    for _ in range(nb_consult):
        motif = random.choice(motifs)
        diagnostic_nom = random.choice(diagnostics)
        recommandation = random.choice(recommandations)
        alertes = detecter_alerte(patient.id)

        try:
            # --- Consultation ---
            consultation = models.Consultation(
                patient_id=patient.id,
                medecin_id=medecin.id,
                date_consultation=datetime.now() - timedelta(days=random.randint(0, 30)),
                motif=motif,
                diagnostic=diagnostic_nom,
                traitement=random.choice(["Repos", "Antihypertenseur", "Antibiotique", "Insuline", "Régime alimentaire"]),
                recommandations=recommandation,
                commentaire=f"Consultation générée automatiquement par Aetheris IA — {alertes[0]}",
                created_at=datetime.now(),
            )
            db.add(consultation)
            db.commit()
            db.refresh(consultation)

            # --- Diagnostic IA associé ---
            diag_ia = models.Diagnostic(
                patient_id=patient.id,
                consultation_id=consultation.id,
                medecin_id=medecin.id,
                type="Analyse IA",
                resultat=f"Analyse IA : {diagnostic_nom}",
                details=f"IA Aetheris détecte {alertes[0]} pour {patient.nom} {patient.prenom}.",
                score_confiance=round(random.uniform(80, 98), 1),
                priorite="Normale",
                niveau_risque="Bas",
                signature_ia="Aetheris IA",
                commentaire_medecin=None,
                date_diagnostic=datetime.utcnow(),
                created_at=datetime.utcnow(),
            )
            db.add(diag_ia)

            # --- Notification IA ---
            for alert in alertes:
                notif = models.Notification(
                    user_id=medecin.id,
                    titre="Alerte médicale IA",
                    message=alert,
                    type="alerte" if "⚠️" in alert else "info",
                    created_at=datetime.utcnow(),
                )
                db.add(notif)
                total_alertes += 1

            db.commit()
            total_consult += 1

        except Exception as e:
            db.rollback()
            print(f"❌ Erreur pour le patient {patient.nom} {patient.prenom}: {e}")

db.close()

print(f"\n✅ Génération terminée : {total_consult} consultations, {total_alertes} alertes IA ajoutées.")
print("🌐 Données prêtes pour le tableau de bord AETHERIS ⚡")
