# ============================================================
# TEST AUTOMATIQUE D'AETHERIS IA (CHAT LOCAL)
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST AUTOMATIQUE AETHERIS CHAT LOCAL" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ------------------------------------------------------------
# 1️⃣ Connexion pour récupérer le token
# ------------------------------------------------------------
$email = "superadmin@aetheris.com"
$password = "admin123"

Write-Host "Connexion à l'API pour obtenir le token..." -ForegroundColor Yellow

try {
    $loginResponse = Invoke-RestMethod `
        -Uri "http://127.0.0.1:8000/auth/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/x-www-form-urlencoded" } `
        -Body "username=$email&password=$password"

    $token = $loginResponse.access_token

    if (-not $token) {
        Write-Host "Erreur : impossible d'obtenir le token JWT." -ForegroundColor Red
        exit
    }

    Write-Host "Token obtenu avec succès." -ForegroundColor Green
}
catch {
    Write-Host "Erreur pendant la connexion :" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    exit
}

# ------------------------------------------------------------
# 2️⃣ Envoi d’un message test à Aetheris IA locale
# ------------------------------------------------------------
Write-Host "`nEnvoi du message de test à Aetheris..." -ForegroundColor Cyan

$body = @{
    message = "Bonjour Aetheris, effectue une evaluation clinique rapide du système hospitalier."
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod `
        -Uri "http://127.0.0.1:8000/aetheris/chat/ask" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        } `
        -Body $body `
        -TimeoutSec 900


    Write-Host "`nRéponse Aetheris :" -ForegroundColor Green
    Write-Host $response.aetheris_response -ForegroundColor White
}
catch {
    Write-Host "`nErreur pendant le test :" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}

Write-Host "`nTest terminé. Vérifie la réponse ci-dessus." -ForegroundColor Cyan
