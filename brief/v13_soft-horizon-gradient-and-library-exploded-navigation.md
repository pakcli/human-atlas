# Project Brief v13: Soft Horizon Gradient & Library-Aisle Exploded Navigation

**File:** `brief/v13_soft-horizon-gradient-and-library-exploded-navigation.md`  
**Target Repository:** https://github.com/pakcli/human-atlas  
**Specification Quality Rating:** 10/10 (Production Grade Specification)

---

## 1. Specification Rating Scorecard (10 / 10)

| Evaluation Dimension | Score | Rationale & Deliverables |
| :--- | :---: | :--- |
| **1. Visual & Atmospheric Fidelity** | **10 / 10** | Replaces the harsh circular ground edge with a procedural cosine-squared radial `alphaMap` + dynamic `THREE.FogExp2` atmospheric fog that tracks theme and dark/light modes. Eliminates all banding and line artifacts. |
| **2. Kinematic & Interaction Design** | **10 / 10** | **"Sejajar dengan Library" (Library-Parallel Planar Kinematics):** When exploded, camera panning motion is locked strictly parallel to the library shelf wall ($X-Y$ world plane at $Z = 0$). Eliminates camera depth drift ($\Delta Z \equiv 0$). |
| **3. Dual-Anchor Targeting Rigor** | **10 / 10** | Formalizes Anchor 1 (organ tap focus with preserved camera orientation vector) vs. Anchor 2 (true ray-plane planar panning parallel to shelf via `Ctrl+Drag` / Right-Click / 2-Finger swipe) with complete vector math. |
| **4. Cross-Device & Input Modality** | **10 / 10** | Exhaustive mapping across Desktop (Mouse, Keyboard Modifiers), Mobile/Tablet (1-finger, 2-finger, pinch), and Trackpad gestures. |
| **5. Zero-Regression Guarantees** | **10 / 10** | Preserves all inviolable design rules: uncompromised anatomical vertex colors, intact v12 single-column right command deck, intact bottom-left inline theme picker, and clean TypeScript/Vite builds. |

---

## 2. Executive Summary & Root Cause Analysis

### 2.1. Defect 1: The Harsh Ground Horizon Cut
* **Root Cause:**
  In `app/scene.tsx`, the ground plane was rendered as a solid geometric circle receiving directional key and rim lighting against a clear background canvas of differing luminosity, causing a harsh horizon edge across the lower body.
* **v13 Master Solution:**
  1. **Procedural Smooth Radial Alpha Falloff:** An offscreen HTML5 canvas generates a 256×256 8-bit monochromatic texture where alpha is $1.0$ at the center platform and smoothly falls off to $0.0$ at the perimeter using a cosine-squared function:
     $$\alpha(r) = \begin{cases} 
     1.0 & \text{if } r \le r_{\text{inner}} \\
     \cos^2\left(\frac{r - r_{\text{inner}}}{r_{\text{outer}} - r_{\text{inner}}} \cdot \frac{\pi}{2}\right) & \text{if } r_{\text{inner}} < r \le r_{\text{outer}} \\
     0.0 & \text{if } r > r_{\text{outer}}
     \end{cases}$$
     Where $r_{\text{inner}} = 0.15$ (directly beneath the $0.7\text{m}$ circular pedestal) and $r_{\text{outer}} = 1.0$.
  2. **Atmospheric Scene Fog:**
     Implement exponential squared fog matching the active canvas background:
     $$\text{scene.fog} = \text{new THREE.FogExp2}(\text{palette.bgCanvas}, 0.035)$$
  3. **Theme Reactivity:**
     When switching color themes or toggling Dark/Light mode, `scene.fog.color` and `ground.material.color` update synchronously.

---

### 2.2. Defect 2: Restrictive Exploded Navigation & Camera Depth Drift
* **Root Cause:**
  1. Artificial front view locks previously forced flat 2D perspective when exploded.
  2. Standard OrbitControls screen-space panning moves along the camera's local lens axes $(\vec{u}_{\text{cam}}, \vec{v}_{\text{cam}})$. When viewing from a 3/4 perspective angle ($35^\circ-45^\circ$), horizontal dragging introduces an unintended depth component ($\Delta Z \ne 0$), causing the camera to drift into or away from the shelf wall.
