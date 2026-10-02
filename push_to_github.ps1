Set-Location "C:\Users\Chetna Bhatia\.gemini\antigravity\scratch\Project1_ScrewdriverWorkshop\ClientPortal"

# Retrieve token from credential manager
$inputStr = "protocol=https`nhost=github.com`nusername=AasavR`n"
$output = $inputStr | git credential fill

$token = ""
foreach ($line in $output) {
    if ($line.StartsWith("password=")) {
        $token = $line.Substring(9).Trim()
    }
}

if (-not (Test-Path ".git")) {
    git init -b main
}

git config user.name "Aasav Ravi"
git config user.email "aasavravi@gmail.com"

# Exclude temporary scripts from git
Remove-Item "deploy_netlify.ps1" -ErrorAction SilentlyContinue
Remove-Item "create_github_repo.ps1" -ErrorAction SilentlyContinue

git add -A
git commit -m "Initial release: Vocational Screwdriver Workshop client portal, WebGL simulator & Meta Quest APK"

# Set authenticated remote
$authRemote = "https://${token}@github.com/AasavR/vocational-screwdriver-workshop.git"
git remote remove origin 2>$null
git remote add origin $authRemote

Write-Output "Pushing to GitHub..."
git push -u origin main --force

# Clean up remote URL to standard public HTTPS (without embedded token)
git remote set-url origin "https://github.com/AasavR/vocational-screwdriver-workshop.git"

Write-Output "Successfully pushed to https://github.com/AasavR/vocational-screwdriver-workshop"
