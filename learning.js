// Contextual lessons share the drawing system with live gates and result charts.
const WaterLearning={
 visual:typeof module!=='undefined'?require('./visuals'):WaterVisual,
 lessons:[
  ['给河流留路','拓宽窄口，或分一条水路。','river'],
  ['让急流慢下来','拓宽桥下，或开绕桥旁路。','bridge'],
  ['入口，也要有出口','东汊分水，出口把水送走。','split'],
  ['坝蓄水，闸放水','取土 → 筑坝 → 接通下游。','dam'],
  ['雨中泄洪，晴天供田','浅渠送水，排水沟防涝。','farm'],
  ['设计自己的水路','改一处，再用同一场雨比较。','river']
 ],
 works:{
  river:['拓宽窄口','河道变宽，积水更容易排走。','river'],bypass:['分一条水路','把部分来水引向洼地。','split'],bank:['抬高河岸','挡住漫向小镇的水。','bank'],
  relief:['旁路分水','从桥前分流，在桥后汇合。','bridge'],bridgebed:['拓宽桥下','增加过水空间，减轻桥脚冲刷。','river'],
  east:['接通入口','让东汊分担西岸来水。','split'],eastout:['接通出口','分来的水从东汊排出。','split'],west:['拓宽西汊','拓宽原来的水路，也是一种办法。','river'],
  borrow:['取土备料','挖出的土，用来筑坝。','earth'],dam:['筑坝蓄洪','闸口下泄，满过坝顶会溢流。','dam'],outlet:['疏通下游','给闸门放出的水留路。','dam'],
  canal:['浅水供田','连通水库和田边。','farm'],drain:['排走余水','田边积水从这里离开。','farm'],pond:['挖湖存水','挖好后，接通河道。','split']
 },
 next(id,done,h){
  if(id===3||id===4){if(!h.damBuilt)return done.has('borrow')?'dam':'borrow';if(!done.has('outlet'))return 'outlet';if(id===4&&!done.has('canal'))return 'canal';}
  if(id===2&&done.has('east')&&!done.has('eastout'))return 'eastout';
  return null;
 },
 svg(kind,gate=.5,up=.65,down=.2){
  const v=this.visual,c=v.colors,a=(d)=>v.arrow(d),t=(x,y,text)=>v.label(x,y,text);
  let body='';
  if(kind==='dam'){
   const u=Math.max(0,Math.min(1.16,up)),d=Math.max(0,Math.min(1.16,down));
   body=`<path d="M14 104H266" stroke="${c.land}" stroke-width="8" stroke-linecap="round"/>
    <rect data-water="up" x="16" y="25" width="116" height="75" rx="3" fill="${c.water}" style="transform:scaleY(${u});transform-origin:0 100px"/>
    <rect data-water="down" x="152" y="25" width="112" height="75" rx="3" fill="${c.water}" style="transform:scaleY(${d});transform-origin:0 100px"/>
    <rect x="132" y="25" width="20" height="75" rx="3" fill="${c.stone}"/><rect x="132" y="68" width="20" height="32" fill="${c.paper}"/>
    <rect data-gate-panel x="132" y="68" width="20" height="32" rx="2" fill="${c.stone}" style="transform:translateY(${-gate*32}px)"/>
    <path d="M128 22H156" stroke="${c.gold}" stroke-width="5" stroke-linecap="round"/>
    <g data-gate-flow opacity="${gate>0&&up>0?1:0}">${a('M116 94H189')}</g>
    <g data-overflow opacity="${up>1?1:0}">${a('M117 13H165Q178 13 178 34')}</g>
    ${t(55,16,'蓄水')}${t(223,16,'下泄')}${t(142,123,'水闸')}`;
  }else if(kind==='earth')body=`<path d="M18 76H62L78 101H109L124 76H148" fill="none" stroke="${c.land}" stroke-width="9" stroke-linecap="round"/>${a('M116 48Q163 17 206 49')}<path d="M193 101L215 51L244 101Z" fill="${c.gold}" stroke-linejoin="round"/>${t(87,125,'挖土 +')}${t(218,125,'筑坝 −')}`;
  else if(kind==='bridge')body=`<path d="M18 48H258M65 48Q89 48 101 84Q140 113 180 84Q193 48 224 48" fill="none" stroke="${c.water}" stroke-width="15" stroke-linecap="round"/>${a('M18 48H258')}${a('M65 48Q89 48 101 84Q140 113 180 84Q193 48 224 48')}<path d="M133 29V66M142 29V66M151 29V66" stroke="${c.gold}" stroke-width="5" stroke-linecap="round"/>${t(142,17,'桥')}${t(143,125,'旁路分水')}`;
  else if(kind==='split')body=`<path d="M18 64H67Q88 64 105 36Q140 6 179 36Q194 64 221 64H259M67 64Q87 64 104 91Q141 118 178 91Q193 64 221 64" fill="none" stroke="${c.water}" stroke-width="14" stroke-linecap="round"/>${a('M18 64H67Q88 64 105 36Q140 6 179 36Q194 64 221 64H259')}${a('M67 64Q87 64 104 91Q141 118 178 91Q193 64 221 64')}${t(43,31,'入口')}${t(238,31,'出口')}${t(143,68,'分流')}`;
  else if(kind==='farm')body=`<rect x="14" y="37" width="63" height="60" rx="16" fill="${c.water}"/>${a('M79 66H124')}<path d="M138 40V94M154 40V94M170 40V94" stroke="${c.land}" stroke-width="9" stroke-linecap="round"/>${a('M186 66H258')}${t(45,23,'存水')}${t(153,23,'浅水供田')}${t(235,116,'排水')}`;
  else if(kind==='bank')body=`<rect x="16" y="62" width="107" height="38" rx="4" fill="${c.water}"/><path d="M116 102L140 42L164 102Z" fill="${c.gold}"/><path d="M192 77L212 59L233 77V102H192Z" fill="${c.land}" stroke="${c.stone}" stroke-width="2" stroke-linejoin="round"/>${t(58,45,'河水')}${t(140,26,'护岸')}${t(212,123,'小镇')}`;
  else body=`<path d="M16 35Q82 35 114 51H163Q194 35 264 35V100Q190 100 163 82H114Q82 100 16 100Z" fill="${c.water}"/>${a('M21 66H256')}<path d="M113 36V23M164 36V23M113 96V109M164 96V109" stroke="${c.gold}" stroke-width="3" stroke-linecap="round"/>${t(139,15,'拓宽窄口')}`;
  return v.frame(body,kind==='dam'?'水坝剖面：蓄水、闸口下泄与坝顶溢流':'水路原理图');
 },
 updateDam(svg,gate,up,down,flow=up-down){
  for(const [side,value] of [['up',up],['down',down]])svg.querySelector('[data-water="'+side+'"]').style.transform='scaleY('+Math.max(0,Math.min(1.16,value))+')';
  svg.querySelector('[data-gate-panel]').style.transform='translateY('+(-gate*32)+'px)';
  const stream=svg.querySelector('[data-gate-flow]');stream.style.opacity=gate>0&&Math.abs(flow)>.005?1:0;stream.style.transform=flow<0?'translateX(280px) scaleX(-1)':'';
  svg.querySelector('[data-overflow]').style.opacity=up>1?1:0;
 },
 hint(id,done,h,m,phase='build',selected){
  if(phase==='result')return ['雨后的线索',this.lessons[id][1],this.lessons[id][2]];
  if(phase!=='build'){
   if(id===4&&phase==='dry')return ['晴天接力','关小水闸，留水供田。','farm'];
   if(h.damBuilt&&h.overtopFlow>.05)return ['水越过了坝顶','开大一档，看看水位怎样变。','dam'];
   if(h.damBuilt)return [phase==='peak'?'洪峰到了':'蓄水与下泄','点水闸档位，看库水与下游。','dam'];
   if(id===1&&h.scouring)return ['桥脚在受冲刷','看桥前急流，也看旁路分水。','bridge'];
   return this.lessons[id];
  }
  if(selected&&!done.has(selected)&&selected!==this.next(id,done,h))return this.works[selected]||this.lessons[id];
  if(id===3||id===4){if(!h.damBuilt)return done.has('borrow')?['土料备好了','下一步：筑山口大坝。','dam']:['先取土','挖取土塘，为大坝备料。','earth'];if(!done.has('outlet'))return ['给下泄留路','接通下游泄洪道。','dam'];if(id===4&&!done.has('canal'))return ['把水送到田边','接浅渠供水，排水沟防涝。','farm'];return ['准备试水',id===4?'雨中开大些，晴天关小些。':'从半开开始，比较蓄水和下泄。','dam'];}
  if(id===2&&done.has('east')&&!done.has('eastout'))return ['还差一个出口','接通东汊出口，带走分来的水。','split'];
  if(done.size&&id<3)return ['让雨检验',id===1?'看小镇水位，也看桥况。':'比较改造前后的水路。',this.lessons[id][2]];
  return this.lessons[id];
 },
 card(id,done,h,m,phase='build',selected){const [title,text,kind]=this.hint(id,done,h,m,phase,selected),d=h.damBuilt&&h.map?.dam,up=d?(h.upstream-d.invert)/(d.crest-d.invert):.65,down=d?(h.downstream-d.invert)/(d.crest-d.invert):.2;return `<div class="lesson-heading"><span>水的线索</span><b>${title}</b></div>${this.svg(kind,h.gate,up,down)}<p>${text}</p>`;}
};
if(typeof module!=='undefined')module.exports=WaterLearning;
