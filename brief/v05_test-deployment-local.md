# Project Brief: Local Deployment Testing & Verification Guide

**File:** `brief/v05_test-deployment-local.md`  
**Target Repo:** https://github.com/pakcli/human-atlas  
**Objective:** Provide exact commands and step-by-step procedures to test, preview, and validate the local production build before publishing to Firebase Hosting.

---

## 1. Local Testing Environments

There are two primary ways to test locally:

### Option A: Fast Local Dev Server (Hot Reload)
Use this during active development:
```powershell
npm run dev
```
* **Local URL:** `http://localhost:3016`
* **Network URL:** `http://[your-ip]:3016`
* Fast startup (~1 second) with instant TypeScript and CSS hot module replacement.

---

### Option B: Production Static Build & Local Serving (Recommended)
This tests the exact output that Firebase Hosting or Vercel will serve to public users.

1. **Compile & Typecheck:**
   ```powershell
   npm run check
   ```
2. **Build Production Assets to `dist/`:**
   ```powershell
   npm run build
   ```
3. **Serve the `dist/` Directory:**
   Using `npx serve`:
   ```powershell
   npx serve dist -l 3016
   ```
   Or using Vite preview:
   ```powershell
   npx vite preview --port 3016
   ```

---

## 2. Test Verification Checklist

When opening `http://localhost:3016`:

### 2.1. Initial Male Scene
- [ ] Header shows **Human Atlas 3D** with `2,234 modeled pieces · BodyParts3D 4.0`.
- [ ] Segmented buttons `[ ♂ Male | ♀ Female ]` are visible in the header.
- [ ] 3D canvas loads and renders the male body.
- [ ] Orbit controls respond smoothly (click + drag).
- [ ] Zoom controls respond smoothly (scroll wheel / pinch).

### 2.2. Sex Switching Transition
- [ ] Click **♀ Female**.
- [ ] Loading indicator appears: `Loading 888 pieces`.
- [ ] URL updates cleanly to `?sex=female` without page reload.
- [ ] Header updates to `888 modeled pieces · HuBMAP HRA v1.5`.
- [ ] Female reference anatomy renders smoothly in 3D.
- [ ] Click **♂ Male** to return; verify camera preserves angle and male model reloads with 0 errors.

### 2.3. Search & Standardized Information Sheet
- [ ] Open search (`Find a structure` or `/` key).
- [ ] Type `uterus` in Female mode:
  - Click `Uterus`.
  - Sheet opens on the right.
  - Accent bar and system name (`REPRODUCTIVE`).
  - Title: `Uterus`.
  - Venn Badge: 🟣 **Female Reference Anatomy**.
  - Definition: Clear medical explanation.
  - Atlas reference and piece count.
- [ ] Type `ovary` in Female mode:
  - Click `Ovary`.
  - **Biological Counterpart Card** appears:
    - Counterpart: *Testis (Male)*.
    - Origin: *Bipotential embryonic gonad*.
    - Button: *Switch to Male view*.
  - Click the button: viewer transitions to Male mode and selects the Testis!

### 2.4. Performance & Memory
- [ ] Toggle between Male and Female 5 times consecutively.
- [ ] Open Chrome DevTools (`Ctrl + Shift + I` → `Console`).
- [ ] Verify **0 WebGL errors** (`NO_ERROR`) and stable 60 FPS.
