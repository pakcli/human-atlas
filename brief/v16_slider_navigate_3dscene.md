# Project Brief v16: 3D Scene Spatial Navigation Sliders & Bounding Box Scrollers

**File:** `brief/v16_slider_navigate_3dscene.md`  
**Target:** 3D Scene Camera Navigation, Adaptive Bounding Box Scrollers, Universal Multi-State (0%–100%) Navigation  
**Status:** User Proposal / Architecture & UI/UX Specification  

---

## 1. Executive Summary & Design Vision

In 3D medical anatomy exploration, navigating a human body composed of over 2,000 distinct organs, bones, and vessels presents a fundamental spatial challenge:

> When the user zooms in to inspect anatomical details, or when the anatomy is exploded across horizontal shelves, **the visible model inevitably overflows the camera frustum**. Relying exclusively on multi-touch gestures or mouse panning leaves users disoriented without spatial landmarks or precise position control.

### The v16 Core Innovation:
Instead of treating sliders merely as abstract "Explosion Percentage" controls, **v16 transforms sliders into an Anatomical Spatial Navigator (Orthogonal Viewport Scrollers)**:
1. **Dynamic World Bounding Box Calculation**: Continuously computes the aggregate 3D bounding box ($B_{\text{visible}}$) of all currently rendered meshes across any state:
   - **Assembled Mode ($0\%$)**: Natural human standing posture ($Y \in [0, 1.723\text{m}]$, $X \in [-0.27, 0.27\text{m}]$).
   - **Exploded Mode ($1\% - 100\%$)**: Dissected organ shelves spanning horizontally and vertically.
   - **Isolated Mode**: Focused bounding box of a single organ system or individual structure (e.g. Heart or Femur).
2. **Frustum Intersection & Overflow Detection**:
   - The engine projects $B_{\text{visible}}$ against the camera frustum at the current zoom level.
   - If the model is **fully enclosed** within the screen, the navigators indicate a centered / fitted state.
   - If the model **overflows** (e.g. zoomed in, or wide exploded shelves on mobile portrait), the **Horizontal (X) and Vertical (Y) navigation sliders activate automatically**.
3. **Universal Two-Way Spatial Scrubbing**:
   - **Vertical Slider (Y-Axis / Cranial–Caudal)**: Smoothly pans camera target from **Head/Cranial** down through **Thorax**, **Abdomen**, **Pelvis**, to **Feet/Extremities**.
   - **Horizontal Slider (X-Axis / Lateral / Shelf)**: Smoothly pans camera target from **Left** to **Right** (or across Shelves 1 to 4).
   - **Bi-directional Sync**: Dragging the canvas with touch/mouse updates the slider thumbs in real-time; dragging the sliders dollies the camera target smoothly with high-precision damping.
4. **One-Tap Smart Frame (`[⊡ Fit All]`)**: Instantly recomputes the optimal camera distance to frame the exact visible bounding box with zero cropping.

---

## 2. Minimalist Plain Slider Philosophy (Zero Clutter)

Based on user feedback, the navigation sliders strictly follow a **clean, distraction-free aesthetic**:
- **Plain Sliders**: No verbose text labels, no bulky anatomical badges, and no extra clutter over the 3D canvas.
- **Sleek Scroller Track & Thumb**: Minimalist, semi-transparent track with a subtle, tactile thumb (similar to Figma canvas scrollers or Apple native viewport indicators).
- **Adaptive Auto-Show**:
  - When the entire bounding box fits 100% inside the viewport, the sliders fade out completely (`opacity: 0`), keeping the 3D model pristine and unobstructed.
  - As soon as the user zooms in or rotates/pans such that the mesh overflows the camera frustum, the sleek horizontal (bottom) and vertical (side) sliders smoothly fade in.
- **High-Precision Direct Scrubbing**: Dragging the thumb dollies the camera directly across the bounding box travel range with silky 60 FPS damping.
- **Two-Way Synchronization**: Touch or mouse gestures on the canvas update the slider thumbs in real time.

---

## 3. UI/UX Wireframes

### 3.1. Mobile Portrait Viewport with Active Spatial Navigators

When zoomed in or viewing wide exploded shelves:

