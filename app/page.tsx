import {flushSync} from 'react-dom';
import {registerAtlasTools} from './agent-tools';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Activity,ArrowRightLeft,ArrowUpRight,Check,ChevronDown,ChevronRight,ChevronUp,CircleDot,Focus,Info,Layers3,Moon,Pause,RotateCcw,RotateCw,Search,Sun,X} from 'lucide-react';
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

const initial:SceneState={
 explode:0,
 visible:DEFAULT_VISIBLE,
 selected:[],
 isolate:false,
 view:'three-quarter',
 rotate:false,
 reset:0,
 showDots:true,
 opacities:{...DEFAULT_OPACITIES},
 accentTheme:'navy_blue',
 customAccentColor:'#38bdf8',
};

export default function Home(){
 const detailTitle=useRef<HTMLHeadingElement>(null);
 const accentPickerRef=useRef<HTMLDivElement>(null);
 const [accentPickerOpen,setAccentPickerOpen]=useState(false);
 const [expandedSystems,setExpandedSystems]=useState<Set<SystemId>>(new Set(['integumentary']));

 const [theme,setTheme]=useState<'light'|'dark'>(()=>{
  if(typeof window!=='undefined'){
   const stored=localStorage.getItem('atlas_theme');
   if(stored==='dark'||stored==='light')return stored;
  }
  return 'light';
 });

 useEffect(()=>{
  if(typeof window==='undefined')return;
  localStorage.setItem('atlas_theme',theme);
  if(theme==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}
 },[theme]);

 const toggleTheme=()=>setTheme(t=>t==='dark'?'light':'dark');

 const [sex,setSex]=useState<AnatomySex>(()=>{
  if(typeof window!=='undefined'){
   const param=new URLSearchParams(window.location.search).get('sex');
   if(param==='female')return 'female';
  }
  return 'male';
 });

 const [pendingTarget,setPendingTarget]=useState<string|null>(null);
 const [atlas,setAtlas]=useState<Atlas|null>(null);
 const [state,setState]=useState(initial);
 const [progress,setProgress]=useState(0);
 const [error,setError]=useState('');
 const [panel,setPanel]=useState<'layers'|'search'|null>(null);
 const [details,setDetails]=useState(false);
 const [about,setAbout]=useState(false);
 const [query,setQuery]=useState('');
 const [chosen,setChosen]=useState<Concept|null>(null);

 // Sync theme variables to DOM when theme, accent theme, or custom color changes
 useEffect(()=>{
  const palette=getThemePalette(state.accentTheme??'navy_blue',theme,state.customAccentColor??'#38bdf8');
  applyThemeToDom(palette);
 },[state.accentTheme,state.customAccentColor,theme]);

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
  if(typeof window!=='undefined'){
   const url=new URL(window.location.href);
   if(url.searchParams.get('sex')!==sex){
    url.searchParams.set('sex',sex);
    window.history.replaceState({},'',url.toString());
   }
  }
  setError('');
  const abort=new AbortController();
  const file=sex==='female'?'/models/atlas-female.json':'/models/atlas.json';
  fetch(file,{signal:abort.signal})
   .then(r=>r.json() as Promise<Atlas>)
   .then(a=>{
    setAtlas(a);
    setState(s=>({
     ...s,
     visible:sex==='female'?[...DEFAULT_VISIBLE,'integumentary']:DEFAULT_VISIBLE,
     selected:[],
     isolate:false,
    }));
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
 };

 const toggle=(id:SystemId)=>{
  setDetails(false);
  setState(s=>({...s,selected:[],isolate:false,visible:s.visible.includes(id)?s.visible.filter(x=>x!==id):[...s.visible,id]}));
 };

 const reset=()=>{
  setState(s=>({
   ...initial,
   visible:sex==='female'?[...DEFAULT_VISIBLE,'integumentary']:DEFAULT_VISIBLE,
   reset:s.reset+1,
   opacities:{...DEFAULT_OPACITIES},
   accentTheme:s.accentTheme,
   customAccentColor:s.customAccentColor,
  }));
  setChosen(null);
  setDetails(false);
  setPanel(null);
 };

 const openPanel=(next:'layers'|'search')=>{
  setDetails(false);
  setPanel(p=>p===next?null:next);
 };

 const toggleSystemAccordion=(id:SystemId)=>{
  setExpandedSystems(prev=>{
   const next=new Set(prev);
   if(next.has(id))next.delete(id);
   else next.add(id);
   return next;
  });
 };

 return <main className="studio">
  {atlas&&<AnatomyScene atlas={atlas} state={{...state,inspectorOpen:details&&selectedParts.length>0}} theme={theme} onSelect={choosePart} onProgress={n=>{setProgress(n);if(n===100)setError('');}} onError={setError}/>}
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

  {/* Top center caption */}
  <div className="top-center-caption">
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
   <Button variant="ghost" className={panel==='search'?'active':''} onClick={()=>openPanel('search')} aria-label="Search anatomy">
    <Search size={18}/><span>Find a structure</span><kbd>/</kbd>
   </Button>
   <Button variant="ghost" className="icon-button" aria-label="About this atlas" onClick={()=>{setDetails(false);setPanel(null);setAbout(true);}}>
    <Info size={18}/>
   </Button>
  </nav>

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
    className={`deck-col-btn ${state.showDots!==false?'active':''}`}
    onClick={()=>setState(s=>({...s,showDots:s.showDots===false?true:false}))}
    title={state.showDots===false?'Turn on inspection dots':'Bare mode: hide inspection dots'}
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
    <span className="deck-col-label">EXPLODE</span>
   </div>
  </aside>

  {/* Studio Bottom Bar: Navigation Guide + Theme Dropdown on far right */}
  <footer className="studio-footer">
   <div className="footer-right">
    <span className="footer-guide">
     Left-drag to orbit · Right-drag to pan · Tap to inspect
    </span>

    <div className="accent-theme-picker" ref={accentPickerRef}>
     <button
      type="button"
      className="accent-picker-trigger glass"
      onClick={()=>setAccentPickerOpen(prev=>!prev)}
      title="Accent theme"
      aria-label="Select accent theme"
     >
      <span
       className="accent-dot"
       style={{
        background:state.accentTheme==='custom'
         ?(state.customAccentColor??'#38bdf8')
         :(THEME_OPTIONS.find(t=>t.id===state.accentTheme)?.[theme==='dark'?'dotColorDark':'dotColorLight']??'#0284c7')
       }}
      />
      <span>{THEME_OPTIONS.find(t=>t.id===state.accentTheme)?.label??'Theme'}</span>
      {accentPickerOpen?<ChevronDown size={12}/>:<ChevronUp size={12}/>}
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
   </div>
  </footer>

  {progress<100&&!error&&<div className="loading glass" role="status"><Activity size={18}/><div><strong>Preparing the anatomy</strong><span>{progress}% · Loading {atlas?.parts.length.toLocaleString()??(sex==='female'?'888':'2,234')} pieces</span><div className="loading-track"><i style={{width:`${progress}%`}}/></div></div></div>}
  {error&&<div className="loading glass error" role="alert"><p>{error}</p><Button variant="ghost" onClick={()=>location.reload()}>Reload viewer</Button></div>}

  {/* Standardized Information Panel */}
  <Sheet open={details&&selectedParts.length>0} modal={false} disablePointerDismissal onOpenChange={setDetails}>
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

  <Sheet open={about} onOpenChange={setAbout}>
   <SheetContent className="about-sheet glass">
    <div className="eyebrow">SOURCE & SCOPE</div>
    <SheetTitle className="structure-title">A body, revealed.</SheetTitle>
    <SheetDescription>Explore the human anatomy across two independent, open scientific reference collections.</SheetDescription>
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
   </SheetContent>
  </Sheet>
 </main>;
}
