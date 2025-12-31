# Script de lancement du projet Check Filling

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  LANCEMENT DU PROJET CHECK FILLING" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Lancer le backend en arrière-plan
Write-Host "Démarrage du backend (API)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend API - Port 5000' -ForegroundColor Green; dotnet run"

Write-Host "✓ Backend démarré" -ForegroundColor Green
Write-Host ""

# Attendre que le backend démarre
Write-Host "Attente du démarrage du backend (5 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Lancer le frontend
Write-Host "Démarrage du frontend (Next.js)..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
cd $frontendPath
Write-Host "✓ Passage au répertoire frontend" -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  FRONTEND - Port 3000" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
npm run dev
