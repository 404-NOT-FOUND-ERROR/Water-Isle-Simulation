const assert=require('assert/strict'),W=require('./sim'),C=require('./campaign'),H=require('./hydraulics'),Compare=require('./comparison'),Report=require('./report'),Trial=require('./trial');
C.seed(JSON.parse(require('fs').readFileSync('reference/initial-rivers.json','utf8')).states);
for(const id of [0,1,2,3,4,5]){
 const w=new W(),start=C.prepare(w,id),h=new H(w,w.map),floors=w.map.houses.map(p=>w.sample(w.h,...p));
 const c=new Compare(W,C,H,id,start,floors);Trial.reset(w,start,h);
 for(let t=.08;t<C.levels[id].duration+.001;t+=.08){const rate=C.rate(id,t,28);h.drySeason=id===4&&t>=C.levels[id].storm;w.step(.08,rate);h.tick(.08,id===1||id===4);c.step(.08,rate,t,w,h);}
 assert.deepEqual(c.before,c.after,'Unchanged islands must produce identical metrics in level '+id);
 assert.deepEqual(c.maps[0],c.maps[1]);assert(c.history.length>50);assert(c.maps[0].arrows.length>0);
 assert(Report.render(c,'未施工',null).includes('为什么会这样'));console.log('PASS equal initial worlds and same weather, level',id);
}
{
 const w=new W(),start=C.prepare(w,0),h=new H(w,w.map),floors=w.map.houses.map(p=>w.sample(w.h,...p));
 const job=C.works(0,w)[0];for(const p of job.path)w.edit(...p,job.r,job.amount,'dig',[],job.floor??-1.8);
 w.w.set(start.w);w.qx.set(start.qx);w.qz.set(start.qz);Trial.reset(w,start,h);
 const c=new Compare(W,C,H,0,start,floors),terrain=w.h.slice();
 for(let t=.08;t<=120.001;t+=.08){const rate=C.rate(0,t);w.step(.08,rate);h.tick(.08,false);c.step(.08,rate,t,w,h);}
 assert(c.after.maxTown<c.before.maxTown);assert.deepEqual(w.h,terrain);assert.deepEqual(c.reference.h,start.h);
 assert.notDeepEqual(c.maps[0],c.maps[1]);console.log('PASS widening reduces measured peak, independent reference and visible map change',c.before.maxTown,c.after.maxTown);
}
