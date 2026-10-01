# Project Task List: Male & Female Integration & Venn Knowledge Base

**File:** `brief/v04_task.md`  
**Target Repo:** https://github.com/pakcli/human-atlas  
**Status:** In Progress (Planning Phase Complete)

---

## Phase 1: Asset Recovery & Storage Setup
- [x] **Task 1.1: Restore Female Model Files from Git History**
  - Checked out `public/models/atlas-female.json` from commit `e6743fa`.
  - Checked out `public/models/female-0.bin` through `female-9.bin` (and `.bin.gz` counterparts).
  - Checked out `scripts/convert-female.py` for pipeline completeness.
- [x] **Task 1.2: Validate Binary Integrity**
  - Updated `scripts/validate-atlas.mjs` to accept either `atlas.json` or `atlas-female.json`.
  - Verified all 888 female meshes and 2,234 male meshes pass all assertions.
- [x] **Task 1.3: Update Attribution Documentation**
  - Updated `public/ATTRIBUTION.md` to reflect that female anatomy is an actively supported reference in the viewer.

---

## Phase 2: Unified Knowledge Base & Venn Taxonomy
- [x] **Task 2.1: Create Anatomical Dictionary (`app/anatomy-dictionary.ts`)**
  - Defined TypeScript types: `VennClassification` (`'shared' | 'male_only' | 'female_only'`), `HomologyInfo`.
  - Added comprehensive definitions for female reproductive organs (Uterus, Ovary, Cervix, Vagina, Uterine Tube).
  - Added homologous developmental links (Testis ↔ Ovary, Scrotum ↔ Labia majora, Penis ↔ Clitoris, Prostate ↔ Skene's glands).
- [x] **Task 2.2: Synchronize Shared Concepts**
  - Ensured ~95% shared organs (Heart, Lungs, Liver, Brain, Stomach, Femur, etc.) share canonical names, descriptions, and system categories.
- [x] **Task 2.3: Expand System Explanations**
  - Updated `EXPLANATIONS` in `app/anatomy.ts` with female and male reproductive definitions.

---

## Phase 3: 3D Scene Dynamic Loading & Resource Management (`app/scene.tsx`)
- [x] **Task 3.1: Support Dynamic Model Swapping**
  - 3D scene transitions smoothly between male and female models on `atlas` prop changes.
  - Implemented clean GPU resource disposal: disposes old geometries, buffers, and textures (`partTexture`, `selectionTexture`) to prevent WebGL memory leaks.
- [x] **Task 3.2: Dynamic Data Texture & Shader Adaptation**
  - Shader `stateWidth` and `partTexture` dimensions adjust dynamically according to part count (2,234 for male vs. 888 for female).
- [x] **Task 3.3: On-Demand Streaming**
  - Female binary chunks are fetched only when Female mode is active.

---

## Phase 4: UI/UX & Standardized Information Panel (`app/page.tsx`)
- [x] **Task 4.1: Top Sex Selector Control**
  - Added modern segmented toggle in the header: `[ ♂ Male | ♀ Female ]`.
  - Smooth loading state indicator when switching models.
  - Synced state with URL search param (`?sex=female` or `?sex=male`).
- [x] **Task 4.2: Standardized Information Sheet Layout**
  - Female detail sheet matches the male detail sheet in every aspect:
    - Same header eyebrow and system color accent.
    - Standardized concept title and FMA Atlas ID.
    - Venn classification badge (🟢 Shared, 🔵 Male, 🟣 Female).
    - High-quality definitional description.
    - Metadata counter (Selected pieces / Total in concept).
    - Functional actions: `[ Isolate Structure ]` and `[ Clear Selection ]`.
    - Included structures list.
    - Provenance source citation link.
- [x] **Task 4.3: Interactive Biological Homology Card**
  - Renders counterpart card with origin and notes.
  - One-click button: `[ Switch to Female/Male view ]`.
- [x] **Task 4.4: Unified Cross-Sex Search**
  - Combobox searches across the active model and supports auto-navigation to counterparts.

---

## Phase 5: Verification & Quality Assurance
- [x] **Task 5.1: Automated Atlas Validation**
  - `node scripts/validate-atlas.mjs atlas.json` (2,234 parts, passed).
  - `node scripts/validate-atlas.mjs atlas-female.json` (888 parts, passed).
- [x] **Task 5.2: Automated Interaction Tests**
  - `node scripts/validate-interactions.mjs` (both models passed).
- [x] **Task 5.3: Type Checking & Static Bundle Build**
  - `npm run check` (TypeScript compiler passed with zero errors).
  - `npm run build` (Vite static build passed, output in `dist/`).
- [x] **Task 5.4: UI/UX Smoke Testing & Build Verification**
  - Dev server verified on port 3016.
  - Production static bundle built into `dist/` with 0 errors.
  - Model switching, Venn badges, and homology relationships ready for public interaction.
