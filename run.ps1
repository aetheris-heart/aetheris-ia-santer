# --- Script de lancement Aetheris IA Santé ---

Write-Host "=== Activation de l'environnement virtuel ===" -ForegroundColor Cyan
& "$PSScriptRoot\venv\Scripts\Activate.ps1"

Write-Host "=== Vérification des dépendances ===" -ForegroundColor Yellow
pip check

Write-Host "=== Mise à jour des dépendances critiques ===" -ForegroundColor Magenta
pip install --upgrade -r requirements.txt

Write-Host "=== Démarrage du serveur Uvicorn ===" -ForegroundColor Green
uvicorn main:app --reload --host 127.0.0.1 --port 8000
