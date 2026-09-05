(function(KG){
  'use strict';
  if(!KG.Player||!KG.World||!KG.Renderer||!KG.Levels)return;

  const clamp=KG.Math.clamp;

  // v5 control pass: more forgiving jump timing and stronger air control.
  const BasePlayer=KG.Player;
  KG.Player=class extends BasePlayer{
    constructor(...args){
      super(...args);
      this.w=44;
      this.h=82;
    }
    update(dt,input,world,audio){
      this.prevX=this.x;this.prevY=this.y;const wasGrounded=this.onGround;
      if(this.invincible>0)this.invincible-=dt;
      if(this.onGround){this.coyote=.16;this.airTime=0;}else{this.coyote=Math.max(0,this.coyote-dt);this.airTime+=dt;}
      if(input.consumeJump())this.jumpBuffer=.18;else this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);

      const accel=this.onGround?1960:1380,max=370;
      if(input.left)this.vx-=accel*dt;
      if(input.right)this.vx+=accel*dt;
      if(!input.left&&!input.right)this.vx*=Math.pow(this.onGround?.70:.945,dt*60);
      this.vx=clamp(this.vx,-max,max);

      if(this.jumpBuffer>0&&this.coyote>0){
        this.vy=-790;this.onGround=false;this.coyote=0;this.jumpBuffer=0;this.squash=1;this.landTimer=0;audio.sfx('jump');
      }
      if(!input.jumpHeld&&this.vy<-255)this.vy+=1480*dt;
      this.vy=Math.min(1160,this.vy+1710*dt);
      this.x+=this.vx*dt;this.y+=this.vy*dt;
      this.facing=Math.abs(this.vx)>.5?Math.sign(this.vx):this.facing;
      world.resolvePlayer(this);

      if(!wasGrounded&&this.onGround&&this.prevY<this.y){this.landTimer=.12;this.animTime=0;this.squash=1;}
      else this.landTimer=Math.max(0,this.landTimer-dt);
      const next=this.invincible>.92?'hurt':this.landTimer>0?'land':this.onGround&&Math.abs(this.vx)>20?'run':!this.onGround&&this.vy<-30?'jump':!this.onGround?'fall':'idle';
      if(next!==this.state){this.state=next;this.animTime=0;}else this.animTime+=dt;
      this.squash=Math.max(0,this.squash-dt*5.5);
    }
  };

  // Lenient edge landing. Visual platform size stays unchanged.
  KG.World.prototype.resolvePlayer=function(player){
    player.onGround=false;player.standing=null;let best=null;
    const all=this.platforms.concat(this.moving);
    for(const p of all){
      const margin=14;
      if(player.x+player.w/2<p.x-margin||player.x-player.w/2>p.x+p.w+margin)continue;
      if(player.vy>=0&&player.prevY<=p.y+8&&player.y>=p.y-5){if(!best||p.y<best.y)best=p;}
    }
    if(best){player.y=best.y;player.vy=0;player.onGround=true;player.standing=best;}
    player.x=clamp(player.x,24,this.level.width-24);
  };

  // Keep the drawn spikes large but make the lethal region slightly fairer.
  KG.World.prototype.checkHazards=function(player){
    if(player.invincible>0)return false;
    const pb=player.box();
    for(const s of this.spikes){
      const hit={x:s.x+8,y:s.y+8,w:Math.max(24,s.w-16),h:Math.max(16,s.h-8)};
      if(KG.Math.overlap(pb,hit))return true;
    }
    for(const o of this.orbs)if(o.hit){o.dead=true;return true;}
    return false;
  };

  // v5 level-accessibility pass: reduce a few excessive vertical gaps and moving-platform amplitudes.
  Object.assign(KG.Levels[1],{
    platforms:[[0,760,560,70],[650,640,290,44],[1040,500,285,44],[1435,350,300,44],[1860,500,300,44],[2280,330,300,44],[2720,500,300,44],[3250,760,550,70]],
    moving:[[900,340,250,38,'y',130,1.45],[1710,255,240,38,'x',120,1.30],[2570,270,235,38,'y',135,1.40]]
  });
  Object.assign(KG.Levels[2],{
    platforms:[[0,760,820,70],[900,655,350,44],[1330,760,470,70],[1860,610,340,44],[2310,760,500,70],[2910,640,340,44],[3390,760,710,70]],
    moving:[[1580,385,245,38,'y',110,1.35],[2590,395,240,38,'x',125,1.25]]
  });
  Object.assign(KG.Levels[3],{
    platforms:[[0,760,620,70],[680,610,300,44],[1100,470,300,44],[1510,330,300,44],[1930,470,310,44],[2360,320,300,44],[2800,470,300,44],[3230,300,280,44],[3620,470,300,44],[4010,760,390,70]],
    moving:[[930,300,230,38,'y',110,1.45],[1770,220,235,38,'x',115,1.35],[3030,210,230,38,'y',120,1.35]]
  });
  Object.assign(KG.Levels[4],{
    platforms:[[0,760,3600,70],[560,565,340,44],[1260,445,340,44],[2040,565,340,44],[2810,395,340,44]],
    moving:[[940,300,250,38,'y',105,1.35],[2440,270,250,38,'x',120,1.30]]
  });

  const R=KG.Renderer.prototype;
  const oldAmbient=R.backgroundAmbient;

  // Pixel-stable sprite placement prevents visible frame shimmer on slow camera movement.
  R.image=function(file,x,y,w,h,flip=false,alpha=1,contain=true){
    const src=this.source(file);if(!src)return;const c=this.ctx;
    const rx=Math.round(x),ry=Math.round(y),rw=Math.round(w),rh=Math.round(h);
    c.save();c.globalAlpha=alpha;c.translate(rx+rw/2,ry+rh/2);if(flip)c.scale(-1,1);
    if(contain){const scale=Math.min(rw/src.sw,rh/src.sh),dw=Math.round(src.sw*scale),dh=Math.round(src.sh*scale);c.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,-dw/2,-dh/2,dw,dh);}
    else c.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,-rw/2,-rh/2,rw,rh);
    c.restore();
  };
  R.spriteBaseline=function(file,x,feetY,drawH,flip=false,alpha=1,baseline=306,canvasH=320){
    const src=this.source(file);if(!src)return;const scale=drawH/canvasH,w=Math.round(src.sw*scale),dh=Math.round(src.sh*scale),top=Math.round((feetY-2)-baseline*scale),c=this.ctx;
    c.save();c.globalAlpha=alpha;c.translate(Math.round(x),0);if(flip)c.scale(-1,1);c.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,-w/2,top,w,dh);c.restore();
  };

  // Stronger depth separation: background remains detailed but no longer competes with gameplay.
  R.background=function(level,cameraX,time=performance.now()/1000){
    const c=this.ctx,im=this.assets.get(KG.Assets.backgrounds[level.background]);
    const colors=[['#dceef2','#b7ced5'],['#e0f0f2','#b7ced4'],['#deeae3','#b5c9bd'],['#e7eef3','#c1ced7'],['#64545d','#292229']][level.background];
    const g=c.createLinearGradient(0,0,0,this.h);g.addColorStop(0,colors[0]);g.addColorStop(1,colors[1]);c.fillStyle=g;c.fillRect(0,0,this.w,this.h);
    if(im){
      const scale=Math.max(this.w/im.width,this.h/im.height)*1.03,dw=im.width*scale,dh=im.height*scale;
      const par=cameraX*.015+Math.sin(time*.08)*3.2,y=-Math.max(0,dh-this.h)*.15+Math.sin(time*.11)*1.2;
      c.save();c.filter=level.background===4?'saturate(.72) contrast(.80) brightness(.96) blur(1px)':'saturate(.64) contrast(.76) brightness(1.06) blur(1.25px)';c.globalAlpha=level.background===4?.78:.76;c.drawImage(im,-(dw-this.w)/2-par,y,dw,dh);c.restore();
    }
    const haze=c.createLinearGradient(0,0,0,this.h);haze.addColorStop(0,level.background===4?'rgba(44,35,43,.10)':'rgba(240,247,249,.29)');haze.addColorStop(.68,level.background===4?'rgba(30,24,31,.06)':'rgba(236,245,247,.18)');haze.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=haze;c.fillRect(0,0,this.w,this.h);
  };

  R.backgroundAmbient=function(level,cameraX,time){
    oldAmbient.call(this,level,cameraX,time);
    if(this.save.data.settings.reducedMotion||level.background===4)return;
    const c=this.ctx;c.save();c.fillStyle='rgba(255,255,255,.11)';
    for(let i=0;i<4;i++){
      const span=this.w+520,x=((time*(6+i)+i*307-cameraX*.01)%span)-260,y=72+i*58+Math.sin(time*.25+i)*8;
      c.beginPath();c.ellipse(x,y,72,20,0,0,Math.PI*2);c.ellipse(x+42,y-8,54,16,0,0,Math.PI*2);c.ellipse(x-38,y-6,50,15,0,0,Math.PI*2);c.fill();
    }
    c.restore();
  };

  const oldRender=R.render;
  R.render=function(game,time){
    const old=game.cameraX;game.cameraX=Math.round(game.cameraX);oldRender.call(this,game,time);game.cameraX=old;
  };
})(window.KG=window.KG||{});
