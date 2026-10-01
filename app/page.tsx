import {flushSync} from 'react-dom';
import {registerAtlasTools} from './agent-tools';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Activity,ArrowRightLeft,ArrowUpRight,ChevronRight,CircleDot,Focus,Info,Layers3,Moon,Pause,RotateCcw,RotateCw,Search,Sun,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Slider} from '@/components/ui/slider';
import {Switch} from '@/components/ui/switch';
import {Sheet,SheetContent,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {Combobox,ComboboxInput,ComboboxContent,ComboboxList,ComboboxItem,ComboboxEmpty} from '@/components/ui/combobox';
import AnatomyScene from './scene';
import {DEFAULT_VISIBLE,SYSTEMS,type AnatomySex,type Atlas,type Concept,type SceneState,type SystemId,type View} from './anatomy';
import {getVennClassification,getHomology,getStandardizedDescription} from './anatomy-dictionary';

import { ModelTuner } from './model-tuner';

const initial:SceneState={explode:0,visible:DEFAULT_VISIBLE,selected:[],isolate:false,view:'three-quarter',rotate:false,reset:0,showDots:true};

export default function Home(){
 const detailTitle=useRef<HTMLHeadingElement>(null);
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

 useEffect(()=>{
  if(typeof window!=='undefined'){
   const url=new URL(window.location.href);
   if(url.searchParams.get('sex')!==sex){
    url.searchParams.set('sex',sex);
    window.history.replaceState({},'',url.toString());
   }
  }
  const abort=new AbortController();
  setProgress(0);
  setError('');
  setAtlas(null);
  setChosen(null);
  setDetails(false);
  setState(prev=>({
   ...prev,
   selected:[],
   isolate:false,
   reset:prev.reset+1,
  }));
  const modelUrl=sex==='female'?'/models/atlas-female.json':'/models/atlas.json';
  fetch(modelUrl,{signal:abort.signal})
   .then(r=>{if(!r.ok)throw new Error('The anatomy catalogue could not be loaded.');return r.json();})
   .then(data=>{
    const a=data as Atlas;
    setAtlas(a);
    if(pendingTarget){
     const term=pendingTarget.toLowerCase().trim();
     const match=a.concepts.find(c=>c.name.toLowerCase()===term||c.id.toLowerCase()===term)||a.concepts.find(c=>c.name.toLowerCase().includes(term));
     if(match){
      setChosen(match);
      setState(s=>({...s,selected:match.elements,isolate:false,rotate:false}));
      setDetails(true);
     }
     setPendingTarget(null);
    }
   })
   .catch(e=>{if(e.name!=='AbortError')setError(e.message);});
  return()=>abort.abort();
 },[sex]);

 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{
   if(e.key==='/'&&!(e.target instanceof HTMLInputElement)&&!(e.target instanceof HTMLTextAreaElement)){
    e.preventDefault();
    setPanel('search');
    setDetails(false);
   }
  };
  window.addEventListener('keydown',key);
  return()=>window.removeEventListener('keydown',key);
 },[]);

 const parts=useMemo(()=>new Map(atlas?.parts.map(p=>[p.id,p])),[atlas]);
 const counts=useMemo(()=>Object.fromEntries(SYSTEMS.map(s=>[s.id,atlas?.parts.filter(p=>p.system===s.id).length??0])),[atlas]);
 const activeSystems=SYSTEMS.filter(s=>counts[s.id]>0);
 const selectedParts=state.selected.map(id=>parts.get(id)).filter(p=>!!p);
 const selected=selectedParts[0];
 const system=SYSTEMS.find(s=>s.id===selected?.system);
 const visibleCount=atlas?.parts.filter(p=>state.isolate?state.selected.includes(p.id):state.visible.includes(p.system)||state.selected.includes(p.id)).length??0;

 const results=useMemo(()=>{
  if(!atlas)return[];
  const term=query.toLowerCase().trim();
  if(!term){
   const defaults=sex==='female'
    ?['heart','brain','liver','uterus','vagina','ovary','stomach','urinary bladder','trachea']
    :['heart','brain','liver','stomach','spleen','pancreas','urinary bladder','trachea'];
   return defaults.map(name=>atlas.concepts.find(c=>c.name.toLowerCase()===name)).filter((x):x is Concept=>!!x);
  }
  return atlas.concepts.filter(c=>c.name.toLowerCase().includes(term)||c.id.toLowerCase().includes(term)).sort((a,b)=>a.name.length-b.name.length).slice(0,80);
 },[atlas,query,sex]);

 const choose=(c:Concept)=>{
  setChosen(c);
  setState(s=>({...s,selected:c.elements,isolate:false,rotate:false}));
  setDetails(true);
  setPanel(null);
 };

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
  setState(s=>({...initial,visible:sex==='female'?[...DEFAULT_VISIBLE,'integumentary']:DEFAULT_VISIBLE,reset:s.reset+1}));
  setChosen(null);
  setDetails(false);
  setPanel(null);
 };

 const openPanel=(next:'layers'|'search')=>{
  setDetails(false);
  setPanel(p=>p===next?null:next);
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
  </header>

  <nav className="top-actions" aria-label="Explorer panels">
   <Button
    variant="ghost"
    className="icon-button theme-toggle"
    aria-label={theme==='dark'?'Switch to light mode':'Switch to dark mode'}
    title={theme==='dark'?'Light mode':'Dark mode (darkgray)'}
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
    {activeSystems.map(s=><div className={`system-row ${state.visible.includes(s.id)?'enabled':''}`} key={s.id}>
     <Button variant="ghost" className="system-name" title={`Show only ${s.name.toLowerCase()}`} onClick={()=>setState(v=>({...v,visible:[s.id],isolate:false,selected:[]}))}>
      <span className="system-dot" style={{background:s.color}}/>{s.name}<span className="system-count">{counts[s.id]}</span>
     </Button>
     <Switch checked={state.visible.includes(s.id)} onCheckedChange={()=>toggle(s.id)} aria-label={`Show ${s.name.toLowerCase()}`} />
    </div>)}
   </div>
   <div className="panel-foot">
    <span>{visibleCount.toLocaleString()} pieces visible</span>
    <Button variant="ghost" onClick={()=>setState(s=>({...s,visible:[],selected:[],isolate:false}))}>Hide all</Button>
   </div>
  </section>

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

  <nav className="view-controls glass" aria-label="Camera controls">
   {(['three-quarter','front','side','back'] as View[]).map((v,i)=><Button variant="ghost" key={v} className={state.view===v?'active':''} aria-pressed={state.view===v} disabled={state.explode>.8&&v!=='front'} onClick={()=>setState(s=>({...s,view:v,reset:s.reset+1,rotate:false}))} title={`${v} view`} aria-label={`${v} view`}><span>{['¾','F','S','B'][i]}</span></Button>)}
   <i/>
   <Button variant="ghost" disabled={state.explode>=.4} aria-label={state.rotate?'Pause rotation':'Rotate body'} title="Auto rotate" className={state.rotate?'active':''} onClick={()=>setState(s=>({...s,rotate:!s.rotate}))}>{state.rotate?<Pause size={17}/>:<RotateCw size={18}/>}</Button>
   <Button variant="ghost" aria-label="Reset view and layers" title="Reset" onClick={reset}><RotateCcw size={17}/></Button>
  </nav>

  <div className="scene-caption">
   <span className="caption-line"/>
   <span>{state.isolate?(chosen?.name??'SELECTED STRUCTURE'):state.explode>.95?'ANATOMICAL INVENTORY':state.explode>.05?'SEPARATED STRUCTURES':sex==='female'?'FEMALE · REFERENCE ANATOMY':'ADULT HUMAN · MALE'}</span>
   <span className="caption-line"/>
  </div>

  <div className="bottom-dock glass">
   <Button variant="ghost" className="mobile-only dock-layers" onClick={()=>openPanel('layers')} aria-label="Open system layers"><Layers3 size={20}/><span>Systems</span></Button>
   <div className="explode-control">
    <div className="explode-label"><label id="explode-label">Explode anatomy</label><output>{Math.round(state.explode*100)}<span>%</span></output></div>
    <Slider aria-labelledby="explode-label" min={0} max={100} step={1} value={[state.explode*100]} onValueChange={v=>setState(s=>({...s,explode:(Array.isArray(v)?v[0]:v)/100,view:(Array.isArray(v)?v[0]:v)>80?'front':s.view,rotate:false}))}/>
    <div className="slider-endpoints"><span>Assembled</span><span>Every piece</span></div>
   </div>
   {state.explode > 0.05 && (
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
    <Button variant="ghost" className="dock-reset" onClick={reset} aria-label="Assemble and reset"><RotateCcw size={18}/><span>Reset</span></Button>
  </div>

  <footer className="studio-footer">
   <span>{state.explode>.8?'Drag to pan':'Drag to orbit'} <b>·</b> Pinch to zoom <b>·</b> Tap to inspect</span>
   <Button variant="ghost" onClick={()=>{setDetails(false);setPanel(null);setAbout(true);}}>Source & credits <ArrowUpRight size={12}/></Button>
  </footer>

  {progress<100&&!error&&<div className="loading glass" role="status"><Activity size={18}/><div><strong>Preparing the anatomy</strong><span>{progress}% · Loading {atlas?.parts.length.toLocaleString()??(sex==='female'?'888':'2,234')} pieces</span><div className="loading-track"><i style={{width:`${progress}%`}}/></div></div></div>}
  {error&&<div className="loading glass error" role="alert"><p>{error}</p><Button variant="ghost" onClick={()=>location.reload()}>Reload viewer</Button></div>}

  {/* Standardized Information Panel: Identical layout and quality for Male and Female */}
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
