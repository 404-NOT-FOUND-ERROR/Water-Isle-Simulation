(() => {
'use strict';
const $=id=>document.getElementById(id);
const iconPaths={
toolbox:'<rect x="3" y="7" width="18" height="14" rx="3"/><path d="M8 7V3h8v4M3 13h18M10 12v4h4v-4"/>',
gate:'<path d="M4 20V5h16v15M2 5h20M8 5v9h8V5M8 18h8M12 1v4M2 21c3-3 5 3 8 0s5 3 8 0h4"/>',
island:'<path d="m3 15 9 6 9-6-9-5-9 5Z"/><path d="m3 15 9 10 9-10M8 13l4-10 4 10M10 8h4"/>',
dig:'<path d="m16 3 5 5-8 8-5-5 8-8ZM8 11l-5 5v5h5l5-5M6 15l3 3"/>',
raise:'<path d="m2 20 7-11 4 5 3-4 6 10M12 3v7m-3-4 3-3 3 3"/>',
flat:'<path d="M3 18h18M4 12h16M12 2v7m-3-3 3 3 3-3"/>',
hand:'<path d="M8 12V5a2 2 0 0 1 4 0v6-7a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v9c0 4-3 6-6 6h-2c-2 0-3-1-4-3l-5-6c-1-2 1-4 3-2l2 2Z"/>',
rain:'<path d="M6 14a4 4 0 0 1-1-8 6 6 0 0 1 11-1 4 4 0 1 1 2 9M8 17l-2 4m8-4-2 4m8-4-2 4"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
flow:'<path d="M3 7c5-8 9 8 18 0m-4-3 4 3-3 4M3 16c5-8 9 8 18 0m-4-3 4 3-3 4"/>',
undo:'<path d="m8 3-5 5 5 5M3 8h10a7 7 0 0 1 0 14"/>',
reset:'<path d="M3 11a9 9 0 1 1 2 7M3 3v8h8"/>',
pause:'<path d="M8 4v16M16 4v16" stroke-width="4"/>',
play:'<path d="m7 3 14 9-14 9V3Z"/>',
rotate:'<path d="M20 9a8 8 0 0 0-14-4L3 8M3 2v6h6M4 15a8 8 0 0 0 14 4l3-3m0 6v-6h-6"/>',
fit:'<path d="M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6M8 12h8m-4-4v8"/>',
zoom:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6M7 10h6m-3-3v6"/>',
book:'<path d="M12 5C9 2 4 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-7-2-10 1Zm0 0v16"/>',
save:'<path d="M4 3h13l4 4v14H3V3h1Zm3 0v6h10V3M7 21v-8h10v8"/>',
close:'<path d="m5 5 14 14M5 19 19 5"/>'
};
function svg(name){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]||''}</svg>`;}
document.querySelectorAll('[data-icon]').forEach(el=>el.insertAdjacentHTML('afterbegin',svg(el.dataset.icon)));
let toastTimer;
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),4200);}
const host=$('scene');
let renderer;
try{
  const test=document.createElement('canvas');
  if(!test.getContext('webgl2')&&!test.getContext('webgl'))throw new Error('WebGL unavailable');
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
}catch(e){$('fallback').hidden=false;return;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.setClearColor(0xd7e9dc,1);host.appendChild(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-40,40,40,-40,.1,400);
const sun=new THREE.DirectionalLight(0xfff1c9,2.8);sun.position.set(-30,55,15);sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-36,right:36,top:36,bottom:-36,near:1,far:120});sun.shadow.bias=-.0015;scene.add(sun);
scene.add(new THREE.HemisphereLight(0xf8ffef,0x667f77,2));
scene.add(new THREE.AmbientLight(0xfff8e8,.3));
const gradientCanvas=document.createElement('canvas');gradientCanvas.width=3;gradientCanvas.height=1;
const gc=gradientCanvas.getContext('2d');['#565656','#b5b5b5','#ffffff'].forEach((c,i)=>{gc.fillStyle=c;gc.fillRect(i,0,1,1);});
const gradientMap=new THREE.CanvasTexture(gradientCanvas);gradientMap.minFilter=gradientMap.magFilter=THREE.NearestFilter;
const toon=(color,extra={})=>new THREE.MeshToonMaterial({color,gradientMap,...extra});
const outlineMat=new THREE.MeshBasicMaterial({color:0x29493d,side:THREE.BackSide});
const mats={trunk:toon(0x91552d),leaf:toon(0x68b354),pine:toon(0x287e69),rock:toon(0x939b86),flower:toon(0xffbd3f),seed:toon(0xffd75a),cloud:toon(0xfffef2),wood:toon(0xa86c3c),wall:toon(0xffe7ba),water:toon(0x73d5c9)};
const TAU=Math.PI*2;let seedHash=20261020;
const outlines=[],props=[],dynamic=[],lanterns=[],residents=[],fantasyBuildings=[],fantasyFloaters=[];
let world=new WaterWorld();
const terrainHeight=(x,z)=>world.sample(world.h,x,z);
/* ORIGINAL_ART */
const protectedSites=[{x:0,z:0,r:1.9},{x:2,z:5,r:1.9},{x:5,z:0,r:1.9},{x:1,z:16,r:1.9}];
const houses=protectedSites.map((s,i)=>{const obj=makeHouse(s.x,s.z,-.25,i);return {obj,x:s.x,z:s.z,floor:terrainHeight(s.x,s.z),down:i===3};});
for(let i=0;i<3;i++){
  makeResident(i);const r=residents[i];r.home={x:houses[i].x+1.9,z:houses[i].z+1.8};
  r.group.position.set(r.home.x,terrainHeight(r.home.x,r.home.z),r.home.z);
}
makeLantern(4,3,0);makeLantern(0,13,1);
makeCrystal(-18,-12,.85);makeCrystal(-21,-10,.55,true);makeCrystal(-15,-15,.5,true);
makeMushroom(17,10,1.1);makeMushroom(20,12,.75);makeMushroom(16,13,.6);
// Original procedural models are reused, with locations adapted to the catchment.
for(let i=0;i<55;i++){
  const x=(rand()-.5)*52,z=(rand()-.5)*52;
  if(Math.hypot(x,z)>26||Math.abs(x-world.river(z))<5||Math.hypot(x-3,z-3)<10||Math.hypot(x+14,z-6)<7||Math.hypot(x-9,z-12)<6)continue;
  if(i%4===0)makeRock(x,z);else makeTree(x,z,i%3===0);
}
for(let i=0;i<24;i++){const x=12+rand()*8,z=-3+rand()*9;const f=makeFlower(x,z,'plant');props.push(f);}
const cloudA=makeCloud(-20,13,-18,1.6),cloudB=makeCloud(18,12,-20,1.4);
const farm=new THREE.Group();farm.position.set(9,terrainHeight(9,12)+.06,12);scene.add(farm);
const soil=toon(0xc59357),crop=toon(0xcdd96b);
for(let i=0;i<6;i++){const row=new THREE.Mesh(new THREE.BoxGeometry(.35,.14,4),soil);row.position.set((i-2.5)*.7,0,0);farm.add(row);
 for(let j=0;j<7;j++){const leaf=new THREE.Mesh(new THREE.ConeGeometry(.16,.55,4),crop);leaf.position.set((i-2.5)*.7,.3,(j-3)*.5);farm.add(leaf);if(j%2===0){const pumpkin=new THREE.Mesh(new THREE.SphereGeometry(.24,7,5),toon(0xe9a448));pumpkin.scale.set(1,.72,1);pumpkin.position.set((i-2.5)*.7+.12,.2,(j-3)*.5);farm.add(pumpkin);}}}
// Low stone stepping path to the town; discrete pieces follow later terrain edits.
for(let i=0;i<12;i++){const x=3+Math.sin(i*.4),z=6+i*.55;const stone=new THREE.Mesh(new THREE.CylinderGeometry(.38,.42,.12,6),fantasyPalette.paleStone);stone.position.set(x,terrainHeight(x,z)+.08,z);scene.add(stone);props.push(stone);}
let terrain,terrainGeo,waterMesh,waterGeo;
const nodeIds=[];
{
  const positions=[],colors=[],n=world.n,d=world.dx;
  for(let j=0;j<n-1;j++)for(let i=0;i<n-1;i++){
    const x=(i+.5)*d-32,z=(j+.5)*d-32;
    if(Math.hypot(x,z)>29.7)continue;
    const a=j*n+i,b=a+1,c=a+n,e=c+1;
    for(const k of [a,c,b,b,c,e]){nodeIds.push(k);positions.push((k%n)*d-32,world.h[k],Math.floor(k/n)*d-32);colors.push(.4,.7,.3);}
  }
  terrainGeo=new THREE.BufferGeometry();terrainGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  terrainGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  terrain=new THREE.Mesh(terrainGeo,toon(0xffffff,{vertexColors:true,flatShading:true}));terrain.receiveShadow=true;scene.add(terrain);
  waterGeo=new THREE.BufferGeometry();waterGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  waterGeo.setAttribute('depth',new THREE.Float32BufferAttribute(new Float32Array(nodeIds.length),1));
  waterMesh=new THREE.Mesh(waterGeo,new THREE.ShaderMaterial({
    uniforms:{time:{value:0}},transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:`attribute float depth; varying float vDepth; varying vec3 vPos; uniform float time;
      void main(){vDepth=depth;vPos=position;vec3 p=position;p.y+=.004*sin(time*2.)*min(depth,1.);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader:`precision highp float;varying float vDepth;varying vec3 vPos;uniform float time;
      void main(){if(vDepth<.018)discard;float deep=smoothstep(.05,1.8,vDepth);
      vec3 c=mix(vec3(.25,.72,.77),vec3(.06,.38,.54),deep);
      float stripe=0.;
      float ripple=sin(vPos.x*2.1)*sin(vPos.z*2.8)*.18;
      c+=stripe*.35+vec3(ripple*.04);c=mix(vec3(.75,.94,.81),c,smoothstep(.018,.12,vDepth));
      gl_FragColor=vec4(c,.88);}`
  }));waterMesh.renderOrder=2;waterMesh.frustumCulled=false;scene.add(waterMesh);
}
// Faceted floating underside, derived from the project's low-poly material language.
for(const [top,bottom,r1,r2,color] of [[-1.5,-6,29.5,29,0xc0a27d],[-6,-11,29,23,0x8b8991],[-11,-15,23,10,0x72778a]]){
 const geo=new THREE.CylinderGeometry(r1,r2,top-bottom,64,1,true);const m=new THREE.Mesh(geo,toon(color,{flatShading:true}));m.position.y=(top+bottom)/2;scene.add(m);
}
const sea=new THREE.Mesh(new THREE.CircleGeometry(37,80),new THREE.MeshBasicMaterial({color:0x9bd5c9,transparent:true,opacity:.38,side:THREE.DoubleSide}));sea.rotation.x=-Math.PI/2;sea.position.y=-3;scene.add(sea);
const seaRings=[];
for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.RingGeometry(32+i*2.1,32.12+i*2.1,80),new THREE.MeshBasicMaterial({color:0xf6f6cf,transparent:true,opacity:.65,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=-2.95;scene.add(m);seaRings.push(m);}
const ringPositions=new Float32Array(65*3),ringGeo=new THREE.BufferGeometry();ringGeo.setAttribute('position',new THREE.BufferAttribute(ringPositions,3));
const brushRing=new THREE.Line(ringGeo,new THREE.LineBasicMaterial({color:0xfffcbb,depthTest:false,depthWrite:false,transparent:true,opacity:1}));brushRing.renderOrder=10;brushRing.visible=false;scene.add(brushRing);
const cursorDot=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),new THREE.MeshBasicMaterial({color:0xfffcbb,depthTest:false,depthWrite:false,transparent:true,opacity:1}));cursorDot.renderOrder=10;cursorDot.visible=false;scene.add(cursorDot);
const flowPositions=new Float32Array(2000*3),flowGeo=new THREE.BufferGeometry();flowGeo.setAttribute('position',new THREE.BufferAttribute(flowPositions,3));
const flowLines=new THREE.LineSegments(flowGeo,new THREE.LineBasicMaterial({color:0xeafbe0,depthTest:false,transparent:true,opacity:.9}));flowLines.renderOrder=5;flowLines.visible=true;scene.add(flowLines);
const rainPositions=new Float32Array(180*6),rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPositions,3));
const rain=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0xd8f3e7,transparent:true,opacity:.65}));rain.visible=false;scene.add(rain);

/* SCENERY */
/* FLOW */
/* CAMERA */
/* EXPERIENCE */
})();
