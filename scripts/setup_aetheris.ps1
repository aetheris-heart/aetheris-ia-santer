# ============================================================
#  AETHERIS IA SANTE - SETUP LOCAL AUTOMATISE
#  Auteur : Ramses Namba Ateba
#  Objectif : Preparer, securiser et lancer Aetheris localement
# ============================================================

# Force PowerShell to use UTF-8 encoding everywhere
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================"
Write-Host "  AETHERIS IA SANTE - CONFIGURATION LOCALE "
Write-Host "========================================"
Write-Host ""

# ============================================================
#  Detecter le chemin du dossier backend
# ============================================================

# le backend est directement dans le dossier racine du projet
$backendPath = "C:\PROJET IA SANTE 2"

Set-Location $backendPath

Write-Host "Dossier actuel : $backendPath"

# ============================================================
#  Verifier Python
# ============================================================

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python n'est pas installe. Installe-le avant de continuer."
    exit
}

# ============================================================
#  Verifier les fichiers essentiels
# ============================================================

if (-not (Test-Path "$backendPath\main.py")) {
    Write-Host "Fichier main.py introuvable dans $backendPath."
    exit
}

if (-not (Test-Path "$backendPath\api")) {
    Write-Host "Dossier API introuvable dans $backendPath."
    exit
}

# ============================================================
#  1 - Sauvegarde de la base existante
# ============================================================

$dbFile = "test.db"
$backupFile = "test_backup_{0}.db" -f (Get-Date -Format "yyyyMMdd_HHmmss")

if (Test-Path $dbFile) {
    Copy-Item $dbFile $backupFile -Force
    Write-Host "Sauvegarde de la base creee : $backupFile"
} else {
    Write-Host "Aucune base existante trouvee. Une nouvelle sera creee."
}

# ============================================================
#  2 - Creation ou mise a jour du fichier .env
# ============================================================

$envFile = ".env"
$jwtKey = python -c "import secrets; print(secrets.token_hex(64))"

$envContent = @"
# ========================================
#  AUTHENTIFICATION & JWT
# ========================================
AUTH_SECRET_KEY=$jwtKey
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# ========================================
#  BASE DE DONNEES (LOCAL)
# ========================================
DATABASE_URL=sqlite:///./test.db

# ========================================
#  CORS & ENVIRONNEMENT
# ========================================
ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://127.0.0.1:8000
CORS_ALLOWED_ORIGINS=http://localhost:3000`,http://127.0.0.1:3000

# ========================================
#  EMAIL (OPTIONNEL)
# ========================================
MAIL_USERNAME=tonemail@gmail.com
MAIL_PASSWORD=motdepasse_application
MAIL_FROM=tonemail@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_STARTTLS=True
MAIL_SSL_TLS=False

# ========================================
#  IA AETHERIS (API OPENAI)
# ========================================
OPENAI_API_KEY=
"@

Set-Content -Path $envFile -Value $envContent -Encoding UTF8
Write-Host "Fichier .env cree ou mis a jour avec succes."

# Ajouter .env dans .gitignore si necessaire
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore"
    if ($gitignoreContent -notcontains ".env") {
        Add-Content ".gitignore" "`n.env"
        Write-Host ".env ajoute a .gitignore"
    }
} else {
    Set-Content ".gitignore" ".env"
    Write-Host ".gitignore cree et .env ajoute."
}

# ============================================================
#  3 - Synchronisation de la base
# ============================================================

Write-Host "Verification et creation des tables en base..."

$pythonCode = @"
from api.database import Base, engine
from app import models
Base.metadata.create_all(bind=engine)
print('Tables creees ou synchronisees avec succes.')
"@
python -c $pythonCode


# ============================================================
#  4 - Lancement du serveur
# ============================================================

Write-Host ""
Write-Host "Lancement du backend FastAPI..."
Start-Process powershell -ArgumentList "cd '$backendPath'; uvicorn main:app --reload"

Write-Host ""
Write-Host "AETHERIS est pret."
Write-Host "Accede a ton API ici : http://127.0.0.1:8000/docs"
Write-Host "Base utilisee : test.db"
Write-Host "Cle JWT generee et sauvegardee dans .env"
Write-Host ""
Write-Host "Ton environnement local est stable et pret a grandir."
