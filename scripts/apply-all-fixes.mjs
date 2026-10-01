import fs from 'fs';

// ==========================================
// 1. Fix atlas-female.json: Vagina in Reproductive Concepts
// ==========================================
console.log('--- 1. Updating atlas-female.json ---');
const atlasPath = 'public/models/atlas-female.json';
const atlas = JSON.parse(fs.readFileSync(atlasPath, 'utf8'));

// Find VH_F_vagina and make sure its conceptId is HRA:VH_F_vagina
const vagPart = atlas.parts.find(p => p.id === 'VH_F_vagina');
if (vagPart) {
  vagPart.conceptId = 'HRA:VH_F_vagina';
  vagPart.system = 'reproductive';
  console.log('VH_F_vagina conceptId set to HRA:VH_F_vagina');
}

// Ensure HRA:VH_F_vagina concept exists in concepts list
let vagConcept = atlas.concepts.find(c => c.id === 'HRA:VH_F_vagina');
if (vagConcept) {
  if (!vagConcept.elements.includes('VH_F_vagina')) {
    vagConcept.elements.push('VH_F_vagina');
  }
} else {
  atlas.concepts.push({
    id: 'HRA:VH_F_vagina',
    name: 'vagina',
    elements: ['VH_F_vagina']
  });
  console.log('Added HRA:VH_F_vagina concept');
}

// Also ensure UBERON:0000996 points to vagina if referenced
let uberonConcept = atlas.concepts.find(c => c.id === 'UBERON:0000996');
if (!uberonConcept) {
  atlas.concepts.push({
    id: 'UBERON:0000996',
    name: 'vagina',
    elements: ['VH_F_vagina']
  });
}

fs.writeFileSync(atlasPath, JSON.stringify(atlas, null, 2), 'utf8');
console.log('atlas-female.json saved successfully');

// ==========================================
// 2. Fix app/page.tsx: Defaults & Dots Toggle
// ==========================================
console.log('\n--- 2. Updating app/page.tsx ---');
let pageContent = fs.readFileSync('app/page.tsx', 'utf8');
const pageCRLF = pageContent.includes('\r\n');
pageContent = pageContent.replace(/\r\n/g, '\n');

// Add vagina to defaults
if (!pageContent.includes("'vagina',")) {
  pageContent = pageContent.replace(
    "?['heart','brain','liver','uterus','ovary'",
    "?['heart','brain','liver','uterus','vagina','ovary'"
  );
  console.log('Added vagina to search defaults');
}

// Add Dots toggle in bottom dock
const oldDockReset = `<Button variant="ghost" className="dock-reset" onClick={reset} aria-label="Assemble and reset"><RotateCcw size={18}/><span>Reset</span></Button>`;
const newDockWithDots = `{state.explode > 0.05 && (
     <Button
      variant="ghost"
      className="dock-reset"
      onClick={()=>setState(s=>({...s,showDots:s.showDots===false?true:false}))}
      title={state.showDots===false?'Show inspection dots':'Hide inspection dots (bare exploded view)'}
      aria-label="Toggle inspection dots"
      style={{color:state.showDots===false?'#94a3b8':'#38bdf8',display:'flex',alignItems:'center',gap:'5px'}}
     >
      <CircleDot size={18}/>
      <span style={{fontSize:'12px'}}>{state.showDots===false?'Dots: Off':'Dots: On'}</span>
     </Button>
    )}
    ${oldDockReset}`;

if (!pageContent.includes('showDots===false') && pageContent.includes(oldDockReset)) {
  pageContent = pageContent.replace(oldDockReset, newDockWithDots);
  console.log('Added showDots toggle to bottom dock in page.tsx');
}

if (pageCRLF) pageContent = pageContent.replace(/\n/g, '\r\n');
fs.writeFileSync('app/page.tsx', pageContent, 'utf8');

// ==========================================
// 3. Fix app/scene.tsx: Texture, Exploded View, Blue Dots
// ==========================================
console.log('\n--- 3. Updating app/scene.tsx ---');
let sceneContent = fs.readFileSync('app/scene.tsx', 'utf8');
const sceneCRLF = sceneContent.includes('\r\n');
sceneContent = sceneContent.replace(/\r\n/g, '\n');

