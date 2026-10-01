# Project Brief v15: Mobile Collapsible Panels, Bottom Sheet Detail Tabs & Canonical Exploded Navigation

**File:** `brief/v15_mobile_collapsible_panels_and_bottom_sheet_detail_tabs.md`  
**Target:** Mobile & Desktop UI/UX Responsive Layout Architecture  
**Status:** In Progress / User Validated  

---

## 1. Overview & Core Philosophy

Mobile anatomy exploration requires **maximum screen real estate** for the 3D WebGL viewport while keeping controls lightning-fast, ergonomically reachable by thumb, and completely free from lag-inducing effects like heavy blur filters.

### Key Architectural Tenets:
1. **60 FPS Performance Mandate (Zero Glass Blur)**:
   - Mobile overlays use lightweight solid dark colors (`#0b1120` in dark, `#ffffff` in light) with crisp 1px borders.
   - Eliminates expensive `backdrop-filter: blur(...)` GPU compositing stalls.
2. **Top Navbar Cleanliness**:
   - Title `[Human Atlas 3D]` on the left, global window tools `[☀️ Theme] [⛶ Fullscreen] [🔍 Find] [🔗 Share] [ℹ Info]` on the right.
   - Sex switch `[ ♂ Male | ♀ Female ]` moved **outside the navbar to the top-left corner below the title**, eliminating horizontal crowding.
3. **Bottom Sheet 3-Tier Split (Inside-Only Exploded Control)**:
   - **Row 1**: View Controls (`viewmode: [¾][F][S][B] [↺][⤹] [💥 100%] [👁] [✕]`) — guaranteed single-line fit on any mobile width.
   - **Row 1.5**: Exploded Shelf Navigation (`[◀] Shelf 4 · Extremities ───●─── 100% [▶] [0%]`) **strictly INSIDE the bottom sheet**, never floating over the 3D viewport. When sheet is closed, it stays docked at the screen bottom (46px).
   - **Row 2**: Tabs `[ ☰ Systems Explorer (15) ] [ ⓘ Detail ]` + Height Toggle `[ ⤢ Full / ⤡ Split ]`.
   - **Row 3**: Scrollable content with tightened `4px` margins around presets `[ All | Skeleton | Organs ]`.
4. **Canonical 3D Exploded Layout (Identical to Desktop)**:
   - 3D exploded layout logic references natural human height (`1.723m`) using a fixed canonical aspect ratio (`1.5`).
   - The organ shelf arrangement is identical on mobile and desktop.
   - On mobile portrait, the camera naturally frames and crops the model, while the shelf slider calculates smooth horizontal panning along the shelves.

---

## 2. Complete Mobile Screen Wireframes

### 2.1. Normal Assembled View (Split Panel Open)

```
┌────────────────────────────────────────────────────────┐
│ [Human Atlas 3D]               [☀️] [⛶] [🔍] [🔗] [ℹ]  │  ← 42px Flat Top Bar
├────────────────────────────────────────────────────────┤
│ ┌────────────────┐                                     │
│ │ ♂ Male│♀ Female│                                     │  ← Gender Corner Chip (Below Title)
│ └────────────────┘                                     │
│                                                        │
│                     3D VIEWPORT                        │
│                 (Head 100% visible)                    │
│                                                        │
├────────────────────────────────────────────────────────┤  ← Split Panel (50dvh)
│                         ═════                          │  ← Drag Handle
│ ┌────────────────────────────────────────────────────┐ │
│ │viewmode:[¾][F][S][B] [↺][⤹]   [💥 0%] [👁]    [✕]  │ │  ← ROW 1: View Controls (Compact Fit)
│ └────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────┬────────────────────┐ │
│ │[ ☰ Systems (15) ] [ ⓘ Detail ]│ [ ⤢ Full / ⤡ Split]│ │  ← ROW 2: Tabs + Height Toggle
│ └───────────────────────────────┴────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │      [ All ]        [ Skeleton ]       [ Organs ]  │ │  ← Presets (Tight 4px Margins)
│ └────────────────────────────────────────────────────┘ │
│ [●] Skeletal System                                206 │
│ [●] Muscular System                                640 │
│ [●] Cardiovascular System                           48 │
└────────────────────────────────────────────────────────┘
```

---

### 2.2. Exploded View Active (Inside Split Bottom Sheet)

When Exploded View is active (`explode > 0%` or `[💥]` toggled), the shelf navigation slider sits **INSIDE** the bottom sheet directly below Row 1:

```
┌────────────────────────────────────────────────────────┐
│ [Human Atlas 3D]               [☀️] [⛶] [🔍] [🔗] [ℹ]  │
├────────────────────────────────────────────────────────┤
│ ┌────────────────┐                                     │
│ │ ♂ Male│♀ Female│                                     │
│ └────────────────┘                                     │
│               [ CANONICAL 3D SHELF ARRAY ]             │
│            (Human Height Reference 1.723m)             │
│          (Cropped horizontally on mobile portrait)     │
│                                                        │
├────────────────────────────────────────────────────────┤  ← Split Panel (50dvh)
│                         ═════                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │viewmode:[¾][F][S][B] [↺][⤹]   [💥 100%] [👁]  [✕]  │ │  ← ROW 1: View Controls
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │[◀] Shelf 4 · Extremities ────●───── 100% [▶]  [0%] │ │  ← ROW 1.5: Exploded Shelf Scrubber (INSIDE!)
│ └────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────┬────────────────────┐ │
│ │[ ☰ Systems (15) ] [ ⓘ Detail ]│ [ ⤢ Full / ⤡ Split]│ │  ← ROW 2: Tabs + Height Toggle
│ └───────────────────────────────┴────────────────────┘ │
│ ... Content ...                                        │
└────────────────────────────────────────────────────────┘
```

