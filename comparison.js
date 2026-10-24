// A separate untouched island receives exactly the same inflow and time steps.
// Neither the reference world nor report generation mutates the player's world.
class WaterComparison {
 constructor(World,Campaign,Hydraulics,id,start,floors){
  this.id=id;this.map=Campaign.maps[id];this.level=Campaign.levels[id];
  this.reference=new World();Campaign.prepare(this.reference,id);this.reference.restore(start);
  this.hydraulics=new Hydraulics(this.reference,this.map);(typeof module!=='undefined'?require('./trial'):WaterTrial).reset(this.reference,start,this.hydraulics);
  this.floors=floors;this.before=this.empty();this.after=this.empty();this.history=[];this.nextSample=0;
  this.cells=[];for(let k=0;k<this.reference.w.length;k++){const w=this.reference,x=k%w.n*w.dx-32,z=Math.floor(k/w.n)*w.dx-32;if(Math.hypot(x-this.map.basin[0],z-this.map.basin[1])<this.map.basin[2])this.cells.push(k);}
 }
 empty(){return {maxTown:0,maxDown:0,maxBasin:0,endBasin:0,maxFarm:0,farmSeconds:0,maxSpeed:0,bridgeHealth:100,housePeaks:[0,0,0,0],depths:[0,0,0,0]};}
 sample(w,h,m,time,dt){
  m.depths=this.map.houses.map(([x,z],i)=>Math.max(0,w.sample(w.h,x,z)+w.sample(w.w,x,z)-this.floors[i]));
  m.depths.forEach((d,i)=>m.housePeaks[i]=Math.max(m.housePeaks[i],d));
  m.maxTown=Math.max(m.maxTown,...m.depths.slice(0,3));m.maxDown=Math.max(m.maxDown,m.depths[3]);
  m.endBasin=this.cells.reduce((s,k)=>s+w.w[k]*w.area,0);m.maxBasin=Math.max(m.maxBasin,m.endBasin);
  const fd=w.sample(w.w,...this.map.farm);m.maxFarm=Math.max(m.maxFarm,fd);
  if(this.id===4&&time>=this.level.storm&&fd>.025&&fd<.5&&h.irrigationFlow>.35)m.farmSeconds+=dt;
  m.maxSpeed=Math.max(m.maxSpeed,h.speed);m.bridgeHealth=h.health;
 }
 step(dt,rate,time,world,hydraulics){
  this.hydraulics.drySeason=this.id===4&&time>=this.level.storm;this.reference.step(dt,rate);this.hydraulics.tick(dt,this.id===1||this.id===4);
  this.sample(this.reference,this.hydraulics,this.before,time,dt);this.sample(world,hydraulics,this.after,time,dt);
  if(time>=this.nextSample){this.history.push([time,Math.max(...this.before.depths.slice(0,3)),Math.max(...this.after.depths.slice(0,3))]);this.nextSample=time+1;}
  // Both maps show the same instant, when the upstream inflow reaches its peak.
  if(!this.maps&&time>=this.level.storm/2){this.mapTime=time;this.maps=[this.capture(this.reference),this.capture(world)];}
 }
 capture(w){
  const tiles=[],arrows=[];
  for(let j=1;j<w.n;j+=3)for(let i=1;i<w.n;i+=3){const k=j*w.n+i;if(!w.mask[k])continue;const x=i*w.dx-32,z=j*w.dx-32;tiles.push([x,z,w.w[k]]);if(i%9===1&&j%9===1&&w.w[k]>.04){const vx=w.vx[k],vz=w.vz[k],v=Math.hypot(vx,vz);if(v>.04)arrows.push([x,z,vx/v,vz/v]);}}
  return {tiles,arrows};
 }
}
if(typeof module!=='undefined')module.exports=WaterComparison;
