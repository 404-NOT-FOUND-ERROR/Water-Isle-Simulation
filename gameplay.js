let lessonKey='',lastPhase='',phaseRailKey='',gateOpenedForTrial=false,reviewing=false,phaseNoticeUntil=0;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
try{const progress=JSON.parse(localStorage.getItem('water-isle-journey-v7'));if(progress?.stars)stars=Array.from({length:6},(_,i)=>Math.max(0,Math.min(3,+progress.stars[i]||0)));}catch{}
function saveJourney(){try{localStorage.setItem('water-isle-journey-v7',JSON.stringify({stars}));}catch{}}
function reveal(el){if(!reducedMotion)el.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'cubic-bezier(.2,.7,.3,1)'});}
function phaseNotice(title,text){$('phaseNoticeTitle').textContent=title;$('phaseNoticeText').textContent=text;$('phaseNotice').hidden=false;phaseNoticeUntil=clockTime+4;reveal($('phaseNotice'));}
function resumeBuilding(){if(reviewing){reviewing=false;resetWater();$('weatherText').textContent='准备施工';$('progress').style.width='0%';}setPaused(false);updateStats();}
function workRequirement(w){
 if(!w)return '';
 if(w.kind==='dam'&&!hydraulics.damBuilt&&site?.soil<hydraulics.damCost)return '还差 '+Math.ceil(hydraulics.damCost-site.soil)+' 土料 · 先取土';
 if(site?.hours<=.001)return '工时用完 · 可撤销施工';
 if(chapter===2&&w.id==='eastout'&&!workDone.has('east')&&!site?.route(...w.path[0],w.r))return '先接东汊入口';
 return '';
}
function updateWorkGuide(){
 const w=works[selected];if(!w||workPlan)return;
 const done=workDone.has(w.id),need=done?'':workRequirement(w),next=WaterLearning.next(chapter,workDone,hydraulics),nextName=works.find(x=>x.id===next)?.name;
 $('workTip').textContent=need||(done?(nextName?'下一步 · '+nextName:'工程完成 · 可以试水'):w.kind==='dam'?'需 '+Math.ceil(hydraulics.damCost)+' 土料 · 建好后可调闸':WaterLearning.works[w.id]?.[1]||w.tip);
 $('workBtn').textContent=done?(next?'下一步 →':'试水 →'):need?'待准备':'开工';
 $('workBtn').disabled=!!trial||!!need;$('workBtn').classList.toggle('ready',done&&!trial);
}
function workAction(){
 if(trial)return;
 if(workPlan){startWork();return;}
 if(workDone.has(works[selected]?.id)){const next=WaterLearning.next(chapter,workDone,hydraulics);if(next)selectWork(works.findIndex(w=>w.id===next));else startTrial();return;}
 startWork();
}
function openProjects(){
 if(trial||workPlan)return;
 const next=WaterLearning.next(chapter,workDone,hydraulics);
 info('选择工程','<div class="project-picker">'+works.map((w,i)=>{const done=workDone.has(w.id),need=done?'':workRequirement(w);return '<button class="project-option '+(i===selected?'selected':'')+'" data-select="'+i+'"><span class="project-number">'+(done?'✓':String(i+1).padStart(2,'0'))+'</span><span><strong>'+w.name+'</strong><small>'+(need||WaterLearning.works[w.id]?.[1]||w.tip)+'</small></span><em>'+(done?'完成':w.id===next?'下一步':'选择')+'</em></button>';}).join('')+'</div>');
}
function setGatePanel(open){
 const el=$('gateControls'),changed=el.hidden===open;el.hidden=!open;
 for(const id of ['gateBtn','gateMapBtn']){$(id).setAttribute('aria-expanded',String(open));$(id).classList.toggle('active',open);}
 if(open){updateGateView();if(changed)reveal(el);}if(changed)fit();
}
function setGate(value){
 if(!hydraulics?.damBuilt)return;
 const next=Math.max(0,Math.min(1,Math.round(value*4)/4));if(hydraulics.gate===next)return;
 hydraulics.gate=next;
 if(trial&&comparisonRun&&comparisonRun.gates.at(-1)!==Math.round(next*100))comparisonRun.gates.push(Math.round(next*100));
 updateGateView();updateGateDock();
}
function updateGateDock(){
 const h=hydraulics,d=world.map?.dam,percent=Math.round(h.gate*100);
 $('gateBtn').hidden=$('gateMapBtn').hidden=!d;
 if(!d)return;
 $('gateDockValue').textContent=h.damBuilt?percent+'%':'待建';
 $('gateMapBtn').disabled=false;$('gateMapBtn').textContent=h.damBuilt?'调水闸 ↗':'坝址 ↗';
 $('gateBtn').classList.toggle('available',h.damBuilt);
}
function updateGateView(){
 const h=hydraulics,d=world.map?.dam;if(!d)return;
 const built=h.damBuilt,open=Math.round(h.gate*100),up=built?(h.upstream-d.invert)/(d.crest-d.invert):.65,down=built?(h.downstream-d.invert)/(d.crest-d.invert):.2,flow=built&&open?h.gateFlow:0;
 $('gatePercent').textContent=built?open+'%':'待建';$('gatePause').hidden=!paused;
 const section=$('gateSection');if(!section.firstElementChild)section.innerHTML=WaterLearning.svg('dam',h.gate,up,down);WaterLearning.updateDam(section.firstElementChild,h.gate,up,down,built?flow:1);
 for(const b of $('gateSteps').children){b.disabled=!built;b.setAttribute('aria-pressed',String(built&&+b.dataset.opening===open));}
 $('gateHint').textContent=built?(flow<-.01?'下游水位更高 · 河水回流':open===0?'关闭闸孔 · 留水蓄洪':open===100?'全开下泄 · 库水排出更快':open<=25?'小开度 · 留水供田':open>=75?'大开度 · 给洪峰留空间':'半开 · 蓄水与下泄'):'先取土筑坝，再调节开度';
 $('gateBuild').hidden=built;$('gateBuild').disabled=!!workPlan;
 $('gateBuild').textContent=workPlan?'施工中':site?.soil<h.damCost?'去取土 →':'去筑坝 →';
 $('gateStorage').parentElement.hidden=!built;$('gateStatus').hidden=!built;
 if(!built)return;
 const overflow=h.overtopFlow>.05;$('gateStatus').textContent=overflow?'越坝溢流 '+h.overtopFlow.toFixed(1)+' 格/秒':'距坝顶 '+Math.max(0,d.crest-h.upstream).toFixed(2)+' 格';$('gateStatus').classList.toggle('warn',overflow);
 $('gateFlow').textContent=(flow<-.01?'回流 ':'下泄 ')+Math.abs(flow).toFixed(1)+' 格/秒';$('gateStorage').textContent='库水 '+Math.round(lastStats?.basin||0)+' 格';$('gateControls').dataset.alert=String(overflow);
}
$('gateSteps').onclick=e=>{const b=e.target.closest('[data-opening]');if(b)setGate(+b.dataset.opening/100);};
$('gateSteps').onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)||!hydraulics.damBuilt)return;e.preventDefault();setGate(e.key==='Home'?0:e.key==='End'?1:hydraulics.gate+(e.key==='ArrowRight'?.25:-.25));$('gateSteps').querySelector('[data-opening="'+Math.round(hydraulics.gate*100)+'"]').focus();};
$('gateClose').onclick=()=>{setGatePanel(false);$('gateBtn').focus();};
$('gateControls').onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();setGatePanel(false);$('gateBtn').focus();}};
$('gateBtn').onclick=$('gateMapBtn').onclick=()=>setGatePanel($('gateControls').hidden);
$('gateBuild').onclick=()=>{const id=site?.soil<hydraulics.damCost?'borrow':'dam';setGatePanel(false);selectWork(works.findIndex(w=>w.id===id));};
function updateGuidance(){
 const phase=trial?WaterTrial.phase(chapter,trial.time):reviewing?'result':'build',h=hydraulics,m=metrics(),job=works[selected]?.id;
 const hint=WaterLearning.hint(chapter,workDone,h,m,phase,job),key=hint.join('|');
 if(key!==lessonKey){lessonKey=key;$('lessonCard').innerHTML=WaterLearning.card(chapter,workDone,h,m,phase,job);reveal($('lessonCard'));}
 const railKey=chapter+'|'+phase;
 if(railKey!==phaseRailKey){phaseRailKey=railKey;$('phaseRail').innerHTML=(chapter===4?[['build','施工'],['rain','暴雨'],['dry','晴天']]:[['build','施工'],['rain','试水'],['result','对比']]).map(([id,label])=>'<span class="'+(id===phase||(id==='rain'&&['rising','peak','falling'].includes(phase))?'active':reviewing?'done':'')+'">'+label+'</span>').join('<i>→</i>');}
 if(trial){
  if(phase!==lastPhase){lastPhase=phase;if(phase==='dry'){phaseNotice('雨停了','关小水闸，留水供田');setGatePanel(true);}else if(phase==='peak'&&h.damBuilt)phaseNotice('洪峰到了','看库水，也看下游');}
  if(h.damBuilt&&!gateOpenedForTrial){setGatePanel(true);gateOpenedForTrial=true;}
 }else{lastPhase='';gateOpenedForTrial=false;updateWorkGuide();}
 if(!world.map.dam)setGatePanel(false);else if(!$('gateControls').hidden)updateGateView();
 if(clockTime>phaseNoticeUntil)$('phaseNotice').hidden=true;
 updateGateDock();
 $('liveCompare').textContent=trial&&comparisonRun?'小镇峰值 · 改造前 '+comparisonRun.before.maxTown.toFixed(2)+' → 后 '+comparisonRun.after.maxTown.toFixed(2):'';
}
$('skipIntro').onclick=()=>{storyTime=filmLength;storyTick(0);};
