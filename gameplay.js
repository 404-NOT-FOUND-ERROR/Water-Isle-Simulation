let lessonKey='',lastPhase='',gateOpenedForTrial=false;
try{const progress=JSON.parse(localStorage.getItem('water-isle-journey-v7'));if(progress?.stars)stars=Array.from({length:6},(_,i)=>Math.max(0,Math.min(3,+progress.stars[i]||0)));}catch{}
function saveJourney(){try{localStorage.setItem('water-isle-journey-v7',JSON.stringify({stars}));}catch{}}
function workRequirement(w){
 if(!w)return '';
 if(w.kind==='dam'&&!hydraulics.damBuilt&&site?.soil<hydraulics.damCost)return '还需 '+Math.ceil(hydraulics.damCost-site.soil)+' 土料 · 先取土';
 if(site?.hours<=.001)return '工时用完 · 撤销一项工程再调整';
 if(chapter===2&&w.id==='eastout'&&!workDone.has('east')&&!site?.route(...w.path[0],w.r))return '先接通东汊入口';
 return '';
}
function updateWorkGuide(){
 const w=works[selected];if(!w)return;const lesson=WaterLearning.works[w.id],need=workRequirement(w);
 $('workTip').textContent=need||(workDone.has(w.id)?(world.map.dam&&!hydraulics.damBuilt?'取土完成 · 选择山口大坝':'已完成 · 选择下一处，或试水'):w.kind==='dam'?'需 '+Math.ceil(hydraulics.damCost)+' 土料 · 建好后拖动闸门':lesson?.[1]||w.tip);
 if(!workPlan){$('workBtn').textContent=workDone.has(w.id)?'已完成':need?'待准备':'开工';$('workBtn').disabled=!!trial||workDone.has(w.id)||!!need;}
}
function setGate(value){
 if(!hydraulics?.damBuilt)return;hydraulics.gate=Math.max(0,Math.min(1,Math.round(value*4)/4));
 if(trial&&comparisonRun&&comparisonRun.gates.at(-1)!==Math.round(hydraulics.gate*100))comparisonRun.gates.push(Math.round(hydraulics.gate*100));
 updateGateView();animateStructures(0);
}
function updateGateView(){
 const h=hydraulics,d=world.map?.dam;if(!d)return;
 const open=Math.round(h.gate*100);$('gateRange').value=open;$('gatePercent').textContent=open+'%';$('gateRange').setAttribute('aria-valuetext',open+'% 开度');
 $('gateSection').innerHTML=WaterLearning.svg('dam',h.gate,(h.upstream-d.invert)/(d.crest-d.invert),(h.downstream-d.invert)/(d.crest-d.invert));
 const overflow=h.overtopFlow>.05;$('gateStatus').textContent=overflow?'坝顶溢流 '+h.overtopFlow.toFixed(1):'距坝顶 '+Math.max(0,d.crest-h.upstream).toFixed(2)+' 格';$('gateStatus').classList.toggle('warn',overflow);
 $('gateFlow').textContent='下泄 '+Math.max(0,h.gateFlow).toFixed(1)+' 格/秒';$('gateStorage').textContent='库水 '+Math.round(lastStats?.basin||0)+' 格';
 $('gateControls').dataset.alert=String(overflow);
}
$('gateRange').oninput=e=>setGate(+e.target.value/100);
$('gateClose').onclick=()=>{$('gateControls').hidden=true;};
function updateGuidance(){
 const phase=trial?WaterTrial.phase(chapter,trial.time):'build',h=hydraulics;
 const hint=WaterLearning.hint(chapter,workDone,h,metrics(),phase),key=hint.join('|');
 if(key!==lessonKey){lessonKey=key;$('lessonCard').innerHTML=WaterLearning.card(chapter,workDone,h,metrics(),phase);}
 $('phaseRail').innerHTML=(chapter===4?[['build','施工'],['rain','暴雨'],['dry','晴天']]:[['build','施工'],['rain','来雨'],['result','对比']]).map(([id,label])=>'<span class="'+((id===phase||(id==='rain'&&['rising','peak','falling'].includes(phase)))?'active':'')+'">'+label+'</span>').join('<i>→</i>');
 if(trial){
  if(phase!==lastPhase){lastPhase=phase;if(phase==='dry'){toast('雨停了 · 关小闸门留水，看田边供水');$('gateControls').hidden=false;}else if(phase==='peak'&&h.damBuilt)toast('洪峰到了 · 看库水位和下游');}
  if(h.damBuilt&&!gateOpenedForTrial){$('gateControls').hidden=false;gateOpenedForTrial=true;}
 }else{lastPhase='';gateOpenedForTrial=false;updateWorkGuide();}
 if(!h.damBuilt)$('gateControls').hidden=true;else if(!$('gateControls').hidden)updateGateView();
 const wm=world.map;
 $('liveCompare').textContent=trial&&comparisonRun?'同场雨 · 小镇水深 '+comparisonRun.before.maxTown.toFixed(2)+' → '+comparisonRun.after.maxTown.toFixed(2):'';
 $('gateMapBtn').disabled=!h.damBuilt;$('gateMapBtn').textContent=h.damBuilt?'闸门 '+Math.round(h.gate*100)+'%':(site?.soil<h.damCost?'坝址 · 先取土':'坝址 · 待筑坝');
 if(wm.dam){const p=screenPoint(wm.dam.x,wm.dam.z,6),r=host.getBoundingClientRect();$('gateMapBtn').style.left=Math.max(8,Math.min(r.width-135,p.x-60))+'px';$('gateMapBtn').style.top=Math.max(56,Math.min(r.height-55,p.y))+'px';$('gateMapBtn').style.bottom='auto';}
}
