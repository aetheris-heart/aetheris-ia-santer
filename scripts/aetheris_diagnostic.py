import os
import requests
import subprocess
import sqlite3
import sys
from colorama import Fore, Style, init

init(autoreset=True)

# 🧭 CONFIGURATION — chemins corrigés
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # Racine du projet
API_BASE = "http://127.0.0.1:8000"
DB_PATH = os.path.join(BASE_DIR, "test.db")       # Base à la racine
FRONTEND_PATH = os.path.join(BASE_DIR, "frontend")  # Frontend à la racine

ROUTES = [
    "/auth/login",
    "/auth/me",
    "/patients",
    "/consultations",
    "/dashboard/stats/cardiac",
    "/dashboard/stats/renal",
    "/dashboard/stats/digestive",
    "/dashboard/stats/pulmonary",
    "/dashboard/stats/metabolic",
    "/dashboard/stats/neurological",
    "/dashboard/stats/patients-per-month",
    "/dashboard/stats/consultations-per-month",
    "/aetheris/analysis/1",
    "/dashboard/synthese",
]


def section(title):
    print(Fore.CYAN + f"\n=== {title.upper()} ===" + Style.RESET_ALL)


def check_route(route: str):
    url = API_BASE + route
    try:
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            print(Fore.GREEN + f"✅ {route} → {res.status_code}")
        elif res.status_code == 401:
            print(Fore.YELLOW + f"⚠️ {route} → {res.status_code} (auth requise)")
        elif res.status_code == 404:
            print(Fore.RED + f"❌ {route} → 404 (route absente)")
        else:
            print(Fore.MAGENTA + f"⚠️ {route} → {res.status_code}")
    except requests.exceptions.RequestException as e:
        print(Fore.RED + f"❌ {route} → ERREUR: {e}")


def check_backend():
    section("Diagnostic Backend")
    for route in ROUTES:
        check_route(route)


def check_database():
    section("Vérification Base de Données")
    if os.path.exists(DB_PATH):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            if tables:
                print(Fore.GREEN + f"✅ Base connectée ({len(tables)} tables détectées)")
                print(Fore.LIGHTBLACK_EX + f"Tables: {[t[0] for t in tables[:10]]}")
            else:
                print(Fore.YELLOW + "⚠️ Base vide, aucune table détectée")
        except Exception as e:
            print(Fore.RED + f"❌ Erreur connexion DB: {e}")
        finally:
            conn.close()
    else:
        print(Fore.RED + f"❌ Fichier de base de données introuvable : {DB_PATH}")


def check_frontend():
    section("Vérification Frontend")
    if not os.path.exists(FRONTEND_PATH):
        print(Fore.RED + f"❌ Dossier frontend introuvable : {FRONTEND_PATH}")
        return

    try:
        print(Fore.CYAN + "🧪 Vérification lint (npm run lint)...")
        subprocess.run(["npm", "run", "lint"], cwd=FRONTEND_PATH, check=True)
        print(Fore.GREEN + "✅ Lint OK")

        print(Fore.CYAN + "🧱 Vérification build (npm run build)...")
        subprocess.run(["npm", "run", "build"], cwd=FRONTEND_PATH, check=True)
        print(Fore.GREEN + "✅ Build réussi")
    except subprocess.CalledProcessError:
        print(Fore.RED + "❌ Erreur durant le lint ou le build")
    except FileNotFoundError:
        print(Fore.RED + "❌ npm non trouvé. Assure-toi qu’il est installé.")


def summary():
    section("Résumé du Diagnostic")
    print(Fore.GREEN + "🟢 Modules fonctionnels : OK")
    print(Fore.YELLOW + "🟡 Modules nécessitant token : à tester avec authentification")
    print(Fore.RED + "🔴 Modules en erreur : à corriger avant déploiement")


def main():
    print(Fore.MAGENTA + "\n🔮 AETHERIS DIAGNOSTIC - IA SANTÉ 🔮\n")
    check_database()
    check_backend()
    check_frontend()
    summary()
    print(Fore.CYAN + "\n=== Analyse terminée. ===\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(Fore.RED + "\n⚠️ Diagnostic interrompu.")
        sys.exit(1)
