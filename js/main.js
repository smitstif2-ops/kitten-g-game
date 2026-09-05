(function(KG){
  'use strict';
  const loader=new KG.AssetLoader('./assets/');
  const progress=document.getElementById('loading-progress');
  const text=document.getElementById('loading-text');
  let raf;
  const animate=()=>{progress.style.width=Math.round(loader.progress*100)+'%';text.textContent=`Загрузка пластилинового мира… ${Math.round(loader.progress*100)}%`;raf=requestAnimationFrame(animate);};animate();
  loader.load().then(()=>{cancelAnimationFrame(raf);progress.style.width='100%';text.textContent='Готово';const save=new KG.SaveManager();const audio=new KG.AudioManager(save);const input=new KG.InputManager();const game=new KG.Game(document.getElementById('game'),loader,save,audio,input);window.__KITTEN_GAME__=game;game.boot();}).catch(err=>{cancelAnimationFrame(raf);text.textContent='Ошибка загрузки: '+err.message;console.error(err);});
})(window.KG = window.KG || {});
