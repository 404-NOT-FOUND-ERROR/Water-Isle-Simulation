const assert=require('assert/strict'),W=require('./sim'),C=require('./campaign'),H=require('./hydraulics'),Trial=require('./trial'),{prepare,run}=require('./audit-levels.cjs');
{
 const {w,base,h}=prepare(3,['borrow','dam']);Trial.reset(w,base,h);
 for(const k of h.damCells)assert.equal(w.w[k],0,'A newly raised dam must not start with water on its crest');
 assert(w.mass()<=base.initialMass+1e-8,'Reset cannot create water in excavations');
 const initial=w.snapshot();for(let i=0;i<30;i++)w.step(.08,24);Trial.reset(w,base,h);assert.deepEqual(w.w,initial.w);assert.deepEqual(w.qz,initial.qz);console.log('PASS bed-aware, water-conserving repeatable trial setup');
}
{
 const w=new W(41);w.sources=[];w.mask.fill(1);w.h.fill(0);w.w.fill(0);w.qx.fill(0);w.qz.fill(0);
 const map={dam:{x:0,z:0,width:64,crest:2,invert:0,gateWidth:2.4,maxOpening:1.5}},h=new H(w,map);h.build(100);h.gate=0;
 for(let j=0;j<w.n;j++)for(let i=0;i<w.n;i++)if(j*w.dx-32<-2)w.w[j*w.n+i]=3;
 const mass=w.mass();let overtopped=false;for(let i=0;i<150;i++){w.step(.02,0);overtopped||=h.overtopFlow>.01;}
 assert(overtopped);assert.equal(h.gateFlow,0);assert(Math.abs(w.mass()-mass)<1e-7);console.log('PASS closed gate still permits physical overtopping above the crest');
}
{
 const w=new W();C.prepare(w,4);w.h.fill(0);w.w.fill(0);w.qx.fill(0);w.qz.fill(0);const h=new H(w,w.map);h.drySeason=true;for(const k of h.cropCells)w.w[k]=.15;const mass=w.mass();
 for(let i=0;i<200;i++){h.beginStep();h.consume(.1);h.endStep(.1);}assert(h.irrigationFlow<.01);assert(Math.abs(w.mass()+w.output-mass)<1e-8);console.log('PASS stagnant farm puddles are consumed instead of earning endless irrigation');
}
const records=[];function check(id,jobs,gate,expected,label){const result=run(id,jobs,gate);records.push({...result,label});assert.equal(result.pass,expected,label);console.log('PASS',label);return result;}
check(1,[],.5,false,'unprotected bridge fails');check(1,['relief'],.5,true,'bypass is a viable strategy');check(1,['bridgebed'],.5,true,'bridge widening is another viable strategy');
const inlet=check(2,['east'],.5,false,'opening inlet alone floods the other bank');assert(inlet.maxDown>.18);check(2,['east','eastout'],.5,true,'connected distributary succeeds');check(2,['west'],.5,true,'widening the original river remains an alternative');
const dam=['borrow','dam','outlet'];check(3,dam,0,false,'closed gate stores too much and spills');check(3,dam,1,false,'fully open gate misses storage target');check(3,dam,.5,true,'moderate release balances storage and safety');
const farm=[...dam,'canal','drain'],season=(t,c)=>t<c.storm?.75:.25;
check(4,dam,season,false,'no supply canal cannot sustain the crop target');check(4,farm,.75,false,'leaving the flood opening loses drought reserves');check(4,farm,0,false,'closing throughout cannot protect the village');check(4,farm,season,true,'seasonal gate operation and connected field succeeds');
require('fs').mkdirSync('test-results',{recursive:true});require('fs').writeFileSync('test-results/gameplay-balance.json',JSON.stringify(records,null,2));
