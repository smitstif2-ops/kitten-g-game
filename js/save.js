(function(KG){
  'use strict';
  class SaveManager {
    constructor(key='kitten-g-pro-save-v1'){
      this.key=key;
      this.devKey='kitten-g-dev-mode-v1';
      this.defaults={coins:0,highestLevel:0,unlockedCostumes:['default'],equippedCostume:'default',bestScore:0,stars:[0,0,0,0,0],settings:{music:true,sfx:true,volume:0.8,reducedMotion:false}};
      this.devMode=this.resolveDevMode();
      this.data=this.load();
      this.applyDevUnlocks();
    }
    resolveDevMode(){
      try{
        const q=new URLSearchParams(location.search),flag=q.get('dev');
        if(flag==='1'){localStorage.setItem(this.devKey,'1');return true;}
        if(flag==='0'){localStorage.removeItem(this.devKey);return false;}
        return localStorage.getItem(this.devKey)==='1';
      }catch(e){return false;}
    }
    applyDevUnlocks(){
      if(!this.devMode)return;
      this.data.highestLevel=4;
    }
    setDevMode(enabled){
      this.devMode=!!enabled;
      try{if(this.devMode)localStorage.setItem(this.devKey,'1');else localStorage.removeItem(this.devKey);}catch(e){}
      if(this.devMode)this.data.highestLevel=4;
      this.commit();
    }
    load(){
      try{
        const raw=localStorage.getItem(this.key);
        const parsed=raw?JSON.parse(raw):{};
        const merged={...this.defaults,...parsed};
        merged.settings={...this.defaults.settings,...(parsed.settings||{})};
        merged.stars=Array.isArray(parsed.stars)?parsed.stars.slice(0,5):[0,0,0,0,0];
        while(merged.stars.length<5) merged.stars.push(0);
        return merged;
      }catch(e){ return JSON.parse(JSON.stringify(this.defaults)); }
    }
    commit(){ try{localStorage.setItem(this.key,JSON.stringify(this.data));}catch(e){} }
    resetProgress(){
      const settings={...this.data.settings};
      this.data=JSON.parse(JSON.stringify(this.defaults));
      this.data.settings=settings;
      this.applyDevUnlocks();
      this.commit();
    }
    unlockLevel(index){ if(index>this.data.highestLevel){this.data.highestLevel=Math.min(4,index);this.commit();} }
    addCoins(n){this.data.coins=Math.max(0,this.data.coins+n);this.commit();}
    setScore(score){if(score>this.data.bestScore){this.data.bestScore=score;this.commit();}}
    setStars(level,stars){if(stars>(this.data.stars[level]||0)){this.data.stars[level]=stars;this.commit();}}
    ownsCostume(id){return this.data.unlockedCostumes.includes(id);}
    buyCostume(id,price){if(this.ownsCostume(id))return true;if(this.data.coins<price)return false;this.data.coins-=price;this.data.unlockedCostumes.push(id);this.data.equippedCostume=id;this.commit();return true;}
    equipCostume(id){if(!this.ownsCostume(id))return false;this.data.equippedCostume=id;this.commit();return true;}
  }
  KG.SaveManager=SaveManager;
})(window.KG = window.KG || {});
