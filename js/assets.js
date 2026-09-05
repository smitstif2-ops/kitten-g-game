(function(KG){
  'use strict';
  const BG={
    'level-1-hd.jpg':[0,0,1280,720],
    'level-2-hd.jpg':[0,720,1280,720],
    'level-3-hd.jpg':[0,1440,1280,720],
    'level-4-hd.jpg':[0,2160,1280,720],
    'level-5-hd.jpg':[0,2880,1280,720]
  };
  const SPR={
    'boss.png':[4,4,230,165],
    'costume-bee.png':[238,4,142,235],
    'costume-bunny.png':[384,4,157,235],
    'costume-dino.png':[545,4,144,235],
    'costume-space.png':[4,243,149,235],
    'enemy-crab.png':[157,243,106,120],
    'enemy-hedgehog.png':[267,243,92,120],
    'enemy-seagull.png':[363,243,92,120],
    'enemy-slime.png':[459,243,100,120],
    'enemy-spikeball.png':[563,243,95,120],
    'hero-fall.png':[4,482,110,155],
    'hero-jump.png':[118,482,110,155],
    'hero-run.png':[232,482,110,160],
    'hero-win.png':[346,482,105,155],
    'item-ball.png':[455,482,105,110],
    'item-bird.png':[564,482,100,110],
    'item-butterfly.png':[4,646,100,110],
    'item-coin.png':[108,646,90,110],
    'item-fish.png':[202,646,90,110]
  };
  class AssetLoader {
    constructor(base='./assets/'){this.base=base;this.images={};this.progress=0;}
    loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.decoding='async';im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Asset failed: '+src));im.src=src;});}
    crop(sheet,rect){const [sx,sy,sw,sh]=rect,c=document.createElement('canvas');c.width=sw;c.height=sh;c.getContext('2d').drawImage(sheet,sx,sy,sw,sh,0,0,sw,sh);return c;}
    async load(){
      const bg=await this.loadImage(this.base+'backgrounds.webp');this.progress=.5;
      const spr=await this.loadImage(this.base+'sprites.webp');this.progress=.85;
      Object.entries(BG).forEach(([file,rect])=>{this.images[file]=this.crop(bg,rect);});
      Object.entries(SPR).forEach(([file,rect])=>{this.images[file]=this.crop(spr,rect);});
      this.progress=1;return this;
    }
    get(file){return this.images[file];}
    previewURL(file){const value=this.get(file);if(!value)return '';if(value instanceof HTMLCanvasElement)return value.toDataURL('image/png');return value.src||'';}
  }
  KG.AssetLoader=AssetLoader;
})(window.KG = window.KG || {});
