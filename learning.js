// Contextual, visual lessons: one engineering decision at a time.
const WaterLearning={
 lessons:[
  {name:'给河流留路',text:'窄口会积水。拓宽主河道，或把一部分水引向洼地。',focus:'river',kind:'river'},
  {name:'让急流慢下来',text:'拓宽桥下或开旁路。水位低了，也要留意桥脚的流速。',focus:'bridgebed',kind:'bridge'},
  {name:'入口与出口一起看',text:'只开东汊入口，会把洪水送给东岸。接通出口，水才有去处。',focus:'east',kind:'split'},
  {name:'坝蓄水，闸放水',text:'取土 → 筑坝 → 疏通下游。关小闸蓄水，开大闸泄水。',focus:'borrow',kind:'dam'},
  {name:'留住雨，接力供田',text:'雨中泄洪，晴天关小闸留水。田边浅渠送水，排水沟防涝。',focus:'borrow',kind:'farm'},
  {name:'自己试一条水路',text:'改河、挖湖，换一场雨。每次只改一处，更容易看出变化。',focus:'river',kind:'river'}
 ],
 works:{
  river:['拓宽','水路变宽，窄口附近的水更容易排走。','river'],bypass:['分流','接通河道与洼地，让洪峰分走一部分。','split'],bank:['护岸','沿岸抬高挡水；水仍需要下游出口。','bank'],
  relief:['旁路','从桥前分水，在桥后汇合，减少过桥急流。','bridge'],bridgebed:['扩桥孔','拓宽桥下过水空间，观察流速与桥况。','bridge'],
  east:['开入口','让东汊分水。还要接出口，避免东岸积水。','split'],eastout:['接出口','把东汊接到岛外，让分来的水流走。','split'],west:['拓西汊','也可保留原水路，直接扩宽西汊。','river'],
  borrow:['取土','挖出的土进入仓库，筑坝需要这些土。','earth'],dam:['筑坝','坝体抬高山口；水从闸口下泄，满过坝顶仍会溢出。','dam'],outlet:['泄洪道','接通闸后水路，避免放出的水积在村边。','dam'],
  canal:['供水渠','连通库区和田边，晴天持续送来浅水。','farm'],drain:['排水沟','让多余的水离开田边，保护庄稼。','farm'],pond:['挖湖','湖要与河道连通，才接得到来水。','split']
 },
 svg(kind,gate=.5,up=.65,down=.2){
  const arrow=(d)=>`<path d="${d}" fill="none" stroke="#3299ac" stroke-width="5" stroke-linecap="round" marker-end="url(#lessonArrow)"/>`;
  let body='';
  if(kind==='dam'){
   const u=100-Math.min(1.2,Math.max(0,up))*75,v=100-Math.min(1.2,Math.max(0,down))*75,gap=gate*31;
   body=`<path d="M8 ${u}H130V100H8Z M153 ${v}H270V100H153Z" fill="#8bc9d5"/><path d="M8 103H270" stroke="#a5ae7b" stroke-width="9"/><path d="M132 25V${100-gap}H152V25" fill="#6e897c"/><path d="M128 20H156" stroke="#d1a85b" stroke-width="6"/><path d="M132 26H152" stroke="#6e897c" stroke-width="12"/><text x="25" y="18">库区 · 蓄</text><text x="192" y="18">下游 · 泄</text>${gate>0&&up>0?arrow('M117 94H185'):''}${up>1?arrow('M117 12H166Q175 12 175 34'):''}<text x="121" y="119">闸门</text>`;
  }else if(kind==='earth')body=`<path d="M8 70H60L76 98H107L121 70H150" stroke="#a9b67c" stroke-width="10" fill="none"/>${arrow('M127 47Q168 16 203 48')}<path d="M193 95L211 49L241 95Z" fill="#ba9a65"/><text x="38" y="119">挖土 +</text><text x="198" y="119">筑坝 −</text>`;
  else if(kind==='bridge')body=`${arrow('M12 48H260')}${arrow('M65 48Q90 48 102 82Q140 120 180 82Q194 48 227 48')}<path d="M137 27V69M145 27V69M153 27V69" stroke="#af8250" stroke-width="5"/><text x="136" y="19">桥</text><text x="113" y="125">旁路分水</text>`;
  else if(kind==='split')body=`${arrow('M10 58H70Q96 58 108 33Q141 2 174 33Q188 58 220 58H258')}${arrow('M72 59Q100 59 113 86Q143 112 178 86Q192 59 221 59')}${kind==='bridge'?'<path d="M137 48V75M145 48V75M153 48V75" stroke="#af8250" stroke-width="5"/><text x="124" y="43">桥</text><text x="113" y="123">旁路分水</text>':'<text x="43" y="23">入口</text><text x="207" y="23">出口</text><text x="110" y="69">两岸分担</text>'}`;
  else if(kind==='farm')body=`<rect x="12" y="32" width="67" height="61" rx="16" fill="#8bc9d5"/>${arrow('M79 58H126')}<path d="M135 38V89M153 38V89M171 38V89" stroke="#b3c67f" stroke-width="8"/>${arrow('M186 66H254')}<text x="24" y="20">存水</text><text x="126" y="20">浅水供田</text><text x="217" y="112">排水</text>`;
  else if(kind==='bank')body=`<path d="M12 76H121V100H12Z" fill="#8bc9d5"/><path d="M117 101L139 42L160 101Z" fill="#bba26d"/><path d="M191 72L211 54L233 72V101H191Z" fill="#eccb85"/><text x="17" y="40">河水</text><text x="114" y="23">护岸</text><text x="192" y="120">小镇</text>`;
  else body=`<path d="M8 30Q88 30 120 48H157Q182 30 270 30V100Q185 100 157 79H120Q85 100 8 100Z" fill="#c6dfd5"/>${arrow('M18 65H250')}<path d="M111 37L111 24M162 37L162 24M111 91V105M162 91V105" stroke="#ac8d50" stroke-width="3"/><text x="104" y="16">拓宽窄口</text>`;
  return `<svg viewBox="0 0 280 130" class="lesson-diagram" role="img" aria-label="${kind==='dam'?'水坝剖面：上游蓄水、闸门下泄':'工程原理图'}"><defs><marker id="lessonArrow" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0 0L4 2L0 4" fill="#3299ac"/></marker></defs>${body}</svg>`;
 },
 hint(id,done,h,m,phase='build'){
  if(phase!=='build'){
   if(id===4&&phase==='dry')return ['晴天接力','关小闸门留水，观察田边是否持续有浅水。','farm'];
   if(h.damBuilt&&h.overtopFlow>.05)return ['水已越过坝顶','开大一点闸门，观察库水位是否回落。','dam'];
   if(h.damBuilt)return [phase==='peak'?'洪峰到了':'看库区，也看下游','拖动闸门，比较水位与下泄。雨中也能调。','dam'];
   if((id===1||id===4)&&h.scouring)return ['桥脚在受冲刷','观察桥前流速；旁路与桥下拓宽都能分担急流。','bridge'];
   return [this.lessons[id].name,this.lessons[id].text,this.lessons[id].kind];
  }
  if(id>=3&&id<=4){if(!h.damBuilt)return done.has('borrow')?['有土了，去筑坝','选择山口大坝。建好后，闸门可以随时调。','dam']:['先准备土料','选取土塘开工，土会进入仓库。','earth'];if(!done.has('outlet'))return ['给下泄留路','接通下游泄洪道，再迎接来水。','dam'];if(id===4&&!done.has('canal'))return ['给晴天留一条水路','接通田边浅渠；排水沟可减少田边积水。','farm'];return ['可以试水了',id===4?'雨中开大些，晴天关小些。留意村庄、桥和田。':'把闸门开到一半附近，来雨后观察并调整。','dam'];}
  if(id===2&&done.has('east')&&!done.has('eastout'))return ['东汊还差出口','接通下游出口，避免把洪水困在东岸。','split'];
  if(done.size&&id<3)return ['让雨检验你的办法',id===1?'看桥况，也看小镇。可以先试一项工程。':'来一场雨，再看改造前后的水位和两岸变化。',this.lessons[id].kind];
  return [this.lessons[id].name,this.lessons[id].text,this.lessons[id].kind];
 },
 card(id,done,h,m,phase='build'){const [title,text,kind]=this.hint(id,done,h,m,phase),d=h.map?.dam,up=d?(h.upstream-d.invert)/(d.crest-d.invert):.65,down=d?(h.downstream-d.invert)/(d.crest-d.invert):.2;return `<div class="lesson-heading"><span>水的线索</span><b>${title}</b></div>${this.svg(kind,h.gate,up,down)}<p>${text}</p>`;}
};
if(typeof module!=='undefined')module.exports=WaterLearning;
