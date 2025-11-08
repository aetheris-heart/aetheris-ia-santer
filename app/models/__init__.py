# ==========================================
# ⚙️ AETHERIS IA - Initialisation des modèles
# ==========================================

from api.database import Base

# 👤 Patient et base clinique
from app.models.patient import Patient
from app.models.dossier_medical import DossierMedical
from app.models.consultation import Consultation
from app.models.diagnostic import Diagnostic

# 🧠 Intelligence Aetheris
from app.models.analyse_ia import AnalyseIA
from app.models.synthese_ia import SyntheseIA
from app.models.patient_critique import PatientCritique
from app.models.aetheris_chat import AetherisChat
from app.models.etat_clinique import EtatClinique
# ⚙️ Fonctions vitales
from app.models.cardiaque import CardiaqueData
from app.models.renal import RenalData
from app.models.digestive import DigestiveData
from app.models.metabolique import MetaboliqueData
from app.models.neurologique import NeurologiqueData
from app.models.pulmonary import PulmonaryData

# 🖼️ Imagerie et radiologie
from app.models.imagerie import Imagerie
from app.models.radiologie import Radiologie  # ⚠️ placé juste après Imagerie

# 🏥 Gestion hospitalière
from app.models.hospitalisation import Hospitalisation
from app.models.rendezvous import RendezVous
from app.models.document import Document
from app.models.bloc_operatoire import BlocOperatoire
from app.models.soins import SoinsInfirmier

# 🚑 Urgences et transport
from app.models.urgence import Urgence
from app.models.ambulance import Ambulance

# 🧪 Laboratoire et pharmacie
from app.models.biologie import Biologie
from app.models.pharmacie import Pharmacie

# 👥 Utilisateurs et spécialités
from app.models.user import User
from app.models.medecin import Medecin
from app.models.rh import Employe
from app.models.specialite import Specialite
from app.models.demande import DemandeCompte

# 💬 Notifications (après User)
from app.models.notification import Notification

# 💶 Comptabilité
from app.models.facture import Facture
from app.models.finance import Finance
from app.models.visual_ia import VisualIA
from app.models.visual_ia import  VisualIASettings


# =============================
# Exposition
# =============================
__all__ = [
    "Base",
    
    "Urgence",
    "User",
    "Patient",
    "EtatClinique",
    "Consultation",
    "Diagnostic",
    "RendezVous",
    "DossierMedical",
    "DemandeCompte",
    "AetherisIA",
    "SyntheseIA",
    "AnalyseIA",
    "PatientCritique",
    "Document",
    "CardiaqueData",
    "PulmonaryData",
    "NeurologiqueData",
    "DigestiveData",
    "MetaboliqueData",
    "RenalData",
    "AetherisChat",
    "Biologie",
    "Pharmacie",
    "Imagerie",
    "Radiologie",
    "Hospitalisation",
    "BlocOperatoire",
    "SoinsInfirmier",
    "Facture",
    "Ambulance",
    "Notification",
    "VisualIA",
    
    "Finance",
    "Employe",
    "Specialite",
    "Medecin",
    "VisualIASettings",
]
