(function(KG){
  'use strict';
  if(!KG.Renderer||!KG.Game)return;

  const R=KG.Renderer.prototype;
  const originalResize=R.resize;
  const originalEnvironmentBack=R.environmentBack;
  const originalPlatform=R.platform;
  const baselineCache=new Map();

  R.resize=function(){
    originalResize.call(this);
    if(this.dpr>1.5){
      this.dpr=1.5;
      this.canvas.width=Math.floor(this.w*this.dpr);
      this.canvas.height=Math.floor(this.h*this.dpr);
      this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
      this.ctx.imageSmoothingEnabled=true;
      this.ctx.imageSmoothingQuality='high';
    }
  };

  function spriteBottom(renderer,file){
    if(baselineCache.has(file))return baselineCache.get(file);
    const src=renderer.source(file);
    if(!src)return 306;
    try{
      const cv=document.createElement('canvas');
      cv.width=src.sw;cv.height=src.sh;
      const cx=cv.getContext('2d',{willReadFrequently:true});
      cx.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,0,0,src.sw,src.sh);
      const d=cx.getImageData(0,0,src.sw,src.sh).data;
      const x0=Math.floor(src.sw*.16),x1=Math.ceil(src.sw*.84);
      let bottom=-1;
      outer:for(let y=src.sh-1;y>=0;y--){
        for(let x=x0;x<x1;x++)if(d[(y*src.sw+x)*4+3]>28){bottom=y;break outer;}
      }
      if(bottom<0){
        outer2:for(let y=src.sh-1;y>=0;y--){
          for(let x=0;x<src.sw;x++)if(d[(y*src.sw+x)*4+3]>28){bottom=y;break outer2;}
        }
      }
      bottom=bottom<0?Math.round(src.sh*.956):bottom;
      baselineCache.set(file,bottom);
      return bottom;
    }catch(e){return Math.round(src.sh*.956);}
  }

  R.background=function(level,cameraX,time=performance.now()/1000){
    const c=this.ctx,im=this.assets.get(KG.Assets.backgrounds[level.background]);
    const colors=[['#dceef2','#b7ced5'],['#e0f0f2','#b7ced4'],['#deeae3','#b5c9bd'],['#e7eef3','#c1ced7'],['#64545d','#292229']][level.background];
    const g=c.createLinearGradient(0,0,0,this.h);g.addColorStop(0,colors[0]);g.addColorStop(1,colors[1]);c.fillStyle=g;c.fillRect(0,0,this.w,this.h);
    if(im){
      const scale=Math.max(this.w/im.width,this.h/im.height)*1.035,dw=im.width*scale,dh=im.height*scale;
      const par=cameraX*.018+Math.sin(time*.08)*3.5;
      const y=-Math.max(0,dh-this.h)*.16+Math.sin(time*.11)*1.4;
      c.save();
      c.globalAlpha=.92;
      c.filter=level.background===4?'saturate(.74) contrast(.86) brightness(.91)':'saturate(.60) contrast(.78) brightness(1.07)';
      c.drawImage(im,-(dw-this.w)/2-par,y,dw,dh);
      c.restore();
    }
    const haze=c.createLinearGradient(0,0,0,this.h);
    haze.addColorStop(0,level.background===4?'rgba(43,35,42,.08)':'rgba(242,248,250,.26)');
    haze.addColorStop(.60,level.background===4?'rgba(31,25,30,.035)':'rgba(239,246,248,.16)');
    haze.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=haze;c.fillRect(0,0,this.w,this.h);
  };

  R.backgroundAmbient=function(level,cameraX,time){
    if(this.save.data.settings.reducedMotion)return;
    const c=this.ctx;c.save();
    for(let i=0;i<3;i++){
      const y=this.h*(.27+i*.17),speed=7+i*2.5,span=this.w+520;
      const x=((time*speed+i*317-cameraX*.006)%span)-260;
      const grad=c.createRadialGradient(x,y,10,x,y,250+i*32);
      grad.addColorStop(0,level.background===4?'rgba(103,78,88,.085)':'rgba(249,252,253,.145)');
      grad.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=grad;c.beginPath();c.ellipse(x,y,315+i*28,50+i*7,0,0,Math.PI*2);c.fill();
    }
    if(level.background<4){
      c.strokeStyle='rgba(62,82,94,.20)';c.lineWidth=1.25;
      for(let i=0;i<4;i++){
        const span=this.w+280,x=((time*(9+i*1.8)+i*241-cameraX*.004)%span)-140,y=72+i*35+Math.sin(time*.55+i)*5,s=5+(i%2)*2;
        c.beginPath();c.moveTo(x-s,y);c.quadraticCurveTo(x-s/2,y-s*.55,x,y);c.quadraticCurveTo(x+s/2,y-s*.55,x+s,y);c.stroke();
      }
    }
    if(level.fx?.water||level.fx?.lava){
      const base=this.h*.72;c.globalAlpha=level.background===4?.11:.075;c.strokeStyle=level.background===4?'#ff9a58':'#fff';c.lineWidth=1;
      for(let i=0;i<6;i++){
        const yy=base+i*12+Math.sin(time*1.05+i)*1.8,off=(time*(12+i*1.4))%92;c.beginPath();
        for(let x=-92+off;x<this.w+92;x+=92){c.moveTo(x,yy);c.lineTo(x+26,yy);}c.stroke();
      }
    }
    c.restore();
  };

  R.environmentBack=function(level,cameraX,time){
    this.backgroundAmbient(level,cameraX,time);
    originalEnvironmentBack.call(this,level,cameraX,time);
  };

  R.drawWaterBand=function(level,cameraX,time){
    if(!level.fx?.water)return;const file=this.frame(KG.Assets.tiles.water,time,4),src=this.source(file);if(!src)return;
    const c=this.ctx,h=84,w=150,baseY=720;c.save();c.globalAlpha=level.background===3?.17:.23;c.globalCompositeOperation='screen';
    const start=Math.floor(cameraX/w)*w-w;for(let x=start;x<cameraX+this.w+w;x+=w)c.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,x-cameraX,baseY,w,h);c.restore();
  };

  R.drawWaterfalls=function(level,cameraX,time){
    const arr=level.fx?.waterfalls||[];if(!arr.length)return;const file=this.frame(KG.Assets.tiles.waterfall,time,8);
    for(const [x,y,w,h] of arr){const c=this.ctx;c.save();c.globalCompositeOperation='screen';this.image(file,x-cameraX-w/2,y-h/2,w,h,false,.40,false);c.restore();}
  };

  R.drawTreeSway=function(level,cameraX,time){
    const arr=level.fx?.trees||[],file=KG.Assets.environment.treeValley,src=this.source(file);if(!src)return;
    for(let i=0;i<arr.length;i++){
      const [x,feetY,h]=arr[i],scale=h/src.sh,w=src.sw*scale,angle=Math.sin(time*1.35+i)*.016,c=this.ctx;
      c.save();c.translate(x-cameraX,feetY);c.rotate(angle);c.globalAlpha=.72;c.filter='saturate(.76) contrast(.90)';c.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,-w/2,-h,w,h);c.restore();
    }
  };

  R.platform=function(p,cameraX,moving=false,level){
    originalPlatform.call(this,p,cameraX,moving,level);
    const c=this.ctx,x=p.x-cameraX;
    if(x+p.w<-20||x>this.w+20)return;
    c.save();
    c.lineCap='round';
    c.shadowColor='rgba(13,20,25,.22)';c.shadowBlur=moving?7:5;c.shadowOffsetY=3;
    c.strokeStyle=level.surface==='lava'?'rgba(255,150,85,.78)':level.surface==='ice'?'rgba(244,253,255,.96)':'rgba(245,255,237,.92)';
    c.lineWidth=moving?2.4:2.1;c.beginPath();c.moveTo(x+5,p.y+.5);c.lineTo(x+p.w-5,p.y+.5);c.stroke();
    c.shadowBlur=0;c.strokeStyle=level.surface==='lava'?'rgba(60,28,26,.55)':'rgba(31,48,39,.32)';c.lineWidth=2.5;c.beginPath();c.moveTo(x+5,p.y+5);c.lineTo(x+p.w-5,p.y+5);c.stroke();
    c.restore();
  };

  R.spike=function(s,cameraX,level){
    const c=this.ctx,x=s.x-cameraX,base=s.y+s.h,n=Math.max(3,Math.round(s.w/23)),cell=s.w/n;
    c.save();c.shadowColor=level.surface==='lava'?'rgba(255,85,35,.45)':'rgba(15,20,27,.36)';c.shadowBlur=9;c.shadowOffsetY=4;
    const metal=c.createLinearGradient(0,s.y,0,base);metal.addColorStop(0,level.surface==='lava'?'#ffb07a':'#f4f5f7');metal.addColorStop(.45,level.surface==='lava'?'#8d4d43':'#b6bbc3');metal.addColorStop(1,level.surface==='lava'?'#4b3438':'#686d76');
    c.fillStyle=metal;c.strokeStyle=level.surface==='lava'?'#582f31':'#4c515a';c.lineWidth=1.6;
    for(let i=0;i<n;i++){
      const left=x+i*cell+1,right=x+(i+1)*cell-1,tip=x+(i+.5)*cell;
      c.beginPath();c.moveTo(left,base-4);c.lineTo(tip,s.y+1);c.lineTo(right,base-4);c.closePath();c.fill();c.stroke();
      c.strokeStyle='rgba(255,255,255,.46)';c.beginPath();c.moveTo(tip,s.y+4);c.lineTo(tip-cell*.23,base-6);c.stroke();c.strokeStyle=level.surface==='lava'?'#582f31':'#4c515a';
    }
    c.shadowBlur=0;const plate=c.createLinearGradient(0,base-6,0,base+3);plate.addColorStop(0,'#d8dbe0');plate.addColorStop(1,'#555b65');c.fillStyle=level.surface==='lava'?'#59383a':plate;c.fillRect(x,base-6,s.w,7);c.strokeRect(x,base-6,s.w,7);c.restore();
  };

  R.player=function(player,cameraX,time){
    const costume=KG.Assets.costumes[this.save.data.equippedCostume]||KG.Assets.costumes.default;
    const anims=costume.animations||KG.Assets.hero,state=player.state in anims?player.state:'idle',list=anims[state]||anims.idle;
    const fps=state==='run'?9:state==='hurt'?6:state==='idle'?3:5,file=this.frame(list,player.animTime,fps),x=player.x-cameraX,flip=player.facing<0;
    const alpha=player.invincible>0&&Math.floor(player.invincible*14)%2===0?.38:1,isDefault=costume.id==='default',drawH=isDefault?148:138;
    const src=this.source(file);if(!src)return;const baseline=isDefault?spriteBottom(this,file):Math.round(src.sh*.955),canvasH=src.sh;
    const c=this.ctx;c.save();c.fillStyle='rgba(0,0,0,.21)';c.beginPath();c.ellipse(x,player.y+4,isDefault?30:28,7.5,0,0,Math.PI*2);c.fill();c.restore();
    this.spriteBaseline(file,x,player.y,drawH,flip,alpha,baseline,canvasH);
  };

  const BaseGame=KG.Game;
  KG.Game=class extends BaseGame{
    constructor(...args){super(...args);this.step=1/60;}
  };
})(window.KG=window.KG||{});
