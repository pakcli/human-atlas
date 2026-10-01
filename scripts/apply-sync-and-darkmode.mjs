import fs from 'fs';

// ==========================================
// 1. Update app/globals.css with darkgray theme
// ==========================================
console.log('--- 1. Updating app/globals.css ---');
let css = fs.readFileSync('app/globals.css', 'utf8');

const darkStyles = `
/* ================= Darkmode (Darkgray) Styles ================= */
.dark {
  color-scheme: dark;
  --background: #181b1f;
  --foreground: #e2e8f0;
  --card: #20252b;
  --card-foreground: #f1f5f9;
  --popover: #20252b;
  --popover-foreground: #f1f5f9;
  --primary: #38bdf8;
  --primary-foreground: #0f172a;
  --secondary: #272c34;
  --secondary-foreground: #f1f5f9;
  --muted: #272c34;
  --muted-foreground: #94a3b8;
  --accent: #272c34;
  --accent-foreground: #f1f5f9;
  --border: rgba(255, 255, 255, 0.1);
  --input: rgba(255, 255, 255, 0.15);
  --ring: #38bdf8;
  background: #181b1f;
  color: #e2e8f0;
}
.dark body, .dark #root, .dark .studio {
  background: #181b1f;
  color: #e2e8f0;
}
.dark .vignette {
  background: radial-gradient(ellipse at 51% 43%, transparent 35%, rgba(0, 0, 0, 0.45) 100%);
}
.dark .glass {
  background: rgba(27, 31, 37, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  color: #f1f5f9;
}
.dark h1 {
  color: #f8fafc;
}
.dark h1 .edition {
  color: #94a3b8;
  border-color: rgba(255, 255, 255, 0.15);
}
.dark .eyebrow {
  color: #94a3b8;
}
.dark .identity-meta {
  color: #94a3b8;
}
.dark .identity-meta span {
  color: #64748b;
}
.dark .sex-toggle-group {
  background: rgba(30, 35, 42, 0.9);
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.3);
}
.dark .sex-toggle-btn {
  color: #94a3b8 !important;
}
.dark .sex-toggle-btn.active {
  background: #2a313b !important;
  color: #f8fafc !important;
  box-shadow: 0 1px 4px rgba(0,0,0,0.4) !important;
}
.dark .top-actions button {
  background: rgba(36, 42, 50, 0.85);
  border-color: rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
}
.dark .top-actions button:hover {
  background: rgba(48, 56, 66, 0.95);
  color: #ffffff;
}
.dark .top-actions kbd {
  border-color: rgba(255, 255, 255, 0.15);
  color: #94a3b8;
}
.dark .layers-panel {
  background: rgba(27, 31, 37, 0.92);
}
.dark .panel-heading {
  color: #f1f5f9;
}
.dark .panel-heading .small-number {
  background: #272c34;
  color: #94a3b8;
}
.dark .layer-presets {
  background: rgba(20, 24, 29, 0.8);
}
.dark .layer-presets button {
  color: #94a3b8;
}
.dark .layer-presets button[aria-pressed=true] {
  background: #2b323c;
  color: #ffffff;
}
.dark .system-name {
  color: #94a3b8;
}
.dark .enabled .system-name {
  color: #f1f5f9;
}
.dark .system-count {
  color: #64748b;
}
.dark .panel-foot {
  border-color: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
}
.dark .panel-foot button {
  color: #94a3b8;
}
.dark .view-controls {
  background: rgba(27, 31, 37, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.dark .view-controls button {
  color: #94a3b8;
}
.dark .view-controls .active {
  background: #38bdf8;
  color: #0f172a;
}
.dark .view-controls i {
  background: rgba(255, 255, 255, 0.1);
}
.dark .bottom-dock {
  background: rgba(27, 31, 37, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.dark .explode-label {
  color: #cbd5e1;
}
.dark .explode-label output {
  background: #232932;
  border-color: rgba(255, 255, 255, 0.08);
  color: #f1f5f9;
}
.dark .explode-control [data-slot=slider-thumb] {
  background: #38bdf8;
  border-color: #1e242b;
}
.dark .slider-endpoints {
  color: #64748b;
}
.dark .dock-reset {
  border-color: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}
.dark .scene-caption {
  color: #94a3b8;
}
.dark .caption-line {
  background: rgba(255, 255, 255, 0.15);
}
.dark .studio-footer {
  color: #64748b;
}
.dark .studio-footer button {
  color: #94a3b8;
}
.dark .detail-sheet {
  background: rgba(27, 31, 37, 0.96) !important;
  color: #f1f5f9 !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}
.dark .structure-title {
  color: #f8fafc !important;
}
.dark .structure-description {
  color: #cbd5e1 !important;
}
.dark .search-panel {
  background: rgba(27, 31, 37, 0.95);
  color: #f1f5f9;
}
.dark .search-panel [data-slot=input-group] {
  background: rgba(20, 24, 29, 0.8);
}
.dark .search-panel input {
  color: #f1f5f9;
}
.dark .anatomy-search-results {
  background: #20262e !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  color: #f1f5f9 !important;
}
.dark .theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #facc15 !important;
}
`;

