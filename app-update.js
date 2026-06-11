"use strict";
(function installAppUpdates(){
  const shareButton=document.querySelector("#shareWorkoutExportButton");
  if(shareButton)shareButton.textContent="Condividi";

  const exportHelp=document.querySelector(".workout-export-help");
  if(exportHelp){
    exportHelp.textContent="Condividi il testo Markdown con app di note, email, cloud e altri servizi compatibili, oppure salvalo come file.";
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
