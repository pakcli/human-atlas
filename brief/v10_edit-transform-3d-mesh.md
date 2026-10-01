# Project Brief: In-Browser Real-Time 3D Mesh Transform Tuner

**File:** `brief/v10_edit-transform-3d-mesh.md`  
**Target Repo:** https://github.com/pakcli/human-atlas  
**Objective:** Provide an interactive, zero-Blender in-browser transform tool to visually position, rotate, and scale the imported female reproductive organs inside the pelvic bones and perineum in real time, while maintaining a 100% static frontend architecture for Firebase Hosting.

---

## 1. Architectural Strategy: Why In-Browser Tuning Beats Blender

| Feature | Blender Desktop Workflow | In-Browser Real-Time Tuner |
| :--- | :--- | :--- |
| **Speed** | 10–15 min per iteration (Export ➔ Convert ➔ Reload) | **Instant 60 FPS real-time feedback** as sliders drag |
| **Context** | Isolated 3D space; lacks pelvic bone & skin shaders | **Visualized directly inside human pelvis & skin** |
| **Ease of Use** | Requires 3D modeling software skills | **Simple intuitive sliders & `[-]` `[+]` nudge buttons** |
| **Hosting Compatibility** | Unrelated | **100% Static**: values saved in `localStorage` |

---

## 2. Dev Secret Activation: `wkwkwk` (Autoselect Mode)

To protect the public medical atlas from clutter while enabling instant developer tuning:
* **Completely Hidden by Default:** Regular visitors browsing the site see zero tuner buttons or controls.
* **Secret Trigger Keyword:** Type **`wkwkwk`** on your keyboard (or open with `?tune=wkwkwk` or `?secret=wkwkwk`):
  1. Instantly unlocks and reveals the **3D Mesh Tuner HUD**.
  2. Switches the scene to **Female reference anatomy** (`?sex=female`).
  3. Activates **Autoselect Mode**: automatically targets and selects `VH_F_vagina` so the camera focuses right into the pelvic cavity!

---

## 3. Feature Specification

### 2.1. Transform Sliders & Micro-Nudge Buttons
* **Translation ($X, Y, Z$):**
  * `Position X` (Left ↔ Right): $-50\text{ mm}$ to $+50\text{ mm}$ (step $1\text{ mm}$).
  * `Position Y` (Up ↔ Down): $-100\text{ mm}$ to $+100\text{ mm}$ (step $1\text{ mm}$).
  * `Position Z` (Forward ↔ Back): $-100\text{ mm}$ to $+100\text{ mm}$ (step $1\text{ mm}$).
* **Rotation ($R_x, R_y, R_z$):**
  * `Rotation X` (Pelvic Tilt / Sagittal Incline): $-90^\circ$ to $+90^\circ$ (step $1^\circ$).
  * `Rotation Y` (Yaw / Twist): $-45^\circ$ to $+45^\circ$ (step $1^\circ$).
  * `Rotation Z` (Roll / Symmetry Level): $-45^\circ$ to $+45^\circ$ (step $1^\circ$).
* **Scale ($S$ — 4 Dedicated Sliders):**
  * `Scale (All Axes)`: Uniform multiplier across all 3 dimensions ($50\%$ to $150\%$).
  * `Scale X (Width)`: Lateral width multiplier ($50\%$ to $150\%$).
  * `Scale Y (Height)`: Vertical height multiplier ($50\%$ to $150\%$).
  * `Scale Z (Depth)`: Anterior-posterior depth multiplier ($50\%$ to $150\%$).
* **Photorealistic Cross-Section Texture Map:**
  * Native Sketchfab diffuse map (`public/models/textures/uterus_xsection.jpg`) mapped via packed GPU `TEXCOORD_0` UVs.
  * Shows realistic mucosal rugae, endometrial lining, and cervical canal tissue colors.

### 2.2. Anatomical Alignment Presets (One-Click Cameras)
* **`[ 📷 Side View ]`**: Snaps camera to sagittal profile ($X = 1, Y = 0, Z = 0$) to align the natural **$45^\circ$ pelvic incline**.
* **`[ 📷 Bottom View ]`**: Snaps camera looking up through the pelvic outlet to verify the **vaginal introitus is centered between the ischial tuberosities**.
* **`[ 📷 Front View ]`**: Snaps camera to coronal profile to verify **Fallopian tubes fit comfortably within the iliac wings**.

### 2.3. Persistence & Export Actions
* **`[ 💾 Save in Browser ]`**:
  * Saves active transform to `localStorage.getItem('female_mesh_tuner')`.
  * Survives page reloads so adjustments are never lost while inspecting.
* **`[ 📋 Copy Coordinates ]`**:
  * Copies a JSON snippet to the clipboard:
    ```json
    { "scale": 0.03509, "x": -0.007, "y": -0.5654, "z": -0.065, "rotX": 0, "rotY": 0, "rotZ": 0 }
    ```
* **`[ 🔄 Reset ]`**:
  * Restores default calculated values.

---

## 3. Implementation Steps

1. **Scene Decoupling ([app/scene.tsx](file:///d:/0pro/human-atlas/app/scene.tsx)):**
   * Keep chunk 10 geometry (`VH_F_vagina` & `VH_F_uterus_xsection`) in a distinct Three.js `T.Group` or pass live transformation offsets so the group updates dynamically when tuner sliders change.
2. **Tuner HUD Component ([app/model-tuner.tsx](file:///d:/0pro/human-atlas/app/model-tuner.tsx)):**
   * Render a draggable floating glassmorphism HUD panel when `?tune=1` or clicking `[Tune Model]` in the footer.
3. **Parametric Baking Script ([scripts/import-sketchfab-vagina.mjs](file:///d:/0pro/human-atlas/scripts/import-sketchfab-vagina.mjs)):**
   * Update script to accept `--scale`, `--x`, `--y`, `--z`, `--rotX`, `--rotY`, `--rotZ` CLI arguments.
   * Running this script once permanently burns the chosen values into `public/models/female-10.bin` for production.

---

## 4. Verification Checklist
- [ ] Tuner HUD renders when switching to Female model.
- [ ] Moving sliders immediately updates model in 3D viewport at 60 FPS.
- [ ] `[ 💾 Save in Browser ]` persists state across browser reloads.
- [ ] `[ 📋 Copy Coordinates ]` copies valid JSON to clipboard.
- [ ] `scripts/import-sketchfab-vagina.mjs` executes cleanly with copied CLI parameters.
- [ ] `npm run check` and `npm run build` pass with 0 errors.