```
┌────────────────────────────────────────────────────────┐
│ [Human Atlas 3D]               [☀️] [⛶] [🔍] [🔗] [ℹ]  │  ← 42px Minimal Navbar
├────────────────────────────────────────────────────────┤
│ ┌────────────────┐                                     │
│ │ ♂ Male│♀ Female│                                     │  ← Gender Corner Chip
│ └────────────────┘                                     │
│                                                        │
│                                                    [¾] │
│                                                    [F] │
│                                                    [S] │
│                                                    [B] │
│                     3D VIEWPORT                    ─── │
│                 [Zoomed Anatomical]                [↺] │
│                  [Dissection View]                 [⟲] │
│                                                    ─── │
│                                                    [⊡] │  ← [⊡] Smart Fit-All Button
│                                                    ─── │
│                                                  [Thorax]
│                                                    │▲│ │
│                                                    │█│ │  ← VERTICAL NAVIGATOR (Y-Axis)
│                                                    │░│ │     Cranial ↕ Caudal
│                                                    │▼│ │     (Height / Body Level)
│                                                    ─── │
│                                                    [💥] │
│                                                    [👁] │
│                                                    [⇄] │
│                                                        │
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │[◀]  Left / Shelf 2 ───[ █ ]────── Right  [▶]  [⊡] │ │  ← HORIZONTAL NAVIGATOR (X-Axis)
│ └────────────────────────────────────────────────────┘ │     Lateral Panning / Shelf Navigation
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ ≡ Systems & Anatomy Explorer (Collapsed Bar)    ▲  │ │  ← Bottom Sheet Closed Bar
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

---

### 3.2. Desktop Wide Screen Layout with Integrated Orthogonal Navigators

On desktop, the horizontal navigator floats elegantly at the bottom center, while the vertical navigator integrates directly into the Right Command Deck:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [Human Atlas 3D]               [ ♂ Male | ♀ Female ]            [☀️] [⛶] [🔍] [🔗] [ℹ]  │
├──────────────┬──────────────────────────────────────────────────────────┬──────────────┤
│ SYSTEMS      │                                                          │ COMMAND DECK │
│ PANEL        │                                                          │              │
│              │                                                          │ [ ¾ ][ F ]   │
│ [ All ]      │                                                          │ [ S ][ B ]   │
│ [ Skeleton ] │                                                          │ ──────────── │
│ [ Organs ]   │                                                          │ [ ↺ ][ ⟲ ]   │
│              │                                                          │ ──────────── │
│ [●] Skeletal │                       3D VIEWPORT                        │ [⊡ Fit All]  │
│ [●] Muscular │                 (Interactive 60 FPS)                     │ ──────────── │
│ [●] Cardiac  │                                                          │ [Head] 100%  │
│ [●] Vascular │                                                          │   ┌──┐       │
│ [●] Nervous  │                                                          │   │  │       │
│ ...          │                                                          │   │██│       │ Y-NAVIGATOR
│              │                                                          │   │  │       │ (Head ↕ Feet)
│              │                                                          │   └──┘       │
│              │                                                          │ [Feet]  0%   │
│              │                                                          │ ──────────── │
│              │  ┌────────────────────────────────────────────────────┐  │ [💥 Explode] │
│              │  │ [◀] Shelf 2 · Thorax  ────●──────── 50%  [▶] [ ⊡ ] │  │ [ 👁 Zen ]   │
│              │  └────────────────────────────────────────────────────┘  │              │
│              │                Horizontal X-Navigator                    │              │
├──────────────┴──────────────────────────────────────────────────────────┴──────────────┤
│ Left-drag to orbit · Right-drag to pan · Pinch/Scroll to zoom · Slider to navigate     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Mathematical Architecture & Camera Physics

### 4.1. Visible World Bounding Box Computation

At any frame, let $V \subseteq \{1, \dots, N\}$ be the set of active visible anatomy part indices.

$$\mathbf{B}_{\text{visible}} = \left[ \mathbf{p}_{\min}, \mathbf{p}_{\max} \right]$$

where:
$$\mathbf{p}_{\min} = \min_{i \in V} \left( \mathbf{c}_i + \mathbf{d}_i + \mathbf{b}_{i,\min} \right)$$
$$\mathbf{p}_{\max} = \max_{i \in V} \left( \mathbf{c}_i + \mathbf{d}_i + \mathbf{b}_{i,\max} \right)$$

- $\mathbf{c}_i$: Resting anatomical centroid of part $i$.
- $\mathbf{d}_i$: Displacement vector at current explode percentage ($t_{\text{explode}}$).
- $\mathbf{b}_i$: Local bounding extent of part $i$.

The total spatial dimensions are:
$$W_B = p_{\max, x} - p_{\min, x}, \quad H_B = p_{\max, y} - p_{\min, y}, \quad D_B = p_{\max, z} - p_{\min, z}$$
$$\mathbf{C}_B = \frac{\mathbf{p}_{\min} + \mathbf{p}_{\max}}{2}$$

---

### 4.2. Camera Frustum Coverage & Overflow Calculation

At distance $D = \|\mathbf{p}_{\text{cam}} - \mathbf{p}_{\text{target}}\|$, the visible frustum dimensions at the target plane are:

$$H_{\text{frustum}} = 2 \cdot D \cdot \tan\left(\frac{\text{FOV}}{2}\right)$$
$$W_{\text{frustum}} = H_{\text{frustum}} \cdot \text{Aspect}_{\text{viewport}}$$

The camera overflow ratios along $X$ and $Y$ are:

$$\text{Overflow}_X = \frac{W_B}{W_{\text{frustum}}}, \quad \text{Overflow}_Y = \frac{H_B}{H_{\text{frustum}}}$$

- **Case 1 ($\text{Overflow} \le 1.0$)**: Entire model fits inside the screen. Sliders can remain in neutral/fit mode.
- **Case 2 ($\text{Overflow} > 1.0$)**: The model exceeds the screen boundary. Navigation sliders provide exact proportional travel:

$$\text{TravelRange}_X = \max\left(0, \frac{W_B - W_{\text{frustum}}}{2}\right)$$
$$\text{TravelRange}_Y = \max\left(0, \frac{H_B - H_{\text{frustum}}}{2}\right)$$

---

### 4.3. Normalized Slider Position Binding

The sliders map normalized values $t_x, t_y \in [0, 1]$ directly to the camera target offset:

$$\text{target}_x(t_x) = C_{B, x} + \text{lerp}\left(-\text{TravelRange}_X, +\text{TravelRange}_X, t_x\right)$$
$$\text{target}_y(t_y) = C_{B, y} + \text{lerp}\left(-\text{TravelRange}_Y, +\text{TravelRange}_Y, t_y\right)$$

- Moving the Y-slider from $0 \rightarrow 1$ dollies the camera from feet up to head smoothly.
- Moving the X-slider from $0 \rightarrow 1$ dollies the camera from left flank to right flank (or Shelf 1 to Shelf 4).
- Direct screen gestures update $t_x$ and $t_y$ in reverse, keeping the slider thumbs visually locked to the camera's viewport center.

---

### 4.4. One-Tap Optimal Fit (`[⊡ Fit All]`)

When the user taps `[⊡ Fit All]`:

$$D_{\text{optimal}} = \max\left(\frac{H_B}{2 \tan(\text{FOV}/2)}, \frac{W_B}{2 \cdot \text{Aspect} \cdot \tan(\text{FOV}/2)}\right) \times 1.10$$

$$\mathbf{p}_{\text{target}} \to \mathbf{C}_B, \quad \mathbf{p}_{\text{cam}} \to \mathbf{C}_B + \mathbf{u}_{\text{view}} \cdot D_{\text{optimal}}$$

The camera animates smoothly with spherical interpolation, guaranteeing $100\%$ visibility of all parts.

---

## 5. Mobile & Desktop State Matrix

| Feature | Assembled ($0\%$) | Exploded ($1\% - 100\%$) | Zoomed In / Isolated |
| :--- | :--- | :--- | :--- |
| **Y-Slider (Vertical)** | Body Level (Head $\leftrightarrow$ Feet) | Shelf Tier / Vertical Level | Focal Plane Navigation |
| **X-Slider (Horizontal)** | Lateral Pan (Left $\leftrightarrow$ Right) | Shelf Browser (Shelf 1 $\leftrightarrow$ 4) | High-Magnification Lateral Pan |
| **Auto-Activation** | Activates when zoomed in | Always active when shelves exceed screen | Active whenever bounding box overflows |
| **Region Indicator** | Anatomical Tag (e.g. *Thorax*) | Shelf Tag (e.g. *Shelf 2 · Thorax*) | Part Name / System Name |
| **Fit Button `[⊡]`** | Frames full upright body | Frames all horizontal shelves | Frames isolated organ |

---

## 6. Implementation Plan & Milestones

1. **Step 1: Bounding Box Calculation Engine**
   - Create helper `calculateActiveBoundingBox(parts, displacements, isIsolate, selected)` returning Box3 and region bounds.
2. **Step 2: Frustum Overflow Evaluator**
   - Add hook in `scene.tsx` computing `overflowX`, `overflowY`, and normalized current camera position $(t_x, t_y)$.
3. **Step 3: Slider Component Integration**
   - Bind X-scroller to horizontal bottom scrubber.
   - Bind Y-scroller to side dock vertical slider.
   - Add `[⊡ Fit All]` button to side dock and command deck.
4. **Step 4: Real-time Anatomical Region Tagging**
   - Display dynamic region names (*Cranial*, *Thorax*, *Abdomen*, *Pelvis*, *Lower Extremities*) based on $t_y$.
5. **Step 5: Testing & Performance Profiling**
   - Ensure bounding box checks occur on camera movement without causing garbage collection pauses (zero allocation per frame).
   - Validate 60 FPS across desktop and low-end mobile devices.
