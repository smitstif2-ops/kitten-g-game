(function(KG){
  'use strict';
  if(!KG.Renderer||!KG.World||!KG.Game||!KG.Levels||!KG.Boss)return;

  // v7: replace the confusing ball mission with a clear collectible route.
  Object.assign(KG.Levels[2],{
    name:'Лес и руины',
    subtitle:'Руны древнего портала',
    emoji:'🔷',
    objective:'Собери 4 руны и войди в портал',
    goalX:3860,
    par:82,
    ball:null,
    basket:null,
    platforms:[
      [0,760,850,70],[960,650,360,44],[1450,520,340,44],
      [1960,640,360,44],[2470,500,360,44],[2980,620,360,44],[3440,760,660,70]
    ],
    moving:[[1335,670,180,36,'y',70,1.15],[2840,540,180,36,'x',70,1.05]],
    spikes:[[850,740,105],[1800,740,110],[2350,740,105],[3340,740,100]],
    enemies:[['spikeball',2070,610,1980,2250,82],['hedgehog',3070,590,2990,3270,82]],
    mission:[['rune',1100,580],['rune',1600,450],['rune',2600,430],['rune',3120,550]],
    coins:[[350,680],[1180,585],[1700,455],[2150,575],[2680,435],[3180,555],[3650,690]],
    checkpoint:[2100,590],
    fx:{water:true,waterZones:[[850,742,110,170],[1800,742,160,170],[2350,742,120,170],[3340,742,100,170]],waterfalls:[[1210,545,80,120],[2670,395,76,118]],trees:[[420,760,170],[3520,760,160]],flags:[[2020,640,82]],foliage:[[790,742],[3380,742]]}
  });

  const R=KG.Renderer.prototype;
  const oldItem=R.item;
  R.item=function(it,cameraX,time){
    if(it.type!=='rune')return oldItem.call(this,it,cameraX,time);
    if(it.taken)return;
    const c=this.ctx,x=Math.round(it.x-cameraX),y=Math.round(it.y+Math.sin(time*3+it.phase)*7),pulse=1+Math.sin(time*4+it.phase)*.06;
    c.save();c.translate(x,y);c.scale(pulse,pulse);
    c.shadowColor='rgba(100,226,255,.9)';c.shadowBlur=22;
    const g=c.createLinearGradient(0,-28,0,28);g.addColorStop(0,'#eaffff');g.addColorStop(.45,'#69dff0');g.addColorStop(1,'#4778d8');
    c.fillStyle=g;c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=2;
    c.beginPath();c.moveTo(0,-29);c.lineTo(20,-7);c.lineTo(12,25);c.lineTo(0,32);c.lineTo(-12,25);c.lineTo(-20,-7);c.closePath();c.fill();c.stroke();
    c.shadowBlur=0;c.strokeStyle='rgba(27,77,150,.85)';c.lineWidth=3;c.beginPath();c.moveTo(-6,-13);c.lineTo(7,-4);c.lineTo(-4,7);c.lineTo(8,16);c.stroke();
    c.restore();
  };

  // Remove any lingering basket/ball render artifacts if a stale world object is present.
  const oldBall=R.ball,oldBasket=R.basket;
  R.ball=function(ball,cameraX){if(this._gameLevelIndex===2)return;oldBall.call(this,ball,cameraX);};
  R.basket=function(b,cameraX){if(this._gameLevelIndex===2)return;oldBasket.call(this,b,cameraX);};

  // Normalize boss artwork by visible alpha bounds so every state has the same feet, scale and center.
  const bossMetricCache=new Map();
  function bossMetrics(renderer,file){
    if(bossMetricCache.has(file))return bossMetricCache.get(file);
    const src=renderer.source(file);
    if(!src)return null;
    let out={minX:0,maxX:src.sw-1,minY:0,maxY:src.sh-1};
    try{
      const cv=document.createElement('canvas');cv.width=src.sw;cv.height=src.sh;
      const cx=cv.getContext('2d',{willReadFrequently:true});
      cx.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,0,0,src.sw,src.sh);
      const d=cx.getImageData(0,0,src.sw,src.sh).data;
      let minX=src.sw,minY=src.sh,maxX=-1,maxY=-1;
      for(let y=0;y<src.sh;y+=2)for(let x=0;x<src.sw;x+=2){
        if(d[(y*src.sw+x)*4+3]>28){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;}
      }
      if(maxX>=minX&&maxY>=minY)out={minX,maxX,minY,maxY};
    }catch(e){}
    bossMetricCache.set(file,out);return out;
  }

  R.boss=function(b,cameraX,time){
    if(!b)return;
    const c=this.ctx,x=Math.round(b.x-cameraX),feet=Math.round(b.y),facing=(b.facing||-1)<0;
    let file=KG.Assets.boss.idle;
    if(b.dead)file=KG.Assets.boss.defeated;
    else if(b.vulnerable)file=KG.Assets.boss.stunned;
    else if(b.state==='attackFire')file=KG.Assets.boss.attackFire;
    else if(b.state==='attackPunch')file=KG.Assets.boss.attackPunch;
    else if(b.state==='shield')file=KG.Assets.boss.shield;
    else if(b.state==='roar')file=KG.Assets.boss.roar;
    else if(b.state==='walk')file=KG.Assets.boss.walk;
    const src=this.source(file),m=src?bossMetrics(this,file):null;

    c.save();
    c.fillStyle='rgba(8,6,9,.34)';c.beginPath();c.ellipse(x,feet+4,70,15,0,0,Math.PI*2);c.fill();
    if(!b.dead&&b.state==='attackPunch'){
      c.strokeStyle='rgba(255,105,55,.72)';c.lineWidth=5;c.setLineDash([14,10]);
      c.beginPath();c.ellipse(x,feet-4,118+Math.sin(time*9)*5,30,0,0,Math.PI*2);c.stroke();c.setLineDash([]);
    }
    if(!b.dead&&b.state==='attackFire'){
      c.fillStyle='rgba(255,116,48,.12)';c.beginPath();c.arc(x,feet-105,112+Math.sin(time*8)*4,0,Math.PI*2);c.fill();
    }
    c.restore();

    if(src&&m){
      const visibleH=Math.max(1,m.maxY-m.minY+1),visibleCenter=(m.minX+m.maxX)/2;
      const targetH=b.dead?170:198,scale=targetH/visibleH;
      const dx=-visibleCenter*scale,dy=feet-m.maxY*scale;
      c.save();c.translate(x,0);if(facing)c.scale(-1,1);
      if(b.flash>0)c.filter='brightness(1.45) saturate(.75)';
      c.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,dx,Math.round(dy),src.sw*scale,src.sh*scale);c.restore();
    }else{
      // Safe fallback silhouette: no broken sprite can leave the arena visually corrupted.
      c.save();c.translate(x,feet);c.fillStyle='#53384b';c.strokeStyle='#ff9b62';c.lineWidth=5;
      c.beginPath();c.ellipse(0,-92,66,92,0,0,Math.PI*2);c.fill();c.stroke();
      c.fillStyle='#f0d4aa';c.beginPath();c.arc(-22,-112,7,0,Math.PI*2);c.arc(22,-112,7,0,Math.PI*2);c.fill();c.restore();
    }

    c.save();
    if(!b.dead&&b.state==='shield'){
      const rad=108+Math.sin(time*5)*4,g=c.createRadialGradient(x,feet-100,55,x,feet-100,rad);
      g.addColorStop(0,'rgba(112,202,255,.05)');g.addColorStop(1,'rgba(112,202,255,.23)');
      c.fillStyle=g;c.strokeStyle='rgba(155,222,255,.92)';c.lineWidth=5;c.beginPath();c.arc(x,feet-100,rad,0,Math.PI*2);c.fill();c.stroke();
      c.font='800 15px system-ui,sans-serif';c.textAlign='center';c.fillStyle='#d9f5ff';c.fillText('ЩИТ',x,feet-220);
    }
    if(!b.dead&&b.vulnerable){
      const rad=101+Math.sin(time*8)*5;c.strokeStyle='rgba(255,224,98,.95)';c.lineWidth=6;c.beginPath();c.arc(x,feet-104,rad,0,Math.PI*2);c.stroke();
      c.font='900 17px system-ui,sans-serif';c.textAlign='center';c.lineWidth=5;c.strokeStyle='rgba(32,20,17,.72)';c.strokeText('ПРЫГАЙ СВЕРХУ!',x,feet-225);c.fillStyle='#fff1a1';c.fillText('ПРЫГАЙ СВЕРХУ!',x,feet-225);
    }
    c.restore();
  };

  // Boss feet are now anchored to the arena floor; track facing without vertical drift.
  const oldBossUpdate=KG.Boss.prototype.update;
  KG.Boss.prototype.update=function(dt,player,orbs){
    oldBossUpdate.call(this,dt,player,orbs);
    this.y=760;
    this.facing=player&&player.x<this.x?-1:1;
    this.w=156;this.h=188;
  };
  KG.Levels[4].boss=[3120,760];
  KG.Levels[4].objective='Победи Глиняный Хаос: пережди атаки и прыгай сверху, когда появится жёлтая подсветка';

  const oldStart=KG.Game.prototype.startLevel;
  KG.Game.prototype.startLevel=function(index,newRun=false){
    oldStart.call(this,index,newRun);
    if(this.levelIndex===2){
      this.world.ball=null;this.world.basket=null;
      this.missionTarget=this.level.mission.length;
      this.missionDoneCount=0;this.missionDone=false;
      this.ui.toast('🔷 Собери 4 голубые руны и войди в портал справа.',3600);
      this.ui.updateHUD(this);
    }
    if(this.levelIndex===4&&this.world.boss){
      this.world.boss.y=760;this.world.boss.w=156;this.world.boss.h=188;
      this.ui.toast('👹 Когда босс светится жёлтым — прыгай ему на голову.',3600);
    }
  };

  const oldRender=R.render;
  R.render=function(game,time){this._gameLevelIndex=game.levelIndex;oldRender.call(this,game,time);};
})(window.KG=window.KG||{});
