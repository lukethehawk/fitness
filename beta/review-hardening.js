"use strict";
(function initializeBetaReviewHardening(){
  const CACHE_KEYS=new Set([
    "fitness-workoutx-cache-v1",
    "fitness-free-exercise-details-v1"
  ]);
  const CACHE_LIMITS={
    "fitness-workoutx-cache-v1":30,
    "fitness-free-exercise-details-v1":50
  };

  function showStorageWarning(){
    if(document.querySelector("#betaStorageWarning"))return;
    const warning=document.createElement("div");
    warning.id="betaStorageWarning";
    warning.className="beta-storage-warning";
    warning.textContent="Spazio locale quasi esaurito: alcune cache sono state alleggerite. Esporta un backup per sicurezza.";
    document.body.append(warning);
    window.setTimeout(()=>warning.remove(),7000);
  }

  function trimCacheValue(key,value){
    if(!CACHE_KEYS.has(String(key)))return value;
    try{
      const parsed=JSON.parse(value);
      if(!parsed||Array.isArray(parsed)||typeof parsed!=="object")return value;
      const limit=CACHE_LIMITS[key];
      const entries=Object.entries(parsed);
      return entries.length>limit?JSON.stringify(Object.fromEntries(entries.slice(-limit))):value;
    }catch{return value}
  }

  const setItemBeforeHardening=Storage.prototype.setItem;
  Storage.prototype.setItem=function betaSafeSetItem(key,value){
    const trimmed=trimCacheValue(String(key),String(value));
    try{return setItemBeforeHardening.call(this,key,trimmed)}
    catch(error){
      if(error?.name!=="QuotaExceededError"&&error?.name!=="NS_ERROR_DOM_QUOTA_REACHED")throw error;
      CACHE_KEYS.forEach(cacheKey=>{try{this.removeItem(cacheKey)}catch{}});
      showStorageWarning();
      try{return setItemBeforeHardening.call(this,key,trimmed)}catch{return undefined}
    }
  };

  if(typeof EQUIPMENT_LABELS!=="undefined"){
    Object.assign(EQUIPMENT_LABELS,{
      "body only":"Corpo libero",
      "exercise ball":"Fitball",
      "foam roll":"Foam roller",
      "medicine ball":"Palla medica",
      "e-z curl bar":"Bilanciere EZ"
    });
  }

  if(typeof editorExerciseLabel==="function"&&typeof applyUniversalEditorFilters==="function"){
    const labelCache=new WeakMap();
    const originalLabel=editorExerciseLabel;
    editorExerciseLabel=function cachedEditorExerciseLabel(exercise){
      const language=typeof exerciseLanguage==="function"?exerciseLanguage():"it";
      const cached=labelCache.get(exercise);
      if(cached?.language===language)return cached.label;
      const label=originalLabel(exercise);
      labelCache.set(exercise,{language,label,search:`${exercise.name} ${label}`.toLocaleLowerCase("it-IT")});
      return label;
    };
    let searchTimer=0;
    function applyFiltersImmediately(){
      const muscle=document.querySelector("#editorMuscle")?.value||"";
      const equipment=document.querySelector("#editorEquipment")?.value||"";
      const query=document.querySelector("#editorSearch")?.value.trim().toLocaleLowerCase("it-IT")||"";
      editorVisibleCount=18;
      editorFilteredExercises=exerciseCatalog.filter(exercise=>{
        const muscles=[...(exercise.primaryMuscles||[]),...(exercise.secondaryMuscles||[])];
        const label=editorExerciseLabel(exercise);
        const search=labelCache.get(exercise)?.search||`${exercise.name} ${label}`.toLocaleLowerCase("it-IT");
        return(!muscle||muscles.includes(muscle))&&(!equipment||exercise.equipment===equipment)&&(!query||search.includes(query));
      }).sort((a,b)=>editorExerciseLabel(a).localeCompare(editorExerciseLabel(b),"it"));
      renderUniversalEditorResults();
    }
    applyUniversalEditorFilters=function optimizedUniversalEditorFilters(event){
      window.clearTimeout(searchTimer);
      if(event?.type==="input"){
        searchTimer=window.setTimeout(applyFiltersImmediately,180);
        return;
      }
      applyFiltersImmediately();
    };
  }

  if(typeof buildWorkoutDayData==="function"){
    const buildDayBeforeHardening=buildWorkoutDayData;
    buildWorkoutDayData=function buildLocalizedWorkoutDayData(...args){
      const data=buildDayBeforeHardening(...args);
      data.exerciseExports=data.exerciseExports.map(item=>{
        const exercise=item.exercise;
        const canonical=exercise.customDisplayName?exercise.name:(exercise.freeExerciseOriginalName||exercise.freeExerciseName||exercise.name);
        const name=exercise.customDisplayName?exercise.name:(typeof displayExerciseName==="function"?displayExerciseName(canonical):canonical);
        const numericWeight=item.state.weight===""?"":Number(String(item.state.weight).replace(",","."));
        return{...item,name,exercise:{...exercise,name},state:{...item.state,weight:Number.isFinite(numericWeight)?numericWeight:item.state.weight}};
      });
      data.exercises=data.exerciseExports.map(item=>item.exercise);
      data.skippedExercises=data.exerciseExports.filter(item=>item.skipped);
      return data;
    };
  }

  if(typeof openExerciseCatalog==="function"){
    const openCatalogBeforeHardening=openExerciseCatalog;
    openExerciseCatalog=async function openCatalogWithoutStack(){
      if(typeof closeMenu==="function"&&!document.querySelector("#menuOverlay")?.hidden)closeMenu();
      return openCatalogBeforeHardening();
    };
  }

  const fetchBeforeHardening=window.fetch.bind(window);
  window.fetch=function betaFetchWithTimeout(input,init={}){
    const url=typeof input==="string"?input:input?.url||"";
    if(!url.includes("api.workoutxapp.com")&&!url.includes("free-exercise-db"))return fetchBeforeHardening(input,init);
    const controller=new AbortController();
    const timer=window.setTimeout(()=>controller.abort(),12000);
    let signal=controller.signal;
    if(init.signal&&typeof AbortSignal.any==="function")signal=AbortSignal.any([init.signal,controller.signal]);
    return fetchBeforeHardening(input,{...init,signal}).finally(()=>window.clearTimeout(timer));
  };

  function replaceResetButton(){
    const current=document.querySelector("#resetAllButton");
    if(!current||current.dataset.betaSafeReset)return false;
    const button=current.cloneNode(true);
    button.dataset.betaSafeReset="true";
    current.replaceWith(button);
    if(typeof elements!=="undefined")elements.resetAllButton=button;
    button.addEventListener("click",()=>{
      if(!window.confirm("Cancellare tutti i dati della beta, incluse schede, storico e impostazioni?"))return;
      const keys=new Set([
        ...Object.values(typeof STORAGE_KEYS!=="undefined"?STORAGE_KEYS:{}),
        "fitness-workout-progress-v1","fitness-custom-exercises-v1","fitness-active-day-v1",
        "fitness-workout-editor-v1","fitness-workout-days-v1","fitness-workout-names-v1",
        "fitness-exercise-language-v1","fitness-ios-shortcut-timer-v1","fitness-rest-timer-state-v1",
        "fitness-workout-sessions-v1","fitness-workoutx-api-key-v1","fitness-workoutx-cache-v1",
        "fitness-free-exercise-details-v1","fitness-free-exercise-catalog-v1"
      ]);
      keys.forEach(key=>localStorage.removeItem(key));
      window.location.reload();
    });
    return true;
  }

  if(!replaceResetButton()){
    const resetObserver=new MutationObserver(()=>{if(replaceResetButton())resetObserver.disconnect()});
    resetObserver.observe(document.body,{childList:true,subtree:true});
  }

  document.addEventListener("click",event=>{
    const button=event.target.closest("#finishBetaWorkout");
    if(!button||typeof getAllExercises!=="function"||typeof parseSetCount!=="function")return;
    let sessions;
    try{sessions=JSON.parse(localStorage.getItem("fitness-workout-sessions-v1")||"[]")}catch{return}
    const latest=sessions[0];
    if(!latest||Date.now()-new Date(latest.completedAt).getTime()<=10000)return;
    const exercises=getAllExercises(activeDay).map(exercise=>{
      const saved=progress[activeDay]?.[exercise.id]||{};
      const count=parseSetCount(exercise.setsReps);
      const details=Array.isArray(saved.setDetails)?saved.setDetails:[];
      const sets=Array.from({length:count},(_,index)=>{
        const weight=details[index]?.weight??saved.weight??"";
        const reps=details[index]?.reps??"";
        const numberValue=value=>String(value).trim()===""?"":Number(String(value).replace(",","."));
        return{number:index+1,weight:numberValue(weight),reps:numberValue(reps),completed:Boolean(details[index]?.completed??saved.sets?.[index])};
      });
      return{id:exercise.id,sets,notes:String(saved.notes||"").trim()};
    });
    const fingerprint=JSON.stringify({dayId:activeDay,exercises});
    const latestFingerprint=JSON.stringify({dayId:latest.dayId,exercises:latest.exercises.map(item=>({id:item.exerciseId,sets:item.sets,notes:item.notes}))});
    if(fingerprint!==latestFingerprint)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(!window.confirm(`Salvare un nuovo ${WORKOUTS[activeDay].title} con gli stessi valori della sessione precedente?`))return;
    sessions.unshift({...latest,id:`session-${Date.now()}-${Math.random().toString(16).slice(2,8)}`,completedAt:new Date().toISOString(),workout:{title:WORKOUTS[activeDay].title,weekday:WORKOUTS[activeDay].weekday,subtitle:WORKOUTS[activeDay].subtitle}});
    localStorage.setItem("fitness-workout-sessions-v1",JSON.stringify(sessions));
    if(window.confirm("Allenamento salvato. Vuoi azzerare ora i dati della giornata?")){
      delete progress[activeDay];
      saveProgress();
    }
    window.location.reload();
  },true);

  const style=document.createElement("style");
  style.textContent='.beta-storage-warning{position:fixed;z-index:500;right:12px;bottom:max(18px,env(safe-area-inset-bottom));left:12px;padding:12px 14px;border:1px solid rgb(255 204 102 / 40%);border-radius:12px;background:#2a2112;color:#fff3d1;box-shadow:0 12px 32px rgb(0 0 0 / 35%);font-size:.72rem;line-height:1.45}';
  document.head.append(style);
})();
