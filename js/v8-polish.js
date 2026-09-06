(function(KG){
  'use strict';
  if(!KG.Renderer||!KG.World||!KG.Game||!KG.Player||!KG.Boss||!KG.UI||!KG.Levels)return;

  const clamp=KG.Math.clamp, overlap=KG.Math.overlap;

  KG.InputManager=class InputManager{
    constructor(){
      this.left=false;this.right=false;this.jumpHeld=false;this.jumpPressed=false;this.pausePressed=false;
      this._held={left:new Set(),right:new Set(),jump:new Set()};
      this._mouseDrive=false;this._mousePointer=null;
      this.bindKeyboard();this.bindButtons();this.bindMouse();
      addEventListener('blur',()=>this.reset());
      document.addEventListener('visibilitychange',()=>{if(document.hidden)this.reset();});
    }
    reset(){
      this.left=this.right=this.jumpHeld=false;this.jumpPressed=false;this._mouseDrive=false;this._mousePointer=null;
      Object.values(this._held).forEach(s=>s.clear());
    }
    bindKeyboard(){
      addEventListener('keydown',e=>{
        const c=e.code;
        if(['ArrowLeft','ArrowRight','ArrowUp','Space','KeyA','KeyD','KeyW','Escape'].includes(c))e.preventDefault();
        if(c==='ArrowLeft'||c==='KeyA')this.left=true;
        if(c==='ArrowRight'||c==='KeyD')this.right=true;
        if(c==='ArrowUp'||c==='KeyW'||c==='Space'){if(!this.jumpHeld)this.jumpPressed=true;this.jumpHeld=true;}
        if(c==='Escape')this.pausePressed=true;
      });
      addEventListener('keyup',e=>{
        const c=e.code;
        if(c==='ArrowLeft'||c==='KeyA')this.left=this._held.left.size>0;
        if(c==='ArrowRight'||c==='KeyD')this.right=this._held.right.size>0;
        if(c==='ArrowUp'||c==='KeyW'||c==='Space')this.jumpHeld=this._held.jump.size>0;
      });
    }
    bindButtons(){
      const bind=(id,key)=>{
        const el=document.getElementById(id);if(!el)return;
        const down=e=>{
          e.preventDefault();e.stopPropagation();
          this._held[key].add(e.pointerId);
          try{el.setPointerCapture(e.pointerId);}catch(_e){}
          if(key==='jump'){if(!this.jumpHeld)this.jumpPressed=true;this.jumpHeld=true;}
          else this[key]=true;
          el.classList.add('pressed');
          if(key==='jump'&&navigator.vibrate)try{navigator.vibrate(8);}catch(_e){}
        };
        const up=e=>{
          this._held[key].delete(e.pointerId);
          if(key==='jump')this.jumpHeld=this._held.jump.size>0;
          else this[key]=this._held[key].size>0;
          if(!this._held[key].size)el.classList.remove('pressed');
        };
        el.addEventListener('pointerdown',down,{passive:false});
        ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>el.addEventListener(ev,up,{passive:false}));
      };
      bind('touch-left','left');bind('touch-right','right');bind('touch-jump','jump');
    }
    _mouseDirection(clientX){
      const w=Math.max(1,innerWidth),dead=w*.08;
      if(clientX<w/2-dead){this.left=true;this.right=false;}
      else if(clientX>w/2+dead){this.right=true;this.left=false;}
      else{this.left=false;this.right=false;}
    }
    bindMouse(){
      const canvas=document.getElementById('game');if(!canvas)return;
      canvas.addEventListener('contextmenu',e=>e.preventDefault());
      canvas.addEventListener('pointerdown',e=>{
        if(e.pointerType!=='mouse')return;
        if(e.button===0){
          e.preventDefault();this._mouseDrive=true;this._mousePointer=e.pointerId;this._mouseDirection(e.clientX);
          try{canvas.setPointerCapture(e.pointerId);}catch(_e){}
        }else if(e.button===1||e.button===2){
          e.preventDefault();if(!this.jumpHeld)this.jumpPressed=true;this.jumpHeld=true;
          try{canvas.setPointerCapture(e.pointerId);}catch(_e){}
        }
      },{passive:false});
      canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&this._mouseDrive&&e.pointerId===this._mousePointer)this._mouseDirection(e.clientX);});
      const up=e=>{
        if(e.pointerType!=='mouse')return;
        if(e.button===0||e.pointerId===this._mousePointer){this._mouseDrive=false;this._mousePointer=null;this.left=this._held.left.size>0;this.right=this._held.right.size>0;}
        if(e.button===1||e.button===2)this.jumpHeld=this._held.jump.size>0;
      };
      ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>canvas.addEventListener(ev,up));
    }
    consumeJump(){const v=this.jumpPressed;this.jumpPressed=false;return v;}
    consumePause(){const v=this.pausePressed;this.pausePressed=false;return v;}
  };

  const style=document.createElement('style');
  style.textContent=`
    .touch-btn{touch-action:none;user-select:none;-webkit-user-select:none;transition:transform .06s ease,filter .06s ease}
    .touch-btn.pressed{transform:scale(.92);filter:brightness(1.18)}
    @media(pointer:coarse){
      #touch-controls{left:12px;right:12px;bottom:max(14px,env(safe-area-inset-bottom));align-items:end}
      .touch-group{gap:12px}
      .touch-btn{width:82px;height:82px;border-radius:26px;font-size:30px;background:rgba(9,22,38,.86);box-shadow:0 8px 24px rgba(0,0,0,.24)}
      .touch-jump{width:100px;height:100px;border-radius:50%;font-size:34px;background:rgba(246,207,91,.98)}
      #hud{left:7px;right:7px;top:max(7px,env(safe-area-inset-top))}.hud-side{gap:5px}.hud-btn{padding:8px 10px}
    }
  `;
  document.head.appendChild(style);

  Object.assign(KG.Levels[0],{
    objective:'Собери 7 рыбок и войди в портал',width:5420,goalX:5180,par:110,
    platforms:[[0,760,620,70],[720,650,340,44],[1150,520,330,44],[1580,650,350,44],[2030,500,350,44],[2480,620,360,44],[2940,760,500,70],[3540,610,360,44],[4000,470,340,44],[4440,610,360,44],[4900,760,520,70]],
    moving:[[1740,470,180,36,'x',70,1.0],[3730,465,190,36,'y',75,1.05]],
    spikes:[[620,740,88],[1480,740,88],[2380,740,88],[3440,740,88],[4340,740,88],[4800,740,88]],
    enemies:[['hedgehog',1240,490,1160,1420,88],['slime',2160,470,2050,2320,80],['hedgehog',4070,440,4010,4280,86]],
    mission:[['fish',300,690],['fish',820,580],['fish',1260,450],['fish',2140,430],['fish',2600,550],['fish',4120,400],['fish',4590,540]],
    coins:[[470,675],[930,575],[1370,445],[1710,575],[2260,425],[2710,545],[3190,690],[3690,535],[4220,395],[4680,535],[5070,690]],
    checkpoint:[3150,710],
    fx:{water:true,waterZones:[[620,742,100,170],[1480,742,100,170],[2380,742,100,170],[3440,742,100,170],[4340,742,100,170],[4800,742,100,170]],waterfalls:[[1060,705,70,110],[1930,705,72,110],[3900,685,70,150]],trees:[[360,760,205],[3150,760,180],[5070,760,170]],foliage:[[1080,742],[3400,742],[4860,742]]}
  });

  Object.assign(KG.Levels[1],{
    objective:'Поймай 7 птичек и доберись до портала',width:6000,goalX:5760,par:125,
    platforms:[[0,760,600,70],[700,640,320,44],[1120,500,320,44],[1540,360,320,44],[1960,520,330,44],[2390,360,330,44],[2820,520,330,44],[3250,760,500,70],[3850,620,330,44],[4280,470,330,44],[4710,620,330,44],[5140,480,330,44],[5570,760,430,70]],
    moving:[[1730,560,190,36,'y',75,1.0],[3650,500,190,36,'x',75,1.05],[5330,350,190,36,'y',80,1.0]],
    spikes:[[600,740,88],[1020,740,88],[1860,740,88],[2290,740,88],[3150,740,88],[3750,740,88],[4610,740,88],[5470,740,88]],
    enemies:[['crab',800,610,720,970,88],['seagull',2070,490,1980,2250,100],['crab',2940,490,2840,3100,92],['seagull',4390,440,4300,4570,102]],
    mission:[['bird',780,570],['bird',1210,430],['bird',1640,290],['bird',2050,450],['bird',2930,450],['bird',4380,400],['bird',5220,410]],
    coins:[[400,680],[900,565],[1320,425],[1750,285],[2160,445],[2520,285],[3020,445],[3450,690],[3980,545],[4490,395],[4850,545],[5260,405],[5710,690]],
    checkpoint:[3330,710],
    fx:{water:true,waterZones:[[600,742,100,170],[1020,742,100,170],[1860,742,100,170],[2290,742,100,170],[3150,742,100,170],[3750,742,100,170],[4610,742,100,170],[5470,742,100,170]],waterfalls:[[1440,630,72,260],[2720,620,72,260],[5040,620,72,260]],flags:[[3300,760,90],[5640,760,90]],foliage:[[650,742],[3200,742],[5520,742]]}
  });

  Object.assign(KG.Levels[2],{
    objective:'Собери 6 голубых рун и войди в портал',width:6100,goalX:5840,par:125,
    platforms:[[0,760,850,70],[960,650,360,44],[1450,520,340,44],[1960,640,360,44],[2470,500,360,44],[2980,620,360,44],[3440,760,500,70],[4040,620,360,44],[4500,480,340,44],[4940,620,360,44],[5400,760,700,70]],
    moving:[[1340,620,180,36,'y',65,1.0],[3830,500,190,36,'x',70,1.0]],
    spikes:[[850,740,95],[1320,740,110],[1790,740,155],[2320,740,135],[2830,740,135],[3340,740,90],[3940,740,90],[4400,740,90],[4840,740,90],[5300,740,90]],
    enemies:[['spikeball',2070,610,1980,2250,78],['hedgehog',3070,590,2990,3270,82],['spikeball',4620,450,4520,4780,76]],
    mission:[['rune',1100,580],['rune',1600,450],['rune',2600,430],['rune',3120,550],['rune',4600,410],['rune',5150,550]],
    coins:[[350,680],[1200,575],[1690,445],[2160,575],[2710,425],[3220,545],[3700,690],[4150,545],[4700,405],[5100,545],[5620,690]],
    checkpoint:[3500,710],
    fx:{water:true,waterZones:[[850,742,110,170],[1320,742,130,170],[1790,742,170,170],[2320,742,150,170],[2830,742,150,170],[3340,742,100,170],[3940,742,100,170],[4400,742,100,170],[4840,742,100,170],[5300,742,100,170]],waterfalls:[[1320,705,72,110],[2320,700,72,120],[4400,700,72,120]],trees:[[420,760,175],[3650,760,165],[5650,760,170]],flags:[[3500,760,86]],foliage:[[800,742],[3900,742],[5350,742]]}
  });

  Object.assign(KG.Levels[3],{
    objective:'Собери 6 бабочек и доберись до домика',width:6500,house:[6240,760],par:140,
    platforms:[[0,760,620,70],[720,620,320,44],[1140,480,320,44],[1560,340,320,44],[1980,480,330,44],[2410,330,330,44],[2840,480,330,44],[3270,330,330,44],[3700,480,330,44],[4130,760,500,70],[4730,610,330,44],[5160,470,330,44],[5590,610,330,44],[6020,760,480,70]],
    moving:[[1840,600,190,36,'y',70,1.0],[3460,560,190,36,'y',75,1.0],[4940,370,190,36,'x',65,1.0]],
    spikes:[[620,740,88],[1040,740,88],[1460,740,88],[1880,740,88],[2310,740,88],[2740,740,88],[3170,740,88],[3600,740,88],[4030,740,88],[4630,740,88],[5060,740,88],[5490,740,88],[5920,740,88]],
    enemies:[['seagull',2070,450,1990,2260,96],['spikeball',3820,450,3720,3990,78],['seagull',5270,440,5180,5450,98]],
    mission:[['butterfly',820,550],['butterfly',1260,410],['butterfly',1660,270],['butterfly',2510,260],['butterfly',5250,400],['butterfly',5700,540]],
    coins:[[410,680],[910,545],[1330,405],[1760,265],[2180,405],[2600,255],[3020,405],[3440,255],[3860,405],[4340,690],[4850,535],[5290,395],[5700,535],[6190,690]],
    checkpoint:[4230,710],
    fx:{water:true,waterZones:[[620,742,100,170],[1040,742,100,170],[1460,742,100,170],[1880,742,100,170],[2310,742,100,170],[2740,742,100,170],[3170,742,100,170],[3600,742,100,170],[4030,742,100,170],[4630,742,100,170],[5060,742,100,170],[5490,742,100,170],[5920,742,100,170]],waterfalls:[[1040,690,70,140],[3170,690,70,140],[5490,690,70,140]],flags:[[4230,760,90],[6100,760,90]],snow:true}
  });

  Object.assign(KG.Levels[4],{
    objective:'Доберись до арены и победи Глиняный Хаос',width:5600,par:145,
    platforms:[[0,760,5600,70],[600,590,340,44],[1100,450,340,44],[1600,590,340,44],[2100,430,340,44],[2600,590,340,44],[3100,450,340,44],[3600,590,340,44],[4100,520,300,44]],
    moving:[[1430,330,190,36,'y',70,1.0],[2930,330,190,36,'x',70,1.0]],
    spikes:[[950,740,105],[1950,740,105],[2950,740,105],[3950,740,105]],
    enemies:[['rock',1780,560,1640,1900,78],['rock',3260,420,3130,3400,80]],
    mission:[],coins:[[340,680],[760,520],[1220,380],[1740,520],[2240,360],[2740,520],[3240,380],[3740,520],[4200,450]],
    boss:[4950,760],checkpoint:[4300,690],
    fx:{lava:true,flags:[[4300,760,90]],embers:true}
  });

  const W=KG.World.prototype;
  W.collect=function(player,t){
    const collected=[];
    for(const it of this.items){
      if(it.taken)continue;
      const yy=it.y+Math.sin(t*3+it.phase)*8,rad=it.type==='coin'?36:it.type==='rune'?32:27;
      if(overlap(player.box(),{x:it.x-rad,y:yy-rad,w:rad*2,h:rad*2})){it.taken=true;collected.push(it);}
    }
    return collected;
  };

  const R=KG.Renderer.prototype;
  const alphaCache=new Map();
  function supportY(level,x,hint=760){
    const ps=(level&&level.platforms)||[];
    const direct=ps.filter(p=>x>=p[0]-4&&x<=p[0]+p[2]+4);
    if(direct.length)return direct.reduce((a,b)=>Math.abs(a[1]-hint)<=Math.abs(b[1]-hint)?a:b)[1];
    let best=null,bestD=Infinity;
    for(const p of ps){const dx=x<p[0]?p[0]-x:x>p[0]+p[2]?x-(p[0]+p[2]):0;if(dx<bestD){bestD=dx;best=p;}}
    return best&&bestD<=90?best[1]:null;
  }
  function bounds(renderer,file){
    if(alphaCache.has(file))return alphaCache.get(file);
    const src=renderer.source(file);if(!src)return null;
    let out={minX:0,maxX:src.sw-1,minY:0,maxY:src.sh-1};
    try{
      const cv=document.createElement('canvas');cv.width=src.sw;cv.height=src.sh;
      const cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,0,0,src.sw,src.sh);
      const d=cx.getImageData(0,0,src.sw,src.sh).data;let minX=src.sw,minY=src.sh,maxX=-1,maxY=-1;
      for(let y=0;y<src.sh;y+=2)for(let x=0;x<src.sw;x+=2)if(d[(y*src.sw+x)*4+3]>24){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;}
      if(maxX>=minX&&maxY>=minY)out={minX,maxX,minY,maxY};
    }catch(_e){}
    alphaCache.set(file,out);return out;
  }
  function anchored(renderer,file,cx,bottom,targetVisibleH,alpha=1,flip=false){
    const src=renderer.source(file),m=src&&bounds(renderer,file);if(!src||!m)return false;
    const vh=Math.max(1,m.maxY-m.minY+1),scale=targetVisibleH/vh,center=(m.minX+m.maxX)/2;
    const c=renderer.ctx;c.save();c.globalAlpha=alpha;c.translate(Math.round(cx),0);if(flip)c.scale(-1,1);
    c.drawImage(src.im,src.sx,src.sy,src.sw,src.sh,-center*scale,Math.round(bottom-m.maxY*scale),src.sw*scale,src.sh*scale);c.restore();return true;
  }

  R.portal=function(level,cameraX,time,active){
    if(!level.goalX||!active)return;
    const x=level.goalX-cameraX,surf=supportY(level,level.goalX,760);if(surf===null)return;
    const c=this.ctx,pulse=1+Math.sin(time*3.5)*.025,file=level.background===4?KG.Assets.items.portalGold:KG.Assets.items.portalBlue;
    c.save();c.fillStyle='rgba(18,26,33,.25)';c.beginPath();c.ellipse(x,surf+3,48,10,0,0,Math.PI*2);c.fill();
    const g=c.createRadialGradient(x,surf-56,10,x,surf-56,82);g.addColorStop(0,'rgba(164,240,255,.18)');g.addColorStop(1,'rgba(164,240,255,0)');c.fillStyle=g;c.beginPath();c.arc(x,surf-56,82,0,Math.PI*2);c.fill();c.restore();
    c.save();c.translate(x,surf);c.scale(pulse,pulse);c.translate(-x,-surf);anchored(this,file,x,surf+1,126,.98);c.restore();
  };

  R.drawTreeSway=function(level,cameraX,time){
    const arr=level.fx?.trees||[],file=KG.Assets.environment.treeValley;
    for(let i=0;i<arr.length;i++){
      const [x,hint,h]=arr[i],surf=supportY(level,x,hint);if(surf===null)continue;
      const c=this.ctx,screenX=x-cameraX,angle=Math.sin(time*1.15+i)*.010;
      c.save();c.fillStyle='rgba(18,28,22,.22)';c.beginPath();c.ellipse(screenX,surf+3,34,8,0,0,Math.PI*2);c.fill();c.restore();
      c.save();c.translate(Math.round(screenX),surf);c.rotate(angle);c.translate(-Math.round(screenX),-surf);anchored(this,file,screenX,surf+2,h,.92);c.restore();
    }
  };

  R.drawFlags=function(level,cameraX,time){
    const arr=level.fx?.flags||[];if(!arr.length)return;const file=this.frame(KG.Assets.tiles.flag,time,5);
    for(const [x,hint,h] of arr){const surf=supportY(level,x,hint);if(surf!==null)anchored(this,file,x-cameraX,surf+1,h,.90);}
  };
  R.checkpoint=function(cp,cameraX,active,time){
    if(!cp)return;const [x,hint]=cp,surf=supportY(this._v8Level,x,hint);if(surf===null)return;
    anchored(this,this.frame(KG.Assets.tiles.flag,time,5),x-cameraX,surf+1,92,active?1:.68);
  };

  R.house=function(h,cameraX){
    if(!h)return;const level=this._v8Level,x=h.x-cameraX,surf=supportY(level,h.x,h.y||760);if(surf===null)return;
    const c=this.ctx;c.save();c.shadowColor='rgba(0,0,0,.28)';c.shadowBlur=18;c.fillStyle='#f0d7aa';this.roundRect(x-65,surf-175,130,175,22);c.fill();
    c.fillStyle='#d96757';c.beginPath();c.moveTo(x-82,surf-150);c.lineTo(x,surf-250);c.lineTo(x+82,surf-150);c.closePath();c.fill();
    c.fillStyle='#704a31';this.roundRect(x-20,surf-80,40,80,10);c.fill();c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(x,surf+4,58,9,0,0,Math.PI*2);c.fill();c.restore();
  };

  const oldItem=R.item;
  R.item=function(it,cameraX,time){
    if(it.type!=='coin')return oldItem.call(this,it,cameraX,time);
    if(it.taken)return;const y=it.y+Math.sin(time*3+it.phase)*8,x=it.x-cameraX,c=this.ctx,p=1+Math.sin(time*5+it.phase)*.04;
    c.save();c.translate(x,y);c.scale(p,p);c.shadowColor='rgba(255,209,62,.80)';c.shadowBlur=22;this.image(KG.Assets.items.coin,-36,-36,72,72,false,1,true);c.restore();
  };

  KG.Boss.prototype.box=function(){return{x:this.x-70,y:this.y-180,w:140,h:180};};
  KG.Boss.prototype.update=function(dt,player,orbs){
    if(this.dead){this.state='defeated';this.vulnerable=false;return;}
    this.timer+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.flash=Math.max(0,this.flash-dt);this.telegraph=Math.max(0,this.telegraph-dt);
    this.y=this.floorY||760;this.facing=player&&player.x<this.x?-1:1;
    const period=7.2,cycle=this.timer%period,round=Math.floor(this.timer/period);
    if(round!==this._round){this._round=round;this.lastShot=-1;}
    this.vulnerable=false;
    if(cycle<1.7){this.phase='walk';this.state='walk';this.x+=Math.sign(player.x-this.x)*95*dt;}
    else if(cycle<3.2){
      this.phase='fire';this.state='attackFire';this.telegraph=.14;
      const slot=Math.floor((cycle-1.7)/.65);
      if(slot!==this.lastShot){this.lastShot=slot;const dir=Math.sign(player.x-this.x)||-1;orbs.push({x:this.x+dir*55,y:this.y-128,vx:dir*(285+slot*20),vy:-255+slot*28,r:14,dead:false});}
    }
    else if(cycle<4.15){this.phase='punch';this.state='attackPunch';this.telegraph=.15;this.x+=Math.sign(player.x-this.x)*220*dt;}
    else if(cycle<5.1){this.phase='shield';this.state='shield';this.telegraph=.18;}
    else{this.phase='stunned';this.state='stunned';this.vulnerable=true;}
    this.x=clamp(this.x,this.arenaMin||4450,this.arenaMax||5350);
  };

  const PrevGame=KG.Game;
  KG.Game=class extends PrevGame{
    constructor(...args){super(...args);this.maxLives=9;this.lives=9;this._mouseHintShown=false;this._touchHintShown=false;}
    startLevel(index,newRun=false){
      const prevMode=this.mode,prevLives=this.lives,prevScore=this.score;
      super.startLevel(index,newRun);
      const fresh=newRun||prevMode==='menu'||prevMode==='gameover';
      this.lives=fresh?this.maxLives:clamp(prevLives||this.maxLives,1,this.maxLives);
      if(prevMode==='gameover'&&!newRun)this.score=Math.max(0,prevScore);
      if(this.levelIndex===4&&this.world.boss){this.world.boss.floorY=760;this.world.boss.y=760;this.world.boss.arenaMin=4450;this.world.boss.arenaMax=5350;this.world.boss.x=4950;}
      const coarse=!!(window.matchMedia&&window.matchMedia('(pointer:coarse)').matches);
      if(coarse&&!this._touchHintShown){this._touchHintShown=true;this.ui.toast('Управление: удерживай ◀/▶ и жми большую кнопку прыжка. Можно нажимать движение и прыжок одновременно.',4300);}
      else if(!coarse&&!this._mouseHintShown){this._mouseHintShown=true;this.ui.toast('Мышь: удерживай ЛКМ слева/справа от центра — движение. ПКМ или колёсико — прыжок.',4300);}
      this.ui.updateHUD(this);
    }
    complete(){
      if(this.finishLatch)return;this.finishLatch=true;this.mode='complete';this.audio.sfx('win');this.save.unlockLevel(this.levelIndex+1);this.save.setScore(this.score);
      let stars=1;if(this.levelTime<=this.level.par*1.15)stars=2;if(this.levelTime<=this.level.par&&this.lives===this.maxLives)stars=3;
      this.save.setStars(this.levelIndex,stars);this.ui.showComplete(stars,this.levelTime);
    }
    hurt(kind='normal'){
      const boss=this.world&&this.world.boss;
      if(kind==='normal'&&this.levelIndex===4&&boss&&boss.vulnerable&&overlap(this.player.box(),boss.box()))return;
      return super.hurt(kind);
    }
  };

  const oldHUD=KG.UI.prototype.updateHUD;
  KG.UI.prototype.updateHUD=function(game){oldHUD.call(this,game);const lives=this.el('hud-lives');if(lives)lives.textContent=`❤️ × ${game.lives}`;};

  const oldRender=R.render;
  R.render=function(game,time){
    this._v8Level=game.level;oldRender.call(this,game,time);
    if(game.levelIndex===4&&!game.world.boss.dead){
      const c=this.ctx,x=4420-game.cameraX;if(x>-220&&x<this.w+220){c.save();c.textAlign='center';c.font='900 18px system-ui,sans-serif';c.lineWidth=6;c.strokeStyle='rgba(26,17,21,.75)';c.strokeText('АРЕНА БОССА →',x,675);c.fillStyle='#ffd582';c.fillText('АРЕНА БОССА →',x,675);c.restore();}
    }
  };

})(window.KG=window.KG||{});