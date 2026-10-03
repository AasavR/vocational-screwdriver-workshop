$token = "nfc_jf525ftSSQg45yGPY1VeLJaPpK7GiRHEda1c"
$siteId = "a3b027c1-84e3-4a64-aaeb-d79b30e0f1f2"
$sourceDir = "C:\Users\Chetna Bhatia\.gemini\antigravity\scratch\Project1_ScrewdriverWorkshop\ClientPortal"
$zipPath = Join-Path $env:TEMP "clientportal_full_deploy.zip"

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Write-Output "Compressing all portal modules..."
$itemsToZip = Get-ChildItem -Path $sourceDir | Where-Object { 
    $_.Name -ne "deploy_portal.ps1" -and 
    $_.Name -ne ".git" -and 
    $_.Name -ne "push_to_github.ps1" 
}
Compress-Archive -Path $itemsToZip.FullName -DestinationPath $zipPath -Force

$zipSize = (Get-Item $zipPath).Length
Write-Output "Zip size: $zipSize bytes."

Write-Output "Deploying to Netlify site: $siteId..."
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/zip"
}

$deployUrl = "https://api.netlify.com/api/v1/sites/$siteId/deploys"
$response = Invoke-RestMethod -Uri $deployUrl -Method Post -Headers $headers -InFile $zipPath -TimeoutSec 300

Write-Output ("Deploy state: " + $response.state)
Write-Output ("Live URL: " + $response.ssl_url)

# Push to GitHub
Set-Location $sourceDir
$inputStr = "protocol=https`nhost=github.com`nusername=AasavR`n"
$output = $inputStr | git credential fill
$ghToken = ""
foreach ($line in $output) {
    if ($line.StartsWith("password=")) {
        $ghToken = $line.Substring(9).Trim()
    }
}

if ($ghToken) {
    git add -A
    git commit -m "Add remaining 2 tool experiences (Wrench, Pliers) and 500-tool Factory Showroom"
    $authRemote = "https://${ghToken}@github.com/AasavR/vocational-screwdriver-workshop.git"
    git remote remove origin 2>$null
    git remote add origin $authRemote
    git push -u origin main --force
    git remote set-url origin "https://github.com/AasavR/vocational-screwdriver-workshop.git"
    Write-Output "GitHub updated successfully."
}

Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
