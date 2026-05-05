$ErrorActionPreference = 'Stop'
$sourcePath = "c:\Users\walar\OneDrive\Bureau\Esprit-PI-Classe-2026-CodeMasters-main (1)\Esprit-PI-Classe-2026-CodeMasters-main"
$repoPath = "$sourcePath\temp_repo_integration"
$repoUrl = "https://github.com/Alaatahri/Esprit-PI-4twin6-2026-CodeMasters.git"

Write-Host "1. Clonage du dépôt..."
if (Test-Path $repoPath) {
    Remove-Item -Path $repoPath -Recurse -Force
}
git clone -c http.postBuffer=524288000 -c http.version=HTTP/1.1 $repoUrl $repoPath

Set-Location $repoPath

Write-Host "2. Création de la branche integration-projet-local..."
git checkout -b integration-projet-local

Write-Host "3. Copie des fichiers locaux (en excluant backend-react, node_modules, .next)..."
robocopy $sourcePath $repoPath /E /XD temp_repo_integration backend-react .git node_modules .next /XF integrate.ps1 /NFL /NDL /NJH /NJS /nc /ns /np
if ($LASTEXITCODE -ge 8) {
    throw "Erreur lors de la copie avec robocopy."
}

Write-Host "4. Ajout des fichiers à Git..."
git add .

Write-Host "5. Création du commit..."
git commit -m "Intégration du projet local (sans backend-react)"

Write-Host "6. Poussée des modifications vers GitHub..."
git push -u origin integration-projet-local

Write-Host "7. Nettoyage..."
Set-Location $sourcePath
Remove-Item -Path $repoPath -Recurse -Force

Write-Host "Opération terminée avec succès !"
