(function(KG){
  'use strict';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

  class Player {
    constructor(x,y){
      this.x=x;this.y=y;this.prevX=x;this.prevY=y;this.vx=0;this.vy=0;this.w=46;this.h=84;
      this.onGround=false;this.standing=null;this.facing=1;this.invincible=0;this.coyote=0;this.jumpBuffer=0;
      this.state='idle';this.checkpoint={x,y};this.squash=0;this.landTimer=0;this.animTime=0;this.airTime=0;
    }
    box(){return{x:this.x-this.w/2,y:this.y-this.h,w:this.w,h:this.h};}
    setCheckpoint(x,y){this.checkpoint={x,y};}
    respawn(){this.x=this.checkpoint.x;this.y=this.checkpoint.y;this.vx=0;this.vy=0;this.invincible=1.1;this.landTimer=0;this.airTime=0;}
    update(dt,input,world,audio){
      this.prevX=this.x;this.prevY=this.y;const wasGrounded=this.onGround;
      if(this.invincible>0)this.invincible-=dt;
      if(this.onGround){this.coyote=.12;this.airTime=0;}else{this.coyote=Math.max(0,this.coyote-dt);this.airTime+=dt;}
      if(input.consumeJump())this.jumpBuffer=.13;else this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);
      const accel=this.onGround?1840:1260,max=350;
      if(input.left)this.vx-=accel*dt;if(input.right)this.vx+=accel*dt;
      if(!input.left&&!input.right)this.vx*=Math.pow(this.onGround?.70:.945,dt*60);
      this.vx=clamp(this.vx,-max,max);
      if(this.jumpBuffer>0&&this.coyote>0){this.vy=-725;this.onGround=false;this.coyote=0;this.jumpBuffer=0;this.squash=1;this.landTimer=0;audio.sfx('jump');}
      if(!input.jumpHeld&&this.vy<-235)this.vy+=1650*dt;
      this.vy=Math.min(1120,this.vy+1780*dt);this.x+=this.vx*dt;this.y+=this.vy*dt;
      this.facing=Math.abs(this.vx)>.5?Math.sign(this.vx):this.facing;world.resolvePlayer(this);
      if(!wasGrounded&&this.onGround&&this.prevY<this.y){this.landTimer=.12;this.animTime=0;this.squash=1;}else this.landTimer=Math.max(0,this.landTimer-dt);
      const next=this.invincible>.92?'hurt':this.landTimer>0?'land':this.onGround&&Math.abs(this.vx)>20?'run':!this.onGround&&this.vy<-30?'jump':!this.onGround?'fall':'idle';
      if(next!==this.state){this.state=next;this.animTime=0;}else this.animTime+=dt;this.squash=Math.max(0,this.squash-dt*5.5);
    }
  }

  class Enemy {
    constructor(type,x,y,min,max,speed){
      this.type=type;this.x=x;this.y=y;this.baseY=y;this.min=min;this.max=max;this.speed=speed;this.vx=Math.random()>.5?speed:-speed;
      this.dead=false;this.w=52;this.h=42;this.phase=Math.random()*6;this.anim=0;this.state='patrol';this.aiTimer=Math.random()*1.4;this.chargeTimer=0;
      if(type==='seagull'){this.w=58;this.h=46;}if(type==='spikeball'||type==='rock'){this.w=54;this.h=54;}
    }
    box(){return{x:this.x-this.w/2,y:this.y-this.h,w:this.w,h:this.h};}
    update(dt,player){
      if(this.dead)return;this.anim+=dt;this.aiTimer+=dt;const dx=player?player.x-this.x:9999,near=player&&Math.abs(dx)<320&&Math.abs(player.y-this.y)<180;let targetSpeed=this.speed;
      if(this.type==='crab'){this.state=near?'charge':'patrol';targetSpeed=near?this.speed*1.65:this.speed;this.vx=Math.sign(this.vx||dx||1)*targetSpeed;}
      else if(this.type==='seagull'){this.state=near?'dive':'fly';targetSpeed=near?this.speed*1.2:this.speed;this.vx=Math.sign(this.vx||dx||1)*targetSpeed;const hover=this.baseY+Math.sin(this.anim*3.1+this.phase)*18;const target=near?Math.min(this.baseY+85,player.y-58):hover;this.y+=(target-this.y)*Math.min(1,dt*(near?4.2:2.6));}
      else if(this.type==='slime'){this.state='hop';const cycle=(this.anim+this.phase)%1.35;this.y=this.baseY-Math.sin(Math.min(1,cycle/1.05)*Math.PI)*34;this.vx=Math.sign(this.vx||1)*this.speed*.78;}
      else if(this.type==='spikeball'||this.type==='rock'){this.state='roll';targetSpeed=this.speed*(near?1.28:1);this.vx=Math.sign(this.vx||1)*targetSpeed;}
      else{this.state='patrol';this.vx=Math.sign(this.vx||1)*targetSpeed;}
      this.x+=this.vx*dt;if(this.x<this.min){this.x=this.min;this.vx=Math.abs(this.vx);}if(this.x>this.max){this.x=this.max;this.vx=-Math.abs(this.vx);}
    }
  }

  class Boss {
    constructor(x,y){this.x=x;this.y=y;this.hp=5;this.maxHp=5;this.timer=0;this.vulnerable=false;this.dead=false;this.w=150;this.h=170;this.cooldown=0;this.flash=0;this.state='idle';this.phase='walk';this.lastShot=-1;this.telegraph=0;}
    box(){return{x:this.x-this.w/2,y:this.y-this.h,w:this.w,h:this.h};}
    update(dt,player,orbs){
      if(this.dead){this.state='defeated';return;}this.timer+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.flash=Math.max(0,this.flash-dt);this.telegraph=Math.max(0,this.telegraph-dt);const cycle=this.timer%6.4;this.vulnerable=false;
      if(cycle<1.45){this.phase='walk';this.state='walk';this.x+=Math.sign(player.x-this.x)*120*dt;}
      else if(cycle<2.75){this.phase='fire';this.state='attackFire';this.telegraph=Math.max(this.telegraph,.08);const slot=Math.floor((cycle-1.45)/.52);if(slot!==this.lastShot){this.lastShot=slot;const dir=Math.sign(player.x-this.x)||-1;orbs.push({x:this.x,y:this.y-118,vx:dir*(330+slot*22),vy:-290+slot*35,r:14,dead:false});}}
      else if(cycle<3.65){this.phase='punch';this.state='attackPunch';this.x+=Math.sign(player.x-this.x)*275*dt;this.telegraph=.12;}
      else if(cycle<4.55){this.phase='shield';this.state='shield';this.telegraph=.18;}
      else{this.phase='stunned';this.state='stunned';this.vulnerable=true;}
      if(cycle<.12)this.lastShot=-1;this.x=clamp(this.x,2380,3270);
    }
  }

  KG.Math={clamp,overlap};KG.Player=Player;KG.Enemy=Enemy;KG.Boss=Boss;
})(window.KG = window.KG || {});