if (!css.includes('Darkmode (Darkgray) Styles')) {
  css += darkStyles;
  fs.writeFileSync('app/globals.css', css, 'utf8');
  console.log('Appended darkmode styles to app/globals.css');
}

// ==========================================
// 2. Update app/scene.tsx: Accept theme prop & sync amount
// ==========================================
console.log('\n--- 2. Updating app/scene.tsx ---');
let scene = fs.readFileSync('app/scene.tsx', 'utf8');
const sceneCRLF = scene.includes('\r\n');
scene = scene.replace(/\r\n/g, '\n');

// 2A: Update Props interface
scene = scene.replace(
  'interface Props {atlas:Atlas;state:SceneState;onSelect:(id:string)=>void;onProgress:(n:number)=>void;onError:(s:string)=>void}',
  'interface Props {atlas:Atlas;state:SceneState;onSelect:(id:string)=>void;onProgress:(n:number)=>void;onError:(s:string)=>void;theme?:\"light\"|\"dark\"}'
);
scene = scene.replace(
  'export default function AnatomyScene({atlas,state,onSelect,onProgress,onError}:Props){',
  'export default function AnatomyScene({atlas,state,onSelect,onProgress,onError,theme=\"light\"}:Props){\n const latestTheme=useRef(theme);latestTheme.current=theme;'
);

// 2B: Initialize amount to state.explode so switching sex stays in sync!
scene = scene.replace(
  'lastIsolate=\'\',layoutKey=\'\',amount=0;',
  'lastIsolate=\'\',layoutKey=\'\',amount=latest.current.explode;'
);

// 2C: Dynamic colors based on theme in setup
const oldSetupColors = `renderer.setClearColor('#f2f3f3');renderer.outputColorSpace=T.SRGBColorSpace;`;
const newSetupColors = `const isInitDark=latestTheme.current==='dark';renderer.setClearColor(isInitDark?'#1b1e22':'#f2f3f3');renderer.outputColorSpace=T.SRGBColorSpace;`;
scene = scene.replace(oldSetupColors, newSetupColors);

const oldGroundColors = `const ground=new T.Mesh(new T.CircleGeometry(30,96),new T.MeshStandardMaterial({color:0xd5d9dc,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.019;scene.add(ground);
  const platform=new T.Mesh(new T.CylinderGeometry(.68,.7,.028,100),new T.MeshStandardMaterial({color:0xeeeeec,metalness:.12,roughness:.67}));platform.position.y=-.016;scene.add(platform);
  const ring=new T.Mesh(new T.RingGeometry(.63,.632,128),new T.MeshBasicMaterial({color:0x8c969f,transparent:true,opacity:.4,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.001;scene.add(ring);
  const innerRing=new T.Mesh(new T.RingGeometry(.55,.551,128),new T.MeshBasicMaterial({color:0xa4aeb8,transparent:true,opacity:.16,side:T.DoubleSide}));`;

const newGroundColors = `const ground=new T.Mesh(new T.CircleGeometry(30,96),new T.MeshStandardMaterial({color:isInitDark?0x14171a:0xd5d9dc,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.019;scene.add(ground);
  const platform=new T.Mesh(new T.CylinderGeometry(.68,.7,.028,100),new T.MeshStandardMaterial({color:isInitDark?0x23272d:0xeeeeec,metalness:.12,roughness:.67}));platform.position.y=-.016;scene.add(platform);
  const ring=new T.Mesh(new T.RingGeometry(.63,.632,128),new T.MeshBasicMaterial({color:isInitDark?0x3d454e:0x8c969f,transparent:true,opacity:.4,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.001;scene.add(ring);
  const innerRing=new T.Mesh(new T.RingGeometry(.55,.551,128),new T.MeshBasicMaterial({color:isInitDark?0x2c333b:0xa4aeb8,transparent:true,opacity:.16,side:T.DoubleSide}));`;
scene = scene.replace(oldGroundColors, newGroundColors);

// 2D: In animate loop, check for live theme change
const oldAnimateStart = `  const animate=()=>{
   if(disposed)return;frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),s=latest.current;`;

