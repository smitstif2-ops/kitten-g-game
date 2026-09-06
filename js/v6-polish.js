(function(KG){
  'use strict';
  if(!KG.Renderer||!KG.World||!KG.Game||!KG.Levels)return;

  const R=KG.Renderer.prototype;
  const metricCache=new Map();

  function spriteMetrics(renderer,file){
    if(metricCache.has(file)) return metricCache.get(file);
    const src=renderer.source(file);
    if(!src) return {minX:0,maxX:319,minY:0,maxY:319,w:320,h:320};
    let out={minX:0,maxX:src.sw-1,minY:0,maxY:src.sh-1,w:src.sw,h:src.sh};
    try{
      const cv=document.createElement('canvas');
      cv.width=src.sw;cv.height=src.sh;
      const cx=cv.getContext('2d',{willReadFrequently:true});
      cx.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,0,0,src.sw,src.sh);
      const d=cx.getImageData(0,0,src.sw,src.sh).data;
      let minX=src.sw,minY=src.sh,maxX=-1,maxY=-1;
      for(let y=0;y<src.sh;y++){
        for(let x=0;x<src.sw;x++){
          if(d[(y*src.sw+x)*4+3]>24){
            if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
          }
        }
      }
      if(maxX>=minX&&maxY>=minY) out={minX,maxX,minY,maxY,w:src.sw,h:src.sh};
    }catch(e){}
    metricCache.set(file,out);return out;
  }

  R.player=function(player,cameraX,time){
    const costume=KG.Assets.costumes[this.save.data.equippedCostume]||KG.Assets.costumes.default;
    const anims=costume.animations||KG.Assets.hero;
    const state=player.state in anims?player.state:'idle';
    const list=anims[state]||anims.idle;
    const fps=state==='run'?9:state==='hurt'?6:state==='idle'?3:5;
    const file=this.frame(list,player.animTime,fps),src=this.source(file);if(!src)return;
    const m=spriteMetrics(this,file),visibleH=Math.max(1,m.maxY-m.minY+1),targetVisibleH=146;
    const scale=targetVisibleH/visibleH,visibleCenter=(m.minX+m.maxX)/2;
    const x=Math.round(player.x-cameraX),feet=Math.round(player.y-2),flip=player.facing<0;
    const alpha=player.invincible>0&&Math.floor(player.invincible*14)%2===0?.38:1;
    const c=this.ctx;
    c.save();c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(x,player.y+3,29,7,0,0,Math.PI*2);c.fill();c.restore();
    c.save();c.globalAlpha=alpha;c.translate(x,0);if(flip)c.scale(-1,1);
    const dx=-visibleCenter*scale,dy=feet-m.maxY*scale;
    c.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,dx,Math.round(dy),src.sw*scale,src.sh*scale);
    c.restore();
  };

  R.platform=function(p,cameraX,moving=false,level){
    const surface=level.surface,c=this.ctx,x=Math.round(p.x-cameraX);
    if(moving){
      c.save();c.shadowColor='rgba(12,19,24,.34)';c.shadowBlur=12;c.shadowOffsetY=7;
      const src=this.source(KG.Assets.tiles.wood);
      if(src)c.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,x,p.y-7,p.w,42);
      else{c.fillStyle='#9a6339';this.roundRect(x,p.y,p.w,p.h,13);c.fill();}
      c.restore();return;
    }
    if((surface==='grass'||surface==='moss')&&p.h<60){
      const src=this.source(KG.Assets.tiles.grassPlatform);
      if(src){const h=Math.max(82,p.w*.24);c.save();c.shadowColor='rgba(15,24,20,.34)';c.shadowBlur=14;c.shadowOffsetY=8;c.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,x,p.y-5,p.w,h);c.restore();return;}
    }
    const map={grass:KG.Assets.tiles.grass,moss:KG.Assets.tiles.moss,ice:KG.Assets.tiles.ice,lava:KG.Assets.tiles.lava};
    this.blockPlatform(p,cameraX,map[surface]||KG.Assets.tiles.grass);
  };

  R.spike=function(s,cameraX,level){
    const src=this.source(KG.Assets.tiles.spikes),c=this.ctx;
    const drawX=Math.round((s.drawX!==undefined?s.drawX:s.x)-cameraX),drawW=Math.round(s.drawW||s.w),base=Math.round(s.y+s.h);
    if(src){
      const h=Math.max(42,Math.round(drawW*(src.sh/src.sw))),y=base-h;
      c.save();c.shadowColor=level.surface==='lava'?'rgba(255,91,42,.52)':'rgba(19,25,31,.38)';c.shadowBlur=9;c.shadowOffsetY=4;
      c.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,drawX,y,drawW,h);
      c.restore();return;
    }
    const n=Math.max(3,Math.round(drawW/24)),cell=drawW/n;
    c.save();c.shadowColor=level.surface==='lava'?'rgba(255,85,35,.42)':'rgba(15,20,27,.34)';c.shadowBlur=8;c.shadowOffsetY=4;
    const metal=c.createLinearGradient(0,base-34,0,base);metal.addColorStop(0,level.surface==='lava'?'#ffb07a':'#f5f6f8');metal.addColorStop(.5,level.surface==='lava'?'#98544b':'#b9bec6');metal.addColorStop(1,level.surface==='lava'?'#51343a':'#676d76');
    c.fillStyle=metal;c.strokeStyle=level.surface==='lava'?'#5b3031':'#4c5159';c.lineWidth=1.5;
    for(let i=0;i<n;i++){const l=drawX+i*cell+1,r=drawX+(i+1)*cell-1,t=drawX+(i+.5)*cell;c.beginPath();c.moveTo(l,base-4);c.lineTo(t,base-34);c.lineTo(r,base-4);c.closePath();c.fill();c.stroke();}
    c.shadowBlur=0;c.fillStyle=level.surface==='lava'?'#5b383b':'#646b74';c.fillRect(drawX,base-6,drawW,6);c.restore();
  };

  R.drawWaterfalls=function(level,cameraX,time){
    const arr=level.fx?.waterfalls||[];if(!arr.length)return;
    const file=this.frame(KG.Assets.tiles.waterfall,time,7),src=this.source(file);if(!src)return;
    const c=this.ctx;
    for(const [x,y,w,h] of arr){
      const left=Math.round(x-cameraX-w/2),top=Math.round(y-h/2);
      c.save();c.globalAlpha=.78;c.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,left,top,w,h);c.restore();
      const baseY=top+h-5;
      c.save();const g=c.createRadialGradient(x-cameraX,baseY,3,x-cameraX,baseY,w*.62);g.addColorStop(0,'rgba(245,253,255,.70)');g.addColorStop(1,'rgba(185,232,245,0)');c.fillStyle=g;c.beginPath();c.ellipse(x-cameraX,baseY,w*.7,11,0,0,Math.PI*2);c.fill();c.restore();
    }
  };

  R.drawTreeSway=function(level,cameraX,time){
    const arr=level.fx?.trees||[],file=KG.Assets.environment.treeValley,src=this.source(file);if(!src)return;
    for(let i=0;i<arr.length;i++){
      const [x,declaredFeet,h]=arr[i];
      const supports=(level.platforms||[]).filter(p=>x>=p[0]-8&&x<=p[0]+p[2]+8).map(p=>p[1]);
      const feetY=supports.length?Math.min(...supports):declaredFeet;
      const scale=h/src.sh,w=src.sw*scale,angle=Math.sin(time*1.2+i)*.012,c=this.ctx;
      c.save();c.fillStyle='rgba(18,28,22,.22)';c.beginPath();c.ellipse(x-cameraX,feetY+3,Math.max(20,w*.27),7,0,0,Math.PI*2);c.fill();c.restore();
      c.save();c.translate(Math.round(x-cameraX),feetY);c.rotate(angle);c.globalAlpha=.94;c.filter='saturate(.90) contrast(.96)';c.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,-w/2,-h,w,h);c.restore();
    }
  };

  KG.Levels[2].objective='Толкай мяч вправо → закати его в корзину в конце уровня';
  const oldBasket=R.basket;
  R.basket=function(b,cameraX){
    oldBasket.call(this,b,cameraX);if(!b)return;
    const c=this.ctx,x=Math.round(b.x-cameraX+b.w/2),y=b.y-25;
    c.save();c.textAlign='center';c.font='800 16px system-ui,sans-serif';c.lineWidth=5;c.strokeStyle='rgba(20,27,31,.55)';c.strokeText('КОРЗИНА ↓',x,y);c.fillStyle='#fff8cf';c.fillText('КОРЗИНА ↓',x,y);c.restore();
  };

  function drawBallGuide(renderer,game,time){
    if(game.levelIndex!==2||game.missionDone||!game.world?.ball)return;
    const c=renderer.ctx,b=game.world.ball,cam=game.cameraX;
    const bx=Math.round(b.x-cam),by=Math.round(b.y-b.r-28);
    if(bx>-80&&bx<renderer.w+80){
      const pulse=1+Math.sin(time*5)*.06;
      c.save();c.translate(bx,by);c.scale(pulse,pulse);c.textAlign='center';c.font='800 15px system-ui,sans-serif';c.lineWidth=5;c.strokeStyle='rgba(20,27,31,.58)';c.strokeText('ТОЛКАЙ →',0,0);c.fillStyle='#fff7c7';c.fillText('ТОЛКАЙ →',0,0);c.restore();
    }
    const text='⚽ Толкай мяч вправо и доведи его до корзины';
    c.save();c.font='700 15px system-ui,sans-serif';const pad=14,tw=c.measureText(text).width,w=tw+pad*2,h=38,x=(renderer.w-w)/2,y=renderer.h-64;
    c.fillStyle='rgba(20,27,31,.72)';c.beginPath();c.roundRect(x,y,w,h,12);c.fill();c.fillStyle='#fff';c.textBaseline='middle';c.fillText(text,x+pad,y+h/2);c.restore();
  }

  const oldRender=R.render;
  R.render=function(game,time){oldRender.call(this,game,time);drawBallGuide(this,game,time);};

  const oldUpdateBall=KG.World.prototype.updateBall;
  KG.World.prototype.updateBall=function(dt,player){
    oldUpdateBall.call(this,dt,player);
    const b=this.ball;if(!b)return;
    const dx=b.x-player.x,dy=b.y-(player.y-32);
    if(Math.abs(dx)<68&&Math.abs(dy)<78&&Math.abs(player.vx)>35){
      b.vx+=player.vx*dt*3.4;b.vx=Math.max(-470,Math.min(470,b.vx));
    }
  };

  const oldStart=KG.Game.prototype.startLevel;
  KG.Game.prototype.startLevel=function(index,newRun=false){
    oldStart.call(this,index,newRun);
    if(this.levelIndex===2)this.ui.toast('⚽ Толкай мяч вправо и закати его в корзину в конце уровня.',3600);
  };
})(window.KG=window.KG||{});
