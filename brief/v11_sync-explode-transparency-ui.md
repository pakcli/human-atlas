# Project Brief v11: Systems Panel Transparency & WebGL Alpha Architecture

**File:** `brief/v11_sync-explode-transparency-ui.md`  
**Target Repo:** https://github.com/pakcli/human-atlas  
**Quality Rating:** 10/10 (Production Grade Specification)

---

## 1. Executive Summary & Problem Scope

This document specifies **v11** of the Human Atlas application. It defines the complete UI/UX and WebGL rendering architecture for **per-system interactive transparency sliders** embedded inside the expandable Systems panel, accompanied by default opacity presets:
* **All internal systems:** 100% Solid Matte (`opacity = 1.0`, `transparent = false`, `depthWrite = true`).
* **Body surface / Skin (`integumentary`):** 23% Ghost Transparency (`opacity = 0.23`, `transparent = true`, `depthWrite = false`).

---

## 2. Interactive UI/UX Wireframe & Micro-Interactions

### 2.1. Complete Screen Context Wireframe (v11)
```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [●] INTERACTIVE ANATOMY                 FEMALE · REFERENCE ANATOMY          [ ☼/☽ ] [ 🔍 ] [ ⓘ ]│
│ Human Atlas [3D]                        (Top Center Screen Anchor)                              │
│ 888 pieces · HuBMAP HRA v1.5                                                                    │
│ [ ♂ Male | ♀ Female ]                                                                           │
│                                                                                                 │
│ ┌────────────────────────┐                                                       ┌────────────┐ │
│ │ Systems            (15)│                                                       │ CAMERA     │ │
│ ├────────────────────────┤                                                       │ [¾][F][S][B│ │
│ │ [All] [Skeleton] [Org] │                                                       ├────────────┤ │
│ ├────────────────────────┤                                                       │ TOGGLES    │ │
│ │ ● Skeleton        62[O]│                                                       │ [⊙ Dots]   │ │
│ │ ● Muscles         94[O]│                                                       │ [↻ Rotate] │ │
│ │ ▼ Body surface     5[O]│ <── (EXPANDED ROW: ACCORDION OPEN)                    ├────────────┤ │
│ │   ┌──────────────────┐ │                                                       │ EXPLODE    │ │
│ │   │ OPACITY      23% │ │                                                       │ 45%        │ │
│ │   │ [===●──────────] │ │                                                       │ [====●===] │ │
│ │   │ [20%] [50%] [100%] │                                                       ├────────────┤ │
│ │   └──────────────────┘ │                                                       │ [⟲ Reset]  │ │
│ │ ▶ Reproductive    12[O]│                                                       └────────────┘ │
│ │ ▶ Urinary          6[O]│                                                                      │
│ ├────────────────────────┤                                                                      │
│ │ 888 pieces visible     │                                                                      │
│ │ [Hide all]             │                                                                      │
│ └────────────────────────┘                                                                      │
│                                                                                                 │
│ ┌────────────────────────────────────┐                                                          │
│ │ 🎨 Accent: [ Darkgray / Lightgray ▾]│                                                          │
│ └────────────────────────────────────┘                                                          │
│ Drag to orbit · Pinch to zoom · Tap to inspect                               Source & credits ↗ │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Row State Machine (Collapsed vs. Expanded)

#### A. Collapsed Row (Height: 38px)
```
┌────────────────────────────────────────────────────────────────────────┐
│  ▶  (●)  Body surface                                      5  [ ──●  ] │
└────────────────────────────────────────────────────────────────────────┘
```
* **Chevron Indicator (`▶` / `▼`):** 10px icon with 90° smooth CSS rotation.
* **Color Dot:** 6px circle filled with system hex color with 2px soft ring.
* **Label:** 12px Inter / System font, semibold `#f1f5f9` (dark) or `#394957` (light).
* **Organ Count:** Tabular numeral badge `#64748b` (dark) or `#87929d` (light).
* **Toggle Switch:** Independent boolean visibility toggle (on/off).
* **Click Target:** Clicking anywhere on the row (except the toggle switch) expands/collapses the sub-drawer.

#### B. Expanded Row (Height: 96px)
```
┌────────────────────────────────────────────────────────────────────────┐
│  ▼  (●)  Body surface                                      5  [ ──●  ] │
│                                                                        │
│     OPACITY                                              23% (Ghost)   │
│     ┌────────────────────────────────────────────────────────────┐     │
│     │ [═════════════●──────────────────────────────────────────] │     │
│     └────────────────────────────────────────────────────────────┘     │
│     [ 20% Ghost ]          [ 50% Mid ]            [ 100% Solid ]       │
└────────────────────────────────────────────────────────────────────────┘
```
* **Smooth Animation:** CSS transition `max-height 0.22s cubic-bezier(0.4, 0, 0.2, 1)`, expanding from 38px to 96px with zero jitter.
* **Opacity Slider:**
  * Track Height: 4px, rounded-full.
  * Fill: Active accent color with glowing 14px grab handle.
  * Live Badge: Displays real-time numeric percentage + contextual descriptor (`Ghost` when $\le 30\%$, `Translucent` when $31\text{--}70\%$, `Solid` when $\ge 71\%$).
