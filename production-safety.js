"use strict";
(function installProductionSafety(){
  const PRODUCTION_PREFIX="fitness-";
  const BETA_PREFIX="fitness-beta:";
  const MIGRATION_KEY=`${BETA_PREFIX}production-migration-v1`;
  const WORKOUTX_CACHE_KEY="fitness-workoutx-cache-v1";
  const CACHE_LIMITS={"fitness-workoutx-cache-v1":30};

  function storageWarning(){
    if(document.querySelector("#storagePressureWarning"))return;
    const warning=document.createElement("div");
    warning.id="storagePressureWarning";
    warning.className="storage-pressure-warning";
    warning.textContent="Spazio locale quasi esaurito: alcune cache sono state alleggerite. Esporta un backup per sicurezza.";
    document.body.append(warning);
    window.setTimeout(()=>warning.remove(),7000);
  }
  function trimObjectEntries(value,limit){
    if(!value||typeof value!=="object"||Array.isArray(value))return value;
    const entries=Object.entries(value);
    return entries.length>limit?Object.fromEntries(entries.slice(-limit)):value;
  }
  window.saveJson=function saveJson(key,value,options={}){
    const limit=options.limit||CACHE_LIMITS[key]||0;
    const prepared=limit?trimObjectEntries(value,limit):value;
    try{localStorage.setItem(key,JSON.stringify(prepared));return prepared}
    catch(error){
      if(error?.name!=="QuotaExceededError"&&error?.name!=="NS_ERROR_DOM_QUOTA_REACHED")throw error;
      localStorage.removeItem(WORKOUTX_CACHE_KEY);
      storageWarning();
      localStorage.setItem(key,JSON.stringify(prepared));
      return prepared;
    }
  };
  async function clearProductionCaches(){
    if(!("caches" in window))return;
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>!key.startsWith("fitness-beta-")&&(key.startsWith("fitness-app-")||key.startsWith("fitness-workoutx-"))).map(key=>caches.delete(key)));
  }
  async function resetProductionData(event){
    const button=event.target.closest?.("#resetAllButton");
    if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(!window.confirm("Cancellare tutti i dati della webapp, incluse schede, storico, impostazioni e cache?"))return;
    const keys=[];
    for(let index=0;index<localStorage.length;index+=1){
      const key=localStorage.key(index);
      if(key?.startsWith(PRODUCTION_PREFIX)&&!key.startsWith(BETA_PREFIX))keys.push(key);
    }
    keys.forEach(key=>localStorage.removeItem(key));
    localStorage.setItem(MIGRATION_KEY,JSON.stringify({resetAt:new Date().toISOString(),copied:0,reason:"production-reset"}));
    await clearProductionCaches();
    window.location.reload();
  }
  document.addEventListener("click",resetProductionData,true);
})();
