// Reuse the project's model vocabulary, but give each catchment its own settlement.
const originalDecor=props.filter(p=>!p.userData.townBuilding&&p!==soilPile),mapDecor=new Map();
const damArt=new THREE.Group();scene.add(damArt);let gatePanel=null,gateWheel=null,gateJet=null;
function populateMap(id){
 const m=WaterCampaign.maps[id];originalDecor.forEach(p=>p.visible=id===0);mapDecor.forEach((g,key)=>g.visible=key===id);
 if(id&&!mapDecor.has(id)){
  const group=new THREE.Group();scene.add(group);mapDecor.set(id,group);seedHash=717+id*347;
  for(let i=0;i<100;i++){const x=(rand()-.5)*52,z=(rand()-.5)*52;if(Math.hypot(x,z)>26||world.sample(world.w,x,z)>.02||Math.abs(x-m.main(z))<5||(m.branch&&z>-6&&Math.abs(x-m.branch(z))<4)||m.houses.some(p=>Math.hypot(x-p[0],z-p[1])<4.3)||Math.hypot(x-m.farm[0],z-m.farm[1])<4.5||Math.hypot(x-m.basin[0],z-m.basin[1])<m.basin[2]+1||(m.dam&&Math.abs(z-m.dam.z)<4))continue;
   const o=id===1&&i%3!==0?makeRock(x,z):makeTree(x,z,id===1||id===3);if(id===1&&i%3!==0)o.scale.set(1.7,2.3,1.7);group.add(o);
  }
  for(let i=0;i<13;i++){const a=i/13*TAU,x=m.basin[0]+Math.cos(a)*(m.basin[2]+.6),z=m.basin[1]+Math.sin(a)*(m.basin[2]+.6);if(Math.hypot(x,z)>26||Math.abs(x-m.main(z))<3)continue;const o=new THREE.Mesh(new THREE.ConeGeometry(.22,1.1,5),toon(id===1?0x72958a:0x9ba756));o.position.set(x,terrainHeight(x,z),z);group.add(o);props.push(o);}
  for(const [i,p] of m.houses.entries()){group.add(makeLantern(p[0]+2,p[1]+1,i));for(let j=0;j<4;j++){const o=new THREE.Mesh(new THREE.CylinderGeometry(.35,.4,.1,6),fantasyPalette.paleStone);o.position.set(p[0]+Math.sin(j)*.3,terrainHeight(p[0],p[1]+2+j*.6)+.06,p[1]+2+j*.6);group.add(o);props.push(o);}}
  if(id===1){group.add(makeCrystal(-19,-9,.9,true));group.add(makeCrystal(17,-12,.7));}
  if(id===2){for(const p of [[-4,12],[0,15],[3,18]])group.add(makeMushroom(...p,.8));}
  if(id===3){group.add(makeCrystal(-17,-17,1));group.add(makeCrystal(6,-19,.9));}
  if(id===4){group.add(makeMushroom(-15,12,.9));group.add(makeMushroom(-17,10,.7));}
  if(id===5){for(const p of [[-15,-15],[18,4],[-18,14]])group.add(makeCrystal(...p,1));}
 }
 const palette=[0x91b86c,0x849a7d,0xa7bc78,0x83ae90,0xb6ba75,0x8ab5a3];mats.rock.color.setHex(id===1?0x8b99a2:0x939b86);terrain.userData.groundColor=palette[id];
 for(let i=0;i<houses.length;i++){const h=houses[i],[x,z]=m.houses[i];h.x=x;h.z=z;h.floor=terrainHeight(x,z);h.obj.position.set(x,h.floor,z);protectedSites[i].x=x;protectedSites[i].z=z;if(residents[i]){residents[i].group.visible=true;residents[i].home={x:x+1.9,z:z+1.8};residents[i].navigation=null;residents[i].group.position.set(x+1.9,terrainHeight(x+1.9,z+1.8),z+1.8);}}
 farm.position.set(m.farm[0],terrainHeight(...m.farm)+.07,m.farm[1]);farm.visible=id===0||id===4||id===5;
 soilPile.position.set(m.spawn[0]-1.8,terrainHeight(m.spawn[0]-1.8,m.spawn[1])+.4,m.spawn[1]);soilPile.visible=id>0&&id<5;
 mill.visible=id===0||id===4;if(id===4)mill.position.set(-15,terrainHeight(-15,18),18);else mill.position.set(14,terrainHeight(14,15),15);
 // A known crest and a moving gate make the controlled opening readable.
 for(const child of [...damArt.children]){damArt.remove(child);child.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&!Object.values(mats).includes(o.material))o.material.dispose();});}
 gatePanel=gateWheel=null;damArt.visible=!!m.dam;if(m.dam){const d=m.dam;damArt.position.set(d.x,0,d.z);const material=toon(0x87998e);for(const x of [-1.5,1.5]){const p=new THREE.Mesh(new THREE.BoxGeometry(.45,5.6,.8),material.clone());p.position.set(x,d.crest+.2,0);damArt.add(p);}const beam=new THREE.Mesh(new THREE.BoxGeometry(3.5,.35,.85),toon(0xd9bc80));beam.position.y=d.crest+3;damArt.add(beam);gatePanel=new THREE.Mesh(new THREE.BoxGeometry(2.4,3.6,.25),toon(0x487b83));gatePanel.position.y=d.invert+1.8;damArt.add(gatePanel);gateWheel=new THREE.Mesh(new THREE.TorusGeometry(.4,.08,6,12),toon(0xe5bb5d));gateWheel.position.set(0,d.crest+3.3,.5);damArt.add(gateWheel);
  for(let x=-d.width/2+.45;x<d.width/2;x+=.9){if(Math.abs(x)<d.gateWidth/2+.45)continue;const floor=Math.min(d.crest-.35,world.sample(world.base,d.x+x,d.z+1.6)),height=d.crest-floor;const wall=new THREE.Mesh(new THREE.BoxGeometry(.86,height,.48),toon(0xb5b6a0));wall.position.set(x,floor+height/2,.98);wall.userData.buildWall={floor,height};wall.castShadow=true;wall.receiveShadow=true;damArt.add(wall);const coping=new THREE.Mesh(new THREE.BoxGeometry(.89,.18,.86),toon(0xe2d5af));coping.position.set(x,d.crest+.09,.5);coping.userData.crestMarker={floor,crest:d.crest};damArt.add(coping);}
  gateJet=new THREE.Mesh(new THREE.BoxGeometry(2.2,.09,4.5),new THREE.MeshBasicMaterial({color:0x70d8df,transparent:true,opacity:.8}));gateJet.position.set(0,d.invert+.12,.3);damArt.add(gateJet);
  for(let x=-d.width/2;x<=d.width/2;x+=1.4){if(Math.abs(x)<2)continue;const p=new THREE.Mesh(new THREE.CylinderGeometry(.07,.1,.8,5),mats.wood);p.position.set(x,d.crest+.4,0);damArt.add(p);}
 }
}
function animateStructures(dt){
 const h=hydraulics,m=WaterCampaign.maps[chapter];if(!h)return;
 if(m.bridge){const damage=1-h.health/100;if(h.health===0)bridgeFall+=dt;else bridgeFall=0;
  for(const o of bridge.children){const rest=o.userData.rest;if(!rest)continue;const center=Math.abs(rest.x+4.5)<2.8;o.position.set(rest.x,rest.y,rest.z);o.rotation.set(0,0,rest.rz);o.visible=true;
   if(center){o.rotation.z+=damage*.09*Math.sin(clockTime*4+rest.x);if(bridgeFall){const t=Math.min(bridgeFall,7);o.position.y-=Math.min(3.5,t*t*3);o.position.z+=t*Math.max(.1,h.speed)*.6;o.rotation.x=t*.5;o.visible=t<6;}}
   if(o.material?.color)o.material.color.copy(o.userData.color).lerp(new THREE.Color(0xc5683f),damage*.45);
  }
 }
 if(m.dam){damArt.traverse(o=>{const f=h.damBuilt?1:h.builtFraction;if(o.userData.buildWall){const b=o.userData.buildWall;o.scale.y=Math.max(.025,f);o.position.y=b.floor+b.height*f/2;}if(o.userData.crestMarker){const b=o.userData.crestMarker;o.position.y=b.floor+(b.crest-b.floor)*f+.09;}if(o.material){o.material.transparent=!h.damBuilt;o.material.opacity=h.damBuilt?1:.25+f*.65;}});if(gatePanel){const opening=gatePanel.userData.opening??h.gate;gatePanel.userData.opening=opening+(h.gate-opening)*(reducedMotion?1:1-Math.exp(-dt*14));gatePanel.position.y=m.dam.invert+1.8+gatePanel.userData.opening*m.dam.maxOpening;gateWheel.rotation.z=-gatePanel.userData.opening*Math.PI*2;}if(gateJet){gateJet.visible=h.damBuilt&&Math.abs(h.gateFlow)>.02;gateJet.scale.x=Math.max(.08,Math.min(1,Math.abs(h.gateFlow)/3));gateJet.position.z=h.gateFlow>=0?1:-1;gateJet.position.y=m.dam.invert+.12+Math.min(.5,h.gate*.4);}}
 // Wet crops visibly recover; prolonged deep water flattens their leaves.
 farm.children.forEach((o,i)=>{if(o.geometry?.type==='ConeGeometry'){const fd=world.sample(world.w,...m.farm),watered=((trial||(reviewing&&previous))?.farmSeconds||0)>2;const target=fd>.5?.25:watered?1.25:1;o.scale.y+=(target-o.scale.y)*Math.min(1,dt*2);}});
}

