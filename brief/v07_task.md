# Project Task List: Deployment Verification & Reproductive Visualization Polish

**File:** `brief/v07_task.md`  
**Target Repo:** https://github.com/pakcli/human-atlas  
**Status:** Ready to Execute

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

## 2. Female Reproductive & Private Parts Completeness
- [x] **Task 2.1: Audit & Name All Female Reproductive Meshes in `atlas-female.json`**
  - Verified every reproductive mesh in the source dataset is fully accessible:
    - Vagina (`VH_F_vagina`)
    - Uterine cervix, internal & external cervical os (`VH_F_cervix`, `VH_F_internal_cervical_os`, `VH_F_external_cervical_os`)
    - Uterine body, fundus, and walls (`VH_F_body_of_uterus`, `VH_F_fundus_of_uterus`, `VH_F_posterior_wall_of_uterus`, `VH_F_anterior_wall_of_uterus`, `VH_F_lower_uterine_segment`)
    - Fixed unassigned `'-'` labels in source data: named `VH_F_cervicovaginal_junction` as **"Cervicovaginal junction"** and `VH_F_cornua` as **"Uterine cornu"**.
    - Left & right ovaries and suspensory/ovarian ligaments (`VH_F_left_ovary`, `VH_F_right_ovary`, `VH_F_suspensory_ligament_*`, `VH_F_ovarian_ligament_*`).
    - Fallopian tubes (ampulla, isthmus, infundibulum, and fimbriae).
    - Round ligaments, uterosacral ligaments, and cardinal ligaments.
- [ ] **Task 2.2: External Genitalia (Vulva) Context & Body Surface Preservation**
  - In the source HuBMAP dataset, external genitalia (vulva, labia, clitoral hood) are part of the outer integumentary surface mesh (`VH_F_skin`).
  - Configure the viewer so the pelvic/perineal surface outline remains subtly visible (semi-transparent ~10% opacity) in Female mode, clearly showing where the vaginal canal meets the external anatomy.
- [x] **Task 2.3: Explanatory Context Note for Peritoneal Folds & Private Parts**
  - Added educational descriptions in `app/anatomy-dictionary.ts` for broad ligament, mesosalpinx, round ligament, cardinal/uterosacral ligaments, cornu, and cervicovaginal junction explaining why they appear as protective suspensory sheets anchoring the reproductive organs in vivo.

---

## 3. Deployment Preparation (Firebase Static Hosting)
- [ ] **Task 3.1: Verify Firebase Configuration (`firebase.json`)**
  - Ensure `hosting.public` points to `"dist"`.
  - Ensure `cleanUrls: true` and SPA rewrite `/` -> `dist/index.html`.
- [ ] **Task 3.2: Verify Gzip / Brotli Caching Headers**
  - Ensure `firebase.json` serves `.bin.gz` with `Content-Encoding: gzip` if needed or standard static caching.
- [ ] **Task 3.3: Production Deployment**
  - Run `firebase deploy --only hosting` to publish live to Firebase.
