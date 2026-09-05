(function(KG){
  'use strict';
  class AudioManager {
    constructor(save){this.save=save;this.ctx=null;this.musicTimer=0;this.step=0;this.pattern=[392,523,659,523,440,587,698,587,392,494,659,587];}
    ensure(){if(!this.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();}if(this.ctx.state==='suspended')this.ctx.resume();}
    tone(freq,dur=.08,type='sine',gain=.02,delay=0){if(!this.ctx)return;const vol=Math.max(0,Math.min(1,this.save.data.settings.volume));const o=this.ctx.createOscillator(),g=this.ctx.createGain(),t=this.ctx.currentTime+delay;o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain*vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(this.ctx.destination);o.start(t);o.stop(t+dur+.03);}
    sfx(name){if(!this.save.data.settings.sfx)return;this.ensure();if(!this.ctx)return;
      if(name==='jump')this.tone(470,.07,'triangle',.025);
      if(name==='coin'){this.tone(820,.06,'triangle',.025);this.tone(1100,.08,'triangle',.018,.04);}
      if(name==='collect'){this.tone(600,.08,'sine',.022);this.tone(840,.11,'sine',.018,.05);}
      if(name==='hurt')this.tone(150,.16,'sawtooth',.032);
      if(name==='stomp'){this.tone(220,.06,'square',.025);this.tone(440,.08,'triangle',.02,.04);}
      if(name==='combo'){this.tone(660,.07,'triangle',.022);this.tone(880,.09,'triangle',.018,.04);}
      if(name==='splash'){this.tone(180,.05,'sine',.018);this.tone(120,.12,'triangle',.012,.03);}
      if(name==='checkpoint'){this.tone(660,.09,'sine',.018);this.tone(880,.12,'sine',.02,.06);}
      if(name==='win'){[523,659,784].forEach((f,i)=>this.tone(f,.16,'triangle',.025,i*.08));}
      if(name==='boss')this.tone(170,.08,'square',.03);
      if(name==='bossWin')[523,659,784,1046].forEach((f,i)=>this.tone(f,.24,'triangle',.028,i*.10));
    }
    update(dt,mode){if(!this.save.data.settings.music||mode!=='playing')return;this.ensure();if(!this.ctx)return;this.musicTimer+=dt;if(this.musicTimer>.42){this.musicTimer=0;const f=this.pattern[this.step++%this.pattern.length];this.tone(f,.18,'sine',.004);if(this.step%4===0)this.tone(f/2,.22,'triangle',.0028);}}
  }
  KG.AudioManager=AudioManager;
})(window.KG = window.KG || {});
