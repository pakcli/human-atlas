# Project Brief: Female Anatomy Integration & Unified Information Panel

**File:** `brief/v02_female-model-include-plan.md`  
**Target Repo:** https://github.com/pakcli/human-atlas  
**Objective:** Restore and integrate the Female reference anatomy alongside the Male anatomy, unifying both models under an identical, standardized definitional information panel and shared anatomical knowledge base.

---

## 1. Core Mandate: Uniformity & Consistency

> **Key Rule:** The female anatomy experience must not be a second-class citizen or have a divergent UI.
> Every female structure must have the **exact same form, layout, metadata fields, and definitional panel structure** as the male anatomy.

* **Identical Information Panel:**
  * Same drawer/sheet layout, animations, typography, and styling.
  * Same color-coded system badges (`#bda098` for reproductive, `#b96760` for cardiac, etc.).
  * Same metadata metrics: Atlas Reference ID, selected piece count, system classification.
  * Same interactive actions: **Isolate structure**, **Clear selection**, and **Included structures** list.
* **Shared Anatomical Definitions:**
  * For structures shared by both sexes (Heart, Lungs, Brain, Stomach, Femur, etc.), the definitions and explanations must be 100% identical and synchronized.
* **Sex-Specific Definitions:**
  * Female-specific structures (Uterus, Ovary, Uterine Tube, Cervix, Vagina) must have high-quality, professional educational definitions matching the tone of male-specific structures (Testis, Prostate, Epididymis).

---

## 2. Technical Scope & Architecture

### Phase A: Asset Restoration (Streaming on Demand)
1. **Retrieve Female 3D Assets:**
   * Restore the pre-processed female geometry from repository commit `e6743fa`:
     * Manifest: `public/models/atlas-female.json` (888 parts, 1,073 concepts).
     * Binary Chunks: `public/models/female-0.bin` through `female-9.bin` (and gzip `.bin.gz` counterparts).
2. **On-Demand Loading:**
   * Load the Male reference by default (~33 MB).
   * Stream the Female chunks dynamically only when the user toggles to Female.
   * Dispose existing WebGL geometries and data textures from GPU VRAM on switch to avoid memory spikes.

---

### Phase B: Unified Knowledge Base & Venn Classification

Create a single synchronized dictionary mapping FMA (Foundational Model of Anatomy) IDs to concepts:

| Classification | Meaning | Examples | Information Panel Badge |
| :--- | :--- | :--- | :--- |
| **Shared** ($Male \cap Female$) | Identical in both sexes (~90–95% of human body) | Heart, Liver, Femur, Brain, Kidneys | 🟢 **Shared Human Anatomy** |
| **Male Specific** ($Male \setminus Female$) | Male reproductive anatomy | Testis, Prostate, Ductus Deferens, Scrotum | 🔵 **Male Reference Anatomy** |
| **Female Specific** ($Female \setminus Male$) | Female reproductive & pregnancy reference | Uterus, Ovary, Uterine Tube, Vagina, Placenta | 🟣 **Female Reference Anatomy** |

**Biological Homology Linking:**
When viewing sex-dimorphic organs, the information panel displays an interactive cross-reference link:
* *Testis* ↔ *Ovary*
* *Scrotum* ↔ *Labia majora*
* *Glans penis* ↔ *Glans clitoridis*

---

### Phase C: Standardized Definitional Information Panel Specification

When any structure is tapped (whether Male or Female), the sheet displays:

1. **System Tag:** Color-coded chip (e.g., `REPRODUCTIVE`, `CARDIAC`, `SKELETON`).
2. **Structure Title:** Clean anatomical name (e.g., *Uterus*, *Left anterior descending artery*).
3. **Venn Badge:** (Shared Anatomy vs. Female/Male Reference).
4. **Definitional Description:**
   * Core medical explanation of function and anatomy.
   * Fallback to system-level overview if individual organ explanation is not present.
5. **Metadata Grid:**
   * `Atlas Reference`: Standardized Concept ID (e.g. `FMA:7197` or node ID).
   * `Selected Pieces`: Count of rendered 3D meshes grouped under this concept.
6. **Homology Section (if applicable):**
   * Link to counterpart structure in the opposite sex.
7. **Action Buttons:**
   * `[ Isolate Structure ]` / `[ Show Surrounding Anatomy ]`
   * `[ Clear Selection ]`
8. **Included Structures List:**
   * Clickable list of sub-components if the concept groups multiple parts.
9. **Provenance Link:**
   * Direct link to source dataset ([BodyParts3D](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html) or [HuBMAP HRA](https://doi.org/10.48539/HBM352.BTSQ.586)).

---

### Phase D: UI Controls & Navigation

1. **Sex Toggle Selector:**
   * Add a top-level segmented toggle in the header or bottom dock:
     `[ ♂ Male | ♀ Female ]`.
2. **Cross-Sex Unified Search:**
   * Searching works across both models.
   * If a user searches for *"Uterus"* while in Male view, the search result indicates:
     * *“Uterus · Female-specific structure”* → tapping switches the viewer to Female and focuses on the organ.

---

## 3. Implementation Steps

1. **Step 1: Recover Data Files**
   * Checkout `public/models/atlas-female.json`, `female-*.bin`, and `female-*.bin.gz` from git history.
2. **Step 2: Validate Data Integrity**
   * Update `scripts/validate-atlas.mjs` to test both `atlas.json` and `atlas-female.json`.
3. **Step 3: Update Type Definitions & Explanations (`app/anatomy.ts`)**
   * Add female reproductive descriptions and unify shared dictionary entries.
4. **Step 4: Update 3D Canvas (`app/scene.tsx`)**
   * Support dynamic swapping of chunk URLs and geometry buffers with clean memory disposal.
5. **Step 5: Standardize Information Sheet (`app/page.tsx`)**
   * Ensure uniform layout, badges, homology links, and metadata display.
6. **Step 6: Build & Deployment Test**
   * Run `npm run check` and `npm run build` to verify clean static bundling for Firebase Hosting.

---

## 4. Acceptance Criteria

- [ ] User can switch between Male and Female anatomy smoothly without page reloads.
- [ ] Selecting any structure in Female mode opens the exact same information panel layout as Male mode.
- [ ] Shared organs have identical descriptions in both models.
- [ ] Female reproductive structures have thorough, medically accurate educational definitions.
- [ ] No WebGL memory leaks when switching back and forth between sexes.
- [ ] Search accurately resolves structures across both sexes.
- [ ] Static build passes with zero errors (`npm run build`).
