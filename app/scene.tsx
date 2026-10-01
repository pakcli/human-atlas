import {useEffect,useRef} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createExplosionLayout} from './explosion-layout';
import {decodeModelResponse} from './model-download';
import {PointerTap} from './pointer-tap';
import {SYSTEMS,DEFAULT_OPACITIES,type Atlas,type SceneState,type SystemId} from './anatomy';
import {getThemePalette} from './theme-engine';
interface Props {atlas:Atlas;state:SceneState;onSelect:(id:string)=>void;onProgress:(n:number)=>void;onError:(s:string)=>void;theme?:"light"|"dark";dockSide?:"left"|"right"}
export default function AnatomyScene({atlas,state,onSelect,onProgress,onError,theme="light",dockSide="right"}:Props){
 const latestDockSide=useRef(dockSide);latestDockSide.current=dockSide;
 const latestTheme=useRef(theme);latestTheme.current=theme;
 const host=useRef<HTMLDivElement>(null),latest=useRef(state),select=useRef(onSelect);
 latest.current=state;select.current=onSelect;
 const triggerRenderRef=useRef<()=>void>(()=>{});
 useEffect(()=>{
  triggerRenderRef.current();
 },[state,theme,dockSide]);
 useEffect(()=>{
  const el=host.current!;let disposed=false,frame=0,dirty=true,ready=false,lastView='',lastReset=-1,lastIsolate='',layoutKey='',amount=latest.current.explode;
  let lastState:SceneState|null=null,lastThemeKey='';
  triggerRenderRef.current=()=>{dirty=true;};
  const abort=new AbortController();
  let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch{onError('This browser could not start the 3D viewer. Please try a browser with WebGL enabled.');return;}
  const initPalette = getThemePalette(latest.current.accentTheme ?? 'navy_blue', latestTheme.current, latest.current.customAccentColor ?? '#38bdf8');
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<768?1.5:2));renderer.setClearColor(initPalette.bgCanvas);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;el.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Interactive human anatomy. Drag to orbit, pinch or scroll to zoom, and tap a structure to inspect it.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.005,100),controls=new OrbitControls(camera,renderer.domElement);
  if(latest.current.cameraPos && latest.current.cameraTarget){
   camera.position.set(latest.current.cameraPos[0],latest.current.cameraPos[1],latest.current.cameraPos[2]);
   controls.target.set(latest.current.cameraTarget[0],latest.current.cameraTarget[1],latest.current.cameraTarget[2]);
  }else{
   camera.position.set(1.32,1.08,3.77);controls.target.set(0,.86,0);
  }
  controls.enableDamping=true;controls.dampingFactor=.085;controls.minDistance=.07;controls.maxDistance=40;controls.maxPolarAngle=Math.PI*.96;
  controls.screenSpacePanning=true;controls.enablePan=true;controls.enableRotate=true;
  controls.mouseButtons={LEFT:T.MOUSE.ROTATE,MIDDLE:T.MOUSE.DOLLY,RIGHT:T.MOUSE.PAN};
  controls.touches={ONE:T.TOUCH.ROTATE,TWO:T.TOUCH.DOLLY_PAN};
  const calcNavUpdate=()=>{
   if(!ready)return;
   let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
   let hasVis=false;
   for(let i=0;i<atlas.parts.length;i++){
    if(data[i*4+3]>.5){
     const b=bounds[i];
     const dx=data[i*4],dy=data[i*4+1];
     if(b.min.x+dx<minX)minX=b.min.x+dx;
     if(b.max.x+dx>maxX)maxX=b.max.x+dx;
     if(b.min.y+dy<minY)minY=b.min.y+dy;
     if(b.max.y+dy>maxY)maxY=b.max.y+dy;
     hasVis=true;
    }
   }
   if(!hasVis)return;
   const D=camera.position.distanceTo(controls.target);
   const halfFovRad=T.MathUtils.degToRad(camera.fov/2);
   const frustumH=2*D*Math.tan(halfFovRad);
   const frustumW=frustumH*camera.aspect;

   const boxW=maxX-minX;
   const boxH=maxY-minY;
   const centerX=(minX+maxX)/2;
   const centerY=(minY+maxY)/2;

   const overflowX=boxW>frustumW*1.05;
   const overflowY=boxH>frustumH*1.05;

   const travelX=Math.max(0.01,(boxW-frustumW*.85)/2);
   const travelY=Math.max(0.01,(boxH-frustumH*.85)/2);

   const tx=overflowX?Math.max(0,Math.min(1,0.5+(controls.target.x-centerX)/(2*travelX))):0.5;
   const ty=overflowY?Math.max(0,Math.min(1,0.5+(controls.target.y-centerY)/(2*travelY))):0.5;

   window.dispatchEvent(new CustomEvent('atlas-nav-update',{
    detail:{overflowX,overflowY,tx,ty}
   }));
  };
  const syncCam=()=>{
   (window as unknown as {__atlas_camera?:{pos:[number,number,number];target:[number,number,number]}}).__atlas_camera={
    pos:[parseFloat(camera.position.x.toFixed(2)),parseFloat(camera.position.y.toFixed(2)),parseFloat(camera.position.z.toFixed(2))],
    target:[parseFloat(controls.target.x.toFixed(2)),parseFloat(controls.target.y.toFixed(2)),parseFloat(controls.target.z.toFixed(2))],
   };
   calcNavUpdate();
  };
  syncCam();
  controls.addEventListener('change',()=>{dirty=true;syncCam();});
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xffffff,0xa7acb2,1.05));
  const key=new T.DirectionalLight(0xfffaf4,2.3);key.position.set(-2,4,3);scene.add(key);
  const rim=new T.DirectionalLight(0xe9f0ff,1.8);rim.position.set(2,2,-3);scene.add(rim);
  const platform=new T.Mesh(new T.CylinderGeometry(.68,.7,.028,100),new T.MeshStandardMaterial({color:initPalette.bgPlatform,metalness:.12,roughness:.67}));platform.position.y=-.016;scene.add(platform);
  const ring=new T.Mesh(new T.RingGeometry(.63,.632,128),new T.MeshBasicMaterial({color:initPalette.ringOuter,transparent:true,opacity:.4,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.001;scene.add(ring);
  const innerRing=new T.Mesh(new T.RingGeometry(.55,.551,128),new T.MeshBasicMaterial({color:initPalette.ringInner,transparent:true,opacity:.16,side:T.DoubleSide}));innerRing.rotation.x=-Math.PI/2;innerRing.position.y=.001;scene.add(innerRing);
  const width=T.MathUtils.ceilPowerOfTwo(atlas.parts.length),data=new Float32Array(width*4),partTexture=new T.DataTexture(data,width,1,T.RGBAFormat,T.FloatType);partTexture.needsUpdate=true;
  const selectedData=new Uint8Array(width*4),selectionTexture=new T.DataTexture(selectedData,width,1);selectionTexture.needsUpdate=true;
  const materials:T.Material[]=[],geometries:T.BufferGeometry[]=[],pickers:(T.Mesh|undefined)[]=[],centers=atlas.parts.map(p=>new T.Vector3().fromArray(p.bounds[0]).add(new T.Vector3().fromArray(p.bounds[1])).multiplyScalar(.5));
  const offsets:T.Vector3[]=[],bounds=atlas.parts.map(p=>new T.Box3(new T.Vector3().fromArray(p.bounds[0]),new T.Vector3().fromArray(p.bounds[1])));
  let packingWidth=1,packingHeight=1;
  const markerPositions=new Float32Array(atlas.parts.length*3),markerGeometry=new T.BufferGeometry();markerGeometry.setAttribute('position',new T.BufferAttribute(markerPositions,3));
  const markerMaterial=new T.PointsMaterial({color:0x64748b,size:5,sizeAttenuation:false,transparent:true,opacity:.72,depthTest:false});
  markerMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;');};
  const markers=new T.Points(markerGeometry,markerMaterial);markers.frustumCulled=false;markers.renderOrder=10;markers.visible=false;scene.add(markers);
  const hover=document.createElement('div');hover.className='part-hover';hover.setAttribute('role','tooltip');hover.hidden=true;el.appendChild(hover);
  type Target={index:number;x:number;y:number;left:number;right:number;top:number;bottom:number};let targets:Target[]=[];
  const projected=new T.Vector3();
  const findTarget=(x:number,y:number,radius:number)=>{
   let best=-1,score=Infinity;
   for(const t of targets){const dx=Math.max(t.left-x,0,x-t.right),dy=Math.max(t.top-y,0,y-t.bottom),distance=Math.hypot(dx,dy);if(distance>radius)continue;const candidate=distance+Math.hypot(t.x-x,t.y-y)*.025;if(candidate<score){score=candidate;best=t.index;}}
   return best;
  };
  const materialFor=(system:string)=>{
   const defaultOp = DEFAULT_OPACITIES[system as SystemId] ?? 1.0;
   const m=new T.MeshStandardMaterial({color:SYSTEMS.find(s=>s.id===system)?.color??'#aebbb8',metalness:.08,roughness:.53,side:T.DoubleSide,transparent:defaultOp < 0.999,opacity:defaultOp,depthWrite:defaultOp >= 0.999});
   m.onBeforeCompile=shader=>{
    shader.uniforms.partState={value:partTexture};shader.uniforms.selectionState={value:selectionTexture};shader.uniforms.stateWidth={value:width};
    shader.vertexShader='attribute float partIndex; uniform sampler2D partState; uniform sampler2D selectionState; uniform float stateWidth; varying float partVisible; varying float partSelected;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvec2 stateUv = vec2((partIndex + 0.5) / stateWidth, 0.5); vec4 state = texture2D(partState, stateUv); transformed += state.xyz; partVisible = state.w; partSelected = texture2D(selectionState, stateUv).r;');
    shader.fragmentShader='varying float partVisible; varying float partSelected;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (partVisible < 0.5) discard;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42, 0.85, 0.78), partSelected * 0.75);');
   };materials.push(m);return m;
  };
  const mats=new Map(SYSTEMS.map(s=>[s.id,materialFor(s.id)]));
  // --- Sketchfab female reproductive cross-section texture ---
  // glTF UVs: V=0 at top. flipY=false keeps them compatible with WebGL without double-flip.
  // emissiveMap is added because in this Three.js build map_fragment runs BEFORE color_fragment
  // (line 86 vs 87 in the compiled frag shader), so the texture written in map_fragment would
  // be overwritten by our color_fragment injection. emissiveMap bypasses that pipeline.
  const texLoader=new T.TextureLoader();
  const uterusTex=texLoader.load('/models/textures/uterus_xsection.jpg',(tex)=>{
   tex.needsUpdate=true;
   chunk10Material.needsUpdate=true;
   dirty=true;
  });
  uterusTex.colorSpace=T.SRGBColorSpace;
  uterusTex.flipY=false;
  const repDefOp = DEFAULT_OPACITIES['reproductive'] ?? 1.0;
  const chunk10Material=new T.MeshStandardMaterial({
   map:uterusTex,
   color:new T.Color(0xffffff),
   roughness:.55,
   metalness:.02,
   side:T.DoubleSide,
   transparent:repDefOp < 0.999,
   opacity:repDefOp,
   depthWrite:repDefOp >= 0.999,
  });
  chunk10Material.onBeforeCompile=shader=>{
   shader.uniforms.partState={value:partTexture};shader.uniforms.selectionState={value:selectionTexture};shader.uniforms.stateWidth={value:width};
   shader.vertexShader='attribute float partIndex; uniform sampler2D partState; uniform sampler2D selectionState; uniform float stateWidth; varying float partVisible; varying float partSelected;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvec2 stateUv = vec2((partIndex + 0.5) / stateWidth, 0.5); vec4 state = texture2D(partState, stateUv); transformed += state.xyz; partVisible = state.w; partSelected = texture2D(selectionState, stateUv).r;');
   shader.fragmentShader='varying float partVisible; varying float partSelected;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (partVisible < 0.5) discard;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42, 0.85, 0.78), partSelected * 0.25);');
  };materials.push(chunk10Material);
  // --- Tuner pivot for repositioning the female reproductive cross-section model ---
  const PIVOT=new T.Vector3(-0.009,.740,-0.065);
  const tunerPivot=new T.Group();tunerPivot.position.copy(PIVOT);scene.add(tunerPivot);
  const tunerGroup=new T.Group();tunerGroup.position.set(-PIVOT.x,-PIVOT.y,-PIVOT.z);tunerPivot.add(tunerGroup);
  let currentTuner = {x:0,y:0,z:0,rotX:0,rotY:0,rotZ:0,scaleAll:1.0,scaleX:1.0,scaleY:1.0,scaleZ:1.0};
  const applyTune=(v:{x?:number;y?:number;z?:number;rotX?:number;rotY?:number;rotZ?:number;scaleAll?:number;scaleX?:number;scaleY?:number;scaleZ?:number})=>{
   if(!v)return;
   currentTuner={x:v.x??0,y:v.y??0,z:v.z??0,rotX:v.rotX??0,rotY:v.rotY??0,rotZ:v.rotZ??0,scaleAll:v.scaleAll??1.0,scaleX:v.scaleX??1.0,scaleY:v.scaleY??1.0,scaleZ:v.scaleZ??1.0};
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
  window.addEventListener('atlas-camera-snap',handleSnap);
  const handlePanX=(e:Event)=>{
   const d=(e as CustomEvent).detail as {val:number};
   if(typeof d?.val!=='number')return;
   let minX=Infinity,maxX=-Infinity;let hasVis=false;
   for(let i=0;i<atlas.parts.length;i++){
    if(data[i*4+3]>.5){
     const b=bounds[i],dx=data[i*4];
     if(b.min.x+dx<minX)minX=b.min.x+dx;
     if(b.max.x+dx>maxX)maxX=b.max.x+dx;
     hasVis=true;
    }
   }
   if(!hasVis)return;
   const D=camera.position.distanceTo(controls.target);
   const frustumW=2*D*Math.tan(T.MathUtils.degToRad(camera.fov/2))*camera.aspect;
   const boxW=maxX-minX,centerX=(minX+maxX)/2;
   const travelX=Math.max(0.01,(boxW-frustumW*.85)/2);
   const newTargetX=centerX+T.MathUtils.lerp(-travelX,travelX,d.val);
   const deltaX=newTargetX-controls.target.x;
   controls.target.x+=deltaX;
   camera.position.x+=deltaX;
   controls.update();
   dirty=true;
   syncCam();
  };
  window.addEventListener('atlas-pan-x',handlePanX);

  const handlePanY=(e:Event)=>{
   const d=(e as CustomEvent).detail as {val:number};
   if(typeof d?.val!=='number')return;
   let minY=Infinity,maxY=-Infinity;let hasVis=false;
   for(let i=0;i<atlas.parts.length;i++){
    if(data[i*4+3]>.5){
     const b=bounds[i],dy=data[i*4+1];
     if(b.min.y+dy<minY)minY=b.min.y+dy;
     if(b.max.y+dy>maxY)maxY=b.max.y+dy;
     hasVis=true;
    }
   }
   if(!hasVis)return;
   const D=camera.position.distanceTo(controls.target);
   const frustumH=2*D*Math.tan(T.MathUtils.degToRad(camera.fov/2));
   const boxH=maxY-minY,centerY=(minY+maxY)/2;
   const travelY=Math.max(0.01,(boxH-frustumH*.85)/2);
   const newTargetY=centerY+T.MathUtils.lerp(-travelY,travelY,d.val);
   const deltaY=newTargetY-controls.target.y;
   controls.target.y+=deltaY;
   camera.position.y+=deltaY;
   controls.update();
   dirty=true;
   syncCam();
  };
  window.addEventListener('atlas-pan-y',handlePanY);

  const handleFitAll=()=>{
   fit(latest.current.view,amount);
  };
  window.addEventListener('atlas-fit-all',handleFitAll);
  let loaded=0;
  const tunerPartIndices=new Set<number>(); // parts in female-10.bin - position via tunerPivot, not shader offset
  const loadChunk=async(ci:number)=>{
   const chunk=atlas.chunks[ci],compressed=!!chunk.gzip&&typeof DecompressionStream!=='undefined';const response=await fetch(compressed?chunk.gzip!:chunk.url,{signal:abort.signal});const buffer=await decodeModelResponse(response,chunk.bytes,compressed);if(disposed)return;
   const groups=new Map<string,T.BufferGeometry[]>();
   atlas.parts.forEach((p,i)=>{
    if(p.chunk!==ci)return;
    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,p.positions,p.vertexCount*3),3));
    // GPU normalized signed-short normals keep the complete atlas compact in memory.
    g.setAttribute('normal',new T.BufferAttribute(new Int16Array(buffer,p.normals,p.vertexCount*3),3,true));g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,p.indices,p.indexCount),1));
    if((p as {uvs?:number}).uvs!==undefined)g.setAttribute('uv',new T.BufferAttribute(new Float32Array(buffer,(p as {uvs:number}).uvs,p.vertexCount*2),2));
    const isFRC=chunk.url.includes('female-10.bin');
    g.boundingBox=bounds[i].clone();g.computeBoundingSphere();const pick=new T.Mesh(g);pick.matrixAutoUpdate=isFRC;pickers[i]=pick;geometries.push(g);
    if(isFRC){tunerPartIndices.add(i);tunerGroup.add(pick);}
    g.setAttribute('partIndex',new T.BufferAttribute(new Float32Array(p.vertexCount).fill(i),1));
    const list=groups.get(p.system)??[];list.push(g);groups.set(p.system,list);
   });
   const isChunkFRC=chunk.url.includes('female-10.bin');
   groups.forEach((gs,system)=>{const geometry=mergeGeometries(gs,false);if(!geometry)throw new Error('Could not assemble anatomy geometry.');geometries.push(geometry);const mesh=new T.Mesh(geometry,isChunkFRC?chunk10Material:mats.get(system as never));mesh.frustumCulled=false;if(system==='integumentary')mesh.renderOrder=100;if(isChunkFRC){tunerGroup.add(mesh);}else{scene.add(mesh);}});
   lastState=null;loaded++;onProgress(Math.round(loaded/atlas.chunks.length*100));dirty=true;
  };
  (async()=>{try{let cursor=0;await Promise.all(Array.from({length:3},async()=>{while(cursor<atlas.chunks.length){const i=cursor++;await loadChunk(i);}}));if(!disposed){ready=true;dirty=true;}}catch(e){if(!disposed)onError(e instanceof Error?e.message:'Could not load the anatomy.');}})();
  const fit=(view:string,expAmount=0)=>{
    const aspect=camera.aspect,mobile=el.clientWidth<768;
    const reservedHeight=mobile?(el.clientHeight<520?30:96):270;
    const reservedWidth=mobile?84:360;

    const availableHeight=Math.max(160,el.clientHeight-reservedHeight);
    const availableWidth=Math.max(160,el.clientWidth-reservedWidth);
    const availableAspect=availableWidth/availableHeight;
    const halfFovRad=T.MathUtils.degToRad(camera.fov/2);

    const curW=T.MathUtils.lerp(0.54,packingWidth,expAmount);
    const curH=T.MathUtils.lerp(1.723,packingHeight,expAmount);

    const distH=curH/(2*Math.tan(halfFovRad))*(el.clientHeight/availableHeight);
    const distW=(curW/availableAspect)/(2*Math.tan(halfFovRad))*(el.clientHeight/availableHeight);
    const requiredDist=Math.max(distH,distW)*1.18;

    const normalDistance=mobile?Math.max(3.8,1.8*el.clientHeight/Math.max(160,el.clientHeight-(el.clientHeight<520?30:160))/(2*Math.tan(halfFovRad))):4;
    const distance=Math.max(normalDistance,requiredDist);

    const currentDock=latestDockSide.current||'right';
    const frustumW=2*distance*Math.tan(halfFovRad)*camera.aspect;
    const pixelShiftX=mobile?(currentDock==='right'?-32:32):-38;
    const worldShiftX=(pixelShiftX/el.clientWidth)*frustumW;

    const targetX=worldShiftX+(expAmount>.1&&el.clientWidth>767?-packingWidth*.06:0);
    controls.target.set(targetX,expAmount>.1?.88:(mobile?.85:.86),0);

    const direction=view==='front'?new T.Vector3(0,.02,1):view==='back'?new T.Vector3(0,.02,-1):view==='side'?new T.Vector3(1,.02,0):new T.Vector3(.35,.06,1).normalize();
    camera.position.copy(controls.target).addScaledVector(direction,distance);
    controls.update();dirty=true;
   };
  const resize=()=>{layoutKey='';lastState=null;renderer.setPixelRatio(Math.min(devicePixelRatio,el.clientWidth<768||el.clientHeight<600?1.5:2));camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);fit(latest.current.view,amount);};const observer=new ResizeObserver(resize);observer.observe(el);
  const raycaster=new T.Raycaster(),pointer=new T.Vector2(),tap=new PointerTap(),worldBox=new T.Box3(),hitPoint=new T.Vector3();
  const planePoint1=new T.Vector3(),planePoint2=new T.Vector3(),panCoord=new T.Vector2();
  const getLibraryPlanePoint=(cx:number,cy:number,out:T.Vector3):boolean=>{
   const rect=el.getBoundingClientRect();
   const ndcX=((cx-rect.left)/rect.width)*2-1;
   const ndcY=-((cy-rect.top)/rect.height)*2+1;
   panCoord.set(ndcX,ndcY);
   raycaster.setFromCamera(panCoord,camera);
   const ray=raycaster.ray;
   if(Math.abs(ray.direction.z)<1e-4)return false;
   const t=-ray.origin.z/ray.direction.z;
   if(t<0)return false;
   out.copy(ray.origin).addScaledVector(ray.direction,t);
   return true;
  };
  const panLibraryPlane=(dx:number,dy:number,cx:number,cy:number)=>{
   const ok1=getLibraryPlanePoint(cx-dx,cy-dy,planePoint1);
   const ok2=getLibraryPlanePoint(cx,cy,planePoint2);
   if(ok1&&ok2){
    const deltaX=planePoint2.x-planePoint1.x;
    const deltaY=planePoint2.y-planePoint1.y;
    controls.target.x-=deltaX;
    controls.target.y-=deltaY;
    camera.position.x-=deltaX;
    camera.position.y-=deltaY;
   }else{
    const dist=camera.position.distanceTo(controls.target);
    const factor=(2*dist*Math.tan(T.MathUtils.degToRad(camera.fov/2)))/el.clientHeight;
    controls.target.x-=dx*factor;
    controls.target.y+=dy*factor;
    camera.position.x-=dx*factor;
    camera.position.y+=dy*factor;
   }
   controls.target.z=0;
   controls.update();
   dirty=true;
  };
  let isPanningAisle=false,lastPanX=0,lastPanY=0;
  const touchCoords=new Map<number,{x:number;y:number}>();
  let lastTouchMidX=0,lastTouchMidY=0,lastTouchDist=0;
  const down=(e:PointerEvent)=>{
   hover.hidden=true;
   tap.down(e.pointerId,e.clientX,e.clientY,e.pointerType==='touch'?12:5);
   if(e.pointerType==='touch'){
    touchCoords.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(touchCoords.size>=2){
     const pts=Array.from(touchCoords.values());
     lastTouchMidX=(pts[0].x+pts[1].x)/2;
     lastTouchMidY=(pts[0].y+pts[1].y)/2;
     lastTouchDist=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);
     if(amount>.4&&!latest.current.isolate){
      isPanningAisle=true;
      e.stopImmediatePropagation();
     }
    }else{
     isPanningAisle=false;
    }
   }else{
    const isMousePan=e.ctrlKey||e.shiftKey||e.button===2||(e.buttons&2)!==0;
    if(amount>.4&&isMousePan&&!latest.current.isolate){
     isPanningAisle=true;
     lastPanX=e.clientX;
     lastPanY=e.clientY;
     e.stopImmediatePropagation();
    }else{
     isPanningAisle=false;
    }
   }
  };
  const move=(e:PointerEvent)=>{
   tap.move(e.pointerId,e.clientX,e.clientY);
   if(e.pointerType==='touch'){
    touchCoords.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(touchCoords.size>=2&&amount>.4&&!latest.current.isolate){
     const pts=Array.from(touchCoords.values());
     const midX=(pts[0].x+pts[1].x)/2;
     const midY=(pts[0].y+pts[1].y)/2;
     const dist=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);
     const dx=midX-lastTouchMidX;
     const dy=midY-lastTouchMidY;
     lastTouchMidX=midX;
     lastTouchMidY=midY;
     if(Math.abs(dx)>0.1||Math.abs(dy)>0.1){
      panLibraryPlane(dx,dy,midX,midY);
     }
     if(lastTouchDist>0&&Math.abs(dist-lastTouchDist)>1){
      const zoomFactor=dist/lastTouchDist;
      lastTouchDist=dist;
      const offset=camera.position.clone().sub(controls.target);
      offset.divideScalar(zoomFactor);
      const clampedLen=Math.max(controls.minDistance,Math.min(controls.maxDistance,offset.length()));
      offset.setLength(clampedLen);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      dirty=true;
     }
     hover.hidden=true;
     e.stopImmediatePropagation();
     return;
    }
   }else if(isPanningAisle&&amount>.4&&!latest.current.isolate){
    const dx=e.clientX-lastPanX;
    const dy=e.clientY-lastPanY;
    lastPanX=e.clientX;
    lastPanY=e.clientY;
    if(dx!==0||dy!==0){
     panLibraryPlane(dx,dy,e.clientX,e.clientY);
    }
    hover.hidden=true;
    e.stopImmediatePropagation();
    return;
   }
   if(e.buttons||amount<.5||e.pointerType==='touch'){hover.hidden=true;return;}
   const rect=el.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,index=findTarget(x,y,12);
   hover.hidden=index<0;
   renderer.domElement.style.cursor=index<0?'grab':'pointer';
   if(index>=0){
    hover.textContent=atlas.parts[index].name;
    hover.style.left=`${Math.max(8,Math.min(x+14,el.clientWidth-260))}px`;
    hover.style.top=`${Math.max(8,Math.min(y+18,el.clientHeight-55))}px`;
   }
  };
  const cancel=(e:PointerEvent)=>{
   if(e.pointerType==='touch'){
    touchCoords.delete(e.pointerId);
    if(touchCoords.size<2){isPanningAisle=false;lastTouchDist=0;}
   }else{
    isPanningAisle=false;
   }
   tap.cancel(e.pointerId);
  };
  const up=(e:PointerEvent)=>{
   if(e.pointerType==='touch'){touchCoords.delete(e.pointerId);if(touchCoords.size<2){isPanningAisle=false;lastTouchDist=0;}}else{isPanningAisle=false;}const validTap=tap.up(e.pointerId,e.clientX,e.clientY);if(!validTap||!ready)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
   let nearest=Infinity,found=-1;const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);
   pickers.forEach((mesh,i)=>{if(!mesh||data[i*4+3]<.5||(hasSolid&&atlas.parts[i].system==='integumentary'))return;if(tunerPartIndices.has(i)){worldBox.setFromObject(mesh);}else{worldBox.copy(bounds[i]).translate(mesh.position);}if(!raycaster.ray.intersectBox(worldBox,hitPoint))return;const hits=raycaster.intersectObject(mesh,false);if(hits[0]&&hits[0].distance<nearest){nearest=hits[0].distance;found=i;}});
   if(found<0&&amount>.45)found=findTarget(e.clientX-rect.left,e.clientY-rect.top,e.pointerType==='touch'?24:16);if(found>=0){
     hover.hidden=true;
     select.current(atlas.parts[found].id);
     if(amount>.4&&!latest.current.isolate){
      const organCenter=centers[found].clone().add(new T.Vector3(data[found*4],data[found*4+1],data[found*4+2]));
      const delta=organCenter.clone().sub(controls.target);
      controls.target.copy(organCenter);
      camera.position.add(delta);
      controls.update();
      dirty=true;
     }
    }
  };
  renderer.domElement.addEventListener('pointerdown',down,{capture:true});renderer.domElement.addEventListener('pointermove',move,{capture:true});renderer.domElement.addEventListener('pointerup',up,{capture:true});renderer.domElement.addEventListener('pointercancel',cancel,{capture:true});
  const preventMenu=(e:Event)=>e.preventDefault();renderer.domElement.addEventListener('contextmenu',preventMenu);
  const clock=new T.Clock();let lastExtent=-1;
  let currentThemeName=latestTheme.current;
  const animate=()=>{
   if(disposed)return;frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),s=latest.current;
   const themeKey=`${latestTheme.current}:${s.accentTheme}:${s.customAccentColor}`;
    if(themeKey!==lastThemeKey){
     lastThemeKey=themeKey;
     const p=getThemePalette(s.accentTheme??'navy_blue',latestTheme.current,s.customAccentColor??'#38bdf8');
     renderer.setClearColor(p.bgCanvas);
     (platform.material as T.MeshStandardMaterial).color.set(p.bgPlatform);
     (ring.material as T.MeshBasicMaterial).color.set(p.ringOuter);
     (innerRing.material as T.MeshBasicMaterial).color.set(p.ringInner);
     dirty=true;
    }
    const opacities={ ...DEFAULT_OPACITIES, ...(s.opacities??{}) };
    let opChanged=false;
    mats.forEach((mat,sysId)=>{
     const targetOp=opacities[sysId as SystemId]??1.0;
     if(Math.abs(mat.opacity-targetOp)>0.002){
      mat.opacity=targetOp;
      mat.transparent=targetOp<0.999;
      mat.depthWrite=targetOp>=0.999;
      opChanged=true;
     }
    });
    const repOp=opacities['reproductive']??1.0;
    if(Math.abs(chunk10Material.opacity-repOp)>0.002){
     chunk10Material.opacity=repOp;
     chunk10Material.transparent=repOp<0.999;
     chunk10Material.depthWrite=repOp>=0.999;
     opChanged=true;
    }
    if(opChanged)dirty=true;
   const changed=lastState?.visible!==s.visible||lastState?.selected!==s.selected||lastState?.isolate!==s.isolate;
   const moving=Math.abs(amount-s.explode)>.0001;
   if(moving){amount=T.MathUtils.damp(amount,s.explode,8,dt);dirty=true;}
   const exT=Math.min(1,amount/.35);
   tunerPivot.position.set(PIVOT.x+T.MathUtils.lerp(currentTuner.x,0,exT),PIVOT.y+T.MathUtils.lerp(currentTuner.y,0,exT),PIVOT.z+T.MathUtils.lerp(currentTuner.z,0,exT));
   tunerPivot.rotation.set(T.MathUtils.degToRad(T.MathUtils.lerp(currentTuner.rotX,0,exT)),T.MathUtils.degToRad(T.MathUtils.lerp(currentTuner.rotY,0,exT)),T.MathUtils.degToRad(T.MathUtils.lerp(currentTuner.rotZ,0,exT)));
   const saT=T.MathUtils.lerp(currentTuner.scaleAll,1.0,exT);
   tunerPivot.scale.set(saT*T.MathUtils.lerp(currentTuner.scaleX,1.0,exT),saT*T.MathUtils.lerp(currentTuner.scaleY,1.0,exT),saT*T.MathUtils.lerp(currentTuner.scaleZ,1.0,exT));
   if(changed||moving||lastExtent<0){
    const visible=new Set(s.visible),selection=new Set(s.selected);
    const visibleParts=atlas.parts.filter(p=>s.isolate?selection.has(p.id):visible.has(p.system)||selection.has(p.id));
    const nextLayoutKey=visibleParts.map(p=>p.id).join(',');
    if(nextLayoutKey!==layoutKey){const layout=createExplosionLayout(visibleParts,1.5);packingWidth=layout.width;packingHeight=layout.height;atlas.parts.forEach((p,i)=>{const cell=layout.cells.get(p.id);offsets[i]=cell?new T.Vector3(cell.x,cell.y+.85,0):centers[i].clone();});layoutKey=nextLayoutKey;if(amount>.05&&!s.isolate)fit(s.view,Math.max(0,(amount-.3)/.7));}

    atlas.parts.forEach((p,i)=>{
     const c=centers[i],destination=offsets[i];let dx=0,dy=0,dz=0;
     if(amount<=.45){const t=amount/.45;const group=SYSTEMS.findIndex(sys=>sys.id===p.system);const angle=group/SYSTEMS.length*Math.PI*2;dx=Math.sin(angle)*t*.48;dy=(c.y-.85)*t*.28;dz=Math.cos(angle)*t*.48;}
     else {const t=(amount-.45)/.55,group=SYSTEMS.findIndex(sys=>sys.id===p.system),angle=group/SYSTEMS.length*Math.PI*2;dx=T.MathUtils.lerp(Math.sin(angle)*.48,destination.x-c.x,t);dy=T.MathUtils.lerp((c.y-.85)*.28,destination.y-c.y,t);dz=T.MathUtils.lerp(Math.cos(angle)*.48,-c.z,t);}
     const selected=selection.has(p.id);data.set([dx,dy,dz,(s.isolate?selected:visible.has(p.system)||selected)?1:0],i*4);selectedData[i*4]=selected?255:0;
     markerPositions.set(data[i*4+3]>.5?[c.x+dx,c.y+dy,c.z+dz]:[10000,10000,10000],i*3);const mesh=pickers[i];if(mesh){mesh.position.set(dx,dy,dz);mesh.updateMatrix();mesh.updateMatrixWorld(true);}
    });partTexture.needsUpdate=true;selectionTexture.needsUpdate=true;markerGeometry.attributes.position.needsUpdate=true;lastState=s;lastExtent=amount;dirty=true;
   }
   if(s.view!==lastView||s.reset!==lastReset){fit(s.view,amount);lastView=s.view;lastReset=s.reset;}
   if(moving&&!s.isolate)fit(s.view,amount);
   const isolateKey=s.isolate?s.selected.join(',')+':'+s.reset+':'+s.inspectorOpen+':'+camera.aspect:'';
   if(isolateKey!==lastIsolate||(s.isolate&&moving)){
    if(s.isolate){const box=new T.Box3();atlas.parts.forEach((p,i)=>{if(s.selected.includes(p.id))box.union(bounds[i].clone().translate(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])));});
     if(!box.isEmpty()){const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());const w=el.clientWidth,h=el.clientHeight,mobile=w<768,landscape=w>h&&h<=600;let left=20,right=w-20,top=mobile?175:110,bottom=h-170;if(s.inspectorOpen){if(landscape){right=w-335;top=100;bottom=h-125;}else if(mobile){const sheet=document.querySelector('.detail-sheet')?.getBoundingClientRect(),header=document.querySelector('.identity')?.getBoundingClientRect();top=(header?.bottom??94)+16;bottom=(sheet?.top??h*.58-139)-16;}else{right=w-370;left=w>1100?285:25;}}const availableWidth=Math.max(150,right-left),availableHeight=Math.max(40,bottom-top);camera.setViewOffset(w,h,w/2-(left+right)/2,h/2-(top+bottom)/2,w,h);const distance=Math.max(.07,Math.max(size.y*h/availableHeight,size.x*w/availableWidth/camera.aspect,size.z)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*1.35);controls.maxDistance=Math.max(40,distance*2);controls.target.copy(center);camera.position.copy(center).add(new T.Vector3(.2,.1,1).normalize().multiplyScalar(distance));controls.update();dirty=true;}
    }else if(lastIsolate){camera.clearViewOffset();fit(s.view,amount);}
    lastIsolate=isolateKey;
   }
   if(amount>.4&&!s.isolate)controls.target.z=0;
   controls.enableRotate=true;controls.enablePan=true;
   const nextPlatform=amount<.5&&!s.isolate;
   if(platform.visible!==nextPlatform){
    platform.visible=ring.visible=innerRing.visible=nextPlatform;
    dirty=true;
   }
   const nextDots=amount>.75&&(s.showDots??true);
   if(markers.visible!==nextDots){
    markers.visible=nextDots;
    dirty=true;
   }
   if(lastState!==s){
    dirty=true;
    lastState=s;
   }
   controls.autoRotate=s.rotate&&!s.isolate&&amount<.4;
   controls.autoRotateSpeed=.65;
   controls.update();
   if(controls.autoRotate)dirty=true;if(dirty||moving)calcNavUpdate();
   if(dirty){renderer.render(scene,camera);targets=[];if(amount>.45){const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);atlas.parts.forEach((p,i)=>{if(data[i*4+3]<.5||(hasSolid&&p.system==='integumentary'))return;let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;for(let corner=0;corner<8;corner++){projected.set(p.bounds[(corner&1)?1:0][0]+data[i*4],p.bounds[(corner&2)?1:0][1]+data[i*4+1],p.bounds[(corner&4)?1:0][2]+data[i*4+2]).project(camera);const x=(projected.x+1)*el.clientWidth/2,y=(1-projected.y)*el.clientHeight/2;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}projected.copy(centers[i]).add(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])).project(camera);if(projected.z< -1||projected.z>1)return;targets.push({index:i,x:(projected.x+1)*el.clientWidth/2,y:(1-projected.y)*el.clientHeight/2,left,right,top,bottom});});}dirty=false;}

  };animate();
  const contextLost=(e:Event)=>{e.preventDefault();onError('The 3D session was paused by your device. Reload to continue.');};renderer.domElement.addEventListener('webglcontextlost',contextLost);
  return()=>{disposed=true;abort.abort();cancelAnimationFrame(frame);window.removeEventListener('atlas-mesh-tune',handleTune);window.removeEventListener('atlas-camera-snap',handleSnap);window.removeEventListener('atlas-pan-x',handlePanX);window.removeEventListener('atlas-pan-y',handlePanY);window.removeEventListener('atlas-fit-all',handleFitAll);observer.disconnect();controls.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());scene.traverse(o=>{if(o instanceof T.Mesh&&!geometries.includes(o.geometry)){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});env.dispose();partTexture.dispose();selectionTexture.dispose();markerGeometry.dispose();markerMaterial.dispose();hover.remove();renderer.domElement.removeEventListener('pointerdown',down,{capture:true} as never);renderer.domElement.removeEventListener('pointermove',move,{capture:true} as never);renderer.domElement.removeEventListener('pointerup',up,{capture:true} as never);renderer.domElement.removeEventListener('pointercancel',cancel,{capture:true} as never);renderer.domElement.removeEventListener('contextmenu',preventMenu);renderer.dispose();renderer.domElement.remove();};
 },[atlas]);
 return <div className="scene" ref={host}/>;
}
