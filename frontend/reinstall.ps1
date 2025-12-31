# Réinstallation des dépendances frontend
Set-Location $PSScriptRoot

Write-Host "Nettoyage de node_modules..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    Remove-Item -Path node_modules -Recurse -Force
}

Write-Host "Nettoyage du cache npm..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "Installation des dépendances..." -ForegroundColor Yellow
npm install --legacy-peer-deps

Write-Host "Installation terminée!" -ForegroundColor Green