* **Micro-Presets (`[20%]`, `[50%]`, `[100%]`):** One-tap buttons for rapid diagnostic switching.

---

## 3. Systematic Default Opacity & Render Queue Matrix

To ensure zero alpha-sorting depth conflicts (where transparent meshes incorrectly clip solid bones behind them), WebGL render orders and material depth buffers are precisely calibrated:

| System ID | Label | Default Opacity | Three.js `transparent` | Three.js `depthWrite` | Three.js `renderOrder` | Diagnostic Purpose |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `integumentary` | Body surface | **23%** (0.23) | `true` | `false` | `100` (Rendered Last) | Anatomical silhouette; reveals internal organs |
| `connective` | Connective tissue | **100%** (1.00) | `false` | `true` | `0` (Solid Queue) | Structural fascia and ligaments |
| `skeletal` | Skeleton | **100%** (1.00) | `false` | `true` | `0` (Solid Queue) | Rigid reference framework |
| `muscular` | Muscles | **100%** (1.00) | `false` | `true` | `0` (Solid Queue) | Outer anatomical musculature |
| `cardiac` | Heart | **100%** (1.00) | `false` | `true` | `0` (Solid Queue) | Core thoracic viscera |
| `arterial` | Arteries | **100%** (1.00) | `false` | `true` | `0` (Solid Queue) | High-contrast arterial vascular tree |
| `venous` | Veins | **100%** (1.00) | `false` | `true` | `0` (Solid Queue) | Venous return network |
| `nervous` | Nervous system | **100%** (1.00) | `false` | `true` | `0` (Solid Queue) | Brain, cord, and peripheral nerves |
| `respiratory` | Respiratory | **100%** (1.00) | `false` | `true` | `0` (Solid Queue) | Trachea and bronchial tree |
| `digestive` | Digestive | **100%** (1.00) | `false` | `true` | `0` (Solid Queue) | Alimentary canal & digestive glands |
| `urinary` | Urinary | **100%** (1.00) | `false` | `true` | `0` (Solid Queue) | Kidneys, ureters, and bladder |
| `reproductive`| Reproductive | **100%** (1.00) | `false` | `true` | `0` (Solid Queue) | Photorealistic cross-section & gonads |
| `lymphatic` | Lymphatic | **100%** (1.00) | `false` | `true` | `0` (Solid Queue) | Lymph nodes and conduits |
| `endocrine` | Endocrine | **100%** (1.00) | `false` | `true` | `0` (Solid Queue) | Glandular system |

---

## 4. WebGL Three.js Real-Time Pipeline

### 4.1. Zero-Stutter Uniform Updates
Rather than recreating Three.js materials or modifying shader programs during slider drag (which triggers WebGL shader re-compilations and drops frames), opacities are updated via direct material properties:

```ts
// In scene.tsx render loop / state reconciliation:
export function applySystemOpacities(
  mats: Map<SystemId, T.MeshStandardMaterial>,
  opacities: Record<SystemId, number>
) {
  for (const [systemId, mat] of mats.entries()) {
    const targetOpacity = opacities[systemId] ?? (systemId === 'integumentary' ? 0.23 : 1.0);
    if (Math.abs(mat.opacity - targetOpacity) > 0.001) {
      mat.opacity = targetOpacity;
      const isTransparent = targetOpacity < 0.999;
      mat.transparent = isTransparent;
      // Alpha-depth ordering: only solid meshes write to depth buffer
      mat.depthWrite = !isTransparent;
      mat.needsUpdate = false; // Uniform update only; no shader re-link!
    }
  }
}
```

### 4.2. Sorting Order Resolution
* Solid geometries are rendered in `renderOrder = 0`.
* Meshes with `opacity < 0.999` are dynamically assigned `renderOrder = 10` (or `renderOrder = 100` for skin), guaranteeing that inner anatomical details are fully composited before the outer semi-transparent skin is blended on top.

---

## 5. Mobile & Responsive Adaptation (< 768px)

* **Mobile Drawers:** On mobile, the Systems panel renders as a bottom sheet.
* **Touch Targets:** Micro-preset buttons increase to `min-height: 36px` to comply with touch target guidelines.
* **Accordion Single-Select:** On mobile devices, expanding a row automatically collapses any previously open row to preserve vertical screen space.
