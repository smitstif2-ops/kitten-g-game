(function(KG){
  'use strict';
  class AssetLoader {
    constructor(base='./assets/'){this.base=base;this.images={};this.progress=0;this.total=0;this.done=0;}
    async load(){
      const list=[...KG.Assets.backgrounds,...(KG.AtlasFiles||[])];this.total=list.length;
      await Promise.all(list.map(file=>new Promise((resolve,reject)=>{const im=new Image();im.decoding='async';im.onload=()=>{this.images[file]=im;this.done++;this.progress=this.done/this.total;resolve();};im.onerror=()=>reject(new Error('Asset failed: '+file));im.src=this.base+file;})));
      this.progress=1;return this;
    }
    get(file){return this.images[file]||null;}
  }
  KG.AssetLoader=AssetLoader;
})(window.KG = window.KG || {});
