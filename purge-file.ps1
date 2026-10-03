# ==============================================================================
# Git History Purge Script: Erases specific file from ALL past commits
# ==============================================================================
$TargetFile = "brief/v09_download-via-api-sketchfab-public-download.md"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " PURGING FILE FROM ALL COMMITS IN HISTORY             " -ForegroundColor Red
Write-Host " Target: $TargetFile" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

# 1. Verify Git repository
if (-not (Test-Path ".git")) {
    Write-Error "Directory .git not found. Please execute from the repository root!"
    exit 1
}

# 2. Check for git-filter-repo tool
$hasFilterRepo = Get-Command git-filter-repo -ErrorAction SilentlyContinue
if (-not $hasFilterRepo) {
    Write-Host "[*] Installing git-filter-repo via pip..." -ForegroundColor Yellow
    pip install git-filter-repo
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install git-filter-repo. Please ensure Python and pip are installed and in PATH!"
        exit 1
    }
}

# 3. Preserve Remote Origin URL
$remoteUrl = & git config --get remote.origin.url
if ($remoteUrl) {
    Write-Host "[+] Preserved remote origin: $remoteUrl" -ForegroundColor Green
}

# 4. Stash uncommitted changes to allow git-filter-repo to proceed
$status = & git status --porcelain
if ($status) {
    Write-Host "[*] Stashing uncommitted local changes..." -ForegroundColor Yellow
    & git stash
}

# 5. Purge file from all commits across entire git history
Write-Host "[*] Erasing '$TargetFile' from EVERY commit in repository history..." -ForegroundColor Magenta
& git filter-repo --path $TargetFile --invert-paths --force

if ($LASTEXITCODE -ne 0) {
    Write-Error "git-filter-repo process failed!"
    exit 1
}

# 6. Reconnect remote origin
if ($remoteUrl) {
    Write-Host "[*] Reconnecting remote origin..." -ForegroundColor Cyan
    & git remote add origin $remoteUrl
}

# 7. Verification
$check = & git log --all --oneline -- $TargetFile
if (-not $check) {
    Write-Host "[OK] File '$TargetFile' has been completely eradicated from entire commit history!" -ForegroundColor Green
} else {
    Write-Warning "File is still detected in commit history."
}

# 8. Force Push to GitHub
Write-Host "`n[*] Executing force push to GitHub to ensure remote history is clean..." -ForegroundColor Cyan
& git push origin --force --all
& git push origin --force --tags

Write-Host "`n[DONE] Target file and sensitive data have been permanently purged from GitHub history." -ForegroundColor Green
