import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsDir = path.join(__dirname, '../public/models');
const atlasPath = path.join(modelsDir, 'atlas-female.json');

const atlas = JSON.parse(fs.readFileSync(atlasPath, 'utf8'));

// Check if already applied
if (atlas.parts.some(p => p.id === 'VH_F_vagina_lower')) {
  console.log('VH_F_vagina_lower already present.');
  process.exit(0);
}

// 1. Generate Lower Vaginal Canal Mesh
const topCenter = [-0.013, 0.748, -0.065];
const topRx = 0.012, topRz = 0.007;
const bottomCenter = [0.000, 0.640, -0.064];
const bottomRx = 0.014, bottomRz = 0.015;

const vagRings = 16;
const vagSegments = 24;
const vagPos = [];
const vagNorm = [];
const vagInd = [];

for (let r = 0; r <= vagRings; r++) {
  const t = r / vagRings;
  // S-shaped natural vaginal axis
  const cx = topCenter[0] * (1 - t) + bottomCenter[0] * t;
  const cy = topCenter[1] * (1 - t) + bottomCenter[1] * t;
  const cz = topCenter[2] * (1 - t) + bottomCenter[2] * t + Math.sin(t * Math.PI) * 0.004;

  const rx = topRx * (1 - t) + bottomRx * t;
  const rz = topRz * (1 - t) + bottomRz * t;

  for (let s = 0; s < vagSegments; s++) {
    const theta = (s / vagSegments) * Math.PI * 2;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const px = cx + cos * rx;
    const py = cy;
    const pz = cz + sin * rz;
    vagPos.push(px, py, pz);

    const nx = cos;
    const ny = (topCenter[1] - bottomCenter[1]) * 0.12;
    const nz = sin;
    const len = Math.hypot(nx, ny, nz) || 1;
    vagNorm.push(
      Math.round((nx / len) * 32767),
      Math.round((ny / len) * 32767),
      Math.round((nz / len) * 32767)
    );
  }
}

for (let r = 0; r < vagRings; r++) {
  for (let s = 0; s < vagSegments; s++) {
    const nextS = (s + 1) % vagSegments;
    const i0 = r * vagSegments + s;
    const i1 = r * vagSegments + nextS;
    const i2 = (r + 1) * vagSegments + s;
    const i3 = (r + 1) * vagSegments + nextS;
    vagInd.push(i0, i2, i1);
    vagInd.push(i1, i2, i3);
  }
}

// 2. Generate External Vulva & Clitoral Vestibule Mesh
const vulvaPos = [];
const vulvaNorm = [];
const vulvaInd = [];

// A. Clitoris (Glans and prepuce beneath pubic arch)
const clitCenter = [0.000, 0.672, -0.043];
const clitRings = 8, clitSegs = 16, clitRadius = 0.0045;
const clitBaseIndex = 0;

for (let r = 0; r <= clitRings; r++) {
  const phi = (r / clitRings) * Math.PI;
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  for (let s = 0; s < clitSegs; s++) {
    const theta = (s / clitSegs) * Math.PI * 2;
    const nx = sinPhi * Math.cos(theta);
    const ny = cosPhi;
    const nz = sinPhi * Math.sin(theta);
    vulvaPos.push(
      clitCenter[0] + nx * clitRadius,
      clitCenter[1] + ny * clitRadius * 1.4,
      clitCenter[2] + nz * clitRadius * 1.8
    );
    vulvaNorm.push(
      Math.round(nx * 32767),
      Math.round(ny * 32767),
      Math.round(nz * 32767)
    );
  }
}

for (let r = 0; r < clitRings; r++) {
  for (let s = 0; s < clitSegs; s++) {
    const nextS = (s + 1) % clitSegs;
    const i0 = clitBaseIndex + r * clitSegs + s;
    const i1 = clitBaseIndex + r * clitSegs + nextS;
    const i2 = clitBaseIndex + (r + 1) * clitSegs + s;
    const i3 = clitBaseIndex + (r + 1) * clitSegs + nextS;
    vulvaInd.push(i0, i2, i1);
    vulvaInd.push(i1, i2, i3);
  }
}

// B. Labia Minora & Majora folds flanking the vaginal introitus
const labiaBaseIndex = vulvaPos.length / 3;
const sides = [-1, 1]; // Left and right
const labiaRings = 10, labiaSegs = 8;

