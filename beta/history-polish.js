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
})();