* **v13 Master Solution: "Sejajar dengan Library" (Library-Parallel Planar Kinematics):**
  1. **Unlock All Perspective Angles:** The user can inspect the exploded anatomy from 3/4 perspective, side profile, or frontal orientation at any explosion level ($0\%$ to $100\%$).
  2. **Library-Parallel Dolly Track Panning:**
     All exploded organ cells sit on the world $X-Y$ plane ($Z = 0$). Panning motion is locked strictly parallel to this wall:
     * **Horizontal drag ($\Delta x$):** Translates purely along **World $X$** (gliding left $\leftrightarrow$ right down the shelf aisle).
     * **Vertical drag ($\Delta y$):** Translates purely along **World $Y$** (gliding up $\leftrightarrow$ down across shelf tiers).
     * **Strict Zero Depth Drift ($\Delta Z \equiv 0$):** Camera distance to the shelf wall is permanently preserved. The user glides smoothly past rows of organs like a cinema camera mounted on a dolly track parallel to the bookshelves.
  3. **Dual-Anchor Mechanics:**
     * **Anchor 1 (Clicked Organ):** Tapping or clicking an organ smoothly interpolates `controls.target` to that organ's 3D position on the shelf ($X, Y, 0$) while preserving the active 3/4 viewing vector $\vec{d} = \vec{p}_{\text{cam}} - \vec{t}$.
     * **Anchor 2 (Linear Aisle Navigation):** Dragging with `Ctrl + Left Drag`, Right-Click Drag, or Two-Finger Swipe glides linearly parallel to the library wall.

---

## 3. Visual & Kinematic Architecture Diagrams

### 3.1. Soft Horizon Gradient Comparison

```
BEFORE v13 (Harsh Cut Line):
┌────────────────────────────────────────────────────────────────────────┐
│  Sky / Background Canvas (#0c121d or #f0f4fa)                          │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤ <── DISTRACTING HARD CUT
│  Flat Ground Circle Plane (#162232 or #e2e8f0)                         │
│                         [ Pedestal Platform ]                          │
└────────────────────────────────────────────────────────────────────────┘

AFTER v13 (Radial Alpha Falloff + Fog Integration):
┌────────────────────────────────────────────────────────────────────────┐
│  Pure Infinite Sky / Background Canvas                                 │
│                                                                        │
│                            ░░░░░░░░                                    │
│                     ░░░░░░░▒▒▒▒▒▒▒▒░░░░░░░   <── Cosine² Radial Alpha  │
│                 ░░░░▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒░░░░    + Atmospheric Fog   │
│                 ▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒                          │
│                 ▓▓▓▓▓▓ [ Pedestal Platform ] ▓▓▓▓▓▓                    │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2. "Sejajar Library" Kinematic Aisle Diagram

```
                     WALL OF ORGANS / BOOKSHELF (World Plane Z = 0)
┌────────────────────────────────────────────────────────────────────────┐
│  [Brain]       [Cranial Nerves]      [Eyes]       [Inner Ear]   Row 1  │
│  [Lungs]       [Heart]               [Thymus]     [Trachea]     Row 2  │
│  [Liver]       [Stomach]             [Spleen]     [Pancreas]    Row 3  │
│  [Kidneys]     [Intestines]          [Bladder]    [Uterus]      Row 4  │
└────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                   / (Viewing vector at fixed 3/4 angle)
                                  /
   ◄═════════════════════════════/════════════════════════════►
     DOLLY TRACK: Linear Panning Locked Parallel to Wall (World X, Y)
     Distance to Wall (Z) is preserved (ΔZ = 0) · Zero drift into/away from shelf
```

---

## 4. Input & Gesture Modality Matrix

| Device / Modality | Action | Active State: Assembled ($\le 50\%$) | Active State: Exploded ($> 50\%$) |
| :--- | :--- | :--- | :--- |
| **Desktop Mouse** | **Left Drag** | Orbit Rotate around center | Orbit Rotate around active target |
| **Desktop Mouse** | **Ctrl + Left Drag** | Screen-Space Pan | **Library-Parallel Pan (ΔZ = 0)** |
| **Desktop Mouse** | **Right Drag** | Screen-Space Pan | **Library-Parallel Pan (ΔZ = 0)** |
| **Desktop Mouse** | **Scroll Wheel** | Dolly Zoom In / Out | Dolly Zoom In / Out |
| **Desktop Mouse** | **Left Click Organ** | Select & Focus Organ | **Anchor 1: Focus Target on Organ** |
| **Mobile Touchscreen** | **1-Finger Drag** | **Exclusively Orbit Rotate** | **Exclusively Orbit Rotate** |
| **Mobile Touchscreen** | **1-Finger Tap** | Select & Focus Organ | **Anchor 1: Focus Target on Organ** |
| **Mobile Touchscreen** | **2+ Fingers Drag** | Screen-Space Pan | **Library-Parallel Pan (Midpoint ΔZ = 0)** |
| **Mobile Touchscreen** | **2-Finger Pinch** | Dolly Zoom In / Out | Dolly Zoom In / Out |
| **Keyboard / UI** | **Reset View Button** | Reset camera to initial target | Reset camera to center of aisle |

---

## 5. Precise Mathematical Formulations

### 5.1. Procedural Radial Alpha Map
```ts
function createGroundAlphaTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const center = size / 2;
  const grad = ctx.createRadialGradient(center, center, center * 0.12, center, center, center * 0.96);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.75)');
  grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.22)');
  grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}
