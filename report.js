const WaterReport={
 fmt(v,d=2){return Number(v).toFixed(d);},
 delta(a,b,d=2){const n=+(b-a).toFixed(d);return n===0?'基本不变':(n>0?'增加 ':'减少 ')+Math.abs(n).toFixed(d);},
 map(snapshot,metrics,map,title){
  const xy=(x,z)=>[100+x*2.5,100+z*2.5];
  const tiles=snapshot.tiles.map(([x,z,d])=>{const [a,b]=xy(x,z);return `<rect x="${a-3}" y="${b-3}" width="6.2" height="6.2" fill="${d<.025?'#d5dfbc':d<.3?'#b2dce1':d<1?'#5eafc2':'#277c99'}"/>`;}).join('');
  const arrows=snapshot.arrows.map(([x,z,vx,vz])=>{const [a,b]=xy(x,z),ex=a+vx*5,ey=b+vz*5;return `<path d="M${a-vx*3},${b-vz*3}L${ex},${ey}m${-vx*3-vz*2},${-vz*3+vx*2}L${ex},${ey}l${-vx*3+vz*2},${-vz*3-vx*2}"/>`;}).join('');
  const homes=map.houses.map(([x,z],i)=>{const [a,b]=xy(x,z),wet=metrics.housePeaks[i]>=.18;return `<g><circle cx="${a}" cy="${b}" r="6" fill="${wet?'#bd573c':'#397756'}" stroke="#fff9e8" stroke-width="1.5"/><text x="${a}" y="${b+2.8}" text-anchor="middle" fill="white" font-size="8">${i+1}</text></g>`;}).join('');
  return `<figure><figcaption>${title}</figcaption><svg viewBox="0 0 200 200" role="img" aria-label="${title}水深、流向和房屋受灾位置"><circle cx="100" cy="100" r="89" fill="#e5ebd5"/>${tiles}<g fill="none" stroke="#174f65" stroke-width="1" opacity=".85">${arrows}</g>${homes}<text x="8" y="14" font-size="10" fill="#536d60">上游</text><text x="166" y="192" font-size="10" fill="#536d60">下游</text></svg></figure>`;
 },
 chart(c){
  const max=Math.max(.22,...c.history.flatMap(p=>p.slice(1))),y=v=>105-v/max*88,x=t=>35+t/c.level.duration*300;
  const path=i=>c.history.map((p,j)=>(j?'L':'M')+x(p[0]).toFixed(1)+','+y(p[i]).toFixed(1)).join(' ');
  return `<svg class="depth-chart" viewBox="0 0 355 135" role="img" aria-label="同场来水的小镇水深过程线，橙色为未改造，蓝色为本次方案，虚线为进水门槛"><path d="M35 12V105H335" fill="none" stroke="#a7b7a2"/><path d="M35 ${y(.18)}H335" stroke="#aa6844" stroke-dasharray="4 4"/><text x="38" y="${Math.max(12,y(.18)-4)}" font-size="10" fill="#8b553b">进水门槛 0.18</text><path d="${path(1)}" fill="none" stroke="#b76d43" stroke-width="2.5" stroke-dasharray="5 3"/><path d="${path(2)}" fill="none" stroke="#217e97" stroke-width="2.5"/><text x="3" y="17" font-size="10">${max.toFixed(2)}</text><text x="18" y="108" font-size="10">0</text><text x="35" y="125" font-size="10">0 秒</text><text x="275" y="125" font-size="10">${c.level.duration} 模拟秒</text></svg>`;
 },
 render(c,actions,previous){
  const a=c.before,b=c.after,wet=m=>m.housePeaks.filter(d=>d>=.18).length;
  const row=(label,key,unit,d=2)=>`<tr><th scope="row">${label}</th><td>${this.fmt(a[key],d)}${unit}</td><td>${this.fmt(b[key],d)}${unit}</td><td>${this.delta(a[key],b[key],d)}</td></tr>`;
  let rows=row('小镇最高水深','maxTown',' 格')+row(c.id===2?'东岸最高水深':'下游最高水深','maxDown',' 格');
  if(c.id===1||c.id===4)rows+=row('桥下最高流速','maxSpeed',' 格/秒')+row('最终桥梁完整度','bridgeHealth','%',0);
  if(c.map.dam)rows+=row('最高蓄水','maxBasin',' 格',0)+row('最后留水','endBasin',' 格',0);
  if(c.id===4)rows+=row('晴天浅水供田','farmSeconds',' 秒',1)+row('田边最高水深','maxFarm',' 格');
  const change=b.maxTown-a.maxTown,observation=`小镇最高水深${this.delta(a.maxTown,b.maxTown)}${Math.abs(b.maxTown-a.maxTown)<.005?'':' 格'}，进水 ${wet(a)} → ${wet(b)} 户。`;
  const mechanisms=[
   '河道与分流渠为来水腾出通路，护岸挡住漫向小镇的水。',
   '旁路分走急流，桥下拓宽减轻拥堵；水越深、流得越急，桥脚越容易受损。',
   '入口分水，出口排水，两端接通才能让两岸共同分担洪峰。',
   '大坝暂存洪峰，闸门控制下泄，泄洪道把水送出下游。',
   '雨中蓄水，晴天供田；浅渠送水，排水沟带走多余积水。',
   '河床高低和水路连通性，一起决定水往哪里走、在哪里积。'
  ];
  let next=b.maxTown>=.18?'试着疏通小镇旁的窄口和下游出口。':b.maxDown>=.18?'下游仍进水，疏通出口或调小闸门再试。':(c.id===1||c.id===4)&&b.bridgeHealth<=0?'桥仍然断裂。检查旁路是否接回下游，并观察桥下持续急流。':c.id===4&&b.maxFarm>=.5?'田边水过深。先检查排水沟，再调整闸门，观察供田时间与最高水深。':c.id===4&&b.farmSeconds<c.level.irrigation?'晴天供田时间还不够。检查浅渠是否接通，并保留晴天可用的库水。':c.map.dam&&b.maxBasin<c.level.storage?'蓄水尚未达到目标。检查大坝是否完成，再比较不同闸门开度下的蓄水与下游水位。':c.id===4&&b.endBasin<c.level.retain?'结束时留水不足。试着减少晴天后段的下泄，同时确认田边仍有浅水。':'再调整一处，看看水怎么变。';
  const facts=(c.completed||[]).map(id=>(typeof WaterLearning!=='undefined'?WaterLearning.works[id]?.[1]:null)).filter(Boolean);const explanation=(c.id>=3?mechanisms[c.id]:facts.length?facts.slice(0,2).join(' '):mechanisms[c.id]);
  const mapHTML=c.maps?`<div class="water-maps">${this.map(c.maps[0],a,c.map,'改造前')}${this.map(c.maps[1],b,c.map,'改造后')}</div><p class="report-note">同场雨 · 第 ${c.mapTime.toFixed(0)} 秒　深蓝 = 深水，箭头 = 流向<br>橙色屋：曾进水　绿色屋：平安　1–3 小镇 / 4 ${c.id===2?'东岸':'下游'}</p>`:'';
  const needsHelp=b.maxTown>=.18||b.maxDown>=.18||((c.id===1||c.id===4)&&b.bridgeHealth<=0)||(c.map.dam&&b.maxBasin<c.level.storage)||(c.id===4&&(b.maxFarm>=.5||b.farmSeconds<c.level.irrigation||b.endBasin<c.level.retain));
  return `<section class="water-report"><div class="report-summary">${observation}</div>${mapHTML}<div class="reason-card"><b>为什么会这样？</b><p>${explanation}</p><p class="report-note">${actions}</p></div>${needsHelp?`<p>${next}</p>`:''}<details><summary>水位与数据</summary><div class="chart-legend"><span>┄ 改造前</span><span>━ 改造后</span><small>小镇水深 · 格</small></div>${this.chart(c)}<div class="report-table-wrap"><table><thead><tr><th>指标</th><th>改造前</th><th>改造后</th><th>变化</th></tr></thead><tbody>${rows}</tbody></table></div>${previous?`<p class="report-note">上次 → 本次：小镇 ${previous.maxTown.toFixed(2)} → ${b.maxTown.toFixed(2)} 格${c.sameWeather?'':' · 天气已更换'}</p>`:''}</details></section>`;

 }
};
if(typeof module!=='undefined')module.exports=WaterReport;
