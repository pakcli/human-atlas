# Project Task List: Female Model Integration & Deployment Roadmap

**File:** `brief/v07_task.md`  
**Target Repo:** https://github.com/pakcli/human-atlas  
**Status:** In Progress (Local Verification & Deployment Phase)

---

## 1. Female Reproductive Architecture & Scientific Integrity
- [x] **Task 1.1: Audit & Name All Female Reproductive Meshes in `atlas-female.json`**
  - Verified every authentic mesh in the HuBMAP HRA v1.5 dataset.
  - Fixed raw source naming bugs:
    - `VH_F_cervicovaginal_junction` ('-') ➔ **"Cervicovaginal junction"** (`FMA:19984`).
    - `VH_F_cornua` ('-') ➔ **"Uterine cornu"** (`FMA:18251`).
- [x] **Task 1.2: Eliminate Synthetic Geometry to Preserve Medical Truth**
  - Tested and promptly reverted procedural synthetic cylinder/sphere meshes (`scripts/complete-female-vagina.mjs`).
  - Restored the 100% authentic HuBMAP HRA dataset (888 meshes, 1,073 concepts, 1,809,796 triangles).
  - Maintained scientific credibility and CC BY 4.0 data integrity.
- [x] **Task 1.3: Standardized Educational Definitions & Homology System**
  - Implemented identical definitional sheets for both sexes in `app/anatomy-dictionary.ts`.
  - Added full biological homology pairs (Ovary ↔ Testis, Clitoris ↔ Penis, Labia majora ↔ Scrotum, Skene's gland ↔ Prostate).
  - Categorized all structures under the Venn diagram taxonomy (`shared`, `male_only`, `female_only`).
  - Added detailed educational descriptions for suspensory peritoneal folds (broad ligament, round ligament, mesosalpinx).

---

## 2. Local Testing & Verification
- [x] **Task 2.1: Local Build & Serve Verification**
  - `npm run check` (TypeScript typecheck: 0 errors).
  - `npm run build` (production Vite build: 0 errors).
  - Serving preview at `http://localhost:3016`.
- [ ] **Task 2.2: Sex Switching & WebGL Stability Verification**
  - Toggle between Male (BodyParts3D) and Female (HuBMAP) via `[ ♂ Male | ♀ Female ]`.
  - Ensure zero memory leaks or WebGL buffer crashes across repeated toggles.
  - Verify URL query synchronization (`?sex=female` and `?sex=male`).
- [ ] **Task 2.3: Homology Navigation Verification**
  - In Female mode, inspect `Ovary` -> click `Switch to Male view` -> camera navigates to `Testis`.
  - In Male mode, inspect `Testis` -> click `Switch to Female view` -> camera navigates to `Ovary`.

---

## 3. Production Deployment (Firebase Static Hosting)
- [ ] **Task 3.1: Verify Firebase Configuration (`firebase.json`)**
  - Ensure `hosting.public` correctly points to `"dist"`.
  - Validate SPA rewrite (`"rewrites": [ { "source": "**", "destination": "/index.html" } ]`).
- [ ] **Task 3.2: Static Asset Headers & Cache Rules**
  - Verify caching headers for `.bin` and `.bin.gz` chunks for high-speed multi-part loading.
- [ ] **Task 3.3: Publish Live Site**
  - Deploy with `firebase deploy --only hosting`.
  - Verify public production URL.
