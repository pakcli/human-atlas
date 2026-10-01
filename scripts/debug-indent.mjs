import fs from 'fs';
let c = fs.readFileSync('app/scene.tsx', 'utf8');

// Check indentation in loadChunk
const pos = c.indexOf('const g=new T.BufferGeometry()');
console.log('Chars before g=:', JSON.stringify(c.substring(pos-6, pos)));

// Find the exact part-setup block with actual indentation
const partSetup = c.indexOf('atlas.parts.forEach((p,i)=>{');
const partEnd = c.indexOf('});', partSetup) + 3;
console.log('Part forEach block:');
console.log(JSON.stringify(c.substring(partSetup, partEnd)));
