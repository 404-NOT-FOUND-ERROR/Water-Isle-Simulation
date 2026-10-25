let fastForwarding=false,playbackEpoch=0;
function cancelPlayback(){const moving=fastForwarding;playbackEpoch++;fastForwarding=false;acc=0;if(moving)setPaused(paused);}
function updatePlayback(){
 $('playbackActions').hidden=!trial;$('advanceBtn').disabled=fastForwarding;
 $('advanceBtn').textContent=fastForwarding?'快进中…':chapter===4&&trial?.time<chapters[4].storm?'跳到晴天 ↗':'跳到结算 ↗';
 $('runBtn').disabled=fastForwarding;
 if(fastForwarding)$('runBtn').textContent='快进中 · '+Math.round(trial.time/trial.duration*100)+'%';
 $('nextLevelBtn').textContent=chapter<chapters.length-1?'下一关 →':'返回旅程';
}
function returnToBuilding(){
 cancelPlayback();endPointer();cancelWork();trial=null;reviewing=false;document.body.dataset.trial='false';
 $('phaseNotice').hidden=true;$('liveCompare').hidden=true;setGatePanel(false);resetWater();
 $('progress').style.width='0%';$('weatherText').textContent='准备施工';$('runTime').textContent=chapters[chapter].duration/4+' 秒';
 $('runBtn').innerHTML=svg('rain')+(chapter===4?'开始雨旱挑战':'开始试水');$('mobileRun').textContent='来场雨';
 $('chooseWork').disabled=false;$('undoBtn').disabled=!undoStack.length;selectTool('look',false);setPaused(false);selectWork(selected);updateStats();showRoute();fit();
}
function nextLevel(){cancelPlayback();document.querySelectorAll('dialog[open]').forEach(d=>d.close());if(chapter<chapters.length-1)enterLevel(chapter+1);else openMap();}
function advanceTrial(){
 if(!trial||fastForwarding)return;endPointer();const epoch=++playbackEpoch,target=WaterTrial.nextStop(chapter,trial.time);
 fastForwarding=true;setPaused(true);updateStats();
 function chunk(){
  if(epoch!==playbackEpoch||!trial)return;
  if(document.querySelector('dialog[open]')){setTimeout(chunk,50);return;}
  const started=performance.now();let finished=false;
  do{
   const step=Math.min(.08,target-trial.time);if(step<=1e-7)break;
   finished=WaterTrial.advance(world,hydraulics,comparisonRun,chapter,trial,step,comparisonRun.weather);simClock+=step;
  }while(!finished&&trial.time<target-1e-7&&performance.now()-started<18);
  refreshWater();updateStats();
  if(finished){fastForwarding=false;finishTrial();return;}
  if(trial.time>=target-1e-7){fastForwarding=false;setPaused(true);resetFlow();updateStats();phaseNotice('晴天到了','调好开度，再继续供田');fit();return;}
  setTimeout(chunk,0);
 }
 setTimeout(chunk,0);
}
function renderOutcome(t,g){
 const wins=['小镇守住了','木桥，平安通行','两岸都守住了','把洪峰留在湖里','从暴雨，守到晴天','你的水路，通了'];
 let title=wins[chapter],desc=['河道畅通，雨水顺着新水路离开。','急流有了去处，桥上的路还在。','两条水路接通，洪峰分头离开。','水库接住洪峰，闸门控制下泄。','雨天腾库容，晴天留水供田。','每一次挖填，都改变了河水的去向。'][chapter];
 if(!g.primary){
  if(t.maxTown>=.18){title='洪水进了小镇';desc='河道来不及排水，拓宽窄口或分走洪峰。';}
  else if(!t.bridge){title='木桥没能撑住';desc='拓宽桥下或增加旁路，减轻桥脚冲刷。';}
  else if(t.maxDown>=.18){title='下游失守了';desc='疏通出口，让下泄的水继续离开。';}
  else if(!t.damBuilt||t.maxBasin<chapters[chapter].storage){title='洪峰没有留住';desc='适当关小闸门，让水库参与蓄洪。';}
  else if(t.maxFarm>=.5){title='田里积水了';desc='给田地接通排水路，让浅水流过。';}
  else if(t.farmSeconds<chapters[chapter].irrigation){title='晴天，田里断水了';desc='接通浅渠，雨停后调小闸门供田。';}
  else{title='库水先用完了';desc='晴天关小闸门，为后半程留水。';}
 }
 const dialog=$('resultDialog');dialog.dataset.outcome=g.primary?'win':'loss';
 $('resultKicker').textContent=(g.primary?'挑战完成':'本次未通过')+' / '+world.map.name;$('resultTitle').textContent=title;$('resultDesc').textContent=desc;
 const star='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m16 2 4.2 8.5 9.4 1.4-6.8 6.6 1.6 9.3L16 23.4l-8.4 4.4 1.6-9.3-6.8-6.6 9.4-1.4Z"/></svg>';
 const criteria=['完成全部目标',chapters[chapter].hours?'保留至少四成工时':'挖填土方不超过 900 格',chapter===1?'桥况至少 90%':chapter===4?'桥况 85%、留水 150 格、田水低于 0.40 格':'两岸水深低于 0.10 格'];
 $('resultStars').innerHTML=[['平安',g.primary],['省工',g.efficient],['稳健',g.resilient]].map(([name,yes],i)=>'<span role="img" aria-label="'+name+(g.primary&&yes?'星已获得':'星未获得')+'" title="'+criteria[i]+'" class="'+(g.primary&&yes?'earned':'')+'" style="--i:'+i+'">'+star+name+'</span>').join('');
 const safe=(t.housePeaks||[t.maxTown,t.maxTown,t.maxTown,t.maxDown]).slice(0,3).filter(d=>d<.18).length;
 const items=[['平安小屋',safe,'/ 3'],chapter===1?['木桥完整',Math.round(t.bridgeHealth),'%']:world.map.dam?['蓄洪峰值',Math.round(t.maxBasin),'格']:['小镇水深',t.maxTown.toFixed(2),'格'],chapter===4?['晴天供田',Math.round(t.farmSeconds),'秒']:chapter===3?['最后留水',Math.round(t.endBasin),'格']:['下游水深',t.maxDown.toFixed(2),'格']];
 $('resultMetrics').innerHTML=items.map(([name,value,unit])=>'<div class="result-metric"><span>'+name+'</span><strong>'+value+'<small>'+unit+'</small></strong></div>').join('');
 $('resultLearning').innerHTML=goalMarkup(t,true);$('resultEvidence').open=false;
 $('nextBtn').hidden=false;$('nextBtn').textContent=chapter<chapters.length-1?'下一关 →':'返回旅程';
 dialog.showModal();dialog.querySelector('.result-scroll').scrollTop=0;
}
$('advanceBtn').onclick=advanceTrial;$('rebuildBtn').onclick=returnToBuilding;
$('nextLevelBtn').onclick=$('nextBtn').onclick=nextLevel;
$('restartBtn').onclick=()=>{$('resultDialog').close();enterLevel(chapter);};
$('retryBtn').onclick=()=>{$('resultDialog').close();returnToBuilding();};
$('learnToggle').onclick=()=>{const open=$('guidanceDock').dataset.expanded!=='true';$('guidanceDock').dataset.expanded=String(open);$('learnToggle').setAttribute('aria-expanded',String(open));fit();};
const compactMission=matchMedia('(max-width:620px), (max-height:540px)');
function sizeMission(){$('missionDetails').open=!compactMission.matches;fit();}
compactMission.addEventListener('change',sizeMission);$('missionDetails').addEventListener('toggle',fit);sizeMission();
document.addEventListener('keydown',e=>{if(mode!=='play'||tool!=='look'||e.target.closest('button,input,select,dialog')||document.querySelector('dialog[open]'))return;if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();angle+=e.key==='ArrowRight'?.18:-.18;fit();}});
