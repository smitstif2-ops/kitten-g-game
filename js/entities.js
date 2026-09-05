(function(KG){
  'use strict';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

  class Player {
    constructor(x,y){this.x=x;this.y=y;this.prevX=x;this.prevY=y;this.vx=0;this.vy=0;this.w=48;this.h=86;this.onGround=false;this.standing=null;this.facing=1;this.invincible=0;this.coyote=0;this.jumpBuffer=0;this.state='idle';this.checkpoint={x,y};this.squash=0;}
    box(){return{x:this.x-this.w/2,y:this.y-this.h,w:this.w,h:this.h};}
    setCheckpoint(x,y){this.checkpoint={x,y};}
    respawn(){this.x=this.checkpoint.x;this.y=this.checkpoint.y;this.vx=0;this.vy=0;this.invincible=1.1;}
    update(dt,input,world,audio){
      this.prevX=this.x;this.prevY=this.y;if(this.invincible>0)this.invincible-=dt;
      if(this.onGround)this.coyote=.11;else this.coyote=Math.max(0,this.coyote-dt);
      if(input.consumeJump())this.jumpBuffer=.12;else this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);
      const accel=this.onGround?1750:1180,max=340;
      if(input.left)this.vx-=accel*dt;if(input.right)this.vx+=accel*dt;if(!input.left&&!input.right)this.vx*=Math.pow(this.onGround?.72:.94,dt*60);this.vx=clamp(this.vx,-max,max);
      if(this.jumpBuffer>0&&this.coyote>0){this.vy=-715;this.onGround=false;this.coyote=0;this.jumpBuffer=0;this.squash=1;audio.sfx('jump');}
      if(!input.jumpHeld&&this.vy<-240)this.vy+=1500*dt;
      this.vy=Math.min(1100,this.vy+1750*dt);this.x+=this.vx*dt;this.y+=this.vy*dt;this.facing=Math.abs(this.vx)>.5?Math.sign(this.vx):this.facing;
      world.resolvePlayer(this);
      if(this.onGround&&Math.abs(this.vx)>20)this.state='run';else if(!this.onGround&&this.vy<0)this.state='jump';else if(!this.onGround)this.state='fall';else this.state='idle';
      this.squash=Math.max(0,this.squash-dt*5);
    }
  }

  class Enemy {
    constructor(type,x,y,min,max,speed){this.type=type;this.x=x;this.y=y;this.min=min;this.max=max;this.vx=Math.random()>.5?speed:-speed;this.dead=false;this.w=52;this.h=42;this.phase=Math.random()*6;}
    box(){return{x:this.x-this.w/2,y:this.y-this.h,w:this.w,h:this.h};}
    update(dt){if(this.dead)return;this.x+=this.vx*dt;if(this.x<this.min){this.x=this.min;this.vx=Math.abs(this.vx);}if(this.x>this.max){this.x=this.max;this.vx=-Math.abs(this.vx);}}
  }

  class Boss {
    constructor(x,y){this.x=x;this.y=y;this.hp=5;this.maxHp=5;this.timer=0;this.vulnerable=false;this.dead=false;this.w=150;this.h=170;this.cooldown=0;this.flash=0;}
    box(){return{x:this.x-this.w/2,y:this.y-this.h,w:this.w,h:this.h};}
    update(dt,player,orbs){if(this.dead)return;this.timer+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.flash=Math.max(0,this.flash-dt);const phase=this.timer%5;this.vulnerable=phase>3.25;
      if(!this.vulnerable){this.x+=Math.sign(player.x-this.x)*118*dt;if(this.cooldown<=0){this.cooldown=.85;orbs.push({x:this.x,y:this.y-115,vx:(Math.sign(player.x-this.x)||-1)*350,vy:-260,r:14,dead:false});}}
      this.x=clamp(this.x,2400,3270);
    }
  }

  KG.Math={clamp,overlap};KG.Player=Player;KG.Enemy=Enemy;KG.Boss=Boss;
})(window.KG = window.KG || {});
