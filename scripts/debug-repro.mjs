import fs from 'fs';
const c = fs.readFileSync('app/anatomy.ts', 'utf8');
let pos = 0;
let found = [];
const needle = "id:'reproductive'";
while((pos = c.indexOf(needle, pos)) !== -1) {
  found.push(pos);
  console.log('Found at', pos, ':', c.substring(pos, pos+120));
  pos++;
}
if(found.length === 0) {
  console.log('NOT in SYSTEMS! Looking for all mentions...');
  let p2 = 0;
  while((p2 = c.indexOf('reproductive', p2)) !== -1) {
    console.log(p2, c.substring(p2, p2+60));
    p2++;
  }
}
