export interface RadialGlyph {
  char: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  ring: number;
}

/** Deterministic PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface RadialOptions {
  seed?: number;
  /** Virtual canvas size (viewBox is size x size, centered at 0,0). */
  extent?: number;
  rings?: number;
  minRadius?: number;
  minSize?: number;
  maxSize?: number;
  /** Radial exponent: >1 pushes growth toward the edge. */
  sizeExponent?: number;
  ringExponent?: number;
  /** Target arc spacing between glyphs, as a multiple of glyph size. */
  spacing?: number;
}

/**
 * Concentric rings of non-repeating letters (A–Z, no duplicates inside a ring).
 * Glyph size grows from center (small) to periphery (large).
 */
export function generateRadialGlyphs(opts: RadialOptions = {}): RadialGlyph[] {
  const {
    seed = 20260503,
    extent = 1000,
    rings = 5,
    minRadius = 110,
    minSize = 14,
    maxSize = 64,
    sizeExponent = 1.3,
    ringExponent = 1.15,
    spacing = 2.6,
  } = opts;

  const rand = mulberry32(seed);
  const maxRadius = (Math.SQRT2 * extent) / 2;
  const out: RadialGlyph[] = [];
  let prevLast = '';

  for (let k = 1; k <= rings; k++) {
    const t = k / rings;
    const r = minRadius + (maxRadius - minRadius) * Math.pow(t, ringExponent);
    const rel = (r - minRadius) / (maxRadius - minRadius);
    const size = minSize + (maxSize - minSize) * Math.pow(rel, sizeExponent);

    const count = Math.max(5, Math.min(26, Math.floor((2 * Math.PI * r) / (size * spacing))));
    let letters = shuffle(ALPHABET, rand);
    // avoid same letter at the ring seam with previous ring
    if (letters[0] === prevLast) letters = letters.slice(1).concat(letters[0]);
    letters = letters.slice(0, count);
    prevLast = letters[letters.length - 1];

    const phase = rand() * Math.PI * 2;
    for (let i = 0; i < count; i++) {
      const jitterA = (rand() - 0.5) * (Math.PI / count) * 0.6;
      const jitterR = (rand() - 0.5) * size * 0.8;
      const ang = phase + (i / count) * Math.PI * 2 + jitterA;
      const rr = r + jitterR;
      out.push({
        char: letters[i],
        x: Math.cos(ang) * rr,
        y: Math.sin(ang) * rr,
        size,
        rotation: (rand() - 0.5) * 36,
        ring: k,
      });
    }
  }
  return out;
}