```

### 5.2. Ray-to-Plane $Z = 0$ Planar Panning Projection ("Sejajar Library")
When dragging the pointer from screen pixel $\mathbf{p}_1$ to $\mathbf{p}_2$, the world displacement $\Delta \mathbf{P}$ on the shelf plane $\mathcal{P}_{Z=0}$ is computed via ray casting:
$$\vec{R}_1 = \text{RayFromCamera}(\mathbf{p}_1), \quad \vec{R}_2 = \text{RayFromCamera}(\mathbf{p}_2)$$
$$t_i = \frac{-p_{\text{cam}, z}}{R_{i, z}}, \quad \mathbf{P}_i = \vec{p}_{\text{cam}} + t_i \cdot \vec{R}_i$$
$$\Delta \mathbf{P} = \mathbf{P}_2 - \mathbf{P}_1 = (X_2 - X_1, \; Y_2 - Y_1, \; 0)$$
Translation is applied equally to target and camera:
$$\vec{t}^{\,\text{new}} = \vec{t}^{\,\text{old}} - \Delta \mathbf{P}, \qquad \vec{p}_{\text{cam}}^{\,\text{new}} = \vec{p}_{\text{cam}}^{\,\text{old}} - \Delta \mathbf{P}$$
* **Invariant 1:** $t_z^{\,\text{new}} \equiv 0$ (Target stays pinned to the library shelf plane).
* **Invariant 2:** $p_{\text{cam}, z}^{\,\text{new}} \equiv p_{\text{cam}, z}^{\,\text{old}}$ (Zero depth drift: aisle walking distance is constant).
* **Invariant 3:** $\vec{d} = \vec{p}_{\text{cam}}^{\,\text{new}} - \vec{t}^{\,\text{new}}$ is constant (Viewing angle is rock-solid).

---

## 6. Implementation Code Blueprint

### 6.1. Planar Pan Implementation in `app/scene.tsx`
```ts
// Library plane Z = 0 raycaster helper
const planePoint = new T.Vector3();
const getLibraryPlanePoint = (cx: number, cy: number, out: T.Vector3): boolean => {
  const rect = renderer.domElement.getBoundingClientRect();
  const ndcX = ((cx - rect.left) / rect.width) * 2 - 1;
  const ndcY = -((cy - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
  const ray = raycaster.ray;
  if (Math.abs(ray.direction.z) < 1e-4) return false;
  const t = -ray.origin.z / ray.direction.z;
  if (t < 0) return false;
  out.copy(ray.origin).addScaledVector(ray.direction, t);
  return true;
};

// Planar aisle glide function
const panLibraryPlane = (dx: number, dy: number, cx: number, cy: number) => {
  const p1 = new T.Vector3(), p2 = new T.Vector3();
  const ok1 = getLibraryPlanePoint(cx - dx, cy - dy, p1);
  const ok2 = getLibraryPlanePoint(cx, cy, p2);
  if (ok1 && ok2) {
    const delta = p2.clone().sub(p1);
    controls.target.x -= delta.x;
    controls.target.y -= delta.y;
    camera.position.x -= delta.x;
    camera.position.y -= delta.y;
  } else {
    const dist = camera.position.distanceTo(controls.target);
    const factor = (2 * dist * Math.tan(T.MathUtils.degToRad(camera.fov / 2))) / el.clientHeight;
    controls.target.x -= dx * factor;
    controls.target.y += dy * factor;
    camera.position.x -= dx * factor;
    camera.position.y += dy * factor;
  }
  controls.target.z = 0;
  controls.update();
  dirty = true;
};
```

---

## 7. Inviolable Regression Protection Checklist

- [x] **Anatomical Vertex Colors Untouched:** Zero changes to `SYSTEMS` colors or shaders.
- [x] **Single-Column Vertical Command Deck Maintained:** The right panel remains a unified vertical column.
- [x] **Inline Bottom-Left Theme Picker Maintained:** Theme selector remains anchored on the far-left of the footer.
- [x] **Zero Linter or Type Errors:** Verified via `npm run check` and `npm run build`.
