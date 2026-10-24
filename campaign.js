// Each stop has its own catchment, settlements, engineering choices and objectives.
class WaterCampaign {
 static cache=new Map();
 static maps=[
  {name:'云铃河谷',theme:'meadow',main:z=>-4+1.3*Math.sin(z*.14),houses:[[0,0],[2,5],[5,0],[1,16]],farm:[9,12],basin:[-14,6,6],bridge:{x:-4.5,z:-6,length:11,resistance:50},spawn:[-12,-6],outlets:[[-4,28]],source:[-4,-23],town:'云铃镇',down:'下游人家'},
  {name:'青石峡 · 急流与木桥',theme:'gorge',main:z=>3+4*Math.sin(z*.105),houses:[[-7,4],[-10,8],[-7,12],[11,18]],farm:[15,8],basin:[-15,-4,5],bridge:{x:3,z:0,length:12,resistance:24},spawn:[-5,-2],outlets:[[4,28]],source:[.3,-23],town:'峡谷驿站',down:'山脚客栈'},
  {name:'双汊洲 · 两岸来信',theme:'delta',main:z=>z<-5?1.3*Math.sin(z*.16):-.52*(z+5),branch:z=>z<-5?1.3*Math.sin(z*.16):.52*(z+5),houses:[[-11,3],[-13,8],[-18,12],[14,9]],farm:[5,14],basin:[0,12,6],bridge:{x:-1,z:-14,length:12,resistance:100},spawn:[-15,1],outlets:[[-14,25],[14,25]],source:[.7,-23],town:'西岸村',down:'东岸人家'},
  {name:'月牙湖 · 山口筑坝',theme:'reservoir',main:z=>z<4?-4: -4+(z-4)*.33,houses:[[7,10],[10,15],[12,10],[6,22]],farm:[17,5],basin:[-4,-8,9],spawn:[-14,4],outlets:[[4,28]],source:[-4,-23],town:'湖下小镇',down:'河口人家',dam:{x:-4,z:4,width:16,crest:3.8,invert:.1,gateWidth:2.4,maxOpening:1.5}},
  {name:'风车平原 · 雨旱之间',theme:'terrace',main:z=>z<-2?7:7-(z+2)*.32,houses:[[-2,6],[-6,12],[-10,7],[-8,21]],farm:[15,10],basin:[7,-11,8],bridge:{x:2.5,z:12,length:10,resistance:9},spawn:[-3,-4],outlets:[[-2,28]],source:[7,-23],town:'风车镇',down:'河口驿站',dam:{x:7,z:-2,width:15,crest:3.6,invert:.25,gateWidth:2.4,maxOpening:1.5}},
  {name:'星屿 · 自由水工坊',theme:'garden',main:z=>7*Math.sin(z*.13),houses:[[-14,0],[-15,5],[-12,10],[12,17]],farm:[15,7],basin:[-8,-12,6],spawn:[-16,0],outlets:[[-3,28]],source:[-1,-23],town:'星屿小屋',down:'河畔旅舍'}
 ];
 static levels=[
  {title:'小镇的第二次机会',short:'01 · 救回小镇',tag:'01 / 云铃河谷 · 疏导',desc:'河道在小镇旁收窄了。下一场雨到来前，给这条河腾出一条更宽的路。',task:'三间小屋保持平安',peak:24,duration:120,storm:120,budget:1600,why:'水路更宽，来水更容易通过，小镇旁的水位就降下来了。',hints:['选黄色工程点，再点开工。','也可以在地面按住挖低，松开停工。','蓝色水位线越过橙色门槛，小屋就会进水。']},
  {title:'急流下的最后一座桥',short:'02 · 急流护桥',tag:'02 / 青石峡 · 流速与冲刷',desc:'峡谷把水挤成一股急流，桥脚正在被冲刷。拓宽桥下，或开一条绕桥的旁路，让赶集的人平安过河。',task:'木桥保持通行，驿站保持平安',peak:30,duration:128,storm:120,budget:1600,hours:65,soil:20,why:'桥下急流减弱，桥脚受到的持续冲刷也减少了。水深、流速和持续时间共同影响桥况。',hints:['桥上的读数显示流速与完整度。','长按地面召来施工员，按住持续挖填，松开停工。','先看绕桥旁路，再决定是否拓宽桥孔。']},
  {title:'一条河，两封来信',short:'03 · 双汊分洪',tag:'03 / 双汊洲 · 上下游联动',desc:'西岸水急，东汊却被浅滩堵住。让两条水路一起分担洪峰，也别把来水全送到东岸人家。',task:'西岸三户、东岸一户同时平安',peak:38,duration:144,storm:136,budget:1900,hours:68,soil:0,why:'分流入口和下游出口需要一起疏通，才能把水顺利送过两岸村庄。',hints:['先开东汊入口，再看东汊出口。','只开入口，东岸水位可能继续升高。','雨中同时观察两岸的门槛线。']},
  {title:'给洪峰留一间客房',short:'04 · 筑坝蓄洪',tag:'04 / 月牙湖 · 蓄与泄',desc:'山口后是一片宽谷。挖土筑坝，把洪峰暂留湖里；雨中调节闸门，让下游慢慢接水。',task:'筑起大坝，蓄水达到 700 格，小镇与河口平安',peak:24,duration:144,storm:100,budget:1900,hours:55,soil:10,storage:700,why:'坝前暂存洪峰，闸门控制下泄。库满时要给水留出通路，蓄水与泄水需要配合。',hints:['挖取土塘，得到筑坝的土料。','选山口大坝开工，再修下游泄洪道。','雨中可调闸门；看库水位，也看下游。']},
  {title:'留住雨，等一片金黄',short:'05 · 雨旱联调',tag:'05 / 风车平原 · 综合挑战',desc:'先来一场大雨，接着是一段晴天。小镇、木桥、南瓜田都在等水走对路：该放时放，该留时留。',task:'村庄与桥平安，晴天供水 24 秒，最后留水 100 格',peak:26,duration:200,storm:96,budget:2100,hours:70,soil:10,storage:500,retain:100,irrigation:24,why:'雨中留出防洪空间，晴天再把存水送到田边。同一座坝，需要随来水变化调节。',hints:['取土筑坝，疏通桥下，再开田边浅渠。','雨中关注库水位和桥况，晴天关注田边供水。','田边浅水才算供水，积水过深会淹苗。']},
  {title:'你的河流，你的岛',short:'自由水工坊',tag:'自由探索 / 星屿',desc:'在蜿蜒的河谷里开渠、筑岸、挖湖。选择不同的天气，看看同一座岛会怎样回应。',task:'设计一条属于你的河流',peak:18,duration:120,storm:120,budget:Infinity,why:'连接水路、改变河床，会一起改变水位和流速。',hints:['按住挖低或堆高。','工具箱中可以换天气。','保存岛屿，继续自己的实验。']}
 ];
 static seed(states){const decode=text=>{const raw=atob(text),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);const view=new DataView(bytes.buffer),values=new Float64Array(raw.length/8);for(let i=0;i<values.length;i++)values[i]=view.getFloat64(i*8,true);return values;};states.forEach((s,id)=>this.cache.set(id,{h:decode(s.h),w:decode(s.w),qx:decode(s.qx),qz:decode(s.qz),earth:0,input:0,output:0,initialMass:s.mass}));}
 static configure(w,id){
  const m=this.maps[id];w.control=null;w.map=m;w.mapId=id;w.sources=[];
  for(let j=0;j<w.n;j++)for(let i=0;i<w.n;i++){
   const k=j*w.n+i,x=i*w.dx-32,z=j*w.dx-32,r=Math.hypot(x,z);let h=w.pristine[k];
   if(id){
    const bed=id===1?.5-.065*z:.35-.037*z;
    h=(id===1?4.2:3)-.035*z+.12*Math.sin(.31*x)*Math.cos(.2*z);
    const hill=(a,b,amp,s)=>amp*Math.exp(-((x-a)**2+(z-b)**2)/s);
    if(id===1)h+=hill(-16,-14,7,60)+hill(16,-14,8,65)+hill(18,5,4,45);
    else if(id===2)h+=hill(-12,-18,5,50)+hill(13,-19,4,55);
    else if(id===3)h+=hill(-18,-8,5,45)+hill(11,-13,6,60);
    else if(id===4)h+=hill(-12,-14,6,85)+hill(20,-17,5,40);
    else h+=hill(-17,-15,5,50)+hill(18,-7,4,65);
    const width=id===1?2.3-1.15*Math.exp(-((z/4)**2)):id===2?2.35:id===3?2.1:id===4?2:2.8;
    const cut=(cx,ww,floor)=>{const t=Math.exp(-(((x-cx)/ww)**4));h=h*(1-t)+floor*t;};
    cut(m.main(z),width,bed);
    if(id===2&&z>-5){const bw=2.3-1.5*Math.exp(-(((z+1)/3)**2))-.8*Math.exp(-(((z-14)/3)**2));cut(m.branch(z),bw,bed+.14);}
    if(id===3||id===4){const [bx,bz,br]=m.basin,rr=Math.hypot(x-bx,(z-bz)*.86);if(rr<br){const t=Math.min(1,(br-rr)/1.4);h=h*(1-t)+(.65-.018*z)*t;}const d=m.dam;if(Math.abs(x-d.x)>d.width/2-1&&Math.abs(z-d.z)<5)h=Math.max(h,d.crest+.8-.15*(z-d.z)**2);}
    if(id===1)h-=1.1*Math.exp(-((x+7)**2+(z-7)**2)/45);
    if(id===2){h-=.8*Math.exp(-((x+12)**2+(z-7)**2)/35);h-=.9*Math.exp(-((x-14)**2+(z-9)**2)/35);}
    if(id===3)h-=1.3*Math.exp(-((x-8)**2+(z-15)**2)/50);
    if(id===4){h-=1.2*Math.exp(-((x+4)**2+(z-10)**2)/50);if(Math.hypot(x-15,z-10)<2.9)h=2.55;}
    if(r>27)h=h+(Math.max(0,1-(r-27)/3)-1)*(h+4);
    if(z< -25)h=Math.max(h,4+(-25-z));
   }
   w.h[k]=w.base[k]=h;
   if(Math.abs(z+23)<2.4&&Math.abs(x-m.main(z))<1.4)w.sources.push(k);
  }
  return m;
 }
 static prepare(w,id){
  this.configure(w,id);if(this.cache.has(id)){w.restore(this.cache.get(id));return w.snapshot();}
  w.w.fill(0);w.qx.fill(0);w.qz.fill(0);w.earth=0;
  for(let j=0;j<w.n;j++)for(let i=0;i<w.n;i++){const k=j*w.n+i,x=i*w.dx-32,z=j*w.dx-32;if(z> -25&&z<29&&(Math.abs(x-w.river(z))<4||(id===2&&Math.abs(x-w.map.branch(z))<3)))w.w[k]=Math.max(0,(id===1?1.25-.065*z:1.25-.045*z)-w.h[k]);}
  for(let i=0;i<2000;i++)w.step(.08,2);
  w.earth=0;w.input=w.output=0;w.initialMass=w.mass();const s=w.snapshot();this.cache.set(id,s);return w.snapshot();
 }
 static rate(id,time,weather=18){const c=this.levels[id];if(id===4&&time>=c.storm)return .12;return time<c.storm?2+(id===5?weather:c.peak)*Math.sin(Math.PI*time/c.storm):2;}
 static goals(id,m){const c=this.levels[id],result=[{name:id===2?'西岸三户平安':'三间小屋平安',value:m.maxTown.toFixed(2)+' 格 / 门槛 0.18',ok:m.maxTown<.18}];
  if(id===1||id===4)result.push({name:'木桥保持通行',value:Math.round(m.bridgeHealth??100)+'% 完整',ok:m.bridge!==false});
  if(id>=2&&id<=4)result.push({name:id===2?'东岸人家平安':'下游人家平安',value:m.maxDown.toFixed(2)+' 格 / 门槛 0.18',ok:m.maxDown<.18});
  if(c.storage)result.push({name:'筑坝蓄洪',value:Math.round(m.maxBasin)+' / '+c.storage+' 格',ok:!!m.damBuilt&&m.maxBasin>=c.storage});
  if(id===4){result.push({name:'晴天浅水供田',value:m.maxFarm>=.5?'积水 '+m.maxFarm.toFixed(2)+' 格 / 上限 0.50':(m.farmSeconds||0).toFixed(0)+' / '+c.irrigation+' 秒',ok:m.farmSeconds>=c.irrigation&&m.maxFarm<.5});result.push({name:'留水待晴天',value:Math.round(m.endBasin||0)+' / 100 格',ok:m.endBasin>=100});}
  return result;
 }
 static grade(id,m){const c=this.levels[id],goals=this.goals(id,m),primary=goals.every(g=>g.ok),efficient=c.hours?m.hours>=c.hours*.4:m.earth<=900,resilient=id===1?m.bridgeHealth>=90:id===4?m.bridgeHealth>=85&&m.endBasin>=150&&m.maxFarm<.4:m.maxTown<.10&&m.maxDown<.10;return {primary,goals,efficient,resilient,stars:primary?1+Number(efficient)+Number(resilient):0};}

 static works(id,w){
  const line=(a,b,s=.7)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/s);return Array.from({length:n+1},(_,i)=>[a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n]);};
  const work=(key,name,tip,path,r,amount,extra={})=>({id:key,name,tip,path,r,amount,point:path[Math.floor(path.length/2)],...extra});
  const along=(f,a,b,s=.7)=>Array.from({length:Math.ceil((b-a)/s)+1},(_,i)=>{const z=Math.min(b,a+i*s);return [f(z),z];});
  const m=this.maps[id],main=m.main;
  if(id===0)return [work('river','拓宽主河道','沿黄线挖宽河道，让来水通过窄口。',along(z=>main(z)-2,-25,28,.5),5,1.2),work('bypass','开分流渠','把河水引到西侧洼地，分担洪峰。',line([-5,-4],[-14,6]),2.8,1.2),work('bank','加高护岸','挖出的土堆在小镇一侧，补齐低岸。',line([-.4,-6],[-.4,9]),1.7,.7,{mode:'raise'})];
  if(id===1)return [work('relief','开绕桥旁路','从桥上游绕向西侧，再接回下游。',[...line([1,-10],[-7,-5]),...line([-7,-5],[-7,0]),...line([-7,0],[5,10])],2.6,1.05),work('bridgebed','拓宽桥下','给桥下急流腾出空间，观察流速变化。',along(main,-9,10,.5),4.4,.8),work('bank','护住驿站','在驿站和旁路之间补上一道岸。',line([-5.4,2],[-5.4,13]),1.5,.7,{mode:'raise'})];
  if(id===2)return [work('east','疏通东汊入口','清理浅滩，让东汊也能分担来水。',along(m.branch,-6,9),3.6,.9),work('eastout','接通东汊出口','沿东岸一直疏通到出岛口。',along(m.branch,8,26),3.8,1),work('west','拓宽西汊','同时照顾西岸的低处人家。',along(main,-3,26),3.4,.85)];
  if(id===3||id===4){const [bx,bz]=m.basin,d=m.dam,borrow=id===3?[-15,9]:[-10,-2];const works=[work('borrow','挖取土塘','挖出的土进入仓库，供大坝使用。',[borrow,[borrow[0]+1.5,borrow[1]],[borrow[0]-1.5,borrow[1]],[borrow[0],borrow[1]+2]],4,1.3),work('dam','筑山口大坝','用土料封住山口，留一个可调闸口。',line([d.x-d.width/2,d.z],[d.x+d.width/2,d.z]),1,1,{kind:'dam',point:[d.x-d.width/2-1.4,d.z-1]}),work('outlet','修下游泄洪道','让闸门放出的水顺利流向出口。',along(main,d.z+3,27),3.6,.9)];
   if(id===4)works.push(work('canal','接田边浅渠','从库边开渠到田边，雨晴都要看水位。',[...line([13,-8],[16,-3],.45),...line([16,-3],[15,10],.45)],1.6,.7,{floor:1.8}));if(id===4)works.push(work('drain','接田边排水沟','浅水经过田边，再从排水沟离开。',[...line([15,12.5],[16,22.5]),...line([16,22.5],[12,27]) ],2.8,1.1));return works;}
  return [work('river','拓宽弯河','沿着弯道给水留出空间。',along(main,-24,27),4.2,1),work('pond','挖一片湖','在西侧挖湖，再亲手连接水路。',[[-8,-12],[-7,-10],[-10,-12]],5,1.2)];
 }
}
if(typeof module!=='undefined')module.exports=WaterCampaign;






