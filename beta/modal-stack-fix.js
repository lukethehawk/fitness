"use strict";
(function initializeBetaModalStackFix(){
  function closeCatalog(){
    const catalog=document.querySelector("#exerciseCatalogOverlay");
    if(!catalog||catalog.hidden)return false;
    catalog.hidden=true;
    document.body.classList.remove("has-open-menu");
    document.querySelector("#openMenuButton")?.focus();
    return true;
  }

  document.addEventListener("click",event=>{
    if(event.target.closest("#openExerciseCatalogButton")){
      const menu=document.querySelector("#menuOverlay");
      if(menu&&!menu.hidden&&typeof closeMenu==="function")closeMenu();
      return;
    }
    if(event.target.closest("#closeExerciseCatalogButton")){
      event.preventDefault();
      event.stopImmediatePropagation();
      closeCatalog();
    }
  },true);

  document.addEventListener("keydown",event=>{
    if(event.key!=="Escape"||!closeCatalog())return;
    event.preventDefault();
    event.stopImmediatePropagation();
  },true);

  const style=document.createElement("style");
  style.textContent=".overlay:not([hidden]){z-index:300}";
  document.head.append(style);
})();
