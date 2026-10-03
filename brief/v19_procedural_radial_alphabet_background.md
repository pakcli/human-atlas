# Project Brief v19: Procedural Radial Alphabet Typography Watermark & Theme-Adaptive Ambient Background

**File:** `brief/v19_procedural_radial_alphabet_background.md`  
**Target:** Tebak Kata Anatomi Ambient Background, Radial Typography Projection, Dynamic Theme Tinting  
**Status:** Architecture, Algorithm & UI/UX Specification  

---

## 1. Executive Summary & Design Vision

In word-based anatomical games (Tebak Kata Anatomi, Word Connect, Word Typing), solid monochrome backgrounds often feel flat, sterile, or disconnected from the typographic essence of word crafting. Conversely, heavy textured backgrounds cause visual fatigue and collide with essential gameplay elements (letter platters, chiclet guess slots, connecting arrows).

### The v19 Core Innovation:
**v19 introduces a Procedural Radial Alphabet Watermark Engine** inspired by premium typographic word games (e.g. *Wordscapes*, *Words of Wonders*), tailored specifically to our multi-theme architecture:

1. **Non-Repeating Alphabet Distribution ($A - Z$)**:
   - The 26 Latin letters are distributed procedurally across concentric rings or logarithmic spirals.
   - Each ring samples without repetition from a shuffled permutation $\sigma(A \dots Z)$ (Fisher-Yates shuffle), ensuring no adjacent identical letters.
2. **Radial Scale Hierarchy (Center Micro $\to$ Periphery Macro)**:
   - **Center (Radius $r \to 0$)**: Letters are smaller ($12\text{px} - 16\text{px}$) and sparser, leaving the central gameplay platter and letter draft box uncluttered and high-contrast.
   - **Middle Ring ($r \approx 0.35 - 0.65$)**: Medium glyphs ($22\text{px} - 32\text{px}$) with gentle spacing.
   - **Outer Circle ($r \to 1.0$)**: Substantially larger glyphs ($44\text{px} - 68\text{px}$) radiating outwards ("*semakin keluar semakin besar*"), creating an optical illusion of centrifugal depth and focal immersion.
3. **Monochrome Grayscale Base with Universal Theme Color Overlay**:
   - The engine generates glyphs in neutral luminance / grayscale alpha masks.
   - Uses CSS CSS `color-mix`, `var(--accent-primary)`, `var(--bg-canvas)`, and blend modes (`mix-blend-mode: overlay` / `soft-light` or `opacity: 0.05 - 0.12`).
   - Seamlessly and instantaneously reflects whatever palette is selected (Navy Blue, Emerald Green, Amber/Brown, Red/Pink, Dark Slate, or Custom Accent) in both **Light Mode** and **Dark Mode**.
4. **Zero Performance Overhead**:
   - Generated as an ultra-lightweight SVG vector overlay or single-draw cached `<canvas>`, wrapped in `pointer-events-none absolute inset-0 select-none`.
   - Zero layout reflows, zero external raster image downloads, and fully responsive across mobile portrait ($360\text{px}$) and desktop ($1920\text{px}+$).

---

## 2. Design Analysis & Architectural Review ("WDYT?")

### Why This Design Works Exceptionally Well:
| Aspect | Flat Background (Current) | Procedural Radial Alphabet (v19) |
| :--- | :--- | :--- |
| **Visual Atmosphere** | Sterile medical card feeling | Playful, intellectual, typographic board game aesthetic |
| **Focal Hierarchy** | Equal visual weight everywhere | Center is quiet & focused; edges frame the screen dynamically |
| **Theme Adaptability** | Static flat color swap | Ambient watermark reacts in real-time to accent hues & dark mode |
| **Asset Footprint** | $0\text{ KB}$ | $< 2\text{ KB}$ procedural math (no PNG/WebP download needed) |
| **Contrast & Accessibility** | Standard | Preserved 100%: watermark contrast kept strictly under 8–12% alpha |

