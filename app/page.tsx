import {flushSync} from 'react-dom';
import {registerAtlasTools} from './agent-tools';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Activity,ArrowRightLeft,ArrowUpRight,Check,ChevronDown,ChevronLeft,ChevronRight,ChevronUp,CircleDot,Eye,EyeOff,Focus,Gamepad2,Info,Layers3,Maximize,Minimize,Moon,Pause,RotateCcw,RotateCw,Search,Share2,Sun,X} from 'lucide-react';
import { GameApp } from './game/game-app';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Slider} from '@/components/ui/slider';
import {Switch} from '@/components/ui/switch';
import {Sheet,SheetContent,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {Combobox,ComboboxInput,ComboboxContent,ComboboxList,ComboboxItem,ComboboxEmpty} from '@/components/ui/combobox';
import AnatomyScene from './scene';
import {DEFAULT_OPACITIES,DEFAULT_VISIBLE,SYSTEMS,type AnatomySex,type Atlas,type Concept,type SceneState,type SystemId,type View} from './anatomy';
import {getVennClassification,getHomology,getStandardizedDescription} from './anatomy-dictionary';
import {THEME_OPTIONS,getThemePalette,applyThemeToDom} from './theme-engine';
import { ModelTuner } from './model-tuner';
import {serializeStateToUrl,parseStateFromUrl,saveSessionToLocalStorage,loadSessionFromLocalStorage} from './url-state';

const defaultState:SceneState={
 explode:0,
 visible:DEFAULT_VISIBLE,
 selected:[],
 isolate:false,
 view:'three-quarter',
 rotate:false,
 reset:0,
 showDots:false,
 opacities:{...DEFAULT_OPACITIES},
 accentTheme:'navy_blue',
 customAccentColor:'#38bdf8',
};

function getInitialSession():{
 theme:'light'|'dark';
 sex:AnatomySex;
 state:SceneState;
}{
 if(typeof window==='undefined')return{theme:'light',sex:'male',state:{...defaultState}};
 // URL takes priority → then localStorage → defaults
 const fromUrl=parseStateFromUrl(window.location.search);
 const fromStorage=loadSessionFromLocalStorage();
 const merged=fromUrl??fromStorage;
 const theme=(merged?.theme==='dark'||merged?.theme==='light')?merged.theme
 :((localStorage.getItem('atlas_theme')==='dark')?'dark':'light');
 const sex=(merged?.sex==='female'||merged?.sex==='male')?merged.sex:'male';
 const state:SceneState={
 ...defaultState,
 ...(merged?.state??{}),
 reset:0,
 };
 if (fromUrl?.camera) {
  state.cameraPos = fromUrl.camera.pos;
  state.cameraTarget = fromUrl.camera.target;
 } else if (!fromUrl && fromStorage?.camera) {
  state.cameraPos = fromStorage.camera.pos;
  state.cameraTarget = fromStorage.camera.target;
 } else {
  delete state.cameraPos;
  delete state.cameraTarget;
 }
 return{theme,sex,state};
}

export default function Home(){
 const detailTitle=useRef<HTMLHeadingElement>(null);
 const accentPickerRef=useRef<HTMLDivElement>(null);
 const [accentPickerOpen,setAccentPickerOpen]=useState(false);
 const [expandedSystems,setExpandedSystems]=useState<Set<SystemId>>(new Set(['integumentary']));

 const initialSession=useRef(getInitialSession());
 const currentCameraRef=useRef<{pos:[number,number,number];target:[number,number,number]}|undefined>(
  initialSession.current.state.cameraPos && initialSession.current.state.cameraTarget
   ? { pos: initialSession.current.state.cameraPos, target: initialSession.current.state.cameraTarget }
   : undefined
 );
 const isFirstSexLoadRef=useRef(true);
 const urlSyncTimerRef=useRef<ReturnType<typeof setTimeout>|null>(null);

 const [theme,setTheme]=useState<'light'|'dark'>(()=>initialSession.current.theme);
 const [navState,setNavState]=useState<{overflowX:boolean;overflowY:boolean;tx:number;ty:number}>({
  overflowX:false,
  overflowY:false,
  tx:0.5,
  ty:0.5
 });

 useEffect(()=>{
  const handleNav=(e:Event)=>{
   const d=(e as CustomEvent).detail;
   if(d){
    setNavState({
     overflowX:!!d.overflowX,
     overflowY:!!d.overflowY,
     tx:typeof d.tx==='number'?d.tx:0.5,
     ty:typeof d.ty==='number'?d.ty:0.5
    });
   }
  };
  window.addEventListener('atlas-nav-update',handleNav);
  return ()=>window.removeEventListener('atlas-nav-update',handleNav);
 },[]);

 const panX=(v:number)=>{
  setNavState(s=>({...s,tx:v}));
  window.dispatchEvent(new CustomEvent('atlas-pan-x',{detail:{val:v}}));
 };
 const panY=(v:number)=>{
  setNavState(s=>({...s,ty:v}));
  window.dispatchEvent(new CustomEvent('atlas-pan-y',{detail:{val:v}}));
 };
 const fitAll=()=>{
  window.dispatchEvent(new CustomEvent('atlas-fit-all'));
 };

 useEffect(()=>{
  if(typeof window==='undefined')return;
  localStorage.setItem('atlas_theme',theme);
  if(theme==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}
 },[theme]);

 const toggleTheme=()=>setTheme(t=>t==='dark'?'light':'dark');

 const [sex,setSex]=useState<AnatomySex>(()=>initialSession.current.sex);

 const [pendingTarget,setPendingTarget]=useState<string|null>(null);
 const [atlas,setAtlas]=useState<Atlas|null>(null);
 const [state,setState]=useState<SceneState>(()=>initialSession.current.state);
 const [copied,setCopied]=useState(false);
 const [toastMsg,setToastMsg]=useState('');
 const [progress,setProgress]=useState(0);
 const [error,setError]=useState('');
 const [panel,setPanel]=useState<'layers'|'search'|null>(null);
 const [details,setDetails]=useState(false);
 const [about,setAbout]=useState(false);
 const [query,setQuery]=useState('');
 const [chosen,setChosen]=useState<Concept|null>(null);
 const [mobileSheetMode,setMobileSheetMode]=useState<'closed'|'split'|'full'>('closed');
 const [mobileSheetTab,setMobileSheetTab]=useState<'systems'|'detail'>('systems');
 const [cameraPillOpen,setCameraPillOpen]=useState(false);
 const [mobileExplodeOpen,setMobileExplodeOpen]=useState(false);
 const [dockSide,setDockSide]=useState<'right'|'left'>('right');
 const [cleanUI,setCleanUI]=useState(false);
 const [isFullscreen,setIsFullscreen]=useState(false);
 const [viewMode,setViewMode]=useState<'atlas'|'game'>('atlas');
 const [gameTargetName,setGameTargetName]=useState<string|null>(null);

 useEffect(()=>{
  const handleFs=()=>setIsFullscreen(Boolean(document.fullscreenElement));
  document.addEventListener('fullscreenchange',handleFs);
  document.addEventListener('webkitfullscreenchange',handleFs);
  return ()=>{
   document.removeEventListener('fullscreenchange',handleFs);
   document.removeEventListener('webkitfullscreenchange',handleFs);
  };
 },[]);

 const toggleFullscreen=()=>{
  if(!document.fullscreenElement){
   if(document.documentElement.requestFullscreen){
    document.documentElement.requestFullscreen().catch(()=>{});
   }else if((document.documentElement as any).webkitRequestFullscreen){
    (document.documentElement as any).webkitRequestFullscreen();
   }
  }else{
   if(document.exitFullscreen){
    document.exitFullscreen().catch(()=>{});
   }else if((document as any).webkitExitFullscreen){
    (document as any).webkitExitFullscreen();
   }
  }
 };

 const touchStartY=useRef<number|null>(null);

 const handleTouchStart=(e:React.TouchEvent)=>{
  touchStartY.current=e.touches[0].clientY;
 };
 const handleTouchEnd=(e:React.TouchEvent)=>{
  if(touchStartY.current===null)return;
  const touchEndY=e.changedTouches[0].clientY;
  const deltaY=touchEndY-touchStartY.current;
  touchStartY.current=null;
  if(deltaY>50){
   if(mobileSheetMode==='full')setMobileSheetMode('split');
   else if(mobileSheetMode==='split')setMobileSheetMode('closed');
  }else if(deltaY<-50){
   if(mobileSheetMode==='closed')setMobileSheetMode('split');
   else if(mobileSheetMode==='split')setMobileSheetMode('full');
  }
 };

 // Sync theme variables to DOM when theme, accent theme, or custom color changes
 useEffect(()=>{
  const palette=getThemePalette(state.accentTheme??'navy_blue',theme,state.customAccentColor??'#38bdf8');
  applyThemeToDom(palette);
 },[state.accentTheme,state.customAccentColor,theme]);

 const scheduleUrlSync = () => {
  if (typeof window === 'undefined') return;
  if (urlSyncTimerRef.current) clearTimeout(urlSyncTimerRef.current);
  urlSyncTimerRef.current = setTimeout(() => {
   const cam = currentCameraRef.current ?? (window as any).__atlas_camera;
   const url = serializeStateToUrl({ sex, theme, state, camera: cam });
   window.history.replaceState({}, '', url);
   saveSessionToLocalStorage({ sex, theme, state, camera: cam });
  }, 200);
 };

 // Listen for real-time camera manipulation (orbit, pan, zoom) from 3D viewport
 useEffect(() => {
  const handleCam = (e: Event) => {
   const d = (e as CustomEvent).detail;
   if (d?.pos && d?.target) {
    currentCameraRef.current = { pos: d.pos, target: d.target };
    scheduleUrlSync();
   }
  };
  window.addEventListener('atlas-camera-change', handleCam);
  return () => window.removeEventListener('atlas-camera-change', handleCam);
 }, [sex, theme, state]);

 // Keep URL and localStorage updated when state, sex, or theme changes
 useEffect(() => {
  scheduleUrlSync();
  return () => {
   if (urlSyncTimerRef.current) clearTimeout(urlSyncTimerRef.current);
  };
 }, [sex, theme, state]);

 // If a part was restored from URL/localStorage, open details sheet once atlas loads
 useEffect(()=>{
  if(!atlas||state.selected.length===0)return;
  const id=state.selected[0];
  const p=parts.get(id);
  if(!p||details)return;
  setChosen({id:p.conceptId,name:p.name,elements:state.selected});
  setDetails(true);
  setMobileSheetTab('detail');
  setMobileSheetMode('split');
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[atlas]);

 // Close accent theme picker on outside click
 useEffect(()=>{
  const handleClickOutside=(e:MouseEvent)=>{
   if(accentPickerRef.current&&!accentPickerRef.current.contains(e.target as Node)){
    setAccentPickerOpen(false);
   }
  };
  document.addEventListener('pointerdown',handleClickOutside);
  return ()=>document.removeEventListener('pointerdown',handleClickOutside);
 },[]);

 useEffect(()=>{
  setError('');
  const abort=new AbortController();
  const file=sex==='female'?'/models/atlas-female.json':'/models/atlas.json';
  fetch(file,{signal:abort.signal})
   .then(r=>r.json() as Promise<Atlas>)
   .then(a=>{
    setAtlas(a);
    if(isFirstSexLoadRef.current){
     isFirstSexLoadRef.current=false;
    }else{
     setState(s=>({
      ...s,
      visible:sex==='female'?[...DEFAULT_VISIBLE,'integumentary']:DEFAULT_VISIBLE,
      selected:[],
      isolate:false,
     }));
    }
   })
   .catch(e=>{
    if(!abort.signal.aborted)setError('Could not load anatomical definitions for this sex.');
   });
  return ()=>abort.abort();
 },[sex]);

 const parts=useMemo(()=>new Map((atlas?.parts??[]).map(p=>[p.id,p])),[atlas]);

 const counts=useMemo(()=>{
  const m=Object.fromEntries(SYSTEMS.map(s=>[s.id,0])) as Record<SystemId,number>;
  atlas?.parts.forEach(p=>{m[p.system]=(m[p.system]||0)+1;});
  return m;
 },[atlas]);

 const activeSystems=useMemo(()=>SYSTEMS.filter(s=>counts[s.id]>0),[counts]);

 const visibleCount=useMemo(()=>{
  if(!atlas)return 0;
  const s=new Set(state.visible);
  return atlas.parts.filter(p=>s.has(p.system)).length;
 },[atlas,state.visible]);

 const results=useMemo(()=>{
  if(!atlas||!query)return [];
  const q=query.toLowerCase().trim();
  return atlas.concepts.filter(c=>c.name.toLowerCase().includes(q)).slice(0,80);
 },[atlas,query]);

 const choose=(c:Concept)=>{
  setChosen(c);
  setState(s=>({...s,selected:c.elements,isolate:false,rotate:false}));
  setDetails(true);
  setPanel(null);
  setMobileSheetTab('detail');
  setMobileSheetMode(m=>m==='closed'?'split':m);
 };

 const selectedParts=useMemo(()=>{
  if(!atlas||state.selected.length===0)return [];
  return state.selected.map(id=>parts.get(id)!).filter(Boolean);
 },[atlas,parts,state.selected]);

 const selected=selectedParts[0];
 const system=SYSTEMS.find(s=>s.id===selected?.system);

 useEffect(()=>{
  if(!pendingTarget||!atlas)return;
  const targetLower=pendingTarget.toLowerCase().trim();
  const found=atlas.concepts.find(c=>c.name.toLowerCase()===targetLower);
  if(found){
   choose(found);
   setPendingTarget(null);
  }
 },[atlas,pendingTarget]);

 useEffect(()=>{
  if(!atlas)return;
  return registerAtlasTools(atlas,c=>flushSync(()=>choose(c)));
 },[atlas]);

 const choosePart=(id:string)=>{
  const p=parts.get(id);
  if(!p)return;
  setChosen({id:p.conceptId,name:p.name,elements:[id]});
  setState(s=>({...s,selected:[id],isolate:false,rotate:false}));
  setDetails(true);
  setPanel(null);
  setMobileSheetTab('detail');
  setMobileSheetMode(m=>m==='closed'?'split':m);
 };

 const toggle=(id:SystemId)=>{
  setDetails(false);
  setState(s=>({...s,selected:[],isolate:false,visible:s.visible.includes(id)?s.visible.filter(x=>x!==id):[...s.visible,id]}));
 };

 const handleOpenAtlasFromGame=(targetName?:string)=>{
  setViewMode('atlas');
  if(targetName&&atlas){
   setGameTargetName(targetName);
   const targetLower=targetName.toLowerCase().trim();
   const found=atlas.concepts.find(c=>c.name.toLowerCase().includes(targetLower))||atlas.concepts.find(c=>targetLower.includes(c.name.toLowerCase()));
   if(found){
    choose(found);
   }
  }
 };

 const reset=()=>{
  setState(s=>({
   ...defaultState,
   visible:sex==='female'?[...DEFAULT_VISIBLE,'integumentary']:DEFAULT_VISIBLE,
   reset:s.reset+1,
   opacities:{...DEFAULT_OPACITIES},
   accentTheme:s.accentTheme,
   customAccentColor:s.customAccentColor,
  }));
  setChosen(null);
  setDetails(false);
  setPanel(null);
  setMobileSheetTab('systems');
 };

 const openPanel=(next:'layers'|'search')=>{
  setDetails(false);
  setPanel(p=>p===next?null:next);
  if(next==='layers'){
   setMobileSheetTab('systems');
   setMobileSheetMode(m=>m==='closed'?'split':m);
  }
 };

 const handleShare=()=>{
  const cam=(window as any).__atlas_camera as {pos:[number,number,number];target:[number,number,number]}|undefined;
  const url=serializeStateToUrl({sex,theme,state,camera:cam});
  window.history.replaceState({},'',url);
  navigator.clipboard.writeText(url).then(()=>{
   setCopied(true);
   setToastMsg('Link copied to clipboard!');
   setTimeout(()=>{setCopied(false);setToastMsg('');},2800);
  }).catch(()=>{
   setToastMsg('URL updated in address bar');
   setTimeout(()=>setToastMsg(''),2800);
  });
 };

 const toggleSystemAccordion=(id:SystemId)=>{
  setExpandedSystems(prev=>{
   const next=new Set(prev);
   if(next.has(id))next.delete(id);
   else next.add(id);
   return next;
  });
 };

 return <main className={`studio ${cleanUI?'clean-ui-mode':''}`} data-mobile-sheet={mobileSheetMode} data-clean-ui={cleanUI} data-view-mode={viewMode}>
  {atlas&&<AnatomyScene atlas={atlas} state={{...state,inspectorOpen:details&&selectedParts.length>0}} theme={theme} dockSide={dockSide} mobileSheetMode={mobileSheetMode} onSelect={choosePart} onProgress={n=>{setProgress(n);if(n===100)setError('');}} onError={setError}/>}
  <ModelTuner
   sex={sex}
   onIsolateBones={()=>{
    setState(s=>({...s,visible:['skeletal','reproductive'],isolate:false}));
   }}
   onToggleSkin={()=>{
    setState(s=>{
     const hasSkin=s.visible.includes('integumentary');
     return {...s,visible:hasSkin?s.visible.filter(id=>id!=='integumentary'):[...s.visible,'integumentary']};
    });
   }}
   onAutoSelectVagina={()=>{
    if(sex!=='female')setSex('female');
    choosePart('VH_F_vagina');
   }}
  />
  <div className="vignette"/>

  {/* Clean UI: Floating Organ Name Badge */}
  {cleanUI&&(
   <div className="clean-ui-organ-tag glass" aria-live="polite">
    <span className="clean-organ-dot" style={{background:system?.color??'#0284c7'}}/>
    <span className="clean-organ-name">{chosen?chosen.name:(sex==='female'?'Female Reference Anatomy':'Adult Human Anatomy')}</span>
    {chosen&&<span className="clean-organ-system">{system?.name}</span>}
   </div>
  )}

  {/* Clean UI: Collapsed Corner Top View Control */}
  {cleanUI&&(
   <aside className="corner-top-dock glass" aria-label="Corner view controls">
    <div className="corner-dock-angles">
     {(['three-quarter','front','side','back'] as View[]).map((v,i)=>(
      <button
       key={v}
       type="button"
       className={`corner-btn ${state.view===v?'active':''}`}
       onClick={()=>setState(s=>({...s,view:v,reset:s.reset+1,rotate:false}))}
       aria-label={`${v} view`}
       title={`${v} view`}
      >
       {['¾','F','S','B'][i]}
      </button>
     ))}
    </div>
    <div className="corner-divider"/>
    <button
     type="button"
     className={`corner-btn ${state.rotate?'active':''}`}
     disabled={state.explode>=.4}
     onClick={()=>setState(s=>({...s,rotate:!s.rotate}))}
     aria-label="Auto rotate"
     title={state.rotate?'Pause rotation':'Auto rotate'}
    >
     {state.rotate?<Pause size={13}/>:<RotateCw size={13}/>}
    </button>
    <button
     type="button"
     className="corner-btn"
     onClick={reset}
     aria-label="Reset view"
     title="Reset view"
    >
     <RotateCcw size={13}/>
    </button>
    <div className="corner-divider"/>
    <button
     type="button"
     className={`corner-btn ${isFullscreen?'active':''}`}
     onClick={toggleFullscreen}
     aria-label={isFullscreen?'Exit fullscreen':'Enter fullscreen'}
     title={isFullscreen?'Exit fullscreen':'Fullscreen'}
    >
     {isFullscreen?<Minimize size={13}/>:<Maximize size={13}/>}
    </button>
    <button
     type="button"
     className="corner-btn clean-toggle-btn active"
     onClick={()=>setCleanUI(false)}
     aria-label="Exit clean UI"
     title="Exit clean UI (Restore standard layout)"
    >
     <EyeOff size={13}/>
    </button>
   </aside>
  )}

  {/* Header left */}
  <header className="identity">
   <div className="eyebrow"><span className="status-dot"/> INTERACTIVE ANATOMY</div>
   <h1>Human Atlas<Badge variant="outline" className="edition">3D</Badge></h1>
   <div className="identity-meta">
    {atlas?atlas.parts.length.toLocaleString():sex==='female'?'888':'2,234'} modeled pieces <span>·</span> {sex==='female'?'HuBMAP HRA v1.5':'BodyParts3D 4.0'}
   </div>
   <div className="sex-toggle-group" role="group" aria-label="Select anatomy sex reference">
    <Button
     variant="ghost"
     size="sm"
     className={`sex-toggle-btn ${sex==='male'?'active':''}`}
     onClick={()=>{if(sex!=='male')setSex('male');}}
    >
     <span>♂ Male</span>
    </Button>
    <Button
     variant="ghost"
     size="sm"
     className={`sex-toggle-btn ${sex==='female'?'active':''}`}
     onClick={()=>{if(sex!=='female')setSex('female');}}
    >
     <span>♀ Female</span>
    </Button>
   </div>
   <div className="identity-source-link">
    <button
     type="button"
     className="source-credits-btn"
     onClick={()=>{setDetails(false);setPanel(null);setAbout(true);}}
     title="View scientific sources and model attribution"
    >
     <span>Source & credits</span>
     <ArrowUpRight size={11}/>
    </button>
   </div>
  </header>

  {/* Top center caption (Desktop only) */}
  <div className="top-center-caption desktop-only">
   <span className="caption-line"/>
   <span>{state.isolate?(chosen?.name??'SELECTED STRUCTURE'):state.explode>.95?'ANATOMICAL INVENTORY':state.explode>.05?'SEPARATED STRUCTURES':sex==='female'?'FEMALE · REFERENCE ANATOMY':'ADULT HUMAN · MALE'}</span>
   <span className="caption-line"/>
  </div>



  {/* Top actions right */}
  <nav className="top-actions" aria-label="Explorer panels">
   <Button
    variant="ghost"
    className="icon-button theme-toggle"
    aria-label={theme==='dark'?'Switch to light mode':'Switch to dark mode'}
    title={theme==='dark'?'Light mode':'Dark mode'}
    onClick={toggleTheme}
    style={{cursor:'pointer'}}
   >
    {theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}
   </Button>
   <div className="accent-theme-picker header-accent-picker" ref={accentPickerRef}>
    <button
     type="button"
     className={`icon-button accent-picker-icon-btn ${accentPickerOpen?'active':''}`}
     onClick={()=>setAccentPickerOpen(prev=>!prev)}
     title={`Theme color: ${THEME_OPTIONS.find(t=>t.id===state.accentTheme)?.label??'Default'}`}
     aria-label="Select accent theme"
    >
     <span
      className="accent-circle-swatch"
      style={{
       background:state.accentTheme==='custom'
        ?(state.customAccentColor??'#38bdf8')
        :(THEME_OPTIONS.find(t=>t.id===state.accentTheme)?.[theme==='dark'?'dotColorDark':'dotColorLight']??'#0284c7')
      }}
     />
    </button>

    {accentPickerOpen&&(
     <div className="accent-dropdown glass" role="menu">
      {THEME_OPTIONS.map(opt=>{
       const isActive=(state.accentTheme??'navy_blue')===opt.id;
       return (
        <button
         key={opt.id}
         type="button"
         className={`accent-dropdown-item ${isActive?'active':''}`}
         onClick={()=>{
          setState(s=>({...s,accentTheme:opt.id}));
          if(opt.id!=='custom')setAccentPickerOpen(false);
         }}
        >
         <span className="accent-swatch-pair">
          <span className="swatch-circle" style={{background:opt.dotColorDark}} title="Dark tone"/>
          <span className="swatch-circle" style={{background:opt.dotColorLight}} title="Light tone"/>
         </span>
         <span style={{flex:1}}>{opt.label}</span>
         {isActive&&<Check size={13}/>}
        </button>
       );
      })}

      {state.accentTheme==='custom'&&(
       <div className="custom-color-row">
        <span>Custom Color</span>
        <input
         type="color"
         className="custom-color-input"
         value={state.customAccentColor??'#38bdf8'}
         onChange={e=>{
          const col=e.target.value;
          setState(s=>({...s,customAccentColor:col}));
         }}
        />
       </div>
      )}
     </div>
    )}
   </div>
   <Button
    variant="ghost"
    className={`icon-button ${isFullscreen?'active':''}`}
    aria-label="Toggle fullscreen"
    title={isFullscreen?'Exit fullscreen':'Fullscreen'}
    onClick={toggleFullscreen}
   >
    {isFullscreen?<Minimize size={18}/>:<Maximize size={18}/>}
   </Button>
   <Button
    variant="ghost"
    className="game-launch-button"
    onClick={()=>{
     setPanel(null);
     setDetails(false);
     setViewMode('game');
    }}
    aria-label="Tebak Tebak Kata"
    title="Mainkan Tebak Tebak Kata (Game Edukasi)"
   >
    <Gamepad2 size={18}/><span>Tebak Kata</span>
   </Button>
   <Button variant="ghost" className={panel==='search'?'active':''} onClick={()=>openPanel('search')} aria-label="Search anatomy">
    <Search size={18}/><span>Find a structure</span><kbd>/</kbd>
   </Button>
   <Button
    variant="ghost"
    className={`icon-button share-button${copied?' copied':''}`}
    aria-label="Share current view"
    title="Copy share link"
    onClick={handleShare}
   >
    {copied?<Check size={18}/>:<Share2 size={18}/>}
   </Button>
   <Button variant="ghost" className="icon-button" aria-label="About this atlas" onClick={()=>{setDetails(false);setPanel(null);setAbout(true);}}>
    <Info size={18}/>
   </Button>
  </nav>
  {toastMsg&&<div className="share-toast" role="status">{toastMsg}</div>}

  {/* Floating Return to Game Banner (Section 9 & 10.8) */}
  {viewMode==='atlas'&&gameTargetName&&(
   <div
    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 py-2 px-4 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xl border border-white/20 active:translate-y-[1px] cursor-pointer transition-all animate-fadeIn"
    onClick={()=>setViewMode('game')}
    role="button"
    tabIndex={0}
    title="Kembali ke Tebak Tebak Kata"
   >
    <ChevronLeft size={16}/>
    <span>&lt;&lt; Kembali ke Game</span>
    <span className="px-2 py-0.5 rounded-full bg-amber-800/80 text-[10px]">Target: {gameTargetName}</span>
   </div>
  )}

  {/* Systems panel (Left) */}
  <section className={`layers-panel glass ${panel==='layers'?'mobile-open':''}`} aria-label="Anatomical layers">
   <div className="panel-heading">
    <span>Systems</span>
    <Button variant="ghost" className="mobile-only icon-button" onClick={()=>setPanel(null)} aria-label="Close systems"><X size={18}/></Button>
    <Badge variant="secondary" className="desktop-only small-number">{activeSystems.length}</Badge>
   </div>
   <div className="layer-presets">
    <Button variant="ghost" aria-pressed={activeSystems.every(x=>state.visible.includes(x.id))} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:activeSystems.map(x=>x.id).filter(x=>x!=='pregnancy')}))}>All</Button>
    <Button variant="ghost" aria-pressed={state.visible.length===1&&state.visible[0]==='skeletal'} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:['skeletal']}))}>Skeleton</Button>
    <Button variant="ghost" aria-pressed={state.visible.length>=6&&['cardiac','respiratory','digestive','urinary','endocrine','reproductive'].every(id=>state.visible.includes(id as SystemId))} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:['cardiac','respiratory','digestive','urinary','endocrine','reproductive']}))}>Organs</Button>
   </div>
   <div className="system-list">
    {activeSystems.map(s=>{
     const isExpanded=expandedSystems.has(s.id);
     const isEnabled=state.visible.includes(s.id);
     const currentOp=state.opacities?.[s.id]??DEFAULT_OPACITIES[s.id]??1.0;
     const opPercent=Math.round(currentOp*100);

     return (
      <div className={`system-accordion-item ${isEnabled?'enabled':''}`} key={s.id}>
       <div className="system-accordion-header">
        <Button
         variant="ghost"
         className="system-name"
         title={`Show only ${s.name.toLowerCase()}`}
         onClick={()=>setState(v=>({...v,visible:[s.id],isolate:false,selected:[]}))}
        >
         <span className="system-dot" style={{background:s.color}}/>
         {s.name}
         <span className="system-count">{counts[s.id]}</span>
        </Button>
        <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
         <Button
          variant="ghost"
          className="system-expand-btn"
          title={isExpanded?'Collapse transparency slider':'Adjust transparency'}
          aria-label={isExpanded?'Collapse transparency':'Adjust transparency'}
          onClick={()=>toggleSystemAccordion(s.id)}
         >
          {isExpanded?<ChevronUp size={13}/>:<ChevronDown size={13}/>}
         </Button>
         <Switch checked={isEnabled} onCheckedChange={()=>toggle(s.id)} aria-label={`Show ${s.name.toLowerCase()}`}/>
        </div>
       </div>

       {isExpanded&&(
        <div className="system-opacity-drawer">
         <div className="system-opacity-label">
          <span>Opacity</span>
          <span className="opacity-badge">{opPercent}%</span>
         </div>
         <Slider
          aria-label={`${s.name} opacity`}
          min={0}
          max={100}
          step={1}
          value={[opPercent]}
          onValueChange={v=>{
           const val=Array.isArray(v)?v[0]:v;
           setState(prev=>({
            ...prev,
            opacities:{...(prev.opacities??DEFAULT_OPACITIES),[s.id]:val/100}
           }));
          }}
         />
         <div className="opacity-presets">
          <Button
           variant="ghost"
           className={`opacity-preset-btn ${opPercent===0?'active':''}`}
           onClick={()=>setState(prev=>({...prev,opacities:{...(prev.opacities??DEFAULT_OPACITIES),[s.id]:0}}))}
          >
           0%
          </Button>
          {s.id==='integumentary'?(
           <Button
            variant="ghost"
            className={`opacity-preset-btn ${opPercent===23?'active':''}`}
            onClick={()=>setState(prev=>({...prev,opacities:{...(prev.opacities??DEFAULT_OPACITIES),[s.id]:0.23}}))}
           >
            23%
           </Button>
          ):(
           <Button
            variant="ghost"
            className={`opacity-preset-btn ${opPercent===20?'active':''}`}
            onClick={()=>setState(prev=>({...prev,opacities:{...(prev.opacities??DEFAULT_OPACITIES),[s.id]:0.20}}))}
           >
            20%
           </Button>
          )}
          <Button
           variant="ghost"
           className={`opacity-preset-btn ${opPercent===50?'active':''}`}
           onClick={()=>setState(prev=>({...prev,opacities:{...(prev.opacities??DEFAULT_OPACITIES),[s.id]:0.50}}))}
          >
           50%
          </Button>
          <Button
           variant="ghost"
           className={`opacity-preset-btn ${opPercent===100?'active':''}`}
           onClick={()=>setState(prev=>({...prev,opacities:{...(prev.opacities??DEFAULT_OPACITIES),[s.id]:1.0}}))}
          >
           100%
          </Button>
         </div>
        </div>
       )}
      </div>
     );
    })}
   </div>
   <div className="panel-foot">
    <span>{visibleCount.toLocaleString()} pieces visible</span>
    <Button variant="ghost" onClick={()=>setState(s=>({...s,visible:[],selected:[],isolate:false}))}>Hide all</Button>
   </div>
  </section>

  {/* Search panel */}
  {panel==='search'&&<section className="search-panel glass" aria-label="Find anatomy">
   <div className="panel-heading"><span>Find a structure</span><Button variant="ghost" className="icon-button" onClick={()=>setPanel(null)} aria-label="Close search"><X size={18}/></Button></div>
   <Combobox<Concept> items={results} value={null} onValueChange={value=>{if(value)choose(value);}} inputValue={query} onInputValueChange={setQuery} itemToStringLabel={c=>c.name} filter={null} open onOpenChange={open=>{if(!open)setPanel(null);}}>
    <ComboboxInput autoFocus placeholder="Heart, femur, ovary, cranial nerve…" aria-label="Search named anatomical structures" showTrigger={false}/>
    <ComboboxContent className="anatomy-search-results">
     <ComboboxEmpty>No structures match your search in {sex} reference.</ComboboxEmpty>
     <ComboboxList>
      {(c:Concept)=><ComboboxItem key={c.id} value={c}>
       <span className="search-result-name">{c.name}</span>
       <span className="small-number">{c.elements.length} {c.elements.length===1?'piece':'pieces'}</span>
      </ComboboxItem>}
     </ComboboxList>
    </ComboboxContent>
   </Combobox>
   <p className="search-note">{query?'Showing up to 80 matches. Refine your search to find smaller structures.':'Start with a major organ, or search every named structure.'}</p>
  </section>}

  {/* Consolidated Right-Side View Controls: Single Vertical Column (v12) */}
  <aside className="right-command-deck glass" aria-label="Camera and view controls">
   {/* 1. View angles */}
   <div className="deck-angles-column">
    {(['three-quarter','front','side','back'] as View[]).map((v,i)=>(
     <Button
      variant="ghost"
      key={v}
      className={`deck-col-btn ${state.view===v?'active':''}`}
      aria-pressed={state.view===v}
      
      onClick={()=>setState(s=>({...s,view:v,reset:s.reset+1,rotate:false}))}
      title={`${v} view`}
      aria-label={`${v} view`}
     >
      <span>{['¾','F','S','B'][i]}</span>
     </Button>
    ))}
   </div>

   <div className="deck-divider"/>

   {/* 2. Inspection dots toggle */}
   <Button
    variant="ghost"
    className={`deck-col-btn ${state.showDots?'active':''}`}
    onClick={()=>setState(s=>({...s,showDots:!s.showDots}))}
    title={state.showDots?'Hide inspection dots':'Show inspection dots'}
    aria-label="Toggle inspection dots"
   >
    <CircleDot size={15}/>
   </Button>

   {/* 3. Auto rotate toggle */}
   <Button
    variant="ghost"
    disabled={state.explode>=.4}
    className={`deck-col-btn ${state.rotate?'active':''}`}
    onClick={()=>setState(s=>({...s,rotate:!s.rotate}))}
    title={state.rotate?'Pause auto-rotation':'Start auto-rotation'}
    aria-label="Auto rotate"
   >
    {state.rotate?<Pause size={15}/>:<RotateCw size={15}/>}
   </Button>

   <div className="deck-divider"/>

   {/* 4. Reset view button with plain text */}
   <button
    type="button"
    className="deck-reset-btn"
    onClick={reset}
    title="Reset view and camera"
    aria-label="Reset view"
   >
    <RotateCcw size={13}/>
    <span>Reset view</span>
   </button>

   <Button
    variant="ghost"
    className="deck-col-btn"
    onClick={fitAll}
    title="Fit all anatomy to frame"
    aria-label="Fit all to frame"
   >
    <Focus size={15}/>
   </Button>

   <div className="deck-divider"/>

   {/* 5. Explode anatomy vertical slider */}
   <div className="deck-explode-column">
    <span className="deck-badge">{Math.round(state.explode*100)}%</span>
    <Slider
     orientation="vertical"
     aria-label="Explode anatomy slider"
     min={0}
     max={100}
     step={1}
     value={[Math.round(state.explode*100)]}
     onValueChange={v=>{
      const val=Array.isArray(v)?v[0]:v;
      setState(s=>({
       ...s,
       explode:val/100,
       
       rotate:false
      }));
     }}
     className="deck-vertical-slider"
    />
    <div className="deck-divider"/>
    <Button
     variant="ghost"
     className={`deck-col-btn ${isFullscreen?'active':''}`}
     onClick={toggleFullscreen}
     title={isFullscreen?'Exit fullscreen':'Fullscreen view'}
     aria-label="Toggle fullscreen"
    >
     {isFullscreen?<Minimize size={15}/>:<Maximize size={15}/>}
    </Button>
    <Button
     variant="ghost"
     className={`deck-col-btn ${cleanUI?'active':''}`}
     onClick={()=>setCleanUI(v=>!v)}
     title={cleanUI?'Exit clean UI':'Clean UI (Zen mode)'}
     aria-label="Toggle clean UI"
    >
     {cleanUI?<EyeOff size={15}/>:<Eye size={15}/>}
    </Button>
   </div>
  </aside>

  {/* Studio Bottom Bar: Navigation Guide */}
  <footer className="studio-footer">
   <div className="footer-right">
    <span className="footer-guide">
     Left-drag to orbit · Right-drag to pan · Tap to inspect
    </span>
   </div>
  </footer>

  {progress<100&&!error&&<div className="loading glass" role="status"><Activity size={18}/><div><strong>Preparing the anatomy</strong><span>{progress}% · Loading {atlas?.parts.length.toLocaleString()??(sex==='female'?'888':'2,234')} pieces</span><div className="loading-track"><i style={{width:`${progress}%`}}/></div></div></div>}
  {error&&<div className="loading glass error" role="alert"><p>{error}</p><Button variant="ghost" onClick={()=>location.reload()}>Reload viewer</Button></div>}

  {/* Mobile Side Dock: Camera controls docked flush against side edge when panel is closed */}
  {mobileSheetMode==='closed'&&(
   <aside
    className="mobile-side-dock glass mobile-only"
    data-side={dockSide}
    aria-label="Camera view controls"
   >
    <div className="mobile-side-dock-inner">
     {(['three-quarter','front','side','back'] as View[]).map((v,i)=>(
      <button
       key={v}
       type="button"
       className={`dock-btn ${state.view===v?'active':''}`}
       onClick={()=>setState(s=>({...s,view:v,reset:s.reset+1,rotate:false}))}
       aria-label={`${v} view`}
       title={`${v} view`}
      >
       {['¾','F','S','B'][i]}
      </button>
     ))}
     <div className="dock-divider"/>
     <button
      type="button"
      className={`dock-btn ${state.rotate?'active':''}`}
      disabled={state.explode>=.4}
      onClick={()=>setState(s=>({...s,rotate:!s.rotate}))}
      aria-label="Toggle auto-rotate"
      title="Auto rotate"
     >
      {state.rotate?<Pause size={13}/>:<RotateCw size={13}/>}
     </button>
     <button
      type="button"
      className="dock-btn"
      onClick={reset}
      aria-label="Reset camera"
      title="Reset view"
     >
      <RotateCcw size={13}/>
     </button>
     <button
      type="button"
      className="dock-btn"
      onClick={fitAll}
      aria-label="Fit all to frame"
      title="Fit all to frame"
     >
      <Focus size={13}/>
     </button>
     <button
      type="button"
      className={`dock-btn ${state.showDots?'active':''}`}
      onClick={()=>setState(s=>({...s,showDots:!s.showDots}))}
      aria-label="Toggle inspection dots"
      title={state.showDots?'Hide inspection dots':'Show inspection dots'}
     >
      <CircleDot size={13}/>
     </button>
     <div className="dock-divider"/>
     {/* Explode Toggle in Side Dock */}
     <button
      type="button"
      className={`dock-btn ${state.explode>0.05?'active':''}`}
      onClick={()=>{
       const nextExp = state.explode > 0.05 ? 0 : 1.0;
       setState(s => ({ ...s, explode: nextExp, rotate: false }));
       setMobileExplodeOpen(nextExp > 0);
      }}
      aria-label={state.explode > 0.05 ? 'Assemble anatomy' : 'Explode anatomy'}
      title={state.explode > 0.05 ? 'Assemble model' : 'Explode anatomy'}
     >
      <span style={{fontSize:'13px',lineHeight:1}}>💥</span>
     </button>

     {/* Vertical Explode Slider in Side Dock (following view control position) */}
     {(state.explode > 0.05 || mobileExplodeOpen) && (
      <div className="dock-explode-column">
       <span className="dock-badge">{Math.round(state.explode * 100)}%</span>
       <Slider
        orientation="vertical"
        aria-label="Explode anatomy vertical slider"
        min={0}
        max={100}
        step={1}
        value={[Math.round(state.explode * 100)]}
        onValueChange={v => {
         const val = Array.isArray(v) ? v[0] : v;
         setState(s => ({ ...s, explode: val / 100, rotate: false }));
        }}
        className="dock-vertical-slider"
       />
      </div>
     )}
     <div className="dock-divider"/>
     {/* Fullscreen toggle */}
     <button
      type="button"
      className={`dock-btn ${isFullscreen?'active':''}`}
      onClick={toggleFullscreen}
      aria-label="Toggle fullscreen"
      title="Fullscreen"
     >
      {isFullscreen?<Minimize size={13}/>:<Maximize size={13}/>}
     </button>
     {/* Clean UI toggle */}
     <button
      type="button"
      className={`dock-btn ${cleanUI?'active':''}`}
      onClick={()=>setCleanUI(v=>!v)}
      aria-label="Toggle clean UI"
      title="Clean UI"
     >
      <Eye size={13}/>
     </button>
     <div className="dock-divider"/>
     {/* Swap Position Button: Toggles dock side between Left and Right */}
     <button
      type="button"
      className="dock-btn swap-btn"
      onClick={()=>setDockSide(s=>s==='right'?'left':'right')}
      aria-label={`Move controls to ${dockSide==='right'?'left':'right'} edge`}
      title={`Dock to ${dockSide==='right'?'left':'right'} side`}
     >
      <ArrowRightLeft size={13}/>
     </button>
    </div>
   </aside>
  )}

  


  {/* v16 Plain Viewport Scrollers (Adaptive & Minimalist) */}
  <div
   className={`plain-viewport-scroller-x ${navState.overflowX && !cleanUI ? 'visible' : ''}`}
   role="region"
   aria-label="Horizontal viewport navigation"
  >
   <Slider
    aria-label="Navigate scene horizontally"
    min={0}
    max={100}
    step={1}
    value={[Math.round(navState.tx * 100)]}
    onValueChange={v => {
     const val = Array.isArray(v) ? v[0] : v;
     panX(val / 100);
    }}
    className="plain-scroller-slider"
   />
  </div>

  <div
   className={`plain-viewport-scroller-y ${navState.overflowY && !cleanUI ? 'visible' : ''}`}
   role="region"
   aria-label="Vertical viewport navigation"
  >
   <Slider
    orientation="vertical"
    aria-label="Navigate scene vertically"
    min={0}
    max={100}
    step={1}
    value={[Math.round(navState.ty * 100)]}
    onValueChange={v => {
     const val = Array.isArray(v) ? v[0] : v;
     panY(val / 100);
    }}
    className="plain-scroller-slider-vertical"
   />
  </div>

  {/* Mobile Unified Bottom Sheet: Pure 3-Tier Split/Full Panel (No Bottom Dock) */}
  <section
   className={`mobile-bottom-sheet glass mobile-only mode-${mobileSheetMode}`}
   aria-label="Anatomy explorer drawer"
   data-mode={mobileSheetMode}
  >
   {mobileSheetMode==='closed'?(
    <button
     type="button"
     className="mobile-sheet-closed-bar"
     onClick={()=>setMobileSheetMode('split')}
     aria-label="Open anatomy systems explorer"
    >
     <div className="sheet-drag-pill"/>
     <div className="sheet-closed-row">
      <Layers3 size={15}/>
      <span>Systems & Anatomy</span>
      {selectedParts.length>0&&<span className="closed-part-tag"><span className="tab-dot" style={{background:system?.color??'#0284c7'}}/>{chosen?.name}</span>}
      <ChevronUp size={14} className="closed-chevron"/>
     </div>
    </button>
   ):(
    <>
     {/* Drag Handle Bar with Swipe-to-Snap */}
     <div
      className="sheet-handle-bar"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      title="Swipe up for full screen, down to close"
     >
      <div className="sheet-drag-pill"/>
     </div>

     {/* TIER 1: View Controls (Angles, Rotate, Reset), Explode Toggle, Clean UI, and Close */}
     <div className="mobile-tier1-controls">
      <div className="tier1-angles">
       <span className="tier1-label">viewmode:</span>
       {(['three-quarter','front','side','back'] as View[]).map((v,i)=>(
        <button
         key={v}
         type="button"
         className={`tier1-cam-btn ${state.view===v?'active':''}`}
         onClick={()=>setState(s=>({...s,view:v,reset:s.reset+1,rotate:false}))}
         aria-label={`${v} view`}
        >
         {['¾','F','S','B'][i]}
        </button>
       ))}
       <div className="tier1-divider"/>
       <button
        type="button"
        className={`tier1-cam-btn ${state.rotate?'active':''}`}
        disabled={state.explode>=.4}
        onClick={()=>setState(s=>({...s,rotate:!s.rotate}))}
        aria-label="Toggle auto-rotate"
       >
        {state.rotate?<Pause size={13}/>:<RotateCw size={13}/>}
       </button>
       <button
        type="button"
        className="tier1-cam-btn"
        onClick={reset}
        aria-label="Reset camera"
        title="Reset view"
       >
        <RotateCcw size={13}/>
       </button>
      </div>

      <div className="tier1-right">
       <button
        type="button"
        className={`tier1-explode-btn ${state.explode>0.05?'active':''}`}
        onClick={()=>{
         const nextExp = state.explode > 0.05 ? 0 : 1.0;
         setState(s => ({ ...s, explode: nextExp, rotate: false }));
         setMobileExplodeOpen(nextExp > 0);
        }}
        aria-label={state.explode > 0.05 ? 'Assemble anatomy' : 'Explode anatomy'}
        title={state.explode > 0.05 ? 'Assemble model' : 'Explode anatomy'}
       >
        <span>💥 {Math.round(state.explode*100)}%</span>
       </button>
       <button
        type="button"
        className={`tier1-cam-btn ${state.showDots?'active':''}`}
        onClick={()=>setState(s=>({...s,showDots:!s.showDots}))}
        aria-label="Toggle inspection dots"
        title={state.showDots?'Hide inspection dots':'Show inspection dots'}
       >
        <CircleDot size={13}/>
       </button>
       <button
        type="button"
        className={`tier1-cam-btn ${cleanUI?'active':''}`}
        onClick={()=>setCleanUI(v=>!v)}
        aria-label="Toggle clean UI"
        title="Clean UI"
       >
        <Eye size={13}/>
       </button>
       <button
        type="button"
        className="tier1-close-btn"
        onClick={()=>setMobileSheetMode('closed')}
        aria-label="Close panel"
       >
        <X size={15}/>
       </button>
      </div>
     </div>

     {/* TIER 1.5: Exploded Shelf & Navigation Row (INSIDE the split bottom sheet) */}
     {(state.explode > 0.05 || mobileExplodeOpen) && (
      <div className="mobile-sheet-exploded-row" role="region" aria-label="Explode Anatomy Shelf Control">
       <button
        type="button"
        className="scrubber-step-btn"
        onClick={() => {
         const tiers = [0, 0.25, 0.50, 0.75, 1.0];
         const prev = [...tiers].reverse().find(t => t < state.explode - 0.04) ?? 0;
         setState(s => ({ ...s, explode: prev, rotate: false }));
        }}
        aria-label="Previous tier"
        title="Previous tier"
       >
        <ChevronLeft size={13} />
       </button>
       <span className="scrubber-tag">
        {state.explode >= 0.85 ? 'Shelf 4 · Extremities' :
         state.explode >= 0.60 ? 'Shelf 3 · Abdomen' :
         state.explode >= 0.35 ? 'Shelf 2 · Thorax' :
         state.explode > 0 ? 'Shelf 1 · Cranial' : 'Assembled'}
       </span>
       <Slider
        aria-label="Explode anatomy slider"
        min={0}
        max={100}
        step={1}
        value={[Math.round(state.explode * 100)]}
        onValueChange={v => {
         const val = Array.isArray(v) ? v[0] : v;
         setState(s => ({ ...s, explode: val / 100, rotate: false }));
        }}
        className="scrubber-mini-slider"
       />
       <span className="scrubber-val">{Math.round(state.explode * 100)}%</span>
       <button
        type="button"
        className="scrubber-step-btn"
        onClick={() => {
         const tiers = [0.25, 0.50, 0.75, 1.0];
         const next = tiers.find(t => t > state.explode + 0.04) ?? 1.0;
         setState(s => ({ ...s, explode: next, rotate: false }));
        }}
        aria-label="Next tier"
        title="Next tier"
       >
        <ChevronRight size={13} />
       </button>
       <button
        type="button"
        className="scrubber-reset-btn"
        onClick={() => {
         setState(s => ({ ...s, explode: 0, rotate: false }));
         setMobileExplodeOpen(false);
        }}
        title="Reset explosion to 0%"
        aria-label="Reset explode"
       >
        0%
       </button>
      </div>
     )}

     {/* TIER 2: Sistem dan Info below the control + Full/Split toggle */}
     <div className="mobile-tier2-row">
      <div className="mobile-tier2-tabs" role="tablist">
       <button
        type="button"
        role="tab"
        aria-selected={mobileSheetTab==='systems'}
        className={`tier2-tab ${mobileSheetTab==='systems'?'active':''}`}
        onClick={()=>setMobileSheetTab('systems')}
       >
        <Layers3 size={14}/>
        <span>Systems Explorer</span>
        <span className="tab-badge">{activeSystems.length}</span>
       </button>

       {selectedParts.length>0?(
        <button
         type="button"
         role="tab"
         aria-selected={mobileSheetTab==='detail'}
         className={`tier2-tab ${mobileSheetTab==='detail'?'active':''}`}
         onClick={()=>setMobileSheetTab('detail')}
        >
         <span className="tab-dot" style={{background:system?.color??'#0284c7'}}/>
         <span className="tab-label-text">{chosen?.name??'Detail'}</span>
        </button>
       ):(
        <span className="tier2-tab disabled" title="Select a 3D part to view detail">
         <span>Detail (Select part)</span>
        </span>
       )}
      </div>

      <button
       type="button"
       className={`tier2-mode-btn ${mobileSheetMode==='full'?'active':''}`}
       onClick={()=>setMobileSheetMode(m=>m==='full'?'split':'full')}
       title={mobileSheetMode==='full'?'Switch to 50/50 split':'Switch to full screen'}
       aria-label={mobileSheetMode==='full'?'Switch to split':'Switch to full screen'}
      >
       {mobileSheetMode==='full'?(
        <><ChevronDown size={13}/><span>Split</span></>
       ):(
        <><ChevronUp size={13}/><span>Full</span></>
       )}
      </button>
     </div>

     {/* TIER 3: Content Panel */}
     <div className="mobile-sheet-body">
      {mobileSheetTab==='systems'?(
       <div className="mobile-systems-view">
        <div className="layer-presets">
         <Button variant="ghost" aria-pressed={activeSystems.every(x=>state.visible.includes(x.id))} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:activeSystems.map(x=>x.id).filter(x=>x!=='pregnancy')}))}>All</Button>
         <Button variant="ghost" aria-pressed={state.visible.length===1&&state.visible[0]==='skeletal'} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:['skeletal']}))}>Skeleton</Button>
         <Button variant="ghost" aria-pressed={state.visible.length>=6&&['cardiac','respiratory','digestive','urinary','endocrine','reproductive'].every(id=>state.visible.includes(id as SystemId))} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:['cardiac','respiratory','digestive','urinary','endocrine','reproductive']}))}>Organs</Button>
        </div>

        <div className="system-list">
         {activeSystems.map(s=>{
          const isExpanded=expandedSystems.has(s.id);
          const isEnabled=state.visible.includes(s.id);
          const currentOp=state.opacities?.[s.id]??DEFAULT_OPACITIES[s.id]??1.0;
          const opPercent=Math.round(currentOp*100);

          return (
           <div className={`system-accordion-item ${isEnabled?'enabled':''}`} key={s.id}>
            <div className="system-accordion-header">
             <Button
              variant="ghost"
              className="system-name"
              title={`Show only ${s.name.toLowerCase()}`}
              onClick={()=>setState(v=>({...v,visible:[s.id],isolate:false,selected:[]}))}
             >
              <span className="system-dot" style={{background:s.color}}/>
              {s.name}
              <span className="system-count">{counts[s.id]}</span>
             </Button>
             <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
              <Button
               variant="ghost"
               className="system-expand-btn"
               title={isExpanded?'Collapse transparency slider':'Adjust transparency'}
               onClick={()=>toggleSystemAccordion(s.id)}
              >
               {isExpanded?<ChevronUp size={13}/>:<ChevronDown size={13}/>}
              </Button>
              <Switch checked={isEnabled} onCheckedChange={()=>toggle(s.id)}/>
             </div>
            </div>

            {isExpanded&&(
             <div className="system-opacity-drawer">
              <div className="system-opacity-label">
               <span>Opacity</span>
               <span className="opacity-badge">{opPercent}%</span>
              </div>
              <Slider
               aria-label={`${s.name} opacity`}
               min={0}
               max={100}
               step={1}
               value={[opPercent]}
               onValueChange={v=>{
                const val=Array.isArray(v)?v[0]:v;
                setState(prev=>({
                 ...prev,
                 opacities:{...(prev.opacities??DEFAULT_OPACITIES),[s.id]:val/100}
                }));
               }}
              />
              <div className="opacity-presets">
               <Button variant="ghost" className={`opacity-preset-btn ${opPercent===0?'active':''}`} onClick={()=>setState(prev=>({...prev,opacities:{...(prev.opacities??DEFAULT_OPACITIES),[s.id]:0}}))}>0%</Button>
               <Button variant="ghost" className={`opacity-preset-btn ${opPercent===(s.id==='integumentary'?23:20)?'active':''}`} onClick={()=>setState(prev=>({...prev,opacities:{...(prev.opacities??DEFAULT_OPACITIES),[s.id]:s.id==='integumentary'?0.23:0.20}}))}>{s.id==='integumentary'?'23%':'20%'}</Button>
               <Button variant="ghost" className={`opacity-preset-btn ${opPercent===50?'active':''}`} onClick={()=>setState(prev=>({...prev,opacities:{...(prev.opacities??DEFAULT_OPACITIES),[s.id]:0.50}}))}>50%</Button>
               <Button variant="ghost" className={`opacity-preset-btn ${opPercent===100?'active':''}`} onClick={()=>setState(prev=>({...prev,opacities:{...(prev.opacities??DEFAULT_OPACITIES),[s.id]:1.0}}))}>100%</Button>
              </div>
             </div>
            )}
           </div>
          );
         })}
        </div>

        <div className="panel-foot">
         <span>{visibleCount.toLocaleString()} pieces visible</span>
         <Button variant="ghost" onClick={()=>setState(s=>({...s,visible:[],selected:[],isolate:false}))}>Hide all</Button>
        </div>
       </div>
      ):(
       <div className="mobile-detail-view">
        <div className="detail-header">
         <div className="detail-accent" style={{background:system?.color}}/>
         <div className="eyebrow">{system?.name??'ANATOMY'}</div>
         <div className="structure-title">{chosen?.name}</div>
         {chosen&&(()=>{
          const venn=getVennClassification(chosen.name,selected?.system??'connective',sex);
          return <div className="venn-badge-container">
           {venn==='shared'&&<Badge variant="outline" className="venn-badge venn-badge-shared"><span className="venn-dot shared"/>Shared Human Anatomy</Badge>}
           {venn==='male_only'&&<Badge variant="outline" className="venn-badge venn-badge-male"><span className="venn-dot male"/>Male Reference Anatomy</Badge>}
           {venn==='female_only'&&<Badge variant="outline" className="venn-badge venn-badge-female"><span className="venn-dot female"/>Female Reference Anatomy</Badge>}
          </div>;
         })()}
        </div>

        <div className="detail-scroll">
         <div className="structure-description">
          {chosen&&selected?getStandardizedDescription(chosen.name,selected.system,sex):''}
         </div>

         {chosen&&(()=>{
          const homology=getHomology(chosen.name);
          if(!homology)return null;
          return <div className="homology-card">
           <div className="homology-header">
            <ArrowRightLeft size={13}/>
            <span>BIOLOGICAL COUNTERPART</span>
           </div>
           <div className="homology-name">{homology.counterpartName} ({homology.counterpartSex==='female'?'Female':'Male'})</div>
           <div className="homology-origin">Origin: {homology.developmentalOrigin}</div>
           <p className="homology-notes">{homology.notes}</p>
           <Button
            variant="outline"
            size="sm"
            className="homology-btn"
            onClick={()=>{
             setPendingTarget(homology.counterpartName);
             setSex(homology.counterpartSex);
            }}
           >
            <span>Switch to {homology.counterpartSex==='female'?'Female':'Male'} view</span>
            <ChevronRight size={14}/>
           </Button>
          </div>;
         })()}

         <div className="structure-meta">
          <span>Atlas reference<strong>{chosen?.id}</strong></span>
          <span>Selected pieces<strong>{state.selected.length.toLocaleString()}</strong></span>
         </div>

         {selectedParts.length>1&&<div className="member-list">
          <h3>Included structures</h3>
          {selectedParts.slice(0,50).map(p=><Button variant="ghost" key={p.id} onClick={()=>choosePart(p.id)}><span>{p.name}</span><ChevronRight size={14}/></Button>)}
          {selectedParts.length>50&&<p>And {selectedParts.length-50} more modeled pieces.</p>}
         </div>}

         <a className="source-link" href={sex==='female'?'https://doi.org/10.48539/HBM352.BTSQ.586':'https://lifesciencedb.jp/bp3d/'} target="_blank" rel="noreferrer">
          View anatomical source <ArrowUpRight size={14}/>
         </a>
        </div>

        <div className="detail-actions">
         <Button className={`primary-action ${state.isolate?'active':''}`} onClick={()=>setState(s=>({...s,isolate:!s.isolate,explode:0}))}>
          <Focus size={18}/>{state.isolate?'Show surrounding anatomy':'Isolate structure'}<ChevronRight size={16}/>
         </Button>
         <Button variant="ghost" className="secondary-action" onClick={()=>{setState(s=>({...s,selected:[],isolate:false}));setMobileSheetTab('systems');}}>
          Clear selection
         </Button>
        </div>
       </div>
      )}
     </div>
    </>
   )}
  </section>

  {/* Standardized Information Panel */}
  <Sheet open={viewMode==='atlas'&&details&&selectedParts.length>0} modal={false} disablePointerDismissal onOpenChange={setDetails}>
   <SheetContent initialFocus={detailTitle} className={`detail-sheet glass ${state.isolate?'is-isolated':''}`} showCloseButton={true}>
    <div className="detail-header">
     <div className="detail-accent" style={{background:system?.color}}/>
     <div className="eyebrow">{system?.name??'ANATOMY'}</div>
     <SheetTitle ref={detailTitle} tabIndex={-1} className="structure-title">{chosen?.name}</SheetTitle>
     {chosen&&(()=>{
      const venn=getVennClassification(chosen.name,selected?.system??'connective',sex);
      return <div className="venn-badge-container">
       {venn==='shared'&&<Badge variant="outline" className="venn-badge venn-badge-shared"><span className="venn-dot shared"/>Shared Human Anatomy</Badge>}
       {venn==='male_only'&&<Badge variant="outline" className="venn-badge venn-badge-male"><span className="venn-dot male"/>Male Reference Anatomy</Badge>}
       {venn==='female_only'&&<Badge variant="outline" className="venn-badge venn-badge-female"><span className="venn-dot female"/>Female Reference Anatomy</Badge>}
      </div>;
     })()}
    </div>

    <div className="detail-scroll" key={`${chosen?.id}-${state.isolate}-${sex}`}>
     <SheetDescription className="structure-description">
      {chosen&&selected?getStandardizedDescription(chosen.name,selected.system,sex):''}
     </SheetDescription>

     {chosen&&(()=>{
      const homology=getHomology(chosen.name);
      if(!homology)return null;
      return <div className="homology-card">
       <div className="homology-header">
        <ArrowRightLeft size={13}/>
        <span>BIOLOGICAL COUNTERPART</span>
       </div>
       <div className="homology-name">{homology.counterpartName} ({homology.counterpartSex==='female'?'Female':'Male'})</div>
       <div className="homology-origin">Origin: {homology.developmentalOrigin}</div>
       <p className="homology-notes">{homology.notes}</p>
       <Button
        variant="outline"
        size="sm"
        className="homology-btn"
        onClick={()=>{
         setPendingTarget(homology.counterpartName);
         setSex(homology.counterpartSex);
        }}
       >
        <span>Switch to {homology.counterpartSex==='female'?'Female':'Male'} view</span>
        <ChevronRight size={14}/>
       </Button>
      </div>;
     })()}

     <div className="structure-meta">
      <span>Atlas reference<strong>{chosen?.id}</strong></span>
      <span>Selected pieces<strong>{state.selected.length.toLocaleString()}</strong></span>
     </div>

     {selectedParts.length>1&&<div className="member-list">
      <h3>Included structures</h3>
      {selectedParts.slice(0,50).map(p=><Button variant="ghost" key={p.id} onClick={()=>choosePart(p.id)}><span>{p.name}</span><ChevronRight size={14}/></Button>)}
      {selectedParts.length>50&&<p>And {selectedParts.length-50} more modeled pieces.</p>}
     </div>}

     <a className="source-link" href={sex==='female'?'https://doi.org/10.48539/HBM352.BTSQ.586':'https://lifesciencedb.jp/bp3d/'} target="_blank" rel="noreferrer">
      View anatomical source <ArrowUpRight size={14}/>
     </a>
    </div>

    <div className="detail-actions">
     <Button className={`primary-action ${state.isolate?'active':''}`} onClick={()=>setState(s=>({...s,isolate:!s.isolate,explode:0}))}>
      <Focus size={18}/>{state.isolate?'Show surrounding anatomy':'Isolate structure'}<ChevronRight size={16}/>
     </Button>
     <Button variant="ghost" className="secondary-action" onClick={()=>{setState(s=>({...s,selected:[],isolate:false}));setDetails(false);}}>
      Clear selection
     </Button>
    </div>
   </SheetContent>
  </Sheet>

  <Sheet open={viewMode==='atlas'&&about} onOpenChange={setAbout}>
   <SheetContent className="about-sheet glass" showCloseButton={false}>
    <div className="about-sticky-header">
     <div className="about-header-top">
      <div className="eyebrow">SOURCE & SCOPE</div>
      <button
       type="button"
       className="about-close-btn"
       onClick={()=>setAbout(false)}
       aria-label="Close about dialog"
       title="Close"
      >
       <X size={16}/>
      </button>
     </div>
     <SheetTitle className="structure-title">A body, revealed.</SheetTitle>
     <SheetDescription>Explore the human anatomy across two independent, open scientific reference collections.</SheetDescription>
    </div>

    <div className="about-copy-scroll">
     <div className="about-copy">
      <p><strong>Male · BodyParts3D 4.0</strong><br/>2,234 individual meshes and 3,432 named concepts from an adult male reference anatomy based on TARO MRI scan and medical illustration refinements. Complete coverage of skeleton, muscles, neurovasculature, and internal organs.</p>
      <p><strong>Female · Human Reference Atlas (HuBMAP) v1.5</strong><br/>888 source meshes, including the whole-body surface, selected visceral organs, and female reproductive anatomy. Pregnancy reference structures (placenta and umbilical cord) are modeled in a dedicated layer.</p>
      <p>These collections have different coverage and origins. Neither contains every possible human variation. Named concepts can contain multiple pieces; each source mesh is rendered with GPU acceleration.</p>
      <p>Colors and system groupings are curated for educational exploration. The geometry is simplified for high-performance WebGL rendering. This interface is an anatomical reference, not a diagnostic or surgical tool.</p>

      <h3>Male dataset (BodyParts3D)</h3>
      <p>BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.</p>
      <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html" target="_blank" rel="noreferrer">Dataset license <ArrowUpRight size={14}/></a>
      <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html" target="_blank" rel="noreferrer">Original geometry & metadata <ArrowUpRight size={14}/></a>
      <a href="https://doi.org/10.1093/nar/gkn613" target="_blank" rel="noreferrer">Source publication (Mitsuhashi et al. 2009) <ArrowUpRight size={14}/></a>

      <h3>Female dataset (HuBMAP / HRA)</h3>
      <p>Kristen Browne and Heidi Schlehlein, Human Reference Atlas / HuBMAP, <em>3D Reference Organ Set for Female v1.5</em> (2023). CC BY 4.0.</p>
      <a href="https://doi.org/10.48539/HBM352.BTSQ.586" target="_blank" rel="noreferrer">Female reference DOI <ArrowUpRight size={14}/></a>
      <a href="https://lod.humanatlas.io/ref-organ/united-female/v1.5" target="_blank" rel="noreferrer">Digital object repository <ArrowUpRight size={14}/></a>
     </div>
    </div>
   </SheetContent>
  </Sheet>

  {/* Tebak Tebak Kata Game Container (Wireframe Section 10) */}
  <div
   className={`tebak-kata-container fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-4 sm:bg-black/80 sm:dark:bg-black/85 sm:backdrop-blur-md transition-opacity duration-200 ${
    viewMode==='game'?'opacity-100 pointer-events-auto':'opacity-0 pointer-events-none'
   }`}
   style={{
    backgroundColor: 'var(--bg-canvas, #faf7f2)',
   }}
   aria-hidden={viewMode!=='game'}
  >
   <div
    className="relative w-full sm:max-w-md h-full sm:h-[94dvh] sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border-2"
    style={{
      backgroundColor: 'var(--bg-canvas, #faf7f2)',
      borderColor: 'var(--panel-border, rgba(0,0,0,0.18))',
    }}
   >
    <GameApp
     currentTheme={theme}
     accentTheme={state.accentTheme ?? 'navy_blue'}
     onToggleTheme={toggleTheme}
     onSelectAccentTheme={(themeId) => setState(s => ({ ...s, accentTheme: themeId }))}
     onOpenAtlas={handleOpenAtlasFromGame}
     onCloseGame={()=>setViewMode('atlas')}
    />
   </div>
  </div>
 </main>;
}
