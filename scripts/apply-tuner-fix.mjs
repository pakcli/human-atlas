import fs from 'fs';

let raw = fs.readFileSync('app/scene.tsx', 'utf8');
const isCRLF = raw.includes('\r\n');
let c = raw.replace(/\r\n/g, '\n');

// 1. Tuner setup: add applyTune, storage restore, event listeners
const oldTunerSetup = `  // --- Tuner pivot for repositioning the female reproductive cross-section model ---
  const PIVOT=new T.Vector3(-0.009,.740,-0.065);
  const tunerPivot=new T.Group();tunerPivot.position.copy(PIVOT);scene.add(tunerPivot);
  const tunerGroup=new T.Group();tunerPivot.add(tunerGroup);`;

const newTunerSetup = `  // --- Tuner pivot for repositioning the female reproductive cross-section model ---
  const PIVOT=new T.Vector3(-0.009,.740,-0.065);
  const tunerPivot=new T.Group();tunerPivot.position.copy(PIVOT);scene.add(tunerPivot);
  const tunerGroup=new T.Group();tunerGroup.position.set(-PIVOT.x,-PIVOT.y,-PIVOT.z);tunerPivot.add(tunerGroup);
  const applyTune=(v:{x?:number;y?:number;z?:number;rotX?:number;rotY?:number;rotZ?:number;scaleAll?:number;scaleX?:number;scaleY?:number;scaleZ?:number})=>{
   if(!v)return;
   const x=v.x??0,y=v.y??0,z=v.z??0;
   tunerPivot.position.set(PIVOT.x+x,PIVOT.y+y,PIVOT.z+z);
   tunerPivot.rotation.set(T.MathUtils.degToRad(v.rotX??0),T.MathUtils.degToRad(v.rotY??0),T.MathUtils.degToRad(v.rotZ??0));
   const sa=v.scaleAll??1.0;
   tunerPivot.scale.set(sa*(v.scaleX??1.0),sa*(v.scaleY??1.0),sa*(v.scaleZ??1.0));
   tunerPivot.updateMatrixWorld(true);
   dirty=true;
  };
  try{
   const stored=localStorage.getItem('female_mesh_tuner');
   if(stored)applyTune(JSON.parse(stored));
  }catch{}
  const handleTune=(e:Event)=>{applyTune((e as CustomEvent).detail);};
  window.addEventListener('atlas-mesh-tune',handleTune);
  const handleSnap=(e:Event)=>{
   const detail=(e as CustomEvent).detail as {view:'side'|'bottom'|'front'};
   if(!detail?.view)return;
   const target=PIVOT.clone();
   controls.target.copy(target);
   const offset=new T.Vector3();
   if(detail.view==='side')offset.set(.35,.08,.25);
   else if(detail.view==='bottom')offset.set(0,-.42,.06);
   else if(detail.view==='front')offset.set(0,.02,.45);
   camera.position.copy(target).add(offset);
   controls.update();
   dirty=true;
  };
  window.addEventListener('atlas-camera-snap',handleSnap);`;

if (!c.includes(oldTunerSetup)) {
  console.error('oldTunerSetup not found!');
  process.exit(1);
}
c = c.replace(oldTunerSetup, newTunerSetup);
console.log('Step 1: Tuner setup replaced successfully');

// 2. loadChunk groups.forEach: add mesh to tunerGroup when isChunkFRC
const oldGroupsAdd = `   const isChunkFRC=chunk.url.includes('female-10.bin');
   groups.forEach((gs,system)=>{const geometry=mergeGeometries(gs,false);if(!geometry)throw new Error('Could not assemble anatomy geometry.');geometries.push(geometry);const mesh=new T.Mesh(geometry,isChunkFRC?chunk10Material:mats.get(system as never));mesh.frustumCulled=false;scene.add(mesh);});`;

const newGroupsAdd = `   const isChunkFRC=chunk.url.includes('female-10.bin');
   groups.forEach((gs,system)=>{const geometry=mergeGeometries(gs,false);if(!geometry)throw new Error('Could not assemble anatomy geometry.');geometries.push(geometry);const mesh=new T.Mesh(geometry,isChunkFRC?chunk10Material:mats.get(system as never));mesh.frustumCulled=false;if(isChunkFRC){tunerGroup.add(mesh);}else{scene.add(mesh);}});`;

if (!c.includes(oldGroupsAdd)) {
  console.error('oldGroupsAdd not found!');
  process.exit(1);
}
c = c.replace(oldGroupsAdd, newGroupsAdd);
console.log('Step 2: loadChunk groups.forEach patched');

// 3. pickers in loadChunk: add to tunerGroup when isFRC
const oldPickersAdd = `    if(isFRC)tunerPartIndices.add(i);`;
const newPickersAdd = `    if(isFRC){tunerPartIndices.add(i);tunerGroup.add(pick);}`;

if (!c.includes(oldPickersAdd)) {
  console.error('oldPickersAdd not found!');
  process.exit(1);
}
c = c.replace(oldPickersAdd, newPickersAdd);
console.log('Step 3: pickers add to tunerGroup patched');

// 4. Raycasting in up: use worldBox.setFromObject(mesh) for tuner parts
const oldRaycastTarget = `worldBox.copy(bounds[i]).translate(mesh.position);if(!raycaster.ray.intersectBox(worldBox,hitPoint))return;const hits=raycaster.intersectObject(mesh,false);`;
const newRaycastTarget = `if(tunerPartIndices.has(i)){worldBox.setFromObject(mesh);}else{worldBox.copy(bounds[i]).translate(mesh.position);}if(!raycaster.ray.intersectBox(worldBox,hitPoint))return;const hits=raycaster.intersectObject(mesh,false);`;

if (!c.includes(oldRaycastTarget)) {
  console.error('oldRaycastTarget not found!');
  process.exit(1);
}
c = c.replace(oldRaycastTarget, newRaycastTarget);
console.log('Step 4: raycasting patched');

// 5. animate loop picker update: do not overwrite position of tuner parts
const oldAnimatePicker = `const mesh=pickers[i];if(mesh){mesh.position.set(dx,dy,dz);mesh.updateMatrix();mesh.updateMatrixWorld(true);}`;
const newAnimatePicker = `const mesh=pickers[i];if(mesh&&!isFRCPart){mesh.position.set(dx,dy,dz);mesh.updateMatrix();mesh.updateMatrixWorld(true);}`;

if (!c.includes(oldAnimatePicker)) {
  console.error('oldAnimatePicker not found!');
  process.exit(1);
}
c = c.replace(oldAnimatePicker, newAnimatePicker);
console.log('Step 5: animate picker update patched');

// 6. Cleanup: remove event listeners
const oldCleanup = `  return()=>{disposed=true;abort.abort();cancelAnimationFrame(frame);`;
const newCleanup = `  return()=>{disposed=true;abort.abort();cancelAnimationFrame(frame);window.removeEventListener('atlas-mesh-tune',handleTune);window.removeEventListener('atlas-camera-snap',handleSnap);`;

if (!c.includes(oldCleanup)) {
  console.error('oldCleanup not found!');
  process.exit(1);
}
c = c.replace(oldCleanup, newCleanup);
console.log('Step 6: cleanup patched');

if (isCRLF) {
  c = c.replace(/\n/g, '\r\n');
}

fs.writeFileSync('app/scene.tsx', c, 'utf8');
console.log('All patches saved to app/scene.tsx successfully!');
