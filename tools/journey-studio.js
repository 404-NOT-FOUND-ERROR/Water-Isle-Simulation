const studioButton=document.getElementById('render-journey');
setTimeout(()=>{studioButton.disabled=false;document.getElementById('render-covers').disabled=false;},120);
studioButton.onclick=()=>{
 cancelAnimationFrame(raf);raf=0;
 const gallery=document.getElementById('studio-grid');gallery.replaceChildren();
 const photoCamera=new THREE.OrthographicCamera(-42,42,30.8,-30.8,.1,400);
 photoCamera.position.set(Math.sin(.18)*74,67.7,Math.cos(.18)*74);photoCamera.lookAt(0,-2.3,0);photoCamera.updateMatrixWorld();
 for(let id=0;id<6;id++){
  enterLevel(id);paused=true;animateScenery(0);refreshTerrain();refreshWater();
  routeLine.visible=routeBeads.visible=jobRing.visible=brushRing.visible=cursorDot.visible=false;
  flowLines.visible=worker.visible=dust.visible=rain.visible=false;
  renderer.setPixelRatio(1);renderer.setSize(900,660,false);
  renderer.setClearColor(0xd7e9dc,1);renderer.render(scene,photoCamera);
  const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');
  img.src=renderer.domElement.toDataURL('image/webp',.91);img.alt=WaterCampaign.maps[id].name;img.dataset.level=id;
  img.width=900;img.height=660;caption.textContent=WaterCampaign.maps[id].name;figure.append(img,caption);gallery.append(figure);
 }
 studioButton.textContent='重新生成六关缩略图';
};
document.getElementById('render-covers').onclick=()=>{
 cancelAnimationFrame(raf);raf=0;enterLevel(0);paused=true;animateScenery(0);refreshTerrain();refreshWater();
 routeLine.visible=routeBeads.visible=jobRing.visible=brushRing.visible=cursorDot.visible=false;
 flowLines.visible=worker.visible=dust.visible=rain.visible=false;
 const gallery=document.getElementById('studio-grid');gallery.replaceChildren();
 for(const portrait of [false,true]){
  const width=portrait?1200:1600,height=portrait?1600:900,scale=portrait?14:12.4,cx=portrait?600:1050,cy=portrait?1015:445;
  const photoCamera=new THREE.OrthographicCamera(-cx/scale,(width-cx)/scale,cy/scale,-(height-cy)/scale,.1,400);
  photoCamera.position.set(Math.sin(.18)*74,67.7,Math.cos(.18)*74);photoCamera.lookAt(0,-2.3,0);photoCamera.updateMatrixWorld();
  renderer.setPixelRatio(1);renderer.setSize(width,height,false);renderer.setClearColor(0xd7e9dc,1);renderer.render(scene,photoCamera);
  const cover=document.createElement('canvas');cover.width=width;cover.height=height;
  const ctx=cover.getContext('2d');ctx.drawImage(renderer.domElement,0,0);ctx.fillStyle='#285e4f';ctx.font='700 112px "Microsoft YaHei",sans-serif';ctx.textBaseline='middle';ctx.textAlign=portrait?'center':'left';
  ctx.fillText('给水',portrait?600:130,portrait?270:315);ctx.fillText('一条路',portrait?600:130,portrait?415:455);
  const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');
  img.src=cover.toDataURL('image/jpeg',.94);img.alt=portrait?'给水一条路 · 竖版封面':'给水一条路 · 横版封面';img.dataset.cover=portrait?'portrait':'landscape';img.width=width;img.height=height;
  caption.textContent=img.alt;figure.append(img,caption);gallery.append(figure);
 }
};