// 3A: Texture loading and material definition
// Make sure texture is loaded with proper needsUpdate, pure white diffuse color, and no blown-out emissive
const oldTexBlock = `  const texLoader=new T.TextureLoader();
  const uterusTex=texLoader.load('/models/textures/uterus_xsection.jpg',()=>{dirty=true;});
  uterusTex.colorSpace=T.SRGBColorSpace;
  uterusTex.flipY=false;
  const chunk10Material=new T.MeshStandardMaterial({
   map:uterusTex,
   emissiveMap:uterusTex,
   emissive:new T.Color(.38,.26,.22),
   roughness:.62,
   metalness:.03,
   side:T.DoubleSide,
  });
  chunk10Material.onBeforeCompile=shader=>{
   shader.uniforms.partState={value:partTexture};shader.uniforms.selectionState={value:selectionTexture};shader.uniforms.stateWidth={value:width};
   shader.vertexShader='attribute float partIndex; uniform sampler2D partState; uniform sampler2D selectionState; uniform float stateWidth; varying float partVisible; varying float partSelected;\\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\\nvec2 stateUv = vec2((partIndex + 0.5) / stateWidth, 0.5); vec4 state = texture2D(partState, stateUv); transformed += state.xyz; partVisible = state.w; partSelected = texture2D(selectionState, stateUv).r;');
   shader.fragmentShader='varying float partVisible; varying float partSelected;\\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\\nif (partVisible < 0.5) discard;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42, 0.85, 0.78), partSelected * 0.75);');
  };materials.push(chunk10Material);`;

const newTexBlock = `  const texLoader=new T.TextureLoader();
  const uterusTex=texLoader.load('/models/textures/uterus_xsection.jpg',(tex)=>{
   tex.needsUpdate=true;
   chunk10Material.needsUpdate=true;
   dirty=true;
  });
  uterusTex.colorSpace=T.SRGBColorSpace;
  uterusTex.flipY=false;
  const chunk10Material=new T.MeshStandardMaterial({
   map:uterusTex,
   color:new T.Color(0xffffff),
   roughness:.55,
   metalness:.02,
   side:T.DoubleSide,
  });
  chunk10Material.onBeforeCompile=shader=>{
   shader.uniforms.partState={value:partTexture};shader.uniforms.selectionState={value:selectionTexture};shader.uniforms.stateWidth={value:width};
   shader.vertexShader='attribute float partIndex; uniform sampler2D partState; uniform sampler2D selectionState; uniform float stateWidth; varying float partVisible; varying float partSelected;\\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\\nvec2 stateUv = vec2((partIndex + 0.5) / stateWidth, 0.5); vec4 state = texture2D(partState, stateUv); transformed += state.xyz; partVisible = state.w; partSelected = texture2D(selectionState, stateUv).r;');
   shader.fragmentShader='varying float partVisible; varying float partSelected;\\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\\nif (partVisible < 0.5) discard;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42, 0.85, 0.78), partSelected * 0.25);');
  };materials.push(chunk10Material);`;

if (sceneContent.includes(oldTexBlock)) {
  sceneContent = sceneContent.replace(oldTexBlock, newTexBlock);
  console.log('Updated chunk10Material & texture loading in scene.tsx');
} else {
  console.log('oldTexBlock exact match not found, looking for partial...');
  const idx = sceneContent.indexOf('const texLoader=new T.TextureLoader()');
  const endIdx = sceneContent.indexOf('materials.push(chunk10Material);');
  if (idx !== -1 && endIdx !== -1) {
    sceneContent = sceneContent.substring(0, idx) + newTexBlock.trim() + sceneContent.substring(endIdx + 'materials.push(chunk10Material);'.length);
    console.log('Replaced chunk10Material block by indices');
  }
}

// 3B: Store latest tuner values so animate loop can blend them during explosion
const oldTunerDef = `  const applyTune=(v:{x?:number;y?:number;z?:number;rotX?:number;rotY?:number;rotZ?:number;scaleAll?:number;scaleX?:number;scaleY?:number;scaleZ?:number})=>{`;
const newTunerDef = `  let currentTuner = {x:0,y:0,z:0,rotX:0,rotY:0,rotZ:0,scaleAll:1.0,scaleX:1.0,scaleY:1.0,scaleZ:1.0};
  const applyTune=(v:{x?:number;y?:number;z?:number;rotX?:number;rotY?:number;rotZ?:number;scaleAll?:number;scaleX?:number;scaleY?:number;scaleZ?:number})=>{
   if(!v)return;
   currentTuner={x:v.x??0,y:v.y??0,z:v.z??0,rotX:v.rotX??0,rotY:v.rotY??0,rotZ:v.rotZ??0,scaleAll:v.scaleAll??1.0,scaleX:v.scaleX??1.0,scaleY:v.scaleY??1.0,scaleZ:v.scaleZ??1.0};`;

