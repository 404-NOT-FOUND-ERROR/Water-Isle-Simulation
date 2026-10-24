const assert=require('assert/strict'),W=require('./sim'),C=require('./campaign'),Crew=require('./construction');
const w=new W(),base=C.prepare(w,1),sites=C.maps[1].houses.map(([x,z])=>({x,z,r:1.9})),s=new Crew(w,sites,C.levels[1]);
assert(s.order(-5,-5,'dig',2.8,true));for(let i=0;i<80;i++)s.tick(.05);const first=w.earth,soil=s.soil;for(let i=0;i<60;i++)s.tick(.05);assert(w.earth>first+1);assert(s.soil>soil);assert(s.job,'Hold lasts beyond a finite layer');
assert(s.retarget(-7,-5,'dig',2.8));assert.equal(s.job.x,-7);s.cancel();const after=w.earth;for(let i=0;i<30;i++)s.tick(.1);assert.equal(w.earth,after);assert(!s.job);assert.equal(s.path.length,0);
const save=s.snapshot();s.hours=0;assert(!s.order(-5,-5,'dig',2.8,true));assert(s.restore(save));s.soil=.2;assert(s.order(-5,-5,'raise',2.8,true));for(let i=0;i<200&&s.job;i++)s.tick(.05);assert(s.soil>=0&&s.soil<.001);assert(s.hours>=0);assert(!s.job);assert(Math.abs(w.mass()-w.initialMass-w.input+w.output)<1e-7);
console.log('PASS sustained hold, drag retarget, release, soil/hour caps and resource restore');
