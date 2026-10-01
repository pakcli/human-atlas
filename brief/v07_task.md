# Project Task List: Deployment Verification & Reproductive Visualization Polish

**File:** `brief/v07_task.md`  
**Target Repo:** https://github.com/pakcli/human-atlas  
**Status:** In Progress (Vaginal Canal Completion Phase)

---

## 1. Local Testing & Verification
- [ ] **Task 1.1: Local Build & Serve Verification**
  - Run `npm run build` to generate `dist/`.
  - Serve `dist/` with `npx serve dist -l 3016` or `npx vite preview`.
  - Verify static assets load correctly via `http://localhost:3016`.
- [ ] **Task 1.2: Sex Switching & VRAM Stability Test**
  - Toggle between Male and Female 5+ times to ensure 60 FPS and zero WebGL memory leaks.
  - Verify all 15 male chunks and 10 female chunks load without network errors.
- [ ] **Task 1.3: Cross-Sex Homology Navigation Test**
  - In Female mode, inspect `Ovary` -> click `Switch to Male view` -> verify camera smoothly navigates to `Testis`.
  - In Male mode, inspect `Testis` -> click `Switch to Female view` -> verify camera smoothly navigates to `Ovary`.

---

## 2. Female Reproductive & Private Parts Completeness (Active)
- [x] **Task 2.1: Audit & Name All Female Reproductive Meshes in `atlas-female.json`**
  - Verified every reproductive mesh in the source dataset is fully accessible.
  - Fixed unassigned `'-'` labels in source data: named `VH_F_cervicovaginal_junction` as **"Cervicovaginal junction"** and `VH_F_cornua` as **"Uterine cornu"**.
- [x] **Task 2.2: Complete the Missing Lower Vagina & Introitus**
  - Generated and appended the **lower vaginal canal** (`VH_F_vagina_lower`) from $Y = 0.748$ down to the perineal vestibule at $Y = 0.640$, completely closing the 10 cm void.
  - Generated and appended the **external vulva and clitoris** (`VH_F_vulva_clitoris`) with labia and clitoral body contours.
  - Appended geometry directly into `female-5.bin` and registered parts and concepts in `atlas-female.json`.
- [x] **Task 2.3: Explanatory Context Note for Peritoneal Folds & Private Parts**
  - Added educational descriptions in `app/anatomy-dictionary.ts` for broad ligament, mesosalpinx, round ligament, cardinal/uterosacral ligaments, cornu, and cervicovaginal junction explaining why they appear as protective suspensory sheets anchoring the reproductive organs in vivo.
- [x] **Task 2.4: Expand Knowledge Dictionary for Lower Vagina & Vulva**
  - Added standardized definitions in `app/anatomy-dictionary.ts` for `lower vaginal canal`, `vulva and clitoris`, and `clitoris`.

---

## 3. Deployment Preparation (Firebase Static Hosting)
- [ ] **Task 3.1: Verify Firebase Configuration (`firebase.json`)**
  - Ensure `hosting.public` points to `"dist"`.
  - Ensure `cleanUrls: true` and SPA rewrite `/` -> `dist/index.html`.
- [ ] **Task 3.2: Verify Gzip / Brotli Caching Headers**
  - Ensure `firebase.json` serves `.bin.gz` with `Content-Encoding: gzip` if needed or standard static caching.
- [ ] **Task 3.3: Production Deployment**
  - Run `firebase deploy --only hosting` to publish live to Firebase.
