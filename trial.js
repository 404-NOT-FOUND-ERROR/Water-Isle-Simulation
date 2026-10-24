// Repeatable rain starts from the original river surface, fitted to the new bed.
// Excavation cannot create water, and raising a dam cannot place river water on its crest.
class WaterTrial {
 static reset(w,base,hydraulics){
  for(let k=0;k<w.w.length;k++){
   const old=base.w[k],depth=old>w.dry?Math.min(old,Math.max(0,base.h[k]+old-w.h[k])):0;
   w.w[k]=depth;w.qx[k]=(base.qx[k]||0)*depth/(old||1);w.qz[k]=(base.qz[k]||0)*depth/(old||1);
  }
  hydraulics?.reset();w.updateVelocity();w.input=w.output=0;w.initialMass=w.mass();
 }
 static phase(id,time){const c=(typeof module!=='undefined'?require('./campaign'):WaterCampaign).levels[id];return id===4&&time>=c.storm?'dry':time<c.storm*.42?'rising':time<c.storm*.68?'peak':'falling';}
}
if(typeof module!=='undefined')module.exports=WaterTrial;
