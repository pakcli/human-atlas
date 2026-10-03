export interface RadialGlyph {
  char: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
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
  /** Virtual canvas size (viewBox is extent x extent, centered at 0,0). */
  extent?: number;
  /** Radius kept free in the middle for gameplay. */
  minRadius?: number;
  minSize?: number;
  maxSize?: number;
  /** Radial exponent: >1 pushes growth toward the edge. */
  sizeExponent?: number;
  /** Target number of glyphs before gaps/collisions thin it out. */
  attempts?: number;
  /** Number of random empty "voids" carved out of the field. */
  voids?: number;
}

/**
 * Organic scatter (no rings): dart-throwing with size-aware spacing, random
 * empty voids and a letter bag so the same letter never sits near itself.
 * Glyph size grows from center (small) to periphery (large).
 */
export function generateRadialGlyphs(opts: RadialOptions = {}): RadialGlyph[] {
  const {
    seed = 20260503,
    extent = 1000,
    minRadius = 120,
    minSize = 14,
    maxSize = 70,
    sizeExponent = 1.4,
    attempts = 2600,
    voids = 9,
  } = opts;

  const rand = mulberry32(seed);
  const maxRadius = (Math.SQRT2 * extent) / 2;

  // Random empty gaps (soft blobs) so the pattern has breathing room.
  const holes = Array.from({ length: voids }, () => {
    const ang = rand() * Math.PI * 2;
    const rr = minRadius + rand() * (maxRadius - minRadius);
    return {
      x: Math.cos(ang) * rr,
      y: Math.sin(ang) * rr,
      r: 70 + rand() * 150,
    };
  });

  const out: RadialGlyph[] = [];
  let bag: string[] = [];
  const nextFromBag = (x: number, y: number): string => {
    for (let tries = 0; tries < 30; tries++) {
      if (bag.length === 0) bag = shuffle(ALPHABET, rand);
      const c = bag.shift()!;
      const clash = out.some(
        (g) => g.char === c && Math.hypot(g.x - x, g.y - y) < 260
      );
      if (!clash) return c;
      bag.push(c);
    }
    return ALPHABET[Math.floor(rand() * 26)];
  };

  for (let i = 0; i < attempts; i++) {
    const ang = rand() * Math.PI * 2;
    // sqrt-ish radial sampling keeps density roughly even per area
    const rr = minRadius + (maxRadius - minRadius) * Math.sqrt(rand());
    const x = Math.cos(ang) * rr;
    const y = Math.sin(ang) * rr;

    const rel = (rr - minRadius) / (maxRadius - minRadius);
    const size = minSize + (maxSize - minSize) * Math.pow(rel, sizeExponent) * (0.75 + rand() * 0.5);

    if (holes.some((h) => Math.hypot(x - h.x, y - h.y) < h.r)) continue;
    // extra random skipping, stronger near the center => sparser core
    if (rand() < 0.35 - rel * 0.2) continue;

    const gap = size * 2.4;
    const blocked = out.some((g) => Math.hypot(g.x - x, g.y - y) < (g.size + size) * 1.35 + gap * 0.35);
    if (blocked) continue;

    out.push({
      char: nextFromBag(x, y),
      x,
      y,
      size,
      rotation: (rand() - 0.5) * 70,
    });
  }
  return out;
}
