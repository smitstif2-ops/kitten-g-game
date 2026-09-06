(function(KG){
  'use strict';
  if(!KG.InputManager)return;
  const Base=KG.InputManager;
  KG.InputManager=class extends Base{
    constructor(...args){
      super(...args);
      this._mouseButtonsMask=0;
      this.bindMouseButtonCompat();
    }
    bindMouseButtonCompat(){
      const canvas=document.getElementById('game');if(!canvas)return;
      const syncMove=x=>{
        const w=Math.max(1,innerWidth),dead=w*.08;
        if(!(this._mouseButtonsMask&1)){this.left=this._held.left.size>0;this.right=this._held.right.size>0;return;}
        if(x<w/2-dead){this.left=true;this.right=false;}
        else if(x>w/2+dead){this.right=true;this.left=false;}
        else{this.left=false;this.right=false;}
      };
      canvas.addEventListener('mousedown',e=>{
        if(e.button===0){this._mouseButtonsMask|=1;syncMove(e.clientX);e.preventDefault();}
        if(e.button===1||e.button===2){
          this._mouseButtonsMask|=e.button===1?4:2;
          if(!this.jumpHeld)this.jumpPressed=true;this.jumpHeld=true;e.preventDefault();
        }
      },{passive:false});
      canvas.addEventListener('mousemove',e=>{if(this._mouseButtonsMask&1)syncMove(e.clientX);});
      addEventListener('mouseup',e=>{
        if(e.button===0){this._mouseButtonsMask&=~1;this.left=this._held.left.size>0;this.right=this._held.right.size>0;}
        if(e.button===1){this._mouseButtonsMask&=~4;this.jumpHeld=(this._mouseButtonsMask&(2|4))!==0||this._held.jump.size>0;}
        if(e.button===2){this._mouseButtonsMask&=~2;this.jumpHeld=(this._mouseButtonsMask&(2|4))!==0||this._held.jump.size>0;}
      });
      canvas.addEventListener('contextmenu',e=>e.preventDefault());
    }
    reset(){super.reset();this._mouseButtonsMask=0;}
  };
})(window.KG=window.KG||{});
