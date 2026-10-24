const assert=require('assert/strict'),W=require('./sim'),C=require('./campaign'),Nav=require('./resident-navigation');
function flat(){const w=new W();w.h.fill(0);w.w.fill(0);w.mask.fill(1);return w;}
function paint(w,fn){for(let j=0;j<w.n;j++)for(let i=0;i<w.n;i++){const k=j*w.n+i;fn(k,i*w.dx-32,j*w.dx-32);}}
{
 const w=flat();paint(w,(k,x,z)=>{w.h[k]=Math.max(0,(x-7)*.18);if(Math.abs(x)<2)w.w[k]=2;});
 const nav=new Nav(w,{x:5,z:1},[],0),path=nav.route();assert(path.length);assert(path.every(([x])=>x>2));
 for(let i=0;i<500;i++){const old=[nav.x,nav.z];nav.tick(.04,.3);assert(nav.segment(...old,nav.x,nav.z));assert(nav.x>2);}
 assert(nav.refuge(nav.x,nav.z));assert(Math.hypot(nav.x-5,nav.z-1)>1);
 for(let i=0;i<500;i++)nav.tick(.04,0);assert(Math.hypot(nav.x-5,nav.z-1)<.05);
 console.log('PASS nearby refuge stays on the dry bank and return follows land');
}
{
 const w=flat();paint(w,(k,x)=>{if(x<-3)w.h[k]=1;if(Math.abs(x)<2)w.w[k]=2;});
 const nav=new Nav(w,{x:5,z:0},[],0);assert.deepEqual(nav.route(),[],'Opposite-bank refuge is unreachable');
 for(let i=0;i<20;i++)nav.tick(.1,.3);assert.equal(nav.x,5);console.log('PASS no route means no teleporting or crossing the river');
}
{
 const w=flat();paint(w,(k,x)=>w.h[k]=Math.max(0,(x-7)*.18));const nav=new Nav(w,{x:5,z:0},[],0);nav.tick(.05,.3);assert(nav.path.length);
 paint(w,(k,x)=>{if(x>5.4)w.w[k]=2;});for(let i=0;i<100;i++)nav.tick(.04,.3);assert(nav.x<5.4);console.log('PASS rising water invalidates the route before entry');
}
{
 const w=flat();paint(w,(k,x)=>{if(x>6)w.h[k]=4;});const nav=new Nav(w,{x:5,z:0},[],0);assert.deepEqual(nav.route(),[]);console.log('PASS steep banks cannot be climbed directly');
}
C.seed(JSON.parse(require('fs').readFileSync('reference/initial-rivers.json','utf8')).states);
for(let id=0;id<6;id++){
 const w=new W();C.prepare(w,id);const houses=w.map.houses.map(([x,z])=>({x,z,floor:w.sample(w.h,x,z)}));
 const people=houses.map(h=>new Nav(w,{x:h.x+1.9,z:h.z+1.8},houses,h.floor));let moved=0;
 for(let time=.08;time<=C.levels[id].duration;time+=.08){w.step(.08,C.rate(id,time));for(let i=0;i<people.length;i++){const nav=people[i],h=houses[i],x=nav.x,z=nav.z;nav.tick(.02,Math.max(0,w.sample(w.h,h.x,h.z)+w.sample(w.w,h.x,h.z)-h.floor));if(Math.hypot(nav.x-x,nav.z-z)>1e-8){assert(nav.segment(x,z,nav.x,nav.z),'Every motion segment remains passable');assert(Math.hypot(nav.x-x,nav.z-z)<=.064001);moved++;}}}
 if(id===0)assert(moved>100,'Residents must visibly evacuate during the original first-level flood');
 console.log('PASS real-map flood routing',id,'movement steps',moved);
}
