(function(KG){
  'use strict';
  if(!KG.InputManager)return;
  const Base=KG.InputManager;
  KG.InputManager=class extends Base{
    constructor(...args){
      super(...args);
      this._mouseButtonsMask=0;
      this._mouseSteerActive=false;
      this.bindMouseSteering();
    }
    bindMouseSteering(){
      const canvas=document.getElementById('game');if(!canvas)return;
      const fine=()=>!(window.matchMedia&&window.matchMedia('(pointer:coarse)').matches);
      const playing=()=>!window.__KITTEN_GAME__||window.__KITTEN_GAME__.mode==='playing';
      const steer=x=>{
        if(!fine()||!playing())return;
        this._mouseSteerActive=true;
        const w=Math.max(1,innerWidth),dead=w*.105;
        if(x<w/2-dead){this.left=true;this.right=false;}
        else if(x>w/2+dead){this.right=true;this.left=false;}
        else{this.left=this._held.left.size>0;this.right=this._held.right.size>0;}
      };
      canvas.addEventListener('mousemove',e=>steer(e.clientX));
      canvas.addEventListener('mousedown',e=>{
        if(!fine())return;
        if(e.button===0){
          this._mouseButtonsMask|=1;steer(e.clientX);
          if(!this.jumpHeld)this.jumpPressed=true;
          this.jumpHeld=true;
          e.preventDefault();
        }else if(e.button===1||e.button===2){
          this._mouseButtonsMask|=e.button===1?4:2;
          if(!this.jumpHeld)this.jumpPressed=true;this.jumpHeld=true;e.preventDefault();
        }
      },{passive:false});
      addEventListener('mouseup',e=>{
        if(e.button===0){this._mouseButtonsMask&=~1;this.jumpHeld=(this._mouseButtonsMask&(2|4))!==0||this._held.jump.size>0;steer(e.clientX);}
        if(e.button===1){this._mouseButtonsMask&=~4;this.jumpHeld=(this._mouseButtonsMask&(1|2|4))!==0||this._held.jump.size>0;}
        if(e.button===2){this._mouseButtonsMask&=~2;this.jumpHeld=(this._mouseButtonsMask&(1|2|4))!==0||this._held.jump.size>0;}
      });
      canvas.addEventListener('mouseleave',()=>{
        this._mouseSteerActive=false;
        if(!(this._mouseButtonsMask&1)){this.left=this._held.left.size>0;this.right=this._held.right.size>0;}
      });
      canvas.addEventListener('contextmenu',e=>e.preventDefault());
    }
    reset(){super.reset();this._mouseButtonsMask=0;this._mouseSteerActive=false;}
  };

  if(KG.Game){
    const oldStart=KG.Game.prototype.startLevel;
    KG.Game.prototype.startLevel=function(index,newRun=false){
      oldStart.call(this,index,newRun);
      const coarse=!!(window.matchMedia&&window.matchMedia('(pointer:coarse)').matches);
      if(!coarse&&!this._mouseSteerHintShown){
        this._mouseSteerHintShown=true;
        this.ui.toast('Мышь: веди курсор влево/вправо от центра для движения · ЛКМ — прыжок · центр экрана — остановка.',4300);
      }
    };
  }
})(window.KG=window.KG||{});
