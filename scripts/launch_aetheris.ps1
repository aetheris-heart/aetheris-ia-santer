# ============================================================
# LANCEUR AETHERIS IA SANTE — MODE LOCAL
# Auteur : Ramses Namba Ateba
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   LANCEMENT D'AETHERIS IA SANTE LOCAL" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1️⃣ Vérification de Python
if (-not (Get-Command "python" -ErrorAction SilentlyContinue)) {
    Write-Host "Python n'est pas détecté. Installe-le avant de continuer." -ForegroundColor Red
    exit
}
Write-Host "Python détecté." -ForegroundColor Green

# 2️⃣ Vérification d'Ollama
if (-not (Get-Command "ollama" -ErrorAction SilentlyContinue)) {
    Write-Host "Ollama n'est pas détecté. Télécharge-le sur https://ollama.ai/download" -ForegroundColor Yellow
    exit
}

$ollamaModels = (ollama list)
if ($ollamaModels -notmatch "mistral") {
    Write-Host "Téléchargement du modèle médical 'mistral'..." -ForegroundColor Yellow
    ollama pull mistral
} else {
    Write-Host "Modèle Mistral déjà disponible." -ForegroundColor Green
}

# 3️⃣ Vérification du backend FastAPI
$backendPath = "C:\PROJET IA SANTE 2"
Set-Location $backendPath

if (-not (Test-Path "$backendPath\main.py")) {
    Write-Host "Fichier main.py introuvable." -ForegroundColor Red
    exit
}

# 4️⃣ Libération du port 8000
$portUsed = (Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue)
if ($portUsed) {
    Write-Host "Le port 8000 est déjà utilisé. Arrêt du processus..." -ForegroundColor Yellow
    $pid = $portUsed.OwningProcess
    Stop-Process -Id $pid -Force
    Start-Sleep -Seconds 2
}

# 5️⃣ Démarrage d’Ollama
$ollamaRunning = Get-Process | Where-Object { $_.Name -eq "ollama" }
if (-not $ollamaRunning) {
    Write-Host "Démarrage du moteur IA Ollama..." -ForegroundColor Cyan
    Start-Process "ollama" -ArgumentList "serve"
    Start-Sleep -Seconds 4
    Write-Host "Ollama lancé." -ForegroundColor Green
} else {
    Write-Host "Ollama déjà actif." -ForegroundColor Green
}

# 6️⃣ Démarrage du backend FastAPI
Write-Host ""
Write-Host "Lancement du backend FastAPI..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "uvicorn main:app --reload --host 127.0.0.1 --port 8000 --log-level debug"

Start-Sleep -Seconds 3
Write-Host ""
Write-Host "Aetheris est en ligne sur : http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host "Interface React sur : http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Lancement complet termine. Le royaume Aetheris est eveille." -ForegroundColor Cyan
