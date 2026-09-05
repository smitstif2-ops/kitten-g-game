(function(KG){
  'use strict';
  const {overlap,clamp}=KG.Math;
  class World {
    constructor(level,audio,save){this.level=level;this.audio=audio;this.save=save;this.platforms=[];this.moving=[];this.spikes=[];this.enemies=[];this.items=[];this.orbs=[];this.ball=null;this.basket=null;this.house=null;this.boss=null;this.checkpointActivated=false;this.build();}
    build(){const L=this.level;
      this.platforms=L.platforms.map(p=>({x:p[0],y:p[1],w:p[2],h:p[3]}));
      this.moving=L.moving.map(p=>({x:p[0],y:p[1],w:p[2],h:p[3],axis:p[4],amp:p[5],speed:p[6],baseX:p[0],baseY:p[1],phase:Math.random()*6,lastX:p[0],lastY:p[1]}));
      this.spikes=L.spikes.map(s=>({x:s[0],y:s[1],w:s[2],h:20}));
      this.enemies=L.enemies.map(e=>new KG.Enemy(...e));
      this.items=[...L.mission.map(m=>({type:m[0],x:m[1],y:m[2],taken:false,phase:Math.random()*6})),...L.coins.map(c=>({type:'coin',x:c[0],y:c[1],taken:false,phase:Math.random()*6}))];
      if(L.ball){this.ball={x:L.ball[0],y:L.ball[1],vx:0,vy:0,r:28,onGround:false};this.basket={x:L.basket[0],y:L.basket[1],w:130,h:90};}
      if(L.house)this.house={x:L.house[0],y:L.house[1]};
      if(L.boss)this.boss=new KG.Boss(L.boss[0],L.boss[1]);
    }
    update(dt,t,player){
      for(const p of this.moving){p.lastX=p.x;p.lastY=p.y;const off=Math.sin(t*p.speed+p.phase)*p.amp;if(p.axis==='x')p.x=p.baseX+off;else p.y=p.baseY+off;}
      if(player.standing&&this.moving.includes(player.standing)){player.x+=player.standing.x-player.standing.lastX;player.y+=player.standing.y-player.standing.lastY;}
      this.enemies.forEach(e=>e.update(dt));
      this.updateBall(dt,player);
      this.updateOrbs(dt,player);
      if(this.boss)this.boss.update(dt,player,this.orbs);
    }
    resolvePlayer(player){
      player.onGround=false;player.standing=null;let best=null;
      const all=this.platforms.concat(this.moving);
      for(const p of all){if(player.x+player.w/2<p.x||player.x-player.w/2>p.x+p.w)continue;if(player.vy>=0&&player.prevY<=p.y+4&&player.y>=p.y-3){if(!best||p.y<best.y)best=p;}}
      if(best){player.y=best.y;player.vy=0;player.onGround=true;player.standing=best;}
      player.x=clamp(player.x,24,this.level.width-24);
    }
    updateBall(dt,player){const b=this.ball;if(!b)return;const prevY=b.y;b.vy=Math.min(1050,b.vy+1700*dt);b.x+=b.vx*dt;b.y+=b.vy*dt;b.vx*=Math.pow(.985,dt*60);b.onGround=false;let best=null;
      for(const p of this.platforms.concat(this.moving)){if(b.x+b.r<p.x||b.x-b.r>p.x+p.w)continue;if(b.vy>=0&&prevY+b.r<=p.y+5&&b.y+b.r>=p.y-3){if(!best||p.y<best.y)best=p;}}
      if(best){b.y=best.y-b.r;b.vy=0;b.onGround=true;b.vx*=.97;}
      if(Math.abs(player.x-b.x)<58&&Math.abs(player.y-35-b.y)<72){b.vx+=player.vx*dt*2.5;}
      if(b.y>1050){b.x=this.level.ball[0];b.y=this.level.ball[1];b.vx=b.vy=0;}
    }
    updateOrbs(dt,player){for(const o of this.orbs){o.vy+=980*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;if(overlap(player.box(),{x:o.x-o.r,y:o.y-o.r,w:o.r*2,h:o.r*2}))o.hit=true;if(o.y>950||o.x<0||o.x>this.level.width)o.dead=true;}this.orbs=this.orbs.filter(o=>!o.dead);}
    checkHazards(player){if(player.invincible>0)return false;for(const s of this.spikes)if(overlap(player.box(),s))return true;for(const o of this.orbs)if(o.hit){o.dead=true;return true;}return false;}
    checkEnemyCollisions(player){if(player.invincible>0)return null;for(const e of this.enemies){if(e.dead)continue;if(overlap(player.box(),e.box())){if(player.vy>0&&player.y-player.h<e.y-10){e.dead=true;player.vy=-560;return {type:'stomp',enemy:e};}return {type:'hurt',enemy:e};}}return null;}
    collect(player,t){const collected=[];for(const it of this.items){if(it.taken)continue;const yy=it.y+Math.sin(t*3+it.phase)*8;if(overlap(player.box(),{x:it.x-23,y:yy-23,w:46,h:46})){it.taken=true;collected.push(it);}}return collected;}
    checkpoint(player){if(this.checkpointActivated||!this.level.checkpoint)return false;const [x,y]=this.level.checkpoint;if(Math.abs(player.x-x)<80&&Math.abs(player.y-y)<120){this.checkpointActivated=true;player.setCheckpoint(x,y);return true;}return false;}
    objectiveDone(missionDone){if(this.level.ball)return this.ball&&this.basket&&this.ball.x>this.basket.x+20&&this.ball.x<this.basket.x+this.basket.w-20&&this.ball.y>this.basket.y-70&&this.ball.y<this.basket.y+this.basket.h;if(this.level.boss)return this.boss&&this.boss.dead;if(this.level.house)return missionDone&&this.house&&missionDone&&this.house.x-90<this._lastPlayerX;return missionDone;}
  }
  KG.World=World;
})(window.KG = window.KG || {});