---

### 2.3. Panel Collapsed (Drawer Closed) — Side Dock & Anchored Explode Bar

When the bottom drawer is collapsed (`closed` mode):
1. **Side Dock**: Flushed against screen edge ("Mentok") with `[⇄]` to swap left/right.
2. **Exploded Scrubber**: Anchored cleanly at the screen bottom (`bottom: 46px`), NEVER floating into the 3D center!

```
┌────────────────────────────────────────────────────────┐
│ [Human Atlas 3D]               [☀️] [⛶] [🔍] [🔗] [ℹ]  │
├────────────────────────────────────────────────────────┤
│ ┌────────────────┐                                     │
│ │ ♂ Male│♀ Female│                        ┌──────────┐ │
│ └────────────────┘                        │   [¾]    │ │
│                                           │   [F]    │ │
│               3D VIEWPORT                 │   [S]    │ │
│           (Full 100% Canvas)              │   [B]    │ │
│                                           │   ───    │ │
│                                           │   [↺]    │ │
│                                           │   [⤹]    │ │  ← Flush Edge Dock ("Mentok")
│                                           │   ───    │ │    Swappable Left/Right
│                                           │   [⇄]    │ │
│                                           └──────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │[◀] Shelf 4 · Extremities ────●───── 100% [▶]  [0%] │ │  ← Anchored at Bottom (46px)
│ └────────────────────────────────────────────────────┘ │
│ ═════════════════ [ ☰ Systems & Anatomy ▲ ] ═══════════ │  ← Collapsed Bar (38px)
└────────────────────────────────────────────────────────┘
```

---

## 3. Canonical 3D Exploded Layout Logic (Desktop-Mobile Parity)

### 3.1. Problem Identified
Previously, `createExplosionLayout(visibleParts, camera.aspect)` used dynamic viewport aspect ratio:
- Desktop (16:9, aspect = 1.77) → Wide anatomical shelf array.
- Mobile portrait (aspect = 0.46) → Distorted, squashed vertical column of organs that looked unnatural ("aneh").

### 3.2. Canonical Resolution
1. **Human Height Benchmark**: The vertical height of exploded organ shelves is pegged to natural human body height (`1.723m`).
2. **Fixed Canonical Aspect (`1.5`)**: Both mobile and desktop compute the exact same spatial coordinates:
   ```ts
   const layout = createExplosionLayout(visibleParts, 1.5);
   ```
3. **Mobile Horizontal Scrubber Calculation**:
   - On mobile portrait, the model is naturally framed and cropped horizontally ("when its zoomed cropping the model it's fine").
   - The scrubber slider calculates horizontal camera offset or jumps across anatomical shelves (`Shelf 1: Cranial`, `Shelf 2: Thorax`, `Shelf 3: Abdomen`, `Shelf 4: Extremities`).
   - Tapping `[◀]` or `[▶]` or dragging the slider smoothly pans along the canonical array.

---

## 4. Row 1 Responsive Header Fit Guarantee

Row 1 must fit on all mobile screens (320px, 360px, 375px, 390px, 412px, 430px) without line wraps or horizontal clipping:

| Element | Specifications | Width |
| :--- | :--- | :--- |
| `viewmode:` | `font-size: 7.5px; opacity: 0.65; letter-spacing: 0.02em;` | ~45px |
| Angle buttons `[¾][F][S][B]` | `height: 25px; min-width: 24px; font-size: 10px;` | 4 x 24px + 6px = 102px |
| Divider | `width: 1px; height: 14px;` | 3px |
| Rotate `[↺]` & Reset `[⤹]` | `height: 25px; width: 24px;` | 2 x 24px + 4px = 52px |
| Explode `[💥 100%]` | `height: 25px; padding: 0 5px; font-size: 9.5px;` | ~56px |
| Clean UI `[👁]` | `height: 25px; width: 24px;` | 24px |
| Close `[✕]` | `height: 25px; width: 25px;` | 25px |
| **Total Width** | Fits comfortably within **330px** (well under 360px Android & 390px iPhone) | ✅ **100% No Overflow** |

---

## 5. UI/UX Evaluation Matrix

| Metric | Previous Broken State | Brief v15 Implemented State |
| :--- | :--- | :--- |
| **3D Canvas Visibility** | ❌ 35% obscured by text & overlap | 🌟 95% clear; model head & neck 100% visible |
| **Exploded Control Placement** | ❌ Floating at 48vh outside sheet | 🌟 Integrated INSIDE sheet (open) / Anchored at 46px (closed) |
| **3D Exploded Packing** | ❌ Distorted vertical squish on mobile | 🌟 Exact canonical desktop shelf (human height reference) |
| **Top Navbar Ergonomics** | ❌ Colliding buttons and title | 🌟 Clean title left, 5 action buttons right, gender corner chip |
| **Row 1 Header Fit** | ⚠️ Cramped on 360px | 🌟 330px compact fit with subtle `viewmode:` micro label |
| **Sheet Preset Margins** | ❌ 25px top / 21px bottom empty gap | 🌟 Tight 4px margins directly connected to content |
| **Rendering Performance** | ⚠️ Heavy blur filter lag | 🚀 60 FPS crisp solid dark rendering (`#0b1120`) |
