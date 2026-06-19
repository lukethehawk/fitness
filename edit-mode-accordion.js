"use strict";
(function installEditModeAccordion(){
  const STORAGE_KEY="fitness-edit-days-open-v1";

  function isOpen(){return localStorage.getItem(STORAGE_KEY)==="1"}
  function setOpen(value){
    if(value)localStorage.setItem(STORAGE_KEY,"1");
    else localStorage.removeItem(STORAGE_KEY);
  }

  function ensureAccordion(){
    const manager=document.querySelector("#workoutDayManager");
    if(!manager||manager.dataset.accordionReady)return false;
    manager.dataset.accordionReady="true";

    const originalHeading=manager.querySelector(".workout-day-manager-heading");
    const originalList=manager.querySelector("#workoutDayManagerList");
    const title=originalHeading?.querySelector("strong")?.textContent||"Giorni di allenamento";
    const subtitle=originalHeading?.querySelector("p")?.textContent||"Aggiungi o modifica i giorni della scheda.";
    const addButton=originalHeading?.querySelector("#addWorkoutDayButton");

    const button=document.createElement("button");
    button.id="toggleWorkoutDaysAccordion";
    button.className="workout-day-accordion-toggle";
    button.type="button";
    button.setAttribute("aria-expanded",String(isOpen()));
    button.setAttribute("aria-controls","workoutDayAccordionBody");
    button.innerHTML=`<span><strong>${title}</strong><small>${subtitle}</small></span><span class="workout-day-accordion-icon" aria-hidden="true">⌄</span>`;

    const body=document.createElement("div");
    body.id="workoutDayAccordionBody";
    body.className="workout-day-accordion-body";
    body.hidden=!isOpen();

    if(originalHeading)originalHeading.remove();
    if(addButton)body.append(addButton);
    if(originalList)body.append(originalList);
    manager.prepend(button,body);

    button.addEventListener("click",()=>{
      const next=button.getAttribute("aria-expanded")!=="true";
      button.setAttribute("aria-expanded",String(next));
      body.hidden=!next;
      setOpen(next);
    });

    return true;
  }

  function closeOnEditStart(){
    const button=document.querySelector("#toggleWorkoutDaysAccordion");
    const body=document.querySelector("#workoutDayAccordionBody");
    if(!button||!body||!document.body.classList.contains("is-editing-workout"))return;
    if(localStorage.getItem(STORAGE_KEY)!=="1"){
      button.setAttribute("aria-expanded","false");
      body.hidden=true;
    }
  }

  function run(){
    const ready=ensureAccordion();
    closeOnEditStart();
    return ready;
  }

  const observer=new MutationObserver(run);
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
  run();

  const style=document.createElement("style");
  style.textContent=`
    .workout-day-manager{padding:0!important;overflow:hidden}
    .workout-day-accordion-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:14px 15px;border:0;background:transparent;color:var(--text);text-align:left;cursor:pointer}
    .workout-day-accordion-toggle strong{display:block;font-size:.9rem}
    .workout-day-accordion-toggle small{display:block;margin-top:3px;color:var(--muted);font-size:.72rem;line-height:1.35}
    .workout-day-accordion-icon{display:grid;place-items:center;flex:0 0 30px;width:30px;height:30px;border:1px solid var(--border);border-radius:999px;color:var(--accent);font-size:1rem;transition:transform .16s ease}
    .workout-day-accordion-toggle[aria-expanded="true"] .workout-day-accordion-icon{transform:rotate(180deg)}
    .workout-day-accordion-body{display:grid;gap:12px;padding:0 15px 15px}
    .workout-day-accordion-body>#addWorkoutDayButton{width:100%}
    .workout-day-accordion-body[hidden]{display:none!important}
    body.is-editing-workout .workout-day-manager{margin-bottom:10px!important}
  `;
  document.head.append(style);
})();
