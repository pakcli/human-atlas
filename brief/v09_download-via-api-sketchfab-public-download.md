# Project Brief v09: 3D Model Download & Upload via Sketchfab Data API v3

**File:** `brief/v09_download-via-api-sketchfab-public-download.md`  
**Target:** Automated 3D Asset Ingestion & Publishing Pipeline via Sketchfab REST API v3  
**Status:** Architecture Specification & Operational Runbook  

---

## 1. Executive Summary & Purpose

To integrate high-fidelity anatomical references (such as the female reproductive cross-section model, UID: `6c89dc45574c40b3981e8de6310d28d4`), the atlas toolchain provides programmatic access to the **Sketchfab Data API v3**.

This brief documents the standard workflows for:
1. **Downloading 3D models** (GLTF/GLB) directly from Sketchfab's download API into the local `raw/` staging directory.
2. **Uploading 3D models** to Sketchfab for web showcase or community distribution.
3. **Interactive, zero-leak automation**: Providing interactive PowerShell one-liners that dynamically prompt for credentials at runtime, ensuring **no API tokens or secrets are ever hardcoded or committed to Git**.

---

## 2. Authentication Architecture

Sketchfab uses token-based HTTP Authorization:
- Header format: `Authorization: Token <YOUR_SKETCHFAB_API_TOKEN>`
- Location of your personal token:
  1. Log in to [Sketchfab](https://sketchfab.com).
  2. Navigate to **Profile Settings** $\rightarrow$ **Password & API** ([https://sketchfab.com/settings/password](https://sketchfab.com/settings/password)).
  3. Scroll to the bottom to find your **API Token**.

> [!SECURITY]
> **Zero-Hardcoding Policy**: Never write API tokens directly into scripts, source code, or markdown documentation. Always read tokens interactively (`Read-Host`) or from environment variables (`$env:SKETCHFAB_API_TOKEN`).

---

## 3. Interactive PowerShell One-Liners (Safe & Zero-Leak)

These one-liners prompt you interactively in your terminal for your token so that **no credentials touch the disk or Git**.

### 3.1. Interactive 3D Model Downloader (One-Liner)

This interactive command asks for your API token (masked), queries the download endpoint, downloads the GLTF zip package, and extracts it to `raw/female-reproductive-organs`:

```powershell
& { $t = (Read-Host "Enter Sketchfab API Token" -AsSecureString); $token = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($t)); $uid = Read-Host "Enter Model UID [default: 6c89dc45574c40b3981e8de6310d28d4]"; if (-not $uid) { $uid = "6c89dc45574c40b3981e8de6310d28d4" }; Write-Host "[*] Fetching download URL for model $uid..." -ForegroundColor Cyan; $res = Invoke-RestMethod -Uri "https://api.sketchfab.com/v3/models/$uid/download" -Headers @{ Authorization = "Token $token" }; New-Item -ItemType Directory -Path "raw" -Force | Out-Null; Write-Host "[*] Downloading GLTF archive..." -ForegroundColor Cyan; Invoke-WebRequest -Uri $res.gltf.url -OutFile "raw/downloaded-model.zip"; Write-Host "[*] Extracting model..." -ForegroundColor Cyan; Expand-Archive -Path "raw/downloaded-model.zip" -DestinationPath "raw/female-reproductive-organs" -Force; Write-Host "[✔] Model extracted to raw/female-reproductive-organs!" -ForegroundColor Green }
```

### 3.2. Interactive 3D Model Uploader (One-Liner)

To publish an exported 3D model (GLB/GLTF zip) to your Sketchfab account:

```powershell
& { $t = (Read-Host "Enter Sketchfab API Token" -AsSecureString); $token = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($t)); $filePath = Read-Host "Enter path to 3D model file (e.g. dist/model.glb)"; $name = Read-Host "Enter model title"; Write-Host "[*] Uploading $name to Sketchfab..." -ForegroundColor Cyan; $res = curl.exe -X POST "https://api.sketchfab.com/v3/models" -H "Authorization: Token $token" -F "modelFile=@$filePath" -F "name=$name" -F "isPublished=false" | ConvertFrom-Json; Write-Host "[✔] Upload initiated! Model UID: $($res.uid)" -ForegroundColor Green }
```

---

## 4. Node.js Script Automation (`scripts/download-sketchfab.mjs`)

The project includes an automated Node.js helper script located at [`scripts/download-sketchfab.mjs`](file:///d:/0pro/human-atlas/scripts/download-sketchfab.mjs).

### Usage:

#### Option A: Interactive / Terminal Argument
```powershell
node scripts/download-sketchfab.mjs (Read-Host "Enter Sketchfab Token")
```

#### Option B: Temporary Session Environment Variable
```powershell
$env:SKETCHFAB_API_TOKEN = Read-Host "Enter Sketchfab Token"
node scripts/download-sketchfab.mjs
# Token only lives in your current terminal session and is never written to disk
```

---

## 5. API Reference Summary

### 5.1. Download Endpoint
- **URL**: `GET https://api.sketchfab.com/v3/models/{model_uid}/download`
- **Headers**: `Authorization: Token <token>`
- **Response**:
  ```json
  {
    "gltf": {
      "url": "https://media.sketchfab.com/models/...",
      "size": 15420310,
      "expires": 300
    },
    "usdz": { ... }
  }
  ```

### 5.2. Upload Endpoint
- **URL**: `POST https://api.sketchfab.com/v3/models`
- **Headers**: `Authorization: Token <token>`
- **Payload**: `multipart/form-data`
  - `modelFile`: Binary file (`.zip`, `.glb`, `.fbx`, `.obj`)
  - `name`: String (Title of model)
  - `description`: String (Markdown formatted)
  - `isPublished`: Boolean (`false` for draft, `true` for public)

---

## 6. Next Steps in the Ingestion Pipeline

Once raw model assets are extracted into `raw/female-reproductive-organs/`:
1. **Transform & Align**: Run [`scripts/import-sketchfab-vagina.mjs`](file:///d:/0pro/human-atlas/scripts/import-sketchfab-vagina.mjs) to scale, center, and align coordinates with the reference skeleton.
2. **Chunk Optimization**: Run [`scripts/compress-models.mjs`](file:///d:/0pro/human-atlas/scripts/compress-models.mjs) to encode vertex positions into GPU quantized buffers (`female-10.bin`).
3. **Runtime Assembly**: The female atlas engine loads the optimized chunk and attaches it to the reproductive system.
