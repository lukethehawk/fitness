"use strict";
(function installAppUpdates(){
  const APP_VERSION="1.0.41";
  let pendingWorker=null;
  let refreshing=false;
  let updateNoticeShown=false;
  let noticeTimer=null;

  function applyNeutralExportLabels(){
    const shareButton=document.querySelector("#shareWorkoutExportButton");
    const exportHelp=document.querySelector(".workout-export-help");
    if(shareButton&&shareButton.textContent!=="Condividi")shareButton.textContent="Condividi";
    const helpText="Condividi il testo Markdown con app di note, email, cloud e altri servizi compatibili, oppure salvalo come file.";
    if(exportHelp&&exportHelp.textContent!==helpText)exportHelp.textContent=helpText;
    return Boolean(shareButton&&exportHelp);
  }

  function placeVersionUi(control){
    const footer=document.querySelector("#workoutDayActions");
    if(!footer)return false;
    if(control.parentElement!==footer)footer.append(control);
    return true;
  }

  function injectVersionUi(){
    if(document.querySelector("#appVersionControl"))return;
    const control=document.createElement("aside");
    control.id="appVersionControl";
    control.className="app-version-control";
    control.setAttribute("aria-label","Versione webapp");
    control.innerHTML=`<span>v${APP_VERSION}</span><button id="applyAppUpdate" type="button" hidden>Aggiorna</button>`;
    (document.querySelector("main")||document.body).append(control);
    control.querySelector("button").addEventListener("click",applyPendingUpdate);

    if(!placeVersionUi(control)){
      const placementObserver=new MutationObserver(()=>{
        if(placeVersionUi(control))placementObserver.disconnect();
      });
      placementObserver.observe(document.body,{childList:true,subtree:true});
    }

    const notice=document.createElement("div");
    notice.id="appUpdateNotice";
    notice.className="app-update-notice";
    notice.setAttribute("role","status");
    notice.setAttribute("aria-live","polite");
    notice.textContent="Nuova versione disponibile. Aggiorna dal fondo della pagina.";
    document.body.append(notice);

    const style=document.createElement("style");
    style.textContent='.app-version-control{grid-column:1/-1;justify-self:start;display:flex;align-items:center;gap:6px;margin-top:2px;padding:3px 1px;color:#718079;font-size:.58rem;font-weight:750;line-height:1}.app-version-control button{min-height:25px;padding:0 9px;border:0;border-radius:999px;background:var(--accent);color:var(--accent-ink);font-size:.62rem;font-weight:850;cursor:pointer}.app-version-control button[hidden]{display:none}.app-version-control.is-updating{color:var(--accent)}.app-update-notice{position:fixed;z-index:190;top:max(12px,env(safe-area-inset-top));left:50%;width:max-content;max-width:calc(100vw - 28px);padding:10px 14px;border:1px solid rgb(112 229 177 / 38%);border-radius:12px;background:#17231f;color:var(--text);font-size:.72rem;font-weight:750;line-height:1.35;text-align:center;box-shadow:0 10px 28px rgb(0 0 0 / 32%);opacity:0;pointer-events:none;transform:translate(-50%,-14px);transition:opacity .2s ease,transform .2s ease}.app-update-notice.is-visible{opacity:1;transform:translate(-50%,0)}';
    document.head.append(style);
  }

  function showUpdateNotice(){
    if(updateNoticeShown)return;
    updateNoticeShown=true;
    const notice=document.querySelector("#appUpdateNotice");
    if(!notice)return;
    notice.classList.add("is-visible");
    clearTimeout(noticeTimer);
    noticeTimer=setTimeout(()=>notice.classList.remove("is-visible"),4200);
  }

  function showUpdate(worker){
    if(!worker)return;
    pendingWorker=worker;
    const button=document.querySelector("#applyAppUpdate");
    if(button){button.hidden=false;button.disabled=false;button.textContent="Aggiorna"}
    showUpdateNotice();
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