const newAnimateStart = `  let currentThemeName=latestTheme.current;
  const animate=()=>{
   if(disposed)return;frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),s=latest.current;
   if(currentThemeName!==latestTheme.current){
    currentThemeName=latestTheme.current;
    const isDark=currentThemeName==='dark';
    renderer.setClearColor(isDark?'#1b1e22':'#f2f3f3');
    (ground.material as T.MeshStandardMaterial).color.set(isDark?0x14171a:0xd5d9dc);
    (platform.material as T.MeshStandardMaterial).color.set(isDark?0x23272d:0xeeeeec);
    (ring.material as T.MeshBasicMaterial).color.set(isDark?0x3d454e:0x8c969f);
    (innerRing.material as T.MeshBasicMaterial).color.set(isDark?0x2c333b:0xa4aeb8);
    dirty=true;
   }`;
scene = scene.replace(oldAnimateStart, newAnimateStart);

if (sceneCRLF) scene = scene.replace(/\n/g, '\r\n');
fs.writeFileSync('app/scene.tsx', scene, 'utf8');
console.log('app/scene.tsx updated with theme and synced amount');

// ==========================================
// 3. Update app/page.tsx: Theme toggle & Sex sync
// ==========================================
console.log('\n--- 3. Updating app/page.tsx ---');
let page = fs.readFileSync('app/page.tsx', 'utf8');
const pageCRLF = page.includes('\r\n');
page = page.replace(/\r\n/g, '\n');

// 3A: Add Moon, Sun to imports
if (!page.includes('Moon')) {
  page = page.replace(
    "import {Activity,ArrowRightLeft,ArrowUpRight,ChevronRight,CircleDot,Focus,Info,Layers3,Pause,RotateCcw,RotateCw,Search,X} from 'lucide-react';",
    "import {Activity,ArrowRightLeft,ArrowUpRight,ChevronRight,CircleDot,Focus,Info,Layers3,Moon,Pause,RotateCcw,RotateCw,Search,Sun,X} from 'lucide-react';"
  );
  console.log('Added Moon, Sun icons to imports in page.tsx');
}

// 3B: Add theme state & toggle handler in Home
const oldHomeStart = `export default function Home(){\n const detailTitle=useRef<HTMLHeadingElement>(null);`;
const newHomeStart = `export default function Home(){\n const detailTitle=useRef<HTMLHeadingElement>(null);
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
 const toggleTheme=()=>setTheme(t=>t==='dark'?'light':'dark');`;

if (!page.includes('toggleTheme') && page.includes(oldHomeStart)) {
  page = page.replace(oldHomeStart, newHomeStart);
  console.log('Added theme state and toggle handler');
}

// 3C: Pass theme to AnatomyScene
page = page.replace(
  '<AnatomyScene atlas={atlas} state={{...state,inspectorOpen:details&&selectedParts.length>0}}',
  '<AnatomyScene atlas={atlas} state={{...state,inspectorOpen:details&&selectedParts.length>0}} theme={theme}'
);

// 3D: SYNC SYSTEMS PANEL AND EXPLODE WHEN SWITCHING SEX!
// Instead of resetting state to ...initial, we keep prev.visible, prev.explode, prev.view, prev.showDots!
const oldSexEffectState = `   setState({...initial,visible:sex==='female'?[...DEFAULT_VISIBLE,'integumentary']:DEFAULT_VISIBLE});`;
const newSexEffectState = `   setState(prev=>({
     ...prev,
     selected:[],
     isolate:false,
     reset:prev.reset+1,
   }));`;

if (page.includes(oldSexEffectState)) {
  page = page.replace(oldSexEffectState, newSexEffectState);
  console.log('Fixed sex switch: systems panel and explode anatomy now fully synced!');
}

// 3E: Add Dark/Light mode toggle in top-actions (top right corner: di pojok kanan atas)
const oldTopActions = `   <nav className="top-actions" aria-label="Explorer panels">
    <Button variant="ghost" className={panel==='search'?'active':''} onClick={()=>openPanel('search')} aria-label="Search anatomy">`;

const newTopActions = `   <nav className="top-actions" aria-label="Explorer panels">
    <Button
     variant="ghost"
     className="icon-button theme-toggle"
     aria-label={theme==='dark'?'Switch to light mode':'Switch to dark mode'}
     title={theme==='dark'?'Switch to light mode':'Switch to dark mode (darkgray)'}
     onClick={toggleTheme}
    >
     {theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}
    </Button>
    <Button variant="ghost" className={panel==='search'?'active':''} onClick={()=>openPanel('search')} aria-label="Search anatomy">`;

if (!page.includes('theme-toggle') && page.includes(oldTopActions)) {
  page = page.replace(oldTopActions, newTopActions);
  console.log('Added dark/light mode toggle to top right corner (top-actions)');
}

if (pageCRLF) page = page.replace(/\n/g, '\r\n');
fs.writeFileSync('app/page.tsx', page, 'utf8');
console.log('app/page.tsx updated successfully');
