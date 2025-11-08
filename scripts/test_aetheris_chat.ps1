# ============================================================
# 🧠 TEST AETHERIS CHAT LOCAL — DIAGNOSTIC INTÉGRÉ
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🔍 TEST DU MODULE AETHERIS CHAT LOCAL " -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ------------------------------------------------------------
# 1️⃣ Vérifier si Ollama est installé
# ------------------------------------------------------------
if (-not (Get-Command "ollama" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Ollama n'est pas détecté sur cette machine." -ForegroundColor Red
    Write-Host "Télécharge-le depuis https://ollama.ai/download puis réessaie." -ForegroundColor Yellow
    exit
}

# ------------------------------------------------------------
# 2️⃣ Vérifier si le modèle Mistral est disponible
# ------------------------------------------------------------
$ollamaModels = (ollama list)

if ($ollamaModels -notmatch "mistral") {
    Write-Host "⚠️ Modèle Mistral non trouvé — téléchargement en cours..." -ForegroundColor Yellow
    ollama pull mistral
} else {
    Write-Host "✅ Modèle Mistral détecté localement." -ForegroundColor Green
}

# ------------------------------------------------------------
# 3️⃣ Vérifier que le serveur FastAPI tourne
# ------------------------------------------------------------
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/docs" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Serveur FastAPI en ligne." -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Serveur FastAPI non détecté. Lance-le avec :" -ForegroundColor Red
    Write-Host "   uvicorn main:app --reload" -ForegroundColor Yellow
    exit
}

# ------------------------------------------------------------
# 4️⃣ Vérifier le fichier .env (facultatif)
# ------------------------------------------------------------
$envPath = "C:\PROJET IA SANTE 2\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "⚠️ Fichier .env non trouvé, vérifie ta configuration locale." -ForegroundColor Yellow
} else {
    Write-Host "✅ Fichier .env détecté." -ForegroundColor Green
}

# ------------------------------------------------------------
# 5️⃣ Envoi d'une requête test à Aetheris Chat (avec authentification)
# ------------------------------------------------------------
Write-Host "`n🧪 Envoi d'un message test à Aetheris IA (Mistral local)..." -ForegroundColor Cyan

$body = @{
    message = "Bonjour Aetheris, fais-moi une évaluation clinique rapide."
    patient_id = 0  # 🔹 ID d’un patient existant dans ta base
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod `
        -Uri "http://127.0.0.1:8000/aetheris/chat/ask" `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" =" eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZXhwIjoxNzYyNDgyNjA2fQ.KoZt9X-_l7uKle4ySUC4a5DboPpGid4Ra6OKr9DLqzA"
        } `
        -Method POST `
        -Body $body `
        -TimeoutSec 120

    Write-Host "`n🧠 Réponse Aetheris :" -ForegroundColor Green
    Write-Host $res.aetheris_response -ForegroundColor White
}
catch {
    Write-Host "`n❌ Erreur pendant le test :" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}
