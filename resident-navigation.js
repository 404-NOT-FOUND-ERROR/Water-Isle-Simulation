// Residents use dry-ground routes, never a straight interpolation across water.
class ResidentNavigation {
 constructor(world,home,houses,floor){this.w=world;this.home={...home};this.x=home.x;this.z=home.z;this.houses=houses;this.floor=floor;this.path=[];this.evacuating=false;this.retry=0;this.moving=false;}
 depth(x,z){return this.w.sample(this.w.w,x,z);}
 height(x,z){return this.w.sample(this.w.h,x,z);}
 land(x,z){const w=this.w;return Math.hypot(x,z)<27&&w.mask[w.index(x,z)]&&this.houses.every(h=>Math.hypot(x-h.x,z-h.z)>1.45);}
 segment(ax,az,bx,bz){
  const distance=Math.hypot(bx-ax,bz-az),steps=Math.max(1,Math.ceil(distance/.18));let depth=this.depth(ax,az),height=this.height(ax,az);
  for(let i=1;i<=steps;i++){const x=ax+(bx-ax)*i/steps,z=az+(bz-az)*i/steps,d=this.depth(x,z),h=this.height(x,z);
   if(!this.land(x,z)||Math.abs(h-height)>.23||(d>.18&&d>depth+.0001))return false;
   depth=d;height=h;
  }return true;
 }
 refuge(x,z){return this.land(x,z)&&this.depth(x,z)<.035&&this.height(x,z)>=this.floor+.45;}
 route(returning=false){
  const w=this.w,n=w.n,coord=k=>[k%n*w.dx-32,Math.floor(k/n)*w.dx-32],prev=new Int32Array(n*n).fill(-1),queue=[];
  const center=w.index(this.x,this.z),ci=center%n,cj=Math.floor(center/n);
  // Check the actual off-grid position to each seed; snapping must not cross water.
  for(let j=Math.max(0,cj-1);j<=Math.min(n-1,cj+1);j++)for(let i=Math.max(0,ci-1);i<=Math.min(n-1,ci+1);i++){const k=j*n+i,[x,z]=coord(k);if(this.segment(this.x,this.z,x,z)){prev[k]=k;queue.push(k);}}
  let end=-1;for(let a=0;a<queue.length;a++){const k=queue[a],[x,z]=coord(k);
   if(returning?Math.hypot(x-this.home.x,z-this.home.z)<w.dx&&this.segment(x,z,this.home.x,this.home.z):this.refuge(x,z)){end=k;break;}
   for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const i=k%n+di,j=Math.floor(k/n)+dj;if(i<0||i>=n||j<0||j>=n)continue;const q=j*n+i;if(prev[q]>=0)continue;const [qx,qz]=coord(q);if(!this.segment(x,z,qx,qz))continue;prev[q]=k;queue.push(q);}
  }
  if(end<0)return [];const path=[];while(true){path.push(coord(end));if(prev[end]===end)break;end=prev[end];}path.reverse();if(returning)path.push([this.home.x,this.home.z]);return path;
 }
 tick(dt,houseDepth){
  this.moving=false;this.retry-=dt;const danger=houseDepth>.10||this.depth(this.x,this.z)>.12;
  if(danger&&!this.evacuating){this.evacuating=true;this.path=[];this.retry=0;}
  if(this.evacuating&&houseDepth<.035&&this.depth(this.home.x,this.home.z)<.035){this.evacuating=false;this.path=[];this.retry=0;}
  if(this.path.length&&!this.segment(this.x,this.z,...this.path[0])){this.path=[];this.retry=0;}
  const needsRoute=this.evacuating?!this.refuge(this.x,this.z):Math.hypot(this.x-this.home.x,this.z-this.home.z)>.05;
  if(!this.path.length&&needsRoute&&this.retry<=0){this.path=this.route(!this.evacuating);this.retry=.7;}
  let remaining=dt*3.2;
  while(this.path.length&&remaining>0){const [x,z]=this.path[0];if(!this.segment(this.x,this.z,x,z)){this.path=[];break;}const d=Math.hypot(x-this.x,z-this.z),move=Math.min(d,remaining);if(d>0){this.x+=(x-this.x)*move/d;this.z+=(z-this.z)*move/d;this.moving=move>0;}remaining-=move;if(d<=move+.00001)this.path.shift();else break;}
 }
}
if(typeof module!=='undefined')module.exports=ResidentNavigation;
