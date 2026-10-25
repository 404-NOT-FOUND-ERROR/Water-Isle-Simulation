const assert=require('node:assert/strict'),Mesh=require('./island-mesh'),W=require('./sim'),C=require('./campaign');
const w=new W(),mesh=Mesh.create(w.n,w.dx),count=mesh.boundary.length;
assert(mesh.points.length<5000,'The renderer should share vertices, not duplicate every triangle');
for(const p of mesh.points){assert(Math.hypot(p.x,p.z)<=mesh.radius+1e-8);assert(Math.abs(p.weights.reduce((a,b)=>a+b,0)-1)<1e-10);assert(p.indices.every(k=>k>=0&&k<w.h.length));}
for(const id of mesh.boundary)assert(Math.abs(Math.hypot(mesh.points[id].x,mesh.points[id].z)-mesh.radius)<1e-8);
for(let t=0;t<mesh.faces.length;t+=3){const [a,b,c]=mesh.faces.slice(t,t+3).map(i=>mesh.points[i]);assert((b.z-a.z)*(c.x-a.x)-(b.x-a.x)*(c.z-a.z)>1e-8,'Shoreline projection must not fold or invert surface triangles');}
for(let id=0;id<6;id++){
 C.configure(w,id);const heights=mesh.points.map(p=>Mesh.sample(w.h,p)),shell=Mesh.shell(mesh,heights);
 for(let j=0;j<count;j++){assert.equal(shell.positions[j*3+1],heights[mesh.boundary[j]]);assert(shell.positions[j*3+1]>-6.2,'Lower shell ring must stay below shoreline');}
 const shellId=v=>v<count?mesh.boundary[v]:mesh.points.length+v-count;
 const triangles=[...mesh.faces,...shell.indices.map(shellId)],edges=new Map();
 for(let t=0;t<triangles.length;t+=3)for(let i=0;i<3;i++){const a=triangles[t+i],b=triangles[t+(i+1)%3],key=a<b?a+','+b:b+','+a;edges.set(key,(edges.get(key)||0)+1);}
 assert([...edges.values()].every(n=>n===2),'Terrain plus shell must be watertight on map '+id);
 // Moving a shoreline vertex must also move its side wall, with no fixed rim above it.
 heights[mesh.boundary[12]]-=.4;assert.equal(Mesh.shell(mesh,heights).positions[12*3+1],heights[mesh.boundary[12]]);
}
console.log('PASS six maps: circular shoreline, shared vertices, watertight underside and matching moving seam');
