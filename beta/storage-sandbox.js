"use strict";
(function isolateBetaStorage(){
  const PREFIX="fitness-beta:";
  const storage=window.localStorage;
  const original={
    getItem:Storage.prototype.getItem,
    setItem:Storage.prototype.setItem,
    removeItem:Storage.prototype.removeItem,
    clear:Storage.prototype.clear,
    key:Storage.prototype.key
  };
  const scopedKey=key=>`${PREFIX}${String(key)}`;
  const isLocal=current=>current===storage;
  const betaKeys=()=>{
    const keys=[];
    for(let index=0;index<storage.length;index++){
      const key=original.key.call(storage,index);
      if(key?.startsWith(PREFIX))keys.push(key);
    }
    return keys;
  };

  Storage.prototype.getItem=function(key){
    return original.getItem.call(this,isLocal(this)?scopedKey(key):key);
  };
  Storage.prototype.setItem=function(key,value){
    return original.setItem.call(this,isLocal(this)?scopedKey(key):key,value);
  };
  Storage.prototype.removeItem=function(key){
    return original.removeItem.call(this,isLocal(this)?scopedKey(key):key);
  };
  Storage.prototype.clear=function(){
    if(!isLocal(this))return original.clear.call(this);
    betaKeys().forEach(key=>original.removeItem.call(storage,key));
  };

  window.betaStorageSandbox={
    prefix:PREFIX,
    importProduction(){
      const production=[];
      for(let index=0;index<storage.length;index++){
        const key=original.key.call(storage,index);
        if(key?.startsWith("fitness-")&&!key.startsWith(PREFIX))production.push(key);
      }
      production.forEach(key=>{
        const value=original.getItem.call(storage,key);
        if(value!==null)original.setItem.call(storage,scopedKey(key),value);
      });
      return production.length;
    },
    clearBeta(){
      const keys=betaKeys();
      keys.forEach(key=>original.removeItem.call(storage,key));
      return keys.length;
    },
    betaKeyCount(){return betaKeys().length}
  };
})();
