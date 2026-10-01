import fs from 'fs';

let p = fs.readFileSync('app/page.tsx', 'utf8');
const isCRLF = p.includes('\r\n');
p = p.replace(/\r\n/g, '\n');

// 1. Sync sex switch: preserve visible systems, explode level, view, and showDots
const oldSetState = `  setState({...initial,visible:sex==='female'?[...DEFAULT_VISIBLE,'integumentary']:DEFAULT_VISIBLE});`;
const newSetState = `  setState(prev=>({
   ...prev,
   selected:[],
   isolate:false,
   reset:prev.reset+1,
  }));`;

if (p.includes(oldSetState)) {
  p = p.replace(oldSetState, newSetState);
  console.log('1. Sex switch synced!');
} else {
  console.error('oldSetState not found');
}

// 2. Add Dark/Light mode toggle button in top-actions (pojok kanan atas)
const oldNav = `  <nav className="top-actions" aria-label="Explorer panels">
   <Button variant="ghost" className={panel==='search'?'active':''} onClick={()=>openPanel('search')} aria-label="Search anatomy">`;

const newNav = `  <nav className="top-actions" aria-label="Explorer panels">
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
   <Button variant="ghost" className={panel==='search'?'active':''} onClick={()=>openPanel('search')} aria-label="Search anatomy">`;

if (p.includes(oldNav)) {
  p = p.replace(oldNav, newNav);
  console.log('2. Theme toggle added to top-actions!');
} else {
  console.error('oldNav not found');
}

// 3. Ensure theme prop is passed to AnatomyScene
if (!p.includes('theme={theme}')) {
  p = p.replace(
    'onSelect={choosePart}',
    'theme={theme} onSelect={choosePart}'
  );
  console.log('3. theme={theme} passed to AnatomyScene');
}

if (isCRLF) p = p.replace(/\n/g, '\r\n');
fs.writeFileSync('app/page.tsx', p, 'utf8');
console.log('app/page.tsx saved successfully');
