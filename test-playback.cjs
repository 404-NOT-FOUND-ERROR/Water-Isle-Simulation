const assert=require('node:assert/strict'),W=require('./sim'),C=require('./campaign'),H=require('./hydraulics'),Trial=require('./trial'),Compare=require('./comparison'),{prepare}=require('./audit-levels.cjs');
const prepared=prepare(4,['borrow','dam','outlet','canal','drain']),built=prepared.w.snapshot(),dam=prepared.h.snapshot();
function journey(chunked){
 const w=new W();C.prepare(w,4);w.restore(built);const h=new H(w,w.map);h.restore(dam);Trial.reset(w,prepared.base,h);h.gate=.75;
 const comparison=new Compare(W,C,H,4,prepared.base,w.map.houses.map(([x,z])=>w.sample(prepared.base.h,x,z)));
 const t={time:0,duration:C.levels[4].duration};let crossed=false;
 while(t.time<t.duration-1e-7){
  const stop=Trial.nextStop(4,t.time),batch=chunked?57:1;
  for(let n=0;n<batch&&t.time<stop-1e-7;n++)Trial.advance(w,h,comparison,4,t,Math.min(.08,stop-t.time));
  if(!crossed&&t.time>=C.levels[4].storm-1e-7){assert.equal(t.time,96);assert(t.maxBasin>=500);assert(t.farmSeconds<.1);h.gate=.25;crossed=true;}
 }
 Object.assign(t,{earth:w.earth,hours:prepared.crew.hours,damBuilt:h.damBuilt});assert(C.grade(4,t).primary,'Seasonal gate operation should pass');return {w,t,history:comparison.history};
}
const live=journey(false),skip=journey(true);assert.deepEqual(skip.w.w,live.w.w);assert.deepEqual(skip.w.qz,live.w.qz);assert.deepEqual(skip.t,live.t);assert.deepEqual(skip.history,live.history);
assert.equal(skip.t.time,200);assert(skip.t.farmSeconds>=24);assert(skip.t.endBasin>=100);
console.log('PASS fast-forward and ordinary playback produce identical water, peaks, irrigation, history and grade');
{
 const w=new W(),base=C.prepare(w,0),h=new H(w,w.map),comparison=new Compare(W,C,H,0,base,w.map.houses.map(([x,z])=>w.sample(w.h,x,z))),t={time:0,duration:120};Trial.reset(w,base,h);
 while(!Trial.advance(w,h,comparison,0,t,.08)){}
 Object.assign(t,{earth:0,hours:0,damBuilt:false});assert(!C.grade(0,t).primary);assert(t.maxTown>=.18);assert.equal(t.time,120);console.log('PASS skipping an unprotected village records the full flood and still fails');
}
for(let id=0;id<6;id++){assert.equal(Trial.nextStop(id,0),id===4?96:C.levels[id].duration);assert.equal(Trial.nextStop(id,C.levels[id].duration-1),C.levels[id].duration);}