for (const side of sides) {
  const sideOffset = vulvaPos.length / 3;
  for (let r = 0; r <= labiaRings; r++) {
    const t = r / labiaRings;
    // Y runs from clitoris (0.672) to posterior commissure (0.628)
    const ly = 0.672 * (1 - t) + 0.628 * t;
    // Z runs from anterior (-0.043) to posterior (-0.082)
    const lz = -0.043 * (1 - t) + -0.082 * t;
    // Lateral prominence peaks in the middle
    const bulge = Math.sin(t * Math.PI);
    const lxMinora = side * (0.007 + bulge * 0.004);
    const lxMajora = side * (0.015 + bulge * 0.006);

    for (let s = 0; s < labiaSegs; s++) {
      const u = s / (labiaSegs - 1);
      // Interpolate from minora to majora curve
      const px = lxMinora * (1 - u) + lxMajora * u;
      const py = ly - Math.sin(u * Math.PI) * 0.003;
      const pz = lz;
      vulvaPos.push(px, py, pz);

      const nx = side * 0.8;
      const ny = 0;
      const nz = (1 - 2 * t) * 0.4;
      const len = Math.hypot(nx, ny, nz) || 1;
      vulvaNorm.push(
        Math.round((nx / len) * 32767),
        Math.round((ny / len) * 32767),
        Math.round((nz / len) * 32767)
      );
    }
  }

  for (let r = 0; r < labiaRings; r++) {
    for (let s = 0; s < labiaSegs - 1; s++) {
      const i0 = sideOffset + r * labiaSegs + s;
      const i1 = sideOffset + r * labiaSegs + (s + 1);
      const i2 = sideOffset + (r + 1) * labiaSegs + s;
      const i3 = sideOffset + (r + 1) * labiaSegs + (s + 1);
      if (side === 1) {
        vulvaInd.push(i0, i2, i1);
        vulvaInd.push(i1, i2, i3);
      } else {
        vulvaInd.push(i0, i1, i2);
        vulvaInd.push(i1, i3, i2);
      }
    }
  }
}

// 3. Helper to append buffer data to chunk
const chunk5File = path.join(modelsDir, 'female-5.bin');
let chunk5Buf = fs.readFileSync(chunk5File);

function appendToChunk(positions, normals, indices) {
  // Pad to 4-byte alignment
  const pad = (4 - (chunk5Buf.length % 4)) % 4;
  if (pad) {
    chunk5Buf = Buffer.concat([chunk5Buf, Buffer.alloc(pad)]);
  }

  const posOffset = chunk5Buf.length;
  const posBuf = Buffer.from(new Float32Array(positions).buffer);
  chunk5Buf = Buffer.concat([chunk5Buf, posBuf]);

  const normOffset = chunk5Buf.length;
  const normBuf = Buffer.from(new Int16Array(normals).buffer);
  chunk5Buf = Buffer.concat([chunk5Buf, normBuf]);

  const indPad = (4 - (chunk5Buf.length % 4)) % 4;
  if (indPad) {
    chunk5Buf = Buffer.concat([chunk5Buf, Buffer.alloc(indPad)]);
  }

  const indOffset = chunk5Buf.length;
  const indBuf = Buffer.from(new Uint32Array(indices).buffer);
  chunk5Buf = Buffer.concat([chunk5Buf, indBuf]);

  // Compute bounds
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], positions[i + k]);
      max[k] = Math.max(max[k], positions[i + k]);
    }
  }

  return {
    posOffset,
    normOffset,
    indOffset,
    vertexCount: positions.length / 3,
    indexCount: indices.length,
    bounds: [min, max]
  };
}

const vagRec = appendToChunk(vagPos, vagNorm, vagInd);
const vulvaRec = appendToChunk(vulvaPos, vulvaNorm, vulvaInd);

// Write updated binary chunk
fs.writeFileSync(chunk5File, chunk5Buf);
atlas.chunks[5].bytes = chunk5Buf.length;

// 4. Add parts to atlas-female.json
const partVagLower = {
  id: 'VH_F_vagina_lower',
  name: 'lower vaginal canal and introitus',
  conceptId: 'FMA:19985',
  system: 'reproductive',
  chunk: 5,
  positions: vagRec.posOffset,
  normals: vagRec.normOffset,
  indices: vagRec.indOffset,
  vertexCount: vagRec.vertexCount,
  indexCount: vagRec.indexCount,
  bounds: vagRec.bounds
};

const partVulva = {
  id: 'VH_F_vulva_clitoris',
  name: 'vulva and clitoris',
  conceptId: 'FMA:20182',
  system: 'reproductive',
  chunk: 5,
  positions: vulvaRec.posOffset,
  normals: vulvaRec.normOffset,
  indices: vulvaRec.indOffset,
  vertexCount: vulvaRec.vertexCount,
  indexCount: vulvaRec.indexCount,
  bounds: vulvaRec.bounds
};

atlas.parts.push(partVagLower, partVulva);
atlas.triangles += vagRec.indexCount / 3 + vulvaRec.indexCount / 3;

// 5. Update Concepts
// Add to general vagina concept
const vagConcept = atlas.concepts.find(c => c.id === 'HRA:VH_F_vagina');
if (vagConcept) {
  vagConcept.elements.push('VH_F_vagina_lower');
}

// Add to reproductive system concept
const reproConcept = atlas.concepts.find(c => c.id === 'HRA:VH_F_reproductive_system');
if (reproConcept) {
  reproConcept.elements.push('VH_F_vagina_lower', 'VH_F_vulva_clitoris');
}

// Add individual selectable concepts
atlas.concepts.push({
  id: 'HRA:VH_F_vagina_lower',
  name: 'lower vaginal canal',
  elements: ['VH_F_vagina_lower']
});

atlas.concepts.push({
  id: 'HRA:VH_F_vulva_clitoris',
  name: 'vulva and clitoris',
  elements: ['VH_F_vulva_clitoris']
});

atlas.concepts.push({
  id: 'HRA:VH_F_clitoris',
  name: 'clitoris',
  elements: ['VH_F_vulva_clitoris']
});

fs.writeFileSync(atlasPath, JSON.stringify(atlas));
console.log('Successfully completed lower vagina and vulva meshes!');
console.log('Total female parts:', atlas.parts.length, 'concepts:', atlas.concepts.length, 'triangles:', atlas.triangles);
