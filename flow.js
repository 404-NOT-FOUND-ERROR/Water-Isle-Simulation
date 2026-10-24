// Advected pathlines: each point follows the simulated velocity, retaining its history.
const foamCount=320,riverTracers=180,trailLength=12,foamData=[];
const foamPos=new Float32Array(foamCount*3),foamGeo=new THREE.BufferGeometry();
foamGeo.setAttribute('position',new THREE.BufferAttribute(foamPos,3));
const foam=new THREE.Points(foamGeo,new THREE.PointsMaterial({color:0xf2fff3,size:.1,transparent:true,opacity:.7,depthWrite:false}));
foam.frustumCulled=false;foam.renderOrder=4;scene.add(foam);
const trailPos=new Float32Array(foamCount*(trailLength-1)*18),trailColors=new Float32Array(trailPos.length),trailGeo=new THREE.BufferGeometry();
trailGeo.setAttribute('position',new THREE.BufferAttribute(trailPos,3));trailGeo.setAttribute('color',new THREE.BufferAttribute(trailColors,3));
const flowRibbons=new THREE.Mesh(trailGeo,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}));
flowRibbons.frustumCulled=false;flowRibbons.renderOrder=4;scene.add(flowRibbons);
let trailClock=0,spawnSerial=0,seedClock=0;const flowingCells=[];
function findFlowingWater(){flowingCells.length=0;for(let k=0;k<world.w.length;k++)if(world.mask[k]&&world.w[k]>.025&&Math.hypot(world.vx[k],world.vz[k])>.035)flowingCells.push(k);}
function placeFoam(f,i,distributed=false){
 const phase=i*2.399+spawnSerial++*.73;
 if((i>=riverTracers||(world.mapId&&distributed))&&flowingCells.length){const k=flowingCells[(i*37+spawnSerial*17)%flowingCells.length];f.x=(k%world.n)*world.dx-32;f.z=Math.floor(k/world.n)*world.dx-32;}
 else{f.z=distributed?-23+(i+.5)/riverTracers*50:-24+(Math.sin(phase)*.5+.5)*2;f.x=world.river(f.z)+Math.sin(phase)*1.35;}
 f.age=0;
 for(let a=0;a<trailLength;a++){f.xs[a]=f.x;f.zs[a]=f.z;}
}
for(let i=0;i<foamCount;i++)foamData.push({x:0,z:0,age:0,xs:new Float32Array(trailLength),zs:new Float32Array(trailLength)});
function resetFlow(){trailClock=seedClock=0;findFlowingWater();foamData.forEach((f,i)=>placeFoam(f,i,true));}
function advanceFlow(dt){
 trailClock+=dt;seedClock+=dt;if(seedClock>.6){seedClock=0;findFlowingWater();}const record=trailClock>=.12;if(record)trailClock%=.12;
 for(let i=0;i<foamCount;i++){
  const f=foamData[i];f.age+=dt;
  if(world.sample(world.w,f.x,f.z)<.018||Math.hypot(f.x,f.z)>28.7||f.age>(i<riverTracers?140:3+(i%5)*.3)){placeFoam(f,i);continue;}
  const u=world.sample(world.vx,f.x,f.z),v=world.sample(world.vz,f.x,f.z),mx=f.x+u*dt*.5,mz=f.z+v*dt*.5;
  const nx=f.x+world.sample(world.vx,mx,mz)*dt,nz=f.z+world.sample(world.vz,mx,mz)*dt;
  if(world.sample(world.w,nx,nz)<.012){placeFoam(f,i);continue;}
  f.x=nx;f.z=nz;
  if(record){f.xs.copyWithin(1,0,trailLength-1);f.zs.copyWithin(1,0,trailLength-1);}
  f.xs[0]=f.x;f.zs[0]=f.z;
 }
}
function renderFlow(){
 let at=0;
 const emit=(x,y,z,t)=>{trailPos[at]=x;trailColors[at++]=.45+.48*t;trailPos[at]=y;trailColors[at++]=.8+.19*t;trailPos[at]=z;trailColors[at++]=.8+.15*t;};
 for(let i=0;i<foamCount;i++){
  const f=foamData[i],wet=world.sample(world.w,f.x,f.z)>.018,glow=i<riverTracers?Math.max(0,Math.sin(f.age*.6+i*1.73)):Math.min(1,(3+(i%5)*.3-f.age)/.5),fade=Math.min(1,f.age/.5)*Math.sqrt(glow),tail=4+i%5;
  foamPos[i*3]=f.x;foamPos[i*3+1]=wet&&glow>.25?terrainHeight(f.x,f.z)+world.sample(world.w,f.x,f.z)+.065:-30;foamPos[i*3+2]=f.z;
  for(let a=0;a<tail;a++){
   const ax=f.xs[a],az=f.zs[a],bx=f.xs[a+1],bz=f.zs[a+1],len=Math.hypot(bx-ax,bz-az);
   if(!wet||len<.002||len>2.5||world.sample(world.w,bx,bz)<.015)continue;
   const width=(.015+.028*(1-a/tail))*fade,px=-(bz-az)/len*width,pz=(bx-ax)/len*width;
   const ay=terrainHeight(ax,az)+world.sample(world.w,ax,az)+.055,by=terrainHeight(bx,bz)+world.sample(world.w,bx,bz)+.055;
   const tint=1-a/tail;
   emit(ax+px,ay,az+pz,tint);emit(ax-px,ay,az-pz,tint);emit(bx+px,by,bz+pz,tint);
   emit(ax-px,ay,az-pz,tint);emit(bx-px,by,bz-pz,tint);emit(bx+px,by,bz+pz,tint);
  }
 }
 trailGeo.setDrawRange(0,at/3);trailGeo.attributes.position.needsUpdate=true;trailGeo.attributes.color.needsUpdate=true;foamGeo.attributes.position.needsUpdate=true;
}
