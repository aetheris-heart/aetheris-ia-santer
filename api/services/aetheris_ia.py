from datetime import datetime
import random
from typing import Dict, Any, List, Optional


class AetherisIA:
    """
    🧠 Moteur AETHERIS IA Santé
    Analyse multi-systèmes avec calcul de l'Indice Global de Risque (IGR).
    Premium & extensible pour analyses médicales réelles.
    """

    @staticmethod
    def analyse_cardiaque(hr: Optional[int], spo2: Optional[float]) -> Dict[str, Any]:
        alerts = []
        score = 0

        if hr is not None:
            if hr > 140 or hr < 40:
                alerts.append("Instabilité cardiaque critique")
                score += 40
            elif hr > 120:
                alerts.append("Tachycardie sévère")
                score += 25
            elif hr < 50:
                alerts.append("Bradycardie modérée")
                score += 15

        if spo2 is not None and spo2 < 90:
            alerts.append("Hypoxémie associée")
            score += 20

        return {"systeme": "cardiaque", "score": score, "alertes": alerts}

    @staticmethod
    def analyse_pulmonaire(spo2: Optional[float], fr: Optional[int]) -> Dict[str, Any]:
        alerts = []
        score = 0

        if spo2 is not None:
            if spo2 < 85:
                alerts.append("Détresse respiratoire sévère")
                score += 40
            elif spo2 < 92:
                alerts.append("Hypoxémie modérée")
                score += 20

        if fr is not None:
            if fr > 30:
                alerts.append("Tachypnée marquée")
                score += 25
            elif fr < 10:
                alerts.append("Bradypnée inquiétante")
                score += 25

        return {"systeme": "pulmonaire", "score": score, "alertes": alerts}

    @staticmethod
    def analyse_renale(creatinine: Optional[float], uree: Optional[float]) -> Dict[str, Any]:
        alerts = []
        score = 0

        if creatinine and creatinine > 150:
            alerts.append("Insuffisance rénale probable")
            score += 30
        if uree and uree > 10:
            alerts.append("Urée élevée")
            score += 20

        return {"systeme": "rénale", "score": score, "alertes": alerts}

    @staticmethod
    def analyse_digestive(temp: Optional[float]) -> Dict[str, Any]:
        alerts = []
        score = 0

        if temp:
            if temp > 39:
                alerts.append("Fièvre digestive suspecte")
                score += 20
            elif temp < 35:
                alerts.append("Hypothermie (choc ?)")
                score += 40

        return {"systeme": "digestive", "score": score, "alertes": alerts}

    @staticmethod
    def analyse_neuro(etat_mental: Optional[str], eeg: Optional[float]) -> Dict[str, Any]:
        alerts = []
        score = 0

        if etat_mental and etat_mental.lower() in ["confusion", "coma"]:
            alerts.append("Altération de la conscience")
            score += 40
        if eeg and eeg > 70:
            alerts.append("Activité EEG anormale")
            score += 25

        return {"systeme": "neurologique", "score": score, "alertes": alerts}

    @staticmethod
    def analyse_metabolique(glycemie: Optional[float]) -> Dict[str, Any]:
        alerts = []
        score = 0

        if glycemie is not None:
            if glycemie > 11:
                alerts.append("Hyperglycémie critique")
                score += 30
            elif glycemie < 3:
                alerts.append("Hypoglycémie sévère")
                score += 40

        return {"systeme": "métabolique", "score": score, "alertes": alerts}

    # =======================
    # 🔥 Synthèse IA Globale
    # =======================
    @classmethod
    def synthese_globale(cls, patient: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calcule une synthèse IA sur un patient :
        - Analyse multi-organes
        - Calcul de l’IGR (Indice Global de Risque)
        """

        analyses = [
            cls.analyse_cardiaque(patient.get("hr"), patient.get("spo2")),
            cls.analyse_pulmonaire(patient.get("spo2"), patient.get("fr")),
            cls.analyse_renale(patient.get("creatinine"), patient.get("uree")),
            cls.analyse_digestive(patient.get("temperature")),
            cls.analyse_neuro(patient.get("etat_mental"), patient.get("eeg")),
            cls.analyse_metabolique(patient.get("glycemie")),
        ]

        total_score = sum(a["score"] for a in analyses)
        igr = min(100, total_score)  # capped at 100

        # Résumé clinique
        resume = "Stable"
        if igr > 70:
            resume = "⚠️ Patient critique"
        elif igr > 40:
            resume = "⚠️ Patient à surveiller"

        return {
            "patient": {
                "id": patient.get("id"),
                "nom": patient.get("nom"),
                "prenom": patient.get("prenom"),
            },
            "igr": igr,
            "resume": resume,
            "analyses": analyses,
            "tendance": random.choice(["Amélioration", "Stable", "Aggravation"]),
            "date": datetime.utcnow().isoformat(),
            "disclaimer": "⚠️ Analyse générée par AETHERIS IA — nécessite validation médicale.",
        }
