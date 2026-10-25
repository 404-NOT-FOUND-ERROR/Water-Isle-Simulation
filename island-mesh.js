// A shared shoreline keeps the terrain, water and floating rock shell joined.
const IslandMesh={
 create(n,dx,radius=29.7){
  const cells=[],edges=new Map(),points=[],ids=new Map();
  const edge=(a,b)=>{const key=a<b?a+','+b:b+','+a;edges.set(key,(edges.get(key)||0)+1);};
  for(let j=0;j<n-1;j++)for(let i=0;i<n-1;i++){
   if(Math.hypot((i+.5)*dx-32,(j+.5)*dx-32)>radius)continue;
   const a=j*n+i,b=a+1,c=a+n,d=c+1;
   for(const tri of [[a,c,b],[b,c,d]]){cells.push(tri);for(let v=0;v<3;v++)edge(tri[v],tri[(v+1)%3]);}
  }
  const shore=new Set();for(const [key,count] of edges)if(count===1)key.split(',').forEach(k=>shore.add(+k));
  const vertex=k=>{
   if(ids.has(k))return ids.get(k);
   let x=(k%n)*dx-32,z=Math.floor(k/n)*dx-32;
   if(shore.has(k)){const scale=radius/Math.hypot(x,z);x*=scale;z*=scale;}
   const gx=(x+32)/dx,gz=(z+32)/dx,i=Math.floor(gx),j=Math.floor(gz),fx=gx-i,fz=gz-j;
   const p={x,z,k,indices:[j*n+i,j*n+i+1,(j+1)*n+i,(j+1)*n+i+1],weights:[(1-fx)*(1-fz),fx*(1-fz),(1-fx)*fz,fx*fz]};
   ids.set(k,points.length);points.push(p);return points.length-1;
  };
  const faces=cells.flatMap(tri=>tri.map(vertex));
  const boundary=[...shore].map(k=>ids.get(k)).sort((a,b)=>Math.atan2(points[a].z,points[a].x)-Math.atan2(points[b].z,points[b].x));
  return {points,faces,boundary,radius};
 },
 sample(field,p){return p.indices.reduce((sum,k,i)=>sum+field[k]*p.weights[i],0);},
 shell(mesh,heights){
  const positions=[],colors=[],indices=[],rings=[[1,null],[.985,-6.2],[.92,-10.4],[.65,-14]],count=mesh.boundary.length;
  const palette=[[.66,.63,.44],[.62,.59,.45],[.46,.52,.49],[.35,.43,.43]];
  rings.forEach(([scale,y],layer)=>mesh.boundary.forEach((id,j)=>{
   const p=mesh.points[id],shade=1+.035*Math.sin(j*.77);
   positions.push(p.x*scale,y===null?heights[id]:y,p.z*scale);
   colors.push(...palette[layer].map(c=>c*shade));
  }));
  for(let l=0;l<rings.length-1;l++)for(let j=0;j<count;j++){
   const a=l*count+j,b=l*count+(j+1)%count,c=a+count,d=b+count;
   indices.push(a,b,c,b,d,c);
  }
  const center=positions.length/3;positions.push(0,-14.6,0);colors.push(...palette[3]);
  for(let j=0;j<count;j++)indices.push(3*count+j,3*count+(j+1)%count,center);
  return {positions,colors,indices};
 }
};
if(typeof module!=='undefined')module.exports=IslandMesh;
