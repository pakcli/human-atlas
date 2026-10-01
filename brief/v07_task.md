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

## 2. Reproductive Layer Visualization Polish
- [ ] **Task 2.1: Female Pelvic Context Preservation**
  - Ensure the `integumentary` (body surface) layer stays subtly visible (semi-transparent ~10% opacity) in female mode by default so the broad ligament folds do not appear floating in void.
- [ ] **Task 2.2: Explanatory Context Note for Peritoneal Folds**
  - Add educational descriptions in `app/anatomy-dictionary.ts` for broad ligament / mesosalpinx / round ligament clarifying their role as peritoneal suspensory folds.

---

## 3. Deployment Preparation (Firebase Static Hosting)
- [ ] **Task 3.1: Verify Firebase Configuration (`firebase.json`)**
  - Ensure `hosting.public` points to `"dist"`.
  - Ensure `cleanUrls: true` and SPA rewrite `/` -> `dist/index.html`.
- [ ] **Task 3.2: Verify Gzip / Brotli Caching Headers**
  - Ensure `firebase.json` serves `.bin.gz` with `Content-Encoding: gzip` if needed or standard static caching.
- [ ] **Task 3.3: Production Deployment**
  - Run `firebase deploy --only hosting` to publish live to Firebase.
