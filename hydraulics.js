// Game-scale bridge scour and an internal, conservative sluice boundary.
// Scour exposure uses depth * velocity² over time, not a universal failure speed.
class HydraulicWorks {
 constructor(w,map){this.w=w;this.map=map;this.health=100;this.speed=0;this.load=0;this.scouring=false;this.damBuilt=false;this.gate=.25;this.gateFlow=0;this.builtFraction=0;this.damCells=[];this.gatePairs=[];w.control=this;
  if(map.dam){const d=map.dam;for(let j=0;j<w.n;j++)for(let i=0;i<w.n;i++){const k=j*w.n+i,x=i*w.dx-32,z=j*w.dx-32;if(Math.abs(x-d.x)<=d.width/2&&Math.abs(z-d.z)<1.05)this.damCells.push(k);}
   const used=new Set();for(let x=d.x-d.gateWidth/2+w.dx/2;x<d.x+d.gateWidth/2;x+=w.dx){const a=w.index(x,d.z-2),b=w.index(x,d.z+2);if(!used.has(a)){used.add(a);this.gatePairs.push([a,b]);}}
  }
 }
 get damCost(){const d=this.map.dam;return d?this.damCells.reduce((s,k)=>s+Math.max(0,d.crest-this.w.h[k])*this.w.area,0):0;}
 build(dt,crew){if(!this.map.dam||this.damBuilt)return true;const w=this.w,d=this.map.dam,cost=this.damCost;if(cost<.01){this.damBuilt=true;this.builtFraction=1;return true;}const fraction=Math.min(1,dt*.5,crew?crew.soil/cost:1,crew?crew.hours*18/cost:1);if(fraction<=1e-7)return false;
  let used=0;for(const k of this.damCells){const fill=Math.max(0,d.crest-w.h[k])*fraction;w.h[k]+=fill;used+=fill*w.area;}w.earth+=used;if(crew){crew.soil=Math.max(0,crew.soil-used);crew.hours=Math.max(0,crew.hours-used/18);}
  this.builtFraction=1-this.damCost/(this.originalCost||=cost);const remaining=this.damCost;if(remaining<.5&&(!crew||(crew.soil>=remaining&&crew.hours*18>=remaining))){for(const k of this.damCells)w.h[k]=Math.max(w.h[k],d.crest);w.earth+=remaining;if(crew){crew.soil-=remaining;crew.hours-=remaining/18;}this.damBuilt=true;this.builtFraction=1;}return this.damBuilt;
 }
 transfer(dt){this.gateFlow=0;if(!this.damBuilt||!this.gate)return;const w=this.w,d=this.map.dam;
  for(const [a,b] of this.gatePairs){const ea=w.h[a]+w.w[a],eb=w.h[b]+w.w[b],from=ea>=eb?a:b,to=ea>=eb?b:a,up=Math.max(ea,eb),down=Math.min(ea,eb);const opening=Math.min(d.maxOpening*this.gate,Math.max(0,up-d.invert)),head=Math.max(0,up-Math.max(down,d.invert+opening*.5));if(!opening||!head)continue;
   const speed=.62*Math.sqrt(2*w.gravity*head),volume=Math.min(w.w[from]*w.area*.25,w.dx*opening*speed*dt),depth=volume/w.area;if(!depth)continue;
   const retain=1-depth/w.w[from];w.w[from]-=depth;w.qx[from]*=retain;w.qz[from]*=retain;w.w[to]+=depth;w.qz[to]+=depth*Math.min(6,speed)*(from===a?1:-1);this.gateFlow+=volume/dt*(from===a?1:-1);
  }
 }
 tick(dt,expose=true){const b=this.map.bridge;if(!b){this.speed=this.load=0;return;}const w=this.w;let speed=0,load=0;
  for(let x=b.x-2;x<=b.x+2;x+=w.dx){const depth=w.sample(w.w,x,b.z-1.6),v=Math.hypot(w.sample(w.vx,x,b.z-1.6),w.sample(w.vz,x,b.z-1.6));if(depth>.04){speed=Math.max(speed,v);load=Math.max(load,depth*v*v);}}
  this.speed=speed;this.load=load;this.scouring=load>b.resistance;
  if(expose)this.health=Math.max(0,this.health-Math.max(0,load-b.resistance)*dt*1.6);
 }
 reset(){this.health=100;this.scouring=false;this.gateFlow=0;}
 snapshot(){return {health:this.health,damBuilt:this.damBuilt,gate:this.gate,builtFraction:this.builtFraction};}
 restore(s){if(!s)return;this.health=Math.max(0,Math.min(100,Number(s.health)||0));this.damBuilt=!!s.damBuilt;this.gate=Math.max(0,Math.min(1,Number(s.gate)||0));this.builtFraction=Math.max(0,Math.min(1,Number(s.builtFraction)||0));}
}
if(typeof module!=='undefined')module.exports=HydraulicWorks;
