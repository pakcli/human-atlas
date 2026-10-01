import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const gltfPath = path.join(ROOT, 'raw/female-reproductive-organs/scene.gltf');
const binPath = path.join(ROOT, 'raw/female-reproductive-organs/scene.bin');

if (!fs.existsSync(gltfPath) || !fs.existsSync(binPath)) {
  console.error('Error: Sketchfab model files not found in raw/female-reproductive-organs/');
  process.exit(1);
}

const gltf = JSON.parse(fs.readFileSync(gltfPath, 'utf8'));
const rawBin = fs.readFileSync(binPath);

function getAccessorData(accIndex) {
  const acc = gltf.accessors[accIndex];
  const bv = gltf.bufferViews[acc.bufferView];
  const byteOffset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  const count = acc.count;
  if (acc.componentType === 5126) {
    return new Float32Array(rawBin.buffer, rawBin.byteOffset + byteOffset, count * (acc.type === 'VEC3' ? 3 : acc.type === 'VEC2' ? 2 : 1));
  } else if (acc.componentType === 5125) {
    return new Uint32Array(rawBin.buffer, rawBin.byteOffset + byteOffset, count);
  } else if (acc.componentType === 5123) {
    return new Uint16Array(rawBin.buffer, rawBin.byteOffset + byteOffset, count);
  }
}

// Accessor indices from scene.gltf:
// Mesh 2 (Object_4): POSITION: 8, NORMAL: 9, INDICES: 11
const rawPos = getAccessorData(8);
const rawNorm = getAccessorData(9);
const rawIndices = getAccessorData(11);

// Transformation parameters to align with female pelvis
const S = 0.03509;
const X_off = -0.007;
const Y_off = -0.5654;
const Z_off = -0.065;

// Coordinate transformation: X' = X*S + X_off, Y' = Z*S + Y_off, Z' = -Y*S + Z_off
// Splitting threshold in raw Z: 37.2 corresponds to Y' = 37.2 * 0.03509 - 0.5654 = 0.740 m (cervicovaginal junction)
const Z_SPLIT = 37.2;

function extractSubmesh(filterTriangle) {
  const newPositions = [];
  const newNormals = [];
  const newIndices = [];
  const vertexMap = new Map();

  function getOrAddVertex(vIndex) {
    if (vertexMap.has(vIndex)) return vertexMap.get(vIndex);

    const rx = rawPos[vIndex * 3];
    const ry = rawPos[vIndex * 3 + 1];
    const rz = rawPos[vIndex * 3 + 2];

    const tx = rx * S + X_off;
    const ty = rz * S + Y_off;
    const tz = -ry * S + Z_off;

    // Normal transform
    const nx = rawNorm[vIndex * 3];
    const ny = rawNorm[vIndex * 3 + 1];
    const nz = rawNorm[vIndex * 3 + 2];

    const tnx = nx;
    const tny = nz;
    const tnz = -ny;
    const len = Math.hypot(tnx, tny, tnz) || 1;

    const newIdx = newPositions.length / 3;
    newPositions.push(tx, ty, tz);
    newNormals.push(
      Math.max(-32767, Math.min(32767, Math.round((tnx / len) * 32767))),
      Math.max(-32767, Math.min(32767, Math.round((tny / len) * 32767))),
      Math.max(-32767, Math.min(32767, Math.round((tnz / len) * 32767)))
    );

    vertexMap.set(vIndex, newIdx);
    return newIdx;
  }

  for (let i = 0; i < rawIndices.length; i += 3) {
    const i0 = rawIndices[i], i1 = rawIndices[i + 1], i2 = rawIndices[i + 2];
    const z0 = rawPos[i0 * 3 + 2], z1 = rawPos[i1 * 3 + 2], z2 = rawPos[i2 * 3 + 2];
    const avgZ = (z0 + z1 + z2) / 3;

    if (filterTriangle(avgZ)) {
      const a = getOrAddVertex(i0);
      const b = getOrAddVertex(i1);
      const c = getOrAddVertex(i2);
      newIndices.push(a, b, c);
    }
  }

  let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < newPositions.length; i += 3) {
    for (let d = 0; d < 3; d++) {
      const v = newPositions[i + d];
      if (v < min[d]) min[d] = v;
      if (v > max[d]) max[d] = v;
    }
  }

  return {
    positions: new Float32Array(newPositions),
    normals: new Int16Array(newNormals),
    indices: new Uint32Array(newIndices),
    vertexCount: newPositions.length / 3,
    indexCount: newIndices.length,
    bounds: [min, max],
  };
}

console.log('Extracting Vaginal Canal (with rugae & introitus)...');
const vaginaMesh = extractSubmesh((avgZ) => avgZ < Z_SPLIT);
console.log(`✓ Vagina: ${vaginaMesh.vertexCount} verts, ${vaginaMesh.indexCount / 3} tris. Bounds Y: ${vaginaMesh.bounds[0][1].toFixed(3)} to ${vaginaMesh.bounds[1][1].toFixed(3)} m.`);

