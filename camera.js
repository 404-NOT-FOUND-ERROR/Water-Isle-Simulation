let cameraFrame=null,cameraMode='';
const filmLength=20,viewMetrics={w:1,h:1,homeHeight:230};
const filmShots=[
 {t:0,x:-5,z:-20,y:1.9,width:18,angle:-.38,height:44},
 {t:3,x:-4.5,z:-15,y:1.5,width:21,angle:-.25,height:51},
 {t:7,x:-4.2,z:-6,y:1,width:25,angle:.05,height:56},
 {t:10.5,x:.2,z:2.5,y:1,width:20,angle:.22,height:44},
 {t:14.5,x:2,z:3,y:1,width:18,angle:.37,height:42},
 {t:16,x:1,z:3,y:1,width:23,angle:.27,height:52}
];
const smooth=t=>t*t*(3-2*t);
function overviewFrame(kind){
 const {w,h,homeHeight}=viewMetrics,sideHome=w>=650&&w<=900&&h>=360&&h<=560,narrow=w<901&&!sideHome;
 const gate=kind==='play'&&w<650&&!$('gateControls').hidden,sideGate=gate&&w>430&&h<450,left=sideGate?$('gateControls').offsetWidth+22:0;
 const top=kind==='play'?(h<300?8:38):25,right=kind==='home'&&!narrow?Math.min(450,w*.4):0,bottom=kind==='home'&&narrow?homeHeight+32:kind==='play'?(gate&&!sideGate?Math.min(240,$('gateControls').offsetHeight+16):40):16;
 const areaH=Math.max(80,h-top-bottom);
 return {x:0,y:-1,z:0,angle:kind==='play'?angle:.18,height:70,scale:Math.min((w-left-right-24)/66,areaH/53)*(kind==='play'?zoom:1),cx:left+(w-left-right)/2,cy:top+areaH/2};
}
function shotFrame(shot){
 const {w,h}=viewMetrics,top=30,bottom=h<500?86:112,areaH=Math.max(80,h-top-bottom);
 return {...shot,scale:Math.min((w-28)/shot.width,areaH/(shot.width*.77)),cx:w/2,cy:top+areaH/2};
}
function mixFrame(a,b,t){const out={};for(const key of ['x','y','z','angle','height','scale','cx','cy'])out[key]=a[key]+(b[key]-a[key])*t;return out;}
function cinemaFrame(time){
 if(time>=16)return mixFrame(shotFrame(filmShots[filmShots.length-1]),overviewFrame('home'),smooth(Math.min(1,(time-16)/4)));
 let a=filmShots[0],b=filmShots[1];for(let i=0;i<filmShots.length-1;i++)if(time>=filmShots[i].t){a=filmShots[i];b=filmShots[i+1];}
 return mixFrame(shotFrame(a),shotFrame(b),smooth(Math.min(1,Math.max(0,(time-a.t)/(b.t-a.t)))));
}
function updateCamera(dt=1/60){
 const target=mode==='intro'?cinemaFrame(storyTime):overviewFrame(mode),{w,h}=viewMetrics;
 const f=mode==='play'&&cameraMode===mode&&cameraFrame?mixFrame(cameraFrame,target,reducedMotion?1:1-Math.exp(-dt*12)):target;
 const moving=!cameraFrame||Object.keys(f).some(k=>Math.abs(f[k]-cameraFrame[k])>.0001);cameraFrame=f;cameraMode=mode;
 camera.left=-f.cx/f.scale;camera.right=(w-f.cx)/f.scale;camera.top=f.cy/f.scale;camera.bottom=-(h-f.cy)/f.scale;
 camera.position.set(f.x+Math.sin(f.angle)*74,f.y+f.height,f.z+Math.cos(f.angle)*74);camera.lookAt(f.x,f.y,f.z);camera.updateProjectionMatrix();camera.updateMatrixWorld();
 return moving;
}
function resizeCinemaView(){
 const r=host.getBoundingClientRect();viewMetrics.w=Math.max(1,r.width);viewMetrics.h=Math.max(1,r.height);
 const hidden=$('home').hidden;$('home').style.visibility='hidden';$('home').hidden=false;viewMetrics.homeHeight=$('home').offsetHeight;$('home').hidden=hidden;$('home').style.visibility='';
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5,Math.sqrt(1600000/(viewMetrics.w*viewMetrics.h))));renderer.setSize(viewMetrics.w,viewMetrics.h,false);updateCamera();
}
