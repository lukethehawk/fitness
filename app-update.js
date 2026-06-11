"use strict";
(function installAppUpdates(){
  const APP_VERSION="1.0.36";
  let pendingWorker=null;
  let refreshing=false;

  function applyNeutralExportLabels(){
    const shareButton=document.querySelector("#shareWorkoutExportButton");
    const exportHelp=document.querySelector(".workout-export-help");
    if(shareButton&&shareButton.textContent!=="Condividi")shareButton.textContent="Condividi";
    const helpText="Condividi il testo Markdown con app di note, email, cloud e altri servizi compatibili, oppure salvalo come file.";
    if(exportHelp&&exportHelp.textContent!==helpText)exportHelp.textContent=helpText;
    return Boolean(shareButton&&exportHelp);
  }

  function injectVersionUi(){
    if(document.querySelector("#appVersionControl"))return;
    const control=document.createElement("aside");
    control.id="appVersionControl";
    control.className="app-version-control";
    control.setAttribute("aria-label","Versione webapp");
    control.innerHTML=`<span>v${APP_VERSION}</span><button id="applyAppUpdate" type="button" hidden>Aggiorna</button>`;
    document.body.append(control);
    control.querySelector("button").addEventListener("click",applyPendingUpdate);
    const style=document.createElement("style");
    style.textContent='.app-version-control{position:fixed;z-index:18;bottom:max(7px,env(safe-area-inset-bottom));left:max(9px,env(safe-area-inset-left));display:flex;align-items:center;gap:6px;padding:4px 7px;border:1px solid rgb(43 57 52 / 72%);border-radius:999px;background:rgb(11 16 15 / 82%);color:#718079;font-size:.58rem;font-weight:750;line-height:1;box-shadow:0 5px 16px rgb(0 0 0 / 18%);backdrop-filter:blur(10px)}.app-version-control button{min-height:24px;padding:0 8px;border:0;border-radius:999px;background:var(--accent);color:var(--accent-ink);font-size:.62rem;font-weight:850;cursor:pointer}.app-version-control button[hidden]{display:none}.app-version-control.is-updating{color:var(--accent)}';
    document.head.append(style);
  }

  function showUpdate(worker){
    if(!worker)return;
    pendingWorker=worker;
    const button=document.querySelector("#applyAppUpdate");
    if(button){button.hidden=false;button.disabled=false;button.textContent="Aggiorna"}
  }

  function applyPendingUpdate(){
    const button=document.querySelector("#applyAppUpdate");
    if(!pendingWorker||!button)return;
    button.disabled=true;
    button.textContent="Aggiornamento...";
    document.querySelector("#appVersionControl")?.classList.add("is-updating");
    pendingWorker.postMessage({type:"APPLY_UPDATE"});
  }

  if(!applyNeutralExportLabels()){
    let pendingLabelUpdate=false;
    const labelObserver=new MutationObserver(()=>{
      if(pendingLabelUpdate)return;
      pendingLabelUpdate=true;
      requestAnimationFrame(()=>{
        pendingLabelUpdate=false;
        if(applyNeutralExportLabels())labelObserver.disconnect();
      });
    });
    labelObserver.observe(document.body,{childList:true,subtree:true});
  }

  injectVersionUi();
  if(!("serviceWorker" in navigator))return;

  navigator.serviceWorker.addEventListener("controllerchange",()=>{
    if(refreshing)return;
    refreshing=true;
    window.location.reload();
  });

  navigator.serviceWorker.register("./sw.js").then(registration=>{
    if(registration.waiting)showUpdate(registration.waiting);
    registration.addEventListener("updatefound",()=>{
      const worker=registration.installing;
      if(!worker)return;
      worker.addEventListener("statechange",()=>{
        if(worker.state==="installed"&&navigator.serviceWorker.controller)showUpdate(worker);
      });
    });
    registration.update().catch(()=>{});
    document.addEventListener("visibilitychange",()=>{
      if(!document.hidden)registration.update().catch(()=>{});
    });
  }).catch(error=>console.warn("Aggiornamento webapp non disponibile.",error));
})();
