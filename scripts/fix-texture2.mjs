import fs from 'fs';
let c = fs.readFileSync('app/scene.tsx', 'utf8');

// Fix indentation mismatch: the file uses CRLF and specific indent
// beforeLoadChunk needs to match exactly what's in the file

const beforeLoadChunk2 = `  let loaded=0;\r\n  const loadChunk=async(ci:number)=>{`;
if (c.includes(beforeLoadChunk2)) {
  const withTunerSet2 = `  let loaded=0;\r\n  const tunerPartIndices=new Set<number>(); // parts in female-10.bin - position via tunerPivot, not shader offset\r\n  const loadChunk=async(ci:number)=>{`;
  c = c.replace(beforeLoadChunk2, withTunerSet2);
  console.log('tunerPartIndices Set added (CRLF variant)');
} else {
  // Try LF
  const before3 = `  let loaded=0;\n  const loadChunk=async(ci:number)=>{`;
  if (c.includes(before3)) {
    c = c.replace(before3, `  let loaded=0;\n  const tunerPartIndices=new Set<number>();\n  const loadChunk=async(ci:number)=>{`);
    console.log('tunerPartIndices Set added (LF variant)');
  } else {
    // Find the exact text
    const idx = c.indexOf('let loaded=0');
    console.log('Found "let loaded" at:', idx);
    console.log('Context:', JSON.stringify(c.substring(idx-5, idx+80)));
    process.exit(1);
  }
}

// In the forEach loop, when isFRC, add i to tunerPartIndices
const oldPickerSetup = `    if(isFRC)tunerGroup.add(pick);`;
const newPickerSetup = `    if(isFRC)tunerPartIndices.add(i);`;
if (!c.includes(oldPickerSetup)) {
  console.error('oldPickerSetup not found!');
  const idx = c.indexOf('tunerGroup.add(pick)');
  if (idx >= 0) console.log('context:', c.substring(idx-50, idx+100));
  else console.log('tunerGroup.add(pick) not found either');
  process.exit(1);
}
c = c.replace(oldPickerSetup, newPickerSetup);
console.log('tunerPartIndices.add(i) added');

// In animate loop data.set: for tunerPartIndices parts, set dx=dy=dz=0
const oldDataSet = `const selected=selection.has(p.id);data.set([dx,dy,dz,`;
const newDataSet = `const selected=selection.has(p.id);const isFRCPart=tunerPartIndices.has(i);data.set([isFRCPart?0:dx,isFRCPart?0:dy,isFRCPart?0:dz,`;
if (!c.includes(oldDataSet)) {
  console.error('oldDataSet not found!');
  const idx = c.indexOf('data.set([dx');
  console.log('context:', c.substring(Math.max(0,idx-50), idx+100));
  process.exit(1);
}
c = c.replace(oldDataSet, newDataSet);
console.log('animate loop patched for tuner parts');

fs.writeFileSync('app/scene.tsx', c, 'utf8');
console.log('All patches applied. Lines:', c.split('\n').length);
