import fs from 'fs';
let c = fs.readFileSync('app/scene.tsx', 'utf8');

// ---- Patch: loadChunk per-part body (4-space indent inside the forEach) ----
const oldPartBody = `    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,p.positions,p.vertexCount*3),3));\r\n    // GPU normalized signed-short normals keep the complete atlas compact in memory.\r\n    g.setAttribute('normal',new T.BufferAttribute(new Int16Array(buffer,p.normals,p.vertexCount*3),3,true));g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,p.indices,p.indexCount),1));\r\n    g.boundingBox=bounds[i].clone();g.computeBoundingSphere();const pick=new T.Mesh(g);pick.matrixAutoUpdate=false;pickers[i]=pick;geometries.push(g);\r\n    g.setAttribute('partIndex',new T.BufferAttribute(new Float32Array(p.vertexCount).fill(i),1));\r\n    const list=groups.get(p.system)??[];list.push(g);groups.set(p.system,list);`;

const newPartBody = `    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,p.positions,p.vertexCount*3),3));\r\n    // GPU normalized signed-short normals keep the complete atlas compact in memory.\r\n    g.setAttribute('normal',new T.BufferAttribute(new Int16Array(buffer,p.normals,p.vertexCount*3),3,true));g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,p.indices,p.indexCount),1));\r\n    if((p as {uvs?:number}).uvs!==undefined)g.setAttribute('uv',new T.BufferAttribute(new Float32Array(buffer,(p as {uvs:number}).uvs,p.vertexCount*2),2));\r\n    const isFRC=chunk.url.includes('female-10.bin');\r\n    g.boundingBox=bounds[i].clone();g.computeBoundingSphere();const pick=new T.Mesh(g);pick.matrixAutoUpdate=isFRC;pickers[i]=pick;geometries.push(g);\r\n    if(isFRC)tunerGroup.add(pick);\r\n    g.setAttribute('partIndex',new T.BufferAttribute(new Float32Array(p.vertexCount).fill(i),1));\r\n    const list=groups.get(p.system)??[];list.push(g);groups.set(p.system,list);`;

if (!c.includes(oldPartBody)) {
  console.error('OLD PART BODY NOT FOUND!');
  process.exit(1);
}
c = c.replace(oldPartBody, newPartBody);
console.log('Part body patched. Has uvs:', c.includes('p.uvs'), 'Has isFRC:', c.includes('isFRC'));

// ---- Patch: groups.forEach to route female-10 to chunk10Material ----
const oldGroupsLoop = `   groups.forEach((gs,system)=>{const geometry=mergeGeometries(gs,false);if(!geometry)throw new Error('Could not assemble anatomy geometry.');geometries.push(geometry);const mesh=new T.Mesh(geometry,mats.get(system as never));mesh.frustumCulled=false;scene.add(mesh);});`;
const newGroupsLoop = `   const isChunkFRC=chunk.url.includes('female-10.bin');\r\n   groups.forEach((gs,system)=>{const geometry=mergeGeometries(gs,false);if(!geometry)throw new Error('Could not assemble anatomy geometry.');geometries.push(geometry);const mesh=new T.Mesh(geometry,isChunkFRC?chunk10Material:mats.get(system as never));mesh.frustumCulled=false;if(isChunkFRC){tunerGroup.add(mesh);}else{scene.add(mesh);}});`;

if (!c.includes(oldGroupsLoop)) {
  console.error('OLD GROUPS LOOP NOT FOUND!');
  process.exit(1);
}
c = c.replace(oldGroupsLoop, newGroupsLoop);
console.log('Groups loop patched. Has isChunkFRC:', c.includes('isChunkFRC'));

fs.writeFileSync('app/scene.tsx', c, 'utf8');
console.log('All patches applied. Lines:', c.split('\n').length);
