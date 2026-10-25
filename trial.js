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
 static nextStop(id,time){const c=(typeof module!=='undefined'?require('./campaign'):WaterCampaign).levels[id];return id===4&&time<c.storm-1e-7?c.storm:c.duration;}
 // Playback and fast-forward both use these same bounded solver steps.
 static advance(w,h,comparison,id,trial,dt,weather=18){
  const Campaign=typeof module!=='undefined'?require('./campaign'):WaterCampaign;
  const step=Math.min(dt,trial.duration-trial.time,this.nextStop(id,trial.time)-trial.time);
  if(step<=0)return true;
  trial.time=Math.min(trial.duration,trial.time+step);
  if(Math.abs(trial.time-Campaign.levels[id].storm)<1e-7)trial.time=Campaign.levels[id].storm;
  const rate=Campaign.rate(id,trial.time,weather);h.drySeason=id===4&&trial.time>=Campaign.levels[id].storm;
  w.step(step,rate);h.tick(step,id===1||id===4);comparison.step(step,rate,trial.time,w,h);
  Object.assign(trial,comparison.after,{bridge:h.health>0});
  return trial.time>=trial.duration-1e-7;
 }
}
if(typeof module!=='undefined')module.exports=WaterTrial;