### Key Design Principles:
- **Never Interfere with Gameplay**: Opacity must never exceed $0.10$ in light mode or $0.08$ in dark mode so text readability inside chiclet tiles remains $> 7:1$ WCAG AAA.
- **Organic Micro-Rotations**: To avoid looking like a rigid school table, each letter receives a subtle pseudo-random rotation angle ($\theta \in [-18^\circ, +18^\circ]$).
- **High-Legibility Spacing**: Spaced with Poisson-disc or golden-ratio angular steps to eliminate visual crowding.

---

## 3. Mathematical & Algorithmic Model

### 3.1. Concentric Radial Geometry
Let the screen bounding box have center coordinates $(c_x, c_y)$ and maximum radial extent $R_{\text{max}} = \frac{1}{2}\sqrt{W^2 + H^2}$.

We divide the space into $N_{\text{rings}}$ concentric orbital tiers (e.g., $N = 4$ or $5$ rings):
$$r_k = R_{\text{min}} + (R_{\text{max}} - R_{\text{min}}) \cdot \left(\frac{k}{N}\right)^\gamma, \quad k \in \{1, 2, \dots, N\}$$

- **$\gamma \approx 1.2$**: Non-linear radial distribution placing slightly more density in the outer mid-ground.
- **Inner Safe Zone ($R_{\text{min}} \approx 80\text{px}$)**: Keeps the direct center clean.

### 3.2. Dynamic Glyph Scaling Formula
The font size $S(r)$ grows monotonically from the center outward:
$$S(r) = S_{\text{min}} + (S_{\text{max}} - S_{\text{min}}) \cdot \left(\frac{r - R_{\text{min}}}{R_{\text{max}} - R_{\text{min}}}\right)^\alpha$$

- **$S_{\text{min}} = 14\text{px}$** (Center glyphs)
- **$S_{\text{max}} = 58\text{px}$** (Perimeter / outer boundary glyphs)
- **$\alpha \approx 1.3$**: Exponential growth factor making the outer circle distinctly bolder and grander.

### 3.3. Non-Repeating Shuffled Permutations
To satisfy the rule "*the thing won't be repeated A-Z*":
1. Generate standard alphabet set $\mathcal{A} = ['A', 'B', 'C', \dots, 'Z']$.
2. For each ring $k$, apply a seeded **Fisher-Yates Shuffle**:
   $$\mathcal{A}_k = \text{shuffle}(\mathcal{A}, \text{seed} + k)$$
3. Number of glyphs per ring scales with circumference:
   $$M_k = \min\left(26, \left\lfloor \frac{2\pi r_k}{D_{\text{spacing}}} \right\rfloor\right)$$
4. Take the first $M_k$ unique characters from $\mathcal{A}_k$. Zero repetition within any ring!

---

## 4. UI/UX Wireframe & Visual Composition

```
┌────────────────────────────────────────────────────────┐
│  Y (large)                      D (large)            A │
│        e (med)                                         │
│                       K (small)                        │
│             p (med)                 m (med)            │
│                       ┌─────────┐                      │
│     O (large)         │  TEBAK  │             W (large)│
│                       │  KATA   │                      │
│                       └─────────┘                      │
│                                                        │
│             t (med)                 r (med)            │
│                       B (small)                        │
│        x (med)                          L (med)        │
│  G (large)                      Z (large)            Q │
└────────────────────────────────────────────────────────┘
  ▲ Outer: Font 50px+       ▲ Center: 14px       ▲ Outer
  (Semi-transparent watermark seamlessly overlaid with theme)
```

---

## 5. Theme Integration & Color Synthesis

