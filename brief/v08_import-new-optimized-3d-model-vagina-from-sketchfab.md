# Project Brief: Importing and Integrating Sketchfab Female Reproductive Organs (X-Section)

**File:** `brief/v08_import-new-optimized-3d-model-vagina-from-sketchfab.md`  
**Target Repo:** https://github.com/pakcli/human-atlas  
**Source Asset:** [Female Reproductive Organs - X Section on Sketchfab](https://sketchfab.com/3d-models/female-reproductive-organs-x-section-6c89dc45574c40b3981e8de6310d28d4)  
**Author:** CVallance  
**License:** Creative Commons Attribution (CC BY)  
**Geometry Profile:** ~63k triangles, ~53.1k vertices (Lightweight, WebGL optimized)

---

## 1. Architectural & Anatomical Assessment: Why This Model Is a Great Fit

### 1.1. Anatomical Excellence & Educational Realism
* **Continuous Vaginal Canal:** Unlike the HuBMAP v1.5 model (which ends abruptly at the cervix at 5.85 cm), this model features the complete length of the vaginal canal extending down to the external introitus and vestibule.
* **Longitudinal Cross-Section (X-Section):** One side is cut open down the midline, revealing:
  * Internal uterine cavity (*cavitas uteri*) and endometrium.
  * Internal os and cervical canal (*canalis cervicis uteri*).
  * True vaginal mucosal rugae (*rugae vaginales*—the transverse elastic ridges).
  * Natural anteroposterior pelvic tilt (~45° incline relative to the vertical spine).
* **Massive Educational Value:** Medical students and learners gain far more insight from a cross-sectional view showing both internal luminal topography and external organ contours than from a closed solid envelope.

### 1.2. Technical Feasibility
* **Low Polycount:** 63,000 triangles is negligible for our WebGL pipeline (the male atlas renders 2.2M triangles at 60 FPS).
* **Open CC License:** Free to adapt and redistribute with clear author attribution in `public/ATTRIBUTION.md`.

---

## 2. Spatial Alignment & Registration Strategy

The female reference skeleton and pelvis in our atlas are normalized to:
* **Units:** Meters ($1.0 = 1\text{ meter}$).
* **Coordinate System:** Right-handed, $Y$-up.
* **Pelvic Target Coordinates:**
  * Fundus of Uterus: $Y \approx 0.835\text{ m}$
  * Cervix / Cervicovaginal Junction: $Y \approx 0.770\text{ m}$
  * Perineal Floor / Vaginal Introitus: $Y \approx 0.640\text{ m}$
  * Total Vertical Span: $\Delta Y \approx 19.5\text{ cm}$ ($0.195\text{ m}$).

### Alignment Workflow:
1. **Pivot & Scale:** Rescale the Sketchfab asset so its vertical height from fundus to introitus matches the natural anatomical height ($19.5\text{ cm}$).
2. **Translation & Orientation:** Align the cervical canal with the pelvic inlet and position the introitus flush with the perineal floor of the female body surface (`VH_F_skin`).
3. **Reproductive Replacement or Enhancement:**
   * Option A (Recommended): Replace the amputated upper uterine cup with this complete cross-section model so users have a unified, continuous organ set.
   * Option B: Retain the HuBMAP ovaries/broad ligament while substituting the uterine/vaginal tract.

---

## 3. Step-by-Step Implementation Plan

### Step 1: Download Asset from Sketchfab (2 Easy Options)

A free Sketchfab account (via Google or email) is required:

#### Option 1: Direct Web Download (Easiest — No API token needed)
1. Open the model page: [Female Reproductive Organs - X Section](https://sketchfab.com/3d-models/female-reproductive-organs-x-section-6c89dc45574c40b3981e8de6310d28d4)
2. Click **Download 3D Model** (log in with your Google or Sketchfab account).
3. Choose **glTF** (or OBJ/FBX) format and download the `.zip`.
4. Drop that `.zip` file straight into the project folder:
   👉 `d:\0pro\human-atlas\raw\`

#### Option 2: Using the API Script
If you prefer the script, get your API token from [sketchfab.com/settings/password](https://sketchfab.com/settings/password) (at the very bottom), and run:
```powershell
node scripts/download-sketchfab.mjs "your_actual_token_here"
```
*(Make sure to put your real token inside quotes, without `<` and `>`)*.

---
Create a dedicated NodeJS / Three.js conversion script to:
1. Parse the GLB nodes and meshes.
2. Apply the transformation matrix (scale, rotation, translation) to align perfectly within the pelvic cavity.
3. Pack vertices, quantized signed 16-bit normals, and indices into the female binary format (`female-5.bin` or a dedicated chunk).
4. Update `public/models/atlas-female.json` with the new part entries.

### Step 3: Concept Indexing & Definitional Panel
Register the individual elements in `app/anatomy-dictionary.ts`:
* `FMA:17558` (Uterus)
* `FMA:17740` (Endometrium & Uterine Cavity)
* `FMA:19984` (Cervix & Cervicovaginal Junction)
* `FMA:19985` (Vagina & Vaginal Rugae)
* `FMA:20182` (Vaginal Introitus & Vestibule)

### Step 4: Attribution
Update `public/ATTRIBUTION.md` with:
* Title: *Female Reproductive Organs - X Section*
* Author: CVallance
* Source: https://sketchfab.com/3d-models/female-reproductive-organs-x-section-6c89dc45574c40b3981e8de6310d28d4
* License: CC BY 4.0

---

## 4. Verification & Validation Checklist
- [ ] Asset placed in `raw/` directory.
- [ ] Conversion script executes with 0 errors.
- [ ] Bounding box matches female pelvic inlet and perineal outlet.
- [ ] `node scripts/validate-atlas.mjs` passes all mesh and buffer assertions.
- [ ] `npm run check` and `npm run build` succeed cleanly.
- [ ] Visual verification at `http://localhost:3016` shows natural anatomical alignment.
