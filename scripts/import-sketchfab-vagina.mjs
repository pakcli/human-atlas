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
// Mesh 2 (Object_4): POSITION: 8, NORMAL: 9, TEXCOORD_0: 10, INDICES: 11
const rawPos = getAccessorData(8);
const rawNorm = getAccessorData(9);
const rawUV = getAccessorData(10);
const rawIndices = getAccessorData(11);

function parseArg(flag, defaultVal) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return parseFloat(process.argv[idx + 1]);
  }
  return defaultVal;
}

const userX = parseArg('--x', 0);
const userY = parseArg('--y', 0);
const userZ = parseArg('--z', 0);
const userRotX = parseArg('--rotX', 0) * (Math.PI / 180);
const userRotY = parseArg('--rotY', 0) * (Math.PI / 180);
const userRotZ = parseArg('--rotZ', 0) * (Math.PI / 180);

const userScaleAll = parseArg('--scaleAll', parseArg('--scale', 1.0));
const userScaleX = parseArg('--scaleX', 1.0) * userScaleAll;
const userScaleY = parseArg('--scaleY', 1.0) * userScaleAll;
const userScaleZ = parseArg('--scaleZ', 1.0) * userScaleAll;

console.log(
  `Bake Parameters:\n` +
  `  Pos: x=${userX.toFixed(4)}, y=${userY.toFixed(4)}, z=${userZ.toFixed(4)}\n` +
  `  Rot: rotX=${(userRotX*180/Math.PI).toFixed(1)}°, rotY=${(userRotY*180/Math.PI).toFixed(1)}°, rotZ=${(userRotZ*180/Math.PI).toFixed(1)}°\n` +
  `  Scale: All=${userScaleAll.toFixed(3)}, X=${userScaleX.toFixed(3)}, Y=${userScaleY.toFixed(3)}, Z=${userScaleZ.toFixed(3)}`
);

// Transformation parameters to align with female pelvis
const Sx = 0.03509 * userScaleX;
const Sy = 0.03509 * userScaleY;
const Sz = 0.03509 * userScaleZ;

const X_off = -0.007 + userX;
const Y_off = -0.5654 + userY;
const Z_off = -0.065 + userZ;
const PIVOT = { x: -0.009, y: 0.740, z: -0.065 };

// Splitting threshold in raw Z: 37.2 corresponds to Y' = 37.2 * 0.03509 - 0.5654 = 0.740 m (cervicovaginal junction)
const Z_SPLIT = 37.2;

function rotateVec(x, y, z, rx, ry, rz) {
  let cx = x, cy = y, cz = z;
  if (rx !== 0) {
    const ny = cy * Math.cos(rx) - cz * Math.sin(rx);
    const nz = cy * Math.sin(rx) + cz * Math.cos(rx);
    cy = ny; cz = nz;
  }
  if (ry !== 0) {
    const nx = cx * Math.cos(ry) + cz * Math.sin(ry);
    const nz = -cx * Math.sin(ry) + cz * Math.cos(ry);
    cx = nx; cz = nz;
  }
  if (rz !== 0) {
    const nx = cx * Math.cos(rz) - cy * Math.sin(rz);
    const ny = cx * Math.sin(rz) + cy * Math.cos(rz);
    cx = nx; cy = ny;
  }
  return [cx, cy, cz];
}

function extractSubmesh(filterTriangle) {
  const newPositions = [];
  const newNormals = [];
  const newUVs = [];
  const newIndices = [];
  const vertexMap = new Map();

  function getOrAddVertex(vIndex) {
    if (vertexMap.has(vIndex)) return vertexMap.get(vIndex);

    const rx = rawPos[vIndex * 3];
    const ry = rawPos[vIndex * 3 + 1];
    const rz = rawPos[vIndex * 3 + 2];

    let tx = rx * Sx + X_off;
    let ty = rz * Sy + Y_off;
    let tz = -ry * Sz + Z_off;

    // Apply rotation around PIVOT
    if (userRotX !== 0 || userRotY !== 0 || userRotZ !== 0) {
      const [rotX, rotY, rotZ] = rotateVec(tx - PIVOT.x, ty - PIVOT.y, tz - PIVOT.z, userRotX, userRotY, userRotZ);
      tx = rotX + PIVOT.x;
      ty = rotY + PIVOT.y;
      tz = rotZ + PIVOT.z;
    }

    // Normal transform
    const nx = rawNorm[vIndex * 3];
    const ny = rawNorm[vIndex * 3 + 1];
    const nz = rawNorm[vIndex * 3 + 2];

    let [tnx, tny, tnz] = [nx, nz, -ny];
    if (userRotX !== 0 || userRotY !== 0 || userRotZ !== 0) {
      [tnx, tny, tnz] = rotateVec(tnx, tny, tnz, userRotX, userRotY, userRotZ);
    }
    const len = Math.hypot(tnx, tny, tnz) || 1;

    // UV coordinates (glTF V is flipped in WebGL/Three.js default, but standard glTF V = 1 - V or native)
    const u = rawUV[vIndex * 2];
    const v = rawUV[vIndex * 2 + 1];

    const newIdx = newPositions.length / 3;
    newPositions.push(tx, ty, tz);
    newNormals.push(
      Math.max(-32767, Math.min(32767, Math.round((tnx / len) * 32767))),
      Math.max(-32767, Math.min(32767, Math.round((tny / len) * 32767))),
      Math.max(-32767, Math.min(32767, Math.round((tnz / len) * 32767)))
    );
    newUVs.push(u, v);

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
      const val = newPositions[i + d];
      if (val < min[d]) min[d] = val;
      if (val > max[d]) max[d] = val;
    }
  }

  return {
    positions: new Float32Array(newPositions),
    normals: new Int16Array(newNormals),
    uvs: new Float32Array(newUVs),
    indices: new Uint32Array(newIndices),
    vertexCount: newPositions.length / 3,
    indexCount: newIndices.length,
    bounds: [min, max],
  };
}

console.log('Extracting Vaginal Canal (with rugae, introitus & UV textures)...');
const vaginaMesh = extractSubmesh((avgZ) => avgZ < Z_SPLIT);
console.log(`✓ Vagina: ${vaginaMesh.vertexCount} verts, ${vaginaMesh.indexCount / 3} tris. Bounds Y: ${vaginaMesh.bounds[0][1].toFixed(3)} to ${vaginaMesh.bounds[1][1].toFixed(3)} m.`);

console.log('Extracting Uterine Tract & Cavity (Cross-Section with UV textures)...');
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
const vagUvOff = appendBuffer(vaginaMesh.uvs, 4);
const vagIndOff = appendBuffer(vaginaMesh.indices, 4);

const utePosOff = appendBuffer(uterusMesh.positions, 4);
const uteNormOff = appendBuffer(uterusMesh.normals, 2);
const uteUvOff = appendBuffer(uterusMesh.uvs, 4);
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

// Copy texture into public/models/textures/
const texDir = path.join(ROOT, 'public/models/textures');
fs.mkdirSync(texDir, { recursive: true });
const srcTex = path.join(ROOT, 'raw/female-reproductive-organs/textures/Uterus_XSection_baseColor.jpeg');
const dstTex = path.join(texDir, 'uterus_xsection.jpg');
if (fs.existsSync(srcTex) && !fs.existsSync(dstTex)) {
  fs.copyFileSync(srcTex, dstTex);
  console.log(`✓ Copied texture to ${dstTex}`);
}

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
  uvs: vagUvOff,
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
  uvs: uteUvOff,
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