### 5.1. CSS Variable Harmony
The procedural letters do not use static RGB values. They inherit:
```css
.radial-alphabet-watermark {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
  user-select: none;
}

/* Light Mode: Subtle accent-tinted monochrome watermark */
.radial-alphabet-watermark text {
  fill: var(--accent-primary, #0284c7);
  opacity: 0.07;
  font-family: var(--font-display, 'Inter', ui-sans-serif, sans-serif);
  font-weight: 800;
  mix-blend-mode: multiply;
}

/* Dark Mode: Luminous accent glow watermark */
.dark .radial-alphabet-watermark text {
  fill: var(--accent-primary, #38bdf8);
  opacity: 0.09;
  mix-blend-mode: screen;
}
```

### 5.2. Active Palette Response
| Active Accent Palette | Light Mode Appearance | Dark Mode Appearance |
| :--- | :--- | :--- |
| **Navy / Blue** | Faint icy cerulean letters over bone canvas | Glowing deep azure characters over navy canvas |
| **Brown / Cream** | Warm sepia watermark letters | Subtle golden amber glyphs |
| **Greendark / Greenlight** | Gentle sage typography | Crisp emerald ambient glyphs |
| **Red / Pink** | Soft rose watermarks | Warm crimson/coral ambient glow |
| **Darkgray / Lightgray** | Neutral slate watermark | Sleek silver-white typography |
| **Custom** | Dynamically tinted to user's custom hex | Dynamically tinted to user's custom hex |

---

## 6. Implementation Architecture

### 6.1. Component Specification: `<RadialAlphabetBackground />`
Create a dedicated, reusable, self-contained component in `app/game/radial-alphabet-background.tsx`:

```tsx
interface RadialAlphabetBackgroundProps {
  seed?: number;
  className?: string;
  theme?: 'light' | 'dark';
}
```

### 6.2. Key Implementation Details:
1. **Dynamic Viewport Measurement**: Uses `ResizeObserver` or CSS viewBox `0 0 1000 1000` with `preserveAspectRatio="xMidYMid slice"`.
2. **Memoized Coordinate Generation**: Computed once on mount with `useMemo`, zero recalculation during drag/connecting gestures.
3. **Smooth Theme Transition**: CSS `transition: fill 0.3s ease, opacity 0.3s ease` so changing theme accent smoothly transitions all background letters.
4. **Placement in Game Screens**:
   - Embedded at the base of `app/game/game-app.tsx` inside the main game container.
   - Sits below the HUD, word platter, typing keyboard, and modals (`z-0`).

---

## 7. Deliverables & Next Steps

1. **Phase 1: Procedural Generator Engine**:
   - Write algorithm in `app/game/radial-alphabet-generator.ts` with seeded Fisher-Yates and radial scale mapping.
2. **Phase 2: React Vector Component**:
   - Implement `app/game/radial-alphabet-background.tsx` using SVG with viewBox scaling and theme CSS variables.
3. **Phase 3: Integration into Game Container**:
   - Mount background inside `app/game/game-app.tsx` so all screens (`menu`, `connect`, `typing`, `settings`) benefit from the ambient atmosphere.
4. **Phase 4: Multi-Theme & Dark Mode Verification**:
   - Test across all 6 color palettes in both Light and Dark mode to ensure zero contrast degradation with gameplay tiles.

---

## 8. Revision r2: Anti-Clockface Organic Scatter

**Problem:** the concentric-ring layout (Section 3) read as a clock face: evenly spaced letters on visible circles, too repetitive.

**Fix (implemented in `radial-alphabet-generator.ts`):**
- **No rings.** Glyphs are placed by seeded dart-throwing at random angle/radius, rejecting candidates that overlap (spacing scales with glyph size).
- **Random empty gaps.** ~9 random circular voids (70-220 units) are carved out, plus random skipping (denser skipping near the center), so the field has uneven breathing room.
- **Size gradient kept.** 14 -> ~70 units from center to edge, each with +/-25% size jitter.
- **Stronger rotation jitter** (+/-35 degrees) to break alignment.
- **Letter bag.** Letters are drawn from a shuffled A-Z bag, and a letter is not reused within ~260 units of itself, so A-Z cycles without visible repetition.
- **Center stays calm.** A 120-unit radius is kept free for the gameplay platter.

