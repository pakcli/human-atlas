# ==============================================================================
# Git History Purge Script: Erases specific file from ALL past commits
# ==============================================================================
$TargetFile = "brief/v09_download-via-api-sketchfab-public-download.md"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " PURGING FILE FROM ALL COMMITS IN HISTORY             " -ForegroundColor Red
Write-Host " Target: $TargetFile" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

# 1. Pastikan repo Git
if (-not (Test-Path ".git")) {
    Write-Error "Tidak ditemukan folder .git. Jalankan di root repository!"
    exit 1
}

# 2. Cek tool git-filter-repo
$hasFilterRepo = Get-Command git-filter-repo -ErrorAction SilentlyContinue
if (-not $hasFilterRepo) {
    Write-Host "[*] Menginstall git-filter-repo via pip..." -ForegroundColor Yellow
    pip install git-filter-repo
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Gagal menginstall git-filter-repo. Pastikan Python & pip terpasang!"
        exit 1
    }
}

# 3. Simpan Remote Origin URL
$remoteUrl = & git config --get remote.origin.url
if ($remoteUrl) {
    Write-Host "[+] Remote origin tersimpan: $remoteUrl" -ForegroundColor Green
}

# 4. Hapus uncommitted changes agar git-filter-repo bisa jalan
$status = & git status --porcelain
if ($status) {
    Write-Host "[*] Melakukan stash perubahan yang belum tersimpan..." -ForegroundColor Yellow
    & git stash
}

# 5. PURGE FILE DARI SEMUA COMMIT DI SEJARAH GIT
Write-Host "[*] Menghapus '$TargetFile' dari SETIAP commit di sejarah repositori..." -ForegroundColor Magenta
& git filter-repo --path $TargetFile --invert-paths --force

if ($LASTEXITCODE -ne 0) {
    Write-Error "Proses git-filter-repo gagal!"
    exit 1
}

# 6. Sambungkan kembali remote origin
if ($remoteUrl) {
    Write-Host "[*] Menyambungkan kembali remote origin..." -ForegroundColor Cyan
    & git remote add origin $remoteUrl
}

# 7. Verifikasi
$check = & git log --all --oneline -- $TargetFile
if (-not $check) {
    Write-Host "[OK] File '$TargetFile' TELAH TERHAPUS BERSIH DARI SELURUH HISTORY COMMIT!" -ForegroundColor Green
} else {
    Write-Warning "File masih terdeteksi di commit."
}

# 8. Force Push ke GitHub
Write-Host "`n[*] Menjalankan Force Push ke GitHub agar history di server bersih..." -ForegroundColor Cyan
& git push origin --force --all
& git push origin --force --tags

Write-Host "`n[SELESAI] File dan secret di dalamnya telah musnah dari seluruh riwayat GitHub." -ForegroundColor Green
