import fs from 'fs';
let c = fs.readFileSync('app/scene.tsx', 'utf8');

// The tuner dispatches 'atlas-mesh-tune' CustomEvent with TunerValues.
// scene.tsx must:
//  1. Listen for 'atlas-mesh-tune' and apply transforms to tunerPivot
//  2. tunerPivot is already in the scene at PIVOT position
//  3. The render mesh for female-10 is in scene (not tunerGroup),
//     so we need to apply tuner to a SEPARATE group that wraps the render mesh.
//
// Strategy:
//  - Keep render mesh in `scene` (avoids double-offset)
//  - But wrap it in tunerPivot: move render mesh INTO tunerGroup
//  - Remove the vertex-shader state.xyz for female-10 parts (set dx/dy/dz=0 for them)
//    so the tuner is the ONLY position controller
//
// Better strategy (simpler): Keep mesh in scene, but add an event listener
// that applies the tuner values to tunerPivot which wraps the mesh.
// We need to RE-parent the render mesh under tunerPivot.
//
// Cleanest approach:
//  1. Render mesh goes to tunerPivot (NOT scene, NOT tunerGroup)
//  2. chunk10Material shader: skip state.xyz for female-10 parts
//     -- done by always setting data[i*4..i*4+2] = 0,0,0 for female-10 in animate loop
//     -- visibility (data[i*4+3]) still controlled normally
//  3. tunerPivot is at PIVOT. We apply user offsets on top of PIVOT.
//  4. 'atlas-mesh-tune' event updates tunerPivot position/rotation/scale

// First, let's fix groups.forEach to add mesh to tunerPivot (not scene)
// and add the event listener to scene.tsx

const oldGroupsLoop = `   const isChunkFRC=chunk.url.includes('female-10.bin');
   groups.forEach((gs,system)=>{const geometry=mergeGeometries(gs,false);if(!geometry)throw new Error('Could not assemble anatomy geometry.');geometries.push(geometry);const mesh=new T.Mesh(geometry,isChunkFRC?chunk10Material:mats.get(system as never));mesh.frustumCulled=false;scene.add(mesh);});`;

const newGroupsLoop = `   const isChunkFRC=chunk.url.includes('female-10.bin');
   groups.forEach((gs,system)=>{const geometry=mergeGeometries(gs,false);if(!geometry)throw new Error('Could not assemble anatomy geometry.');geometries.push(geometry);const mesh=new T.Mesh(geometry,isChunkFRC?chunk10Material:mats.get(system as never));mesh.frustumCulled=false;if(isChunkFRC){tunerPivot.add(mesh);}else{scene.add(mesh);}});`;

if (!c.includes(oldGroupsLoop)) {
  console.error('oldGroupsLoop not found!');
  const idx = c.indexOf('isChunkFRC');
  console.log('context:', c.substring(idx-30, idx+300));
  process.exit(1);
}
c = c.replace(oldGroupsLoop, newGroupsLoop);
console.log('groups.forEach patched. mesh now in tunerPivot for FRC chunks');

// Now add atlas-mesh-tune event listener + dirty setter after the controls setup
// Insert after: controls.addEventListener('change',()=>{dirty=true;});
const afterControls = `controls.addEventListener('change',()=>{dirty=true;});`;
const tunerListener = `controls.addEventListener('change',()=>{dirty=true;});
  // Tuner: listen for transform events from the 3D Mesh Tuner HUD
  const handleTune=(e:Event)=>{
   const v=(e as CustomEvent).detail as {x:number;y:number;z:number;rotX:number;rotY:number;rotZ:number;scaleAll:number;scaleX:number;scaleY:number;scaleZ:number};
   tunerPivot.position.set(PIVOT.x+v.x,PIVOT.y+v.y,PIVOT.z+v.z);
   tunerPivot.rotation.set(T.MathUtils.degToRad(v.rotX),T.MathUtils.degToRad(v.rotY),T.MathUtils.degToRad(v.rotZ));
   const sa=v.scaleAll;tunerPivot.scale.set(sa*v.scaleX,sa*v.scaleY,sa*v.scaleZ);
   dirty=true;
  };
  window.addEventListener('atlas-mesh-tune',handleTune);`;

if (!c.includes(afterControls)) {
  console.error('afterControls not found!');
  process.exit(1);
}
c = c.replace(afterControls, tunerListener);
console.log('atlas-mesh-tune listener added');

// Clean up listener on dispose: add window.removeEventListener to the cleanup
const oldCleanup = `  return()=>{disposed=true;abort.abort();`;
const newCleanup = `  return()=>{disposed=true;abort.abort();window.removeEventListener('atlas-mesh-tune',handleTune);`;
if (!c.includes(oldCleanup)) {
  console.error('cleanup not found!');
  process.exit(1);
}
c = c.replace(oldCleanup, newCleanup);
console.log('cleanup updated with removeEventListener');

// Now fix the animate loop: for female-10 parts (isFemaleRepro), always set dx/dy/dz=0
// because tunerPivot controls their world position, not the vertex shader offset.
// We need to identify female-10 part indices. The parts in chunk 10 have system='reproductive'.
// But we can't rely on system alone. We need to check chunk membership.
// 
// Simplest: add a Set<number> of female-10 part indices after loading
// OR: add a tunerPartIndices ref that loadChunk populates
//
// Add a Set before loadChunk:
const beforeLoadChunk = `  let loaded=0;
  const loadChunk=async(ci:number)=>{`;
const withTunerSet = `  let loaded=0;
  const tunerPartIndices=new Set<number>(); // parts belonging to female-10.bin (controlled by tunerPivot)
  const loadChunk=async(ci:number)=>{`;
if (!c.includes(beforeLoadChunk)) {
  console.error('beforeLoadChunk not found!');
  const idx = c.indexOf('let loaded=0');
  console.log('context:', c.substring(idx-30, idx+100));
  process.exit(1);
}
c = c.replace(beforeLoadChunk, withTunerSet);
console.log('tunerPartIndices Set added');

// In the forEach loop, when isFRC, add i to tunerPartIndices
const oldPickerSetup = `    if(isFRC)tunerGroup.add(pick);`;
const newPickerSetup = `    if(isFRC){tunerPartIndices.add(i);}`;
if (!c.includes(oldPickerSetup)) {
  console.error('oldPickerSetup not found!');
  process.exit(1);
}
c = c.replace(oldPickerSetup, newPickerSetup);
console.log('tunerPartIndices.add(i) added for FRC parts');

// In animate loop data.set: for tunerPartIndices parts, set dx=dy=dz=0
// so the vertex shader doesn't also offset them (tunerPivot handles position)
const oldDataSet = `     const selected=selection.has(p.id);data.set([dx,dy,dz,(s.isolate?selected:visible.has(p.system)||selected)?1:0],i*4);`;
const newDataSet = `     const selected=selection.has(p.id);const isFRCPart=tunerPartIndices.has(i);data.set([isFRCPart?0:dx,isFRCPart?0:dy,isFRCPart?0:dz,(s.isolate?selected:visible.has(p.system)||selected)?1:0],i*4);`;
if (!c.includes(oldDataSet)) {
  console.error('oldDataSet not found!');
  const idx = c.indexOf('const selected=selection.has');
  console.log('context:', c.substring(idx-30, idx+150));
  process.exit(1);
}
c = c.replace(oldDataSet, newDataSet);
console.log('animate loop: tuner parts get dx/dy/dz=0 (position handled by tunerPivot)');

fs.writeFileSync('app/scene.tsx', c, 'utf8');
console.log('\nAll patches applied! Lines:', c.split('\n').length);
