"use strict";
(function polishBetaHistory(){
  let scheduled=false;
  function removeEmptyReferences(){
    document.querySelectorAll(".beta-previous-performance").forEach(button=>{
      if(button.querySelector("strong")?.textContent.trim()==="Nessuna serie completata")button.remove();
    });
  }
  const observer=new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;removeEmptyReferences()});
  });
  observer.observe(document.body,{childList:true,subtree:true});
  removeEmptyReferences();

  [
    ["beta/set-entry-ui.js?v=1","betaSetEntry"],
    ["beta/edit-mode-ui.js?v=2","betaEditMode"],
    ["beta/settings-backup.js?v=1","betaSettingsBackup"],
    ["beta/changelog.js?v=1","betaChangelog"]
  ].forEach(([src,dataKey])=>{
    const attribute=`data-${dataKey.replace(/[A-Z]/g,letter=>`-${letter.toLowerCase()}`)}`;
    if(document.querySelector(`script[${attribute}]`))return;
    const script=document.createElement("script");
    script.src=src;
    script.dataset[dataKey]="true";
    document.body.append(script);
  });
})();
