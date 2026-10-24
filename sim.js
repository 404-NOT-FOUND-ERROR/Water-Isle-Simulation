// Two-dimensional shallow-water mass and momentum solver.
// HLL finite-volume fluxes with hydrostatic reconstruction (Audusse et al., 2004).
class WaterWorld {
  constructor(n=81) {
    this.n=n; this.size=64; this.dx=this.size/(n-1); this.area=this.dx*this.dx;
    this.h=new Float64Array(n*n); this.w=new Float64Array(n*n);
    this.base=new Float64Array(n*n); this.fx=new Float64Array(n*n); this.fz=new Float64Array(n*n);
    this.qx=new Float64Array(n*n); this.qz=new Float64Array(n*n);
    this.delta=new Float64Array(n*n); this.dqx=new Float64Array(n*n); this.dqz=new Float64Array(n*n); this.mask=new Uint8Array(n*n);
    this.gravity=9.81; this.roughness=.065; this.inletSpeed=1.4; this.dry=1e-6;
    this.vx=new Float32Array(n*n); this.vz=new Float32Array(n*n);
    this.sources=[]; this.input=0; this.output=0; this.earth=0;
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){
      const k=j*n+i,x=i*this.dx-32,z=j*this.dx-32,r=Math.hypot(x,z),cx=this.river(z);
      let h=2.5-.045*z+.12*Math.sin(x*.31)*Math.cos(z*.23);
      h+=5.8*Math.exp(-((x+17)**2+(z+14)**2)/72)+4*Math.exp(-((x-17)**2+(z+17)**2)/58);
      const width=3.2-1.6*Math.exp(-(((z-7)/3.5)**2));
      const channel=Math.exp(-(((x-cx)/width)**4));
      h=h*(1-channel)+(.35-.045*z)*channel;
      h-=1.35*Math.exp(-((x+14)**2+(z-6)**2)/37);
      // An old shallow channel from the river to the western basin.
      const t=Math.max(0,Math.min(1,(-x-4)/10)),oldZ=-2+8*t;
      if(x< -4&&x> -15) h-=.38*Math.exp(-(((z-oldZ)/1.25)**2));
      if(r>27) h=h+(Math.max(0,1-(r-27)/3)-1)*(h+4);
      // A low floodplain under the town, naturally exposed to an overtopping river.
      h-=.4*Math.exp(-((x-2)**2+(z-2)**2)/35);
      // The headwater valley closes upstream; the southern lip is the outlet.
      if(z< -25)h=Math.max(h,3.2+(-25-z)*1.2);
      this.h[k]=this.base[k]=h;
      this.mask[k]=r<29.5?1:0;
      if(Math.abs(z+23)<3&&Math.abs(x-cx)<1.8)this.sources.push(k);
      if(Math.abs(x-cx)<1.9&&z> -25&&z<27)this.w[k]=.18;
    }
    this.pristine=this.h.slice();this.initialMass=this.mass();
  }
  river(z){return this.map?.main(z)??(-4+1.3*Math.sin(z*.14));}
  index(x,z){return Math.max(0,Math.min(this.n-1,Math.round((z+32)/this.dx)))*this.n+Math.max(0,Math.min(this.n-1,Math.round((x+32)/this.dx)));}
  sample(arr,x,z){
    const a=Math.max(0,Math.min(this.n-1.001,(x+32)/this.dx)),b=Math.max(0,Math.min(this.n-1.001,(z+32)/this.dx)),i=Math.floor(a),j=Math.floor(b),u=a-i,v=b-j,k=j*this.n;
    return (arr[k+i]*(1-u)+arr[k+i+1]*u)*(1-v)+(arr[k+this.n+i]*(1-u)+arr[k+this.n+i+1]*u)*v;
  }
  mass(){let sum=0;for(const v of this.w)sum+=v*this.area;return sum;}
  updateVelocity(){
    for(let k=0;k<this.w.length;k++){const d=this.w[k];this.vx[k]=d>this.dry?this.qx[k]/d:0;this.vz[k]=d>this.dry?this.qz[k]/d:0;}
  }
  step(dt,rate=2){
    this.control?.beginStep?.();let left=dt;
    while(left>1e-9){
      let signal=1;
      for(let k=0;k<this.w.length;k++)if(this.w[k]>this.dry){const c=Math.sqrt(this.gravity*this.w[k]);signal=Math.max(signal,Math.abs(this.qx[k]/this.w[k])+c,Math.abs(this.qz[k]/this.w[k])+c);}
      const sub=Math.min(left,.035,.22*this.dx/signal);
      this.substep(sub,rate);left-=sub;
    }
    this.updateVelocity();this.control?.endStep?.(dt);
  }
  substep(dt,rate){
    const {n,h,w,qx,qz,delta,dqx,dqz,mask,gravity:g,dry}=this,ratio=dt/this.dx;
    this.control?.transfer(dt);
    const supply=this.sources.length?Math.max(0,rate)*dt/this.sources.length/this.area:0;
    for(const k of this.sources){const z=Math.floor(k/n)*this.dx-32,slope=(this.river(z+.1)-this.river(z-.1))/.2,norm=Math.hypot(1,slope);w[k]+=supply;qz[k]+=supply*this.inletSpeed/norm;qx[k]+=supply*this.inletSpeed*slope/norm;}
    this.input+=supply*this.sources.length*this.area;
    delta.fill(0);dqx.fill(0);dqz.fill(0);this.fx.fill(0);this.fz.fill(0);
    for(let dir=0;dir<2;dir++){
      const normal=dir?qz:qx,tangent=dir?qx:qz,dn=dir?dqz:dqx,dtan=dir?dqx:dqz,faces=dir?this.fz:this.fx;
      for(let j=0;j<n-(dir?1:0);j++)for(let i=0;i<n-(dir?0:1);i++){
        const k=j*n+i,l=k+(dir?n:1),hl=w[k],hr=w[l];if(hl<=dry&&hr<=dry)continue;
        const bed=Math.max(h[k],h[l]),a=Math.max(0,h[k]+hl-bed),b=Math.max(0,h[l]+hr-bed);
        const ul=hl>dry?normal[k]/hl:0,ur=hr>dry?normal[l]/hr:0,vl=hl>dry?tangent[k]/hl:0,vr=hr>dry?tangent[l]/hr:0;
        const cl=Math.sqrt(g*a),cr=Math.sqrt(g*b);
        let sl=Math.min(ul-cl,ur-cr,0),sr=Math.max(ul+cl,ur+cr,0);
        if(b<=dry&&a>dry){sl=Math.min(0,ul-cl);sr=Math.max(0,ul+2*cl);}
        if(a<=dry&&b>dry){sl=Math.min(0,ur-2*cr);sr=Math.max(0,ur+cr);}
        const al=a*ul,br=b*ur,pl=.5*g*a*a,pr=.5*g*b*b,den=sr-sl;
        let mass=0,momentum=0,cross=0;
        if(den>1e-10){
          mass=(sr*al-sl*br+sl*sr*(b-a))/den;
          momentum=(sr*(al*ul+pl)-sl*(br*ur+pr)+sl*sr*(br-al))/den;
          cross=(sr*al*vl-sl*br*vr+sl*sr*(b*vr-a*vl))/den;
        }
        const volume=ratio*mass;faces[k]=volume;delta[k]-=volume;delta[l]+=volume;
        dn[k]-=ratio*(momentum+.5*g*(hl*hl-a*a));dn[l]+=ratio*(momentum+.5*g*(hr*hr-b*b));
        dtan[k]-=ratio*cross;dtan[l]+=ratio*cross;
      }
    }
    this.control?.recordSurface?.();
    // Reflecting outer grid walls; the island's masked lip acts as a free outfall.
    for(let a=0;a<n;a++){dqx[a*n]+=ratio*.5*g*w[a*n]**2;dqx[a*n+n-1]-=ratio*.5*g*w[a*n+n-1]**2;dqz[a]+=ratio*.5*g*w[a]**2;dqz[(n-1)*n+a]-=ratio*.5*g*w[(n-1)*n+a]**2;}
    for(let k=0;k<w.length;k++){
      w[k]=Math.max(0,w[k]+delta[k]);qx[k]+=dqx[k];qz[k]+=dqz[k];
      if(!mask[k]){this.output+=w[k]*this.area;w[k]=qx[k]=qz[k]=0;continue;}
      if(w[k]<=dry){qx[k]=qz[k]=0;continue;}
      const drag=1+g*this.roughness*this.roughness*dt*Math.hypot(qx[k],qz[k])/Math.pow(Math.max(w[k],.002),7/3);
      qx[k]/=drag;qz[k]/=drag;
    }
  }
  edit(x,z,r,amount,mode,protectedSites=[],floor=-1.8){
    const {n,dx,h,base}=this;let changed=0;
    const target=this.sample(h,x,z);
    for(let j=Math.max(1,Math.floor((z-r+32)/dx));j<Math.min(n-1,Math.ceil((z+r+32)/dx));j++){
      for(let i=Math.max(1,Math.floor((x-r+32)/dx));i<Math.min(n-1,Math.ceil((x+r+32)/dx));i++){
        const px=i*dx-32,pz=j*dx-32,k=j*n+i,d=Math.hypot(px-x,pz-z);
        if(d>r||!this.mask[k]||Math.hypot(px,pz)>27.5||protectedSites.some(s=>Math.hypot(px-s.x,pz-s.z)<s.r))continue;
        const fall=.5+.5*Math.cos(d/r*Math.PI),old=h[k];
        const next=mode==='flat'?old+(target-old)*Math.min(1,amount*fall):old+amount*fall*(mode==='dig'?-1:1);
        h[k]=Math.max(Math.min(old,floor),Math.min(base[k]+5,next));
        changed+=Math.abs(h[k]-old)*this.area;
      }
    }
    this.earth+=changed;
    return changed;
  }
  snapshot(){return {h:this.h.slice(),w:this.w.slice(),qx:this.qx.slice(),qz:this.qz.slice(),earth:this.earth,input:this.input,output:this.output,initialMass:this.initialMass};}
  restore(s){this.h.set(s.h);this.w.set(s.w);this.qx.set(s.qx||new Float64Array(this.qx.length));this.qz.set(s.qz||new Float64Array(this.qz.length));this.updateVelocity();this.earth=s.earth;this.input=s.input;this.output=s.output;this.initialMass=s.initialMass;}
}
if(typeof module!=='undefined')module.exports=WaterWorld;