if (!sceneContent.includes('currentTuner') && sceneContent.includes(oldTunerDef)) {
  sceneContent = sceneContent.replace(oldTunerDef, newTunerDef);
  console.log('Added currentTuner tracking');
}

// 3C: Animate loop:
// - Blend tunerPivot transforms to PIVOT when amount > 0
// - Allow dx,dy,dz for all parts (including isFRCPart) so they explode neatly in the grid!
// - Toggle markers (blue dots) based on s.showDots
const oldAnimateData = `const selected=selection.has(p.id);const isFRCPart=tunerPartIndices.has(i);data.set([isFRCPart?0:dx,isFRCPart?0:dy,isFRCPart?0:dz,(s.isolate?selected:visible.has(p.system)||selected)?1:0],i*4);`;
const newAnimateData = `const selected=selection.has(p.id);data.set([dx,dy,dz,(s.isolate?selected:visible.has(p.system)||selected)?1:0],i*4);`;

if (sceneContent.includes(oldAnimateData)) {
  sceneContent = sceneContent.replace(oldAnimateData, newAnimateData);
  console.log('Enabled explosion dx,dy,dz for female reproductive parts');
}

// Animate loop: picker positioning for all parts
const oldPickPos = `const mesh=pickers[i];if(mesh&&!isFRCPart){mesh.position.set(dx,dy,dz);mesh.updateMatrix();mesh.updateMatrixWorld(true);}`;
const newPickPos = `const mesh=pickers[i];if(mesh){mesh.position.set(dx,dy,dz);mesh.updateMatrix();mesh.updateMatrixWorld(true);}`;

if (sceneContent.includes(oldPickPos)) {
  sceneContent = sceneContent.replace(oldPickPos, newPickPos);
  console.log('Updated picker positioning for exploded view');
}

// Animate loop: blend tunerPivot based on explode amount
const oldMovingCheck = `   if(moving){amount=T.MathUtils.damp(amount,s.explode,8,dt);dirty=true;}`;
const newMovingCheck = `   if(moving){amount=T.MathUtils.damp(amount,s.explode,8,dt);dirty=true;}
   const exT=Math.min(1,amount/.35);
   tunerPivot.position.set(PIVOT.x+T.MathUtils.lerp(currentTuner.x,0,exT),PIVOT.y+T.MathUtils.lerp(currentTuner.y,0,exT),PIVOT.z+T.MathUtils.lerp(currentTuner.z,0,exT));
   tunerPivot.rotation.set(T.MathUtils.degToRad(T.MathUtils.lerp(currentTuner.rotX,0,exT)),T.MathUtils.degToRad(T.MathUtils.lerp(currentTuner.rotY,0,exT)),T.MathUtils.degToRad(T.MathUtils.lerp(currentTuner.rotZ,0,exT)));
   const saT=T.MathUtils.lerp(currentTuner.scaleAll,1.0,exT);
   tunerPivot.scale.set(saT*T.MathUtils.lerp(currentTuner.scaleX,1.0,exT),saT*T.MathUtils.lerp(currentTuner.scaleY,1.0,exT),saT*T.MathUtils.lerp(currentTuner.scaleZ,1.0,exT));`;

if (!sceneContent.includes('const exT=Math.min(1,amount/.35)') && sceneContent.includes(oldMovingCheck)) {
  sceneContent = sceneContent.replace(oldMovingCheck, newMovingCheck);
  console.log('Added tunerPivot explode blending to neutral');
}

// Markers visibility: blue dots toggle
const oldMarkerVis = `markers.visible=amount>.75;`;
const newMarkerVis = `markers.visible=amount>.75&&(s.showDots??true);`;

if (sceneContent.includes(oldMarkerVis)) {
  sceneContent = sceneContent.replace(oldMarkerVis, newMarkerVis);
  console.log('Updated markers.visible to respect showDots');
}

if (sceneCRLF) sceneContent = sceneContent.replace(/\n/g, '\r\n');
fs.writeFileSync('app/scene.tsx', sceneContent, 'utf8');
console.log('app/scene.tsx saved successfully');
