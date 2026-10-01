import type {Part} from './anatomy';
export interface LayoutCell {x:number;y:number;width:number;height:number}
/** Pack visible source meshes. When skin is enabled alongside internal anatomy, split skin to left and pack dissected parts to right. */
export function createExplosionLayout(parts:Part[],aspect=1){
 const skinParts = parts.filter(p=>p.system==='integumentary');
 const dissectedParts = parts.filter(p=>p.system!=='integumentary');

 // Standard single-block packing if no skin or ONLY skin
 if(skinParts.length===0 || dissectedParts.length===0){
  const cards=parts.map(p=>({id:p.id,system:p.system,width:Math.max(.035,p.bounds[1][0]-p.bounds[0][0])+.04,height:Math.max(.035,p.bounds[1][1]-p.bounds[0][1])+.04}));
  const area=cards.reduce((n,c)=>n+c.width*c.height,0),maxWidth=Math.max(.3,...cards.map(c=>c.width));
  const targetHeight=1.723;
  const targetWidth=Math.max(maxWidth,area/targetHeight,Math.sqrt(area*1.5)*1.18);
  cards.sort((a,b)=>b.height-a.height||a.id.localeCompare(b.id));
  const cells=new Map<string,LayoutCell>();let x=0,y=0,row=0,usedWidth=0;
  for(const c of cards){if(x>0&&x+c.width>targetWidth){x=0;y+=row;row=0;}cells.set(c.id,{x:x+c.width/2,y:-y-c.height/2,width:c.width,height:c.height});x+=c.width;usedWidth=Math.max(usedWidth,x);row=Math.max(row,c.height);}
  const height=y+row;
  cells.forEach(c=>{c.x-=usedWidth/2;c.y+=height/2;});
  return {cells,width:usedWidth,height};
 }

 // SPLIT VIEW: Human skin surface on LEFT, all other internal anatomy arranged on RIGHT.
 // Human skin natural height ~1.723m, width ~0.54m.
 const skinWidth = 0.54;
 const skinHeight = 1.723;

 const dissectedCards = dissectedParts.map(p=>({id:p.id,system:p.system,width:Math.max(.035,p.bounds[1][0]-p.bounds[0][0])+.04,height:Math.max(.035,p.bounds[1][1]-p.bounds[0][1])+.04}));
 const area = dissectedCards.reduce((n,c)=>n+c.width*c.height,0);
 const maxWidth = Math.max(.3,...dissectedCards.map(c=>c.width));

 // Target dissected block height to match 100% of human skin height along Y axis (1.72m).
 // Width adjusts dynamically so all parts fit cleanly in rows.
 const targetHeight = skinHeight;
 const targetWidth = Math.max(maxWidth, Math.sqrt(area * 1.5) * 1.15);

 dissectedCards.sort((a,b)=>b.height-a.height||a.id.localeCompare(b.id));
 const cells=new Map<string,LayoutCell>();let x=0,y=0,row=0,usedWidth=0;
 for(const c of dissectedCards){
  if(x>0&&x+c.width>targetWidth){x=0;y+=row;row=0;}
  cells.set(c.id,{x:x+c.width/2,y:-y-c.height/2,width:c.width,height:c.height});
  x+=c.width;
  usedWidth=Math.max(usedWidth,x);
  row=Math.max(row,c.height);
 }
 const dissectedHeight = Math.max(skinHeight, y + row);
 const dissectedWidth = usedWidth;

 const gap = 0.35;
 const totalWidth = skinWidth + gap + dissectedWidth;
 const totalHeight = dissectedHeight;

 const skinCenterX = -totalWidth/2 + skinWidth/2;
 const dissectedCenterX = totalWidth/2 - dissectedWidth/2;

 // 1) Offset dissected cells in right block, centered vertically
 dissectedCards.forEach(c=>{
  const cell = cells.get(c.id)!;
  const localX = cell.x - dissectedWidth/2;
  const localY = cell.y + (y + row)/2;
  cell.x = dissectedCenterX + localX;
  cell.y = localY;
 });

 // 2) Place skin parts intact as the human silhouette in left block
 skinParts.forEach(p=>{
  const cX = (p.bounds[0][0] + p.bounds[1][0]) / 2;
  const cY = (p.bounds[0][1] + p.bounds[1][1]) / 2;
  const w = p.bounds[1][0] - p.bounds[0][0];
  const h = p.bounds[1][1] - p.bounds[0][1];
  cells.set(p.id,{
   x: skinCenterX + cX,
   y: cY - 0.86,
   width: w,
   height: h
  });
 });

 return {cells,width:totalWidth,height:totalHeight};
}

