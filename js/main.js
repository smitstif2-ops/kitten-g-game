(function(KG){
  'use strict';
  const loader=new KG.AssetLoader('./assets/');
  const progress=document.getElementById('loading-progress');
  const text=document.getElementById('loading-text');
  let raf;
  const animate=()=>{progress.style.width=Math.round(loader.progress*100)+'%';text.textContent=`Загрузка пластилинового мира… ${Math.round(loader.progress*100)}%`;raf=requestAnimationFrame(animate);};animate();
  loader.load().then(()=>{
    cancelAnimationFrame(raf);progress.style.width='100%';text.textContent='Готово';
    const save=new KG.SaveManager();
    const audio=new KG.AudioManager(save);
    const input=new KG.InputManager();
    const game=new KG.Game(document.getElementById('game'),loader,save,audio,input);
    window.__KITTEN_GAME__=game;
    game.boot();

    if(save.devMode){
      const badge=document.createElement('div');
      badge.textContent='DEV MODE · Shift+1–5';
      Object.assign(badge.style,{position:'fixed',left:'14px',bottom:'12px',zIndex:'9999',padding:'7px 10px',borderRadius:'10px',font:'700 12px/1.1 system-ui,sans-serif',letterSpacing:'.04em',background:'rgba(20,24,31,.72)',color:'#fff',border:'1px solid rgba(255,255,255,.28)',backdropFilter:'blur(8px)',pointerEvents:'none'});
      document.body.appendChild(badge);
      addEventListener('keydown',e=>{
        if(!e.shiftKey)return;
        const m=e.code.match(/^Digit([1-5])$/);
        if(m){e.preventDefault();game.startLevel(Number(m[1])-1,false);}
      });
      window.__KITTEN_DEV__={enabled:true,goLevel:n=>game.startLevel(Math.max(0,Math.min(4,Number(n)-1)),false),save,game};
    }
  }).catch(err=>{cancelAnimationFrame(raf);text.textContent='Ошибка загрузки: '+err.message;console.error(err);});
})(window.KG = window.KG || {});
