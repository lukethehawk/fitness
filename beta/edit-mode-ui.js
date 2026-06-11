"use strict";
(function initializeBetaEditModeUi(){
  let scheduled=false;

  function cleanEditControls(){
    document.querySelectorAll("#exerciseList .exercise-card").forEach(card=>{
      const controlGroups=[...card.querySelectorAll(":scope > .exercise-edit-controls")];
      controlGroups.slice(1).forEach(group=>group.remove());
      const controls=controlGroups[0];
      if(!controls)return;
      [...controls.querySelectorAll(".exercise-remove-preset")].slice(1)
        .forEach(button=>button.remove());
      const remove=controls.querySelector(".exercise-remove-preset");
      if(remove){
        remove.textContent="Rimuovi";
        remove.setAttribute("aria-label",`Rimuovi ${card.querySelector(".exercise-name")?.textContent||"esercizio"}`);
      }
      const edit=controls.querySelector(".edit-exercise-button");
      if(edit)edit.setAttribute("aria-label",`Modifica ${card.querySelector(".exercise-name")?.textContent||"esercizio"}`);
    });
  }

  function refresh(){
    cleanEditControls();
    const editing=document.body.classList.contains("is-editing-workout");
    document.querySelector("#exerciseList")?.setAttribute("aria-label",editing?"Riordina e modifica gli esercizi":"Esercizi allenamento");
  }

  const observer=new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;refresh()});
  });
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});

  const style=document.createElement("style");
  style.textContent=`
    body.is-editing-workout .quick-notes{display:none!important}
    body.is-editing-workout .workout-heading{margin-bottom:10px}
    body.is-editing-workout #exerciseList{position:relative;gap:7px;padding-top:34px}
    body.is-editing-workout #exerciseList::before{
      content:"Esercizi · trascina per cambiare ordine";
      position:absolute;top:4px;left:2px;color:var(--muted);font-size:.66rem;font-weight:750
    }
    body.is-editing-workout .exercise-card{
      display:grid!important;grid-template-columns:minmax(0,1fr);gap:0!important;
      min-height:0!important;padding:10px 11px!important;border-radius:12px!important;
      background:var(--surface)!important
    }
    body.is-editing-workout .exercise-card-header{min-width:0;margin:0!important;padding:0!important;border:0!important}
    body.is-editing-workout .exercise-card-header>div:first-child{min-width:0}
    body.is-editing-workout .exercise-number,
    body.is-editing-workout .exercise-card-actions,
    body.is-editing-workout .exercise-focus,
    body.is-editing-workout .exercise-description,
    body.is-editing-workout .exercise-fields,
    body.is-editing-workout .beta-set-tracker,
    body.is-editing-workout .beta-previous-performance,
    body.is-editing-workout .notes-field,
    body.is-editing-workout .delete-custom-button,
    body.is-editing-workout .exercise-guide-button{display:none!important}
    body.is-editing-workout .exercise-name{
      margin:0!important;font-size:.92rem!important;line-height:1.2!important;
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap
    }
    body.is-editing-workout .reps-badge{display:block!important;padding:4px 7px!important;font-size:.62rem!important}
    body.is-editing-workout .exercise-edit-controls{
      display:flex!important;align-items:center!important;justify-content:space-between!important;
      gap:8px!important;margin:8px 0 0!important;padding:8px 0 0!important;
      border-top:1px solid var(--border)!important
    }
    body.is-editing-workout .exercise-series-editor,
    body.is-editing-workout .exercise-order-editor{display:flex;align-items:center;gap:5px;min-width:0}
    body.is-editing-workout .exercise-series-editor span{min-width:42px!important;font-size:.64rem!important}
    body.is-editing-workout .exercise-edit-controls button{
      min-width:32px!important;min-height:32px!important;padding:0 8px!important;
      border-radius:8px!important;font-size:.68rem!important
    }
    body.is-editing-workout .exercise-drag-handle{
      order:-1;min-width:38px!important;padding:0!important;font-size:1rem!important
    }
    body.is-editing-workout .edit-exercise-button{margin:0!important;color:var(--accent)!important}
    body.is-editing-workout .exercise-remove-preset{
      min-width:auto!important;border-color:rgb(255 142 142 / 28%)!important;
      background:transparent!important;color:var(--danger)!important
    }
    body.is-editing-workout .timer-launcher{opacity:.35;pointer-events:none}
    @media(max-width:430px){
      body.is-editing-workout .exercise-edit-controls{flex-direction:row!important}
      body.is-editing-workout .exercise-order-editor{width:auto!important;margin-left:auto!important}
      body.is-editing-workout .exercise-edit-controls button{padding:0 7px!important}
      body.is-editing-workout .exercise-remove-preset{font-size:0!important;width:34px!important;padding:0!important}
      body.is-editing-workout .exercise-remove-preset::after{content:"×";font-size:1rem;font-weight:900}
    }
  `;
  document.head.append(style);
  refresh();
})();
