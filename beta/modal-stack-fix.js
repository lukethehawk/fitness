"use strict";
(function initializeBetaModalStackFix(){
  document.addEventListener("click",event=>{
    if(!event.target.closest("#openExerciseCatalogButton"))return;
    const menu=document.querySelector("#menuOverlay");
    if(menu&&!menu.hidden&&typeof closeMenu==="function")closeMenu();
  },true);
})();
