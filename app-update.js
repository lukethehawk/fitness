"use strict";
(function installAppUpdates(){
  function applyNeutralExportLabels(){
    const shareButton=document.querySelector("#shareWorkoutExportButton");
    const exportHelp=document.querySelector(".workout-export-help");
    if(shareButton&&shareButton.textContent!=="Condividi")shareButton.textContent="Condividi";
    const helpText="Condividi il testo Markdown con app di note, email, cloud e altri servizi compatibili, oppure salvalo come file.";
    if(exportHelp&&exportHelp.textContent!==helpText)exportHelp.textContent=helpText;
    return Boolean(shareButton&&exportHelp);
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

  if(!("serviceWorker" in navigator))return;
  const hadController=Boolean(navigator.serviceWorker.controller);
  let refreshing=false;

  navigator.serviceWorker.addEventListener("controllerchange",()=>{
    if(!hadController||refreshing)return;
    refreshing=true;
    window.location.reload();
  });

  navigator.serviceWorker.register("./sw.js").then(registration=>{
    registration.update().catch(()=>{});
    document.addEventListener("visibilitychange",()=>{
      if(!document.hidden)registration.update().catch(()=>{});
    });
  }).catch(error=>console.warn("Aggiornamento webapp non disponibile.",error));
})();