console.log('Extracting Uterine Tract & Cavity (Cross-Section)...');
const uterusMesh = extractSubmesh((avgZ) => avgZ >= Z_SPLIT);
console.log(`✓ Uterus: ${uterusMesh.vertexCount} verts, ${uterusMesh.indexCount / 3} tris. Bounds Y: ${uterusMesh.bounds[0][1].toFixed(3)} to ${uterusMesh.bounds[1][1].toFixed(3)} m.`);

// Build female-10.bin buffer
const chunkBlob = [];
function appendBuffer(typedArray, align = 4) {
  let len = chunkBlob.reduce((acc, b) => acc + b.byteLength, 0);
  const pad = (align - (len % align)) % align;
  if (pad > 0) chunkBlob.push(Buffer.alloc(pad));
  const offset = len + pad;
  const buf = Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
  chunkBlob.push(buf);
  return offset;
}

const vagPosOff = appendBuffer(vaginaMesh.positions, 4);
const vagNormOff = appendBuffer(vaginaMesh.normals, 2);
const vagIndOff = appendBuffer(vaginaMesh.indices, 4);

const utePosOff = appendBuffer(uterusMesh.positions, 4);
const uteNormOff = appendBuffer(uterusMesh.normals, 2);
const uteIndOff = appendBuffer(uterusMesh.indices, 4);

const finalChunkBuf = Buffer.concat(chunkBlob);
const CHUNK_IDX = 10;
const chunkFileName = `female-${CHUNK_IDX}.bin`;
const chunkOutPath = path.join(ROOT, `public/models/${chunkFileName}`);
const chunkGzOutPath = path.join(ROOT, `public/models/${chunkFileName}.gz`);

fs.writeFileSync(chunkOutPath, finalChunkBuf);
console.log(`✓ Wrote ${chunkOutPath} (${finalChunkBuf.byteLength} bytes)`);

const gz = zlib.gzipSync(finalChunkBuf, { level: 9 });
fs.writeFileSync(chunkGzOutPath, gz);
console.log(`✓ Wrote ${chunkGzOutPath} (${gz.byteLength} bytes)`);

// Update atlas-female.json
const atlasPath = path.join(ROOT, 'public/models/atlas-female.json');
const atlas = JSON.parse(fs.readFileSync(atlasPath, 'utf8'));

// Update chunks array
atlas.chunks = atlas.chunks.filter((c) => !c.url.includes(`female-${CHUNK_IDX}.bin`));
atlas.chunks.push({
  url: `/models/${chunkFileName}`,
  bytes: finalChunkBuf.byteLength,
  gzip: `/models/${chunkFileName}.gz`,
  gzipBytes: gz.byteLength,
});

// Update or add VH_F_vagina part
const newVaginaPart = {
  id: 'VH_F_vagina',
  name: 'vagina',
  conceptId: 'UBERON:0000996',
  system: 'reproductive',
  chunk: CHUNK_IDX,
  positions: vagPosOff,
  normals: vagNormOff,
  indices: vagIndOff,
  vertexCount: vaginaMesh.vertexCount,
  indexCount: vaginaMesh.indexCount,
  bounds: vaginaMesh.bounds,
};

const newUterusPart = {
  id: 'VH_F_uterus_xsection',
  name: 'Uterine cavity and wall (cross-section)',
  conceptId: 'FMA:17558',
  system: 'reproductive',
  chunk: CHUNK_IDX,
  positions: utePosOff,
  normals: uteNormOff,
  indices: uteIndOff,
  vertexCount: uterusMesh.vertexCount,
  indexCount: uterusMesh.indexCount,
  bounds: uterusMesh.bounds,
};

// Replace existing VH_F_vagina and add newUterusPart
atlas.parts = atlas.parts.filter((p) => p.id !== 'VH_F_vagina' && p.id !== 'VH_F_uterus_xsection');
atlas.parts.push(newVaginaPart);
atlas.parts.push(newUterusPart);

// Update concepts
const vagConcept = atlas.concepts.find((c) => c.id === 'UBERON:0000996');
if (vagConcept) {
  vagConcept.elements = ['VH_F_vagina'];
}

let uteConcept = atlas.concepts.find((c) => c.id === 'FMA:17558');
if (uteConcept) {
  if (!uteConcept.elements.includes('VH_F_uterus_xsection')) {
    uteConcept.elements.push('VH_F_uterus_xsection');
  }
} else {
  atlas.concepts.push({
    id: 'FMA:17558',
    name: 'Uterus',
    elements: ['VH_F_uterus_xsection'],
  });
}

// Calculate total triangles
let totalTris = 0;
for (const p of atlas.parts) {
  totalTris += p.indexCount / 3;
}
atlas.triangles = totalTris;

fs.writeFileSync(atlasPath, JSON.stringify(atlas, null, 2));
console.log(`✓ Updated ${atlasPath}: parts=${atlas.parts.length}, triangles=${atlas.triangles}, chunks=${atlas.chunks.length}`);
