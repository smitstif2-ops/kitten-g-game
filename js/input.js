(function(KG){
  'use strict';
  class InputManager {
    constructor(){this.left=false;this.right=false;this.jumpHeld=false;this.jumpPressed=false;this.pausePressed=false;this.bindKeyboard();this.bindTouch();}
    bindKeyboard(){
      addEventListener('keydown',e=>{const c=e.code;if(['ArrowLeft','ArrowRight','ArrowUp','Space','KeyA','KeyD','KeyW','Escape'].includes(c))e.preventDefault();if(c==='ArrowLeft'||c==='KeyA')this.left=true;if(c==='ArrowRight'||c==='KeyD')this.right=true;if(c==='ArrowUp'||c==='KeyW'||c==='Space'){if(!this.jumpHeld)this.jumpPressed=true;this.jumpHeld=true;}if(c==='Escape')this.pausePressed=true;});
      addEventListener('keyup',e=>{const c=e.code;if(c==='ArrowLeft'||c==='KeyA')this.left=false;if(c==='ArrowRight'||c==='KeyD')this.right=false;if(c==='ArrowUp'||c==='KeyW'||c==='Space')this.jumpHeld=false;});
      addEventListener('blur',()=>{this.left=this.right=this.jumpHeld=false;});
    }
    bindTouch(){const bind=(id,on,off)=>{const el=document.getElementById(id);if(!el)return;const dn=e=>{e.preventDefault();on();},up=e=>{e.preventDefault();off();};['pointerdown','touchstart'].forEach(ev=>el.addEventListener(ev,dn,{passive:false}));['pointerup','pointercancel','pointerleave','touchend'].forEach(ev=>el.addEventListener(ev,up,{passive:false}));};
      bind('touch-left',()=>this.left=true,()=>this.left=false);bind('touch-right',()=>this.right=true,()=>this.right=false);bind('touch-jump',()=>{if(!this.jumpHeld)this.jumpPressed=true;this.jumpHeld=true;},()=>this.jumpHeld=false);
    }
    consumeJump(){const v=this.jumpPressed;this.jumpPressed=false;return v;}
    consumePause(){const v=this.pausePressed;this.pausePressed=false;return v;}
  }
  KG.InputManager=InputManager;
})(window.KG = window.KG || {});
