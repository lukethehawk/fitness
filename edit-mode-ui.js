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
        const exerciseName=card.querySelector(".exercise-name")?.textContent||"esercizio";
        remove.setAttribute("aria-label",`Rimuovi ${exerciseName}`);
        if(!remove.classList.contains("beta-remove-ready")){
          remove.classList.add("beta-remove-ready");
          const label=document.createElement("span");
          label.className="beta-remove-label";
          label.textContent="Rimuovi";
          const icon=document.createElement("span");
          icon.className="beta-remove-icon";
          icon.setAttribute("aria-hidden","true");
          icon.textContent="×";
          remove.replaceChildren(label,icon);
        }
      }
      const edit=controls.querySelector(".edit-exercise-button");
      if(edit)edit.setAttribute("aria-label",`Modifica ${card.querySelector(".exercise-name")?.textContent||"esercizio"}`);
    });
  }

  function currentEditingExercise(){
    if(typeof editingExerciseId==="undefined"||!editingExerciseId||typeof getAllExercises!=="function")return null;
    return getAllExercises(activeDay).find(exercise=>exercise.id===editingExerciseId)||null;
  }

  function ensureBetaExerciseFields(){
    const fields=document.querySelector(".universal-editor-fields");
    if(!fields)return null;
    let extra=fields.querySelector(".beta-editor-extra-fields");
    if(extra)return extra;
    extra=document.createElement("section");
    extra.className="beta-editor-extra-fields";
    extra.innerHTML=`
      <div class="beta-editor-extra-heading"><strong>Valori base beta</strong><span>Usati per precompilare una nuova sessione.</span></div>
      <div class="beta-editor-extra-grid">
        <label>Peso base<input id="betaEditorBaseWeight" type="number" min="0" step="0.5" inputmode="decimal" placeholder="kg"></label>
        <label>Ripetizioni base<input id="betaEditorBaseReps" type="number" min="0" step="1" inputmode="numeric" placeholder="rep"></label>
      </div>
      <label>Recupero automatico<select id="betaEditorRestPreset"><option value="0">No, non avviare timer</option><option value="60">60 secondi</option><option value="90">90 secondi</option><option value="120">120 secondi</option><option value="180">180 secondi</option><option value="custom">Personalizzato</option></select></label>
      <label id="betaEditorCustomRestLabel" hidden>Secondi recupero<input id="betaEditorCustomRest" type="number" min="10" max="900" step="5" inputmode="numeric" placeholder="secondi"></label>
      <label>Note base<textarea id="betaEditorBaseNotes" rows="3" placeholder="Note che vuoi ritrovare gia pronte in una nuova sessione"></textarea></label>
    `;
    fields.append(extra);
    const restPreset=extra.querySelector("#betaEditorRestPreset");
    const customLabel=extra.querySelector("#betaEditorCustomRestLabel");
    restPreset.addEventListener("change",()=>{
      customLabel.hidden=restPreset.value!=="custom";
    });
    const saveButton=document.querySelector("#saveUniversalExercise");
    if(saveButton&&!saveButton.dataset.betaExtraSave){
      saveButton.dataset.betaExtraSave="true";
      saveButton.addEventListener("click",event=>{
        event.preventDefault();
        event.stopImmediatePropagation();
        if(typeof saveUniversalExercise==="function")saveUniversalExercise();
      },true);
    }
    return extra;
  }

  function populateBetaExerciseFields(exercise=currentEditingExercise()){
    const extra=ensureBetaExerciseFields();
    if(!extra||!exercise)return;
    const base=Array.isArray(exercise.baseSetDetails)?exercise.baseSetDetails:[];
    const firstBase=base.find(item=>item?.weight||item?.reps)||base[0]||{};
    extra.querySelector("#betaEditorBaseWeight").value=firstBase.weight||"";
    extra.querySelector("#betaEditorBaseReps").value=firstBase.reps||"";
    extra.querySelector("#betaEditorBaseNotes").value=exercise.baseNotes||"";

    const rest=Number(exercise.restSeconds||0);
    const restPreset=extra.querySelector("#betaEditorRestPreset");
    const customLabel=extra.querySelector("#betaEditorCustomRestLabel");
    const customInput=extra.querySelector("#betaEditorCustomRest");
    if([60,90,120,180].includes(rest)){
      restPreset.value=String(rest);
      customInput.value="";
      customLabel.hidden=true;
    }else if(rest>0){
      restPreset.value="custom";
      customInput.value=String(rest);
      customLabel.hidden=false;
    }else{
      restPreset.value="0";
      customInput.value="";
      customLabel.hidden=true;
    }
  }

  function readBetaExerciseFields(setCount){
    const extra=ensureBetaExerciseFields();
    if(!extra)return{};
    const weight=extra.querySelector("#betaEditorBaseWeight")?.value?.trim()||"";
    const reps=extra.querySelector("#betaEditorBaseReps")?.value?.trim()||"";
    const notes=extra.querySelector("#betaEditorBaseNotes")?.value?.trim()||"";
    const restPreset=extra.querySelector("#betaEditorRestPreset")?.value||"0";
    const customRest=Number(extra.querySelector("#betaEditorCustomRest")?.value||0);
    const restSeconds=restPreset==="custom"?Math.max(0,customRest):Number(restPreset||0);
    const count=Math.max(1,Math.min(12,Number(setCount)||1));
    return{
      baseSetDetails:weight||reps?Array.from({length:count},()=>({weight,reps})):[],
      baseNotes:notes,
      restSeconds:Number.isFinite(restSeconds)?restSeconds:0,
    };
  }

  function installBetaExerciseEditorExtras(){
    if(window.__betaExerciseEditorExtrasInstalled)return;
    if(typeof openExerciseEditor!=="function"||typeof saveUniversalExercise!=="function")return;
    window.__betaExerciseEditorExtrasInstalled=true;

    const openBeforeBeta=openExerciseEditor;
    openExerciseEditor=async function openBetaExerciseEditor(exercise){
      const result=await openBeforeBeta(exercise);
      populateBetaExerciseFields(exercise);
      return result;
    };

    const saveBeforeBeta=saveUniversalExercise;
    saveUniversalExercise=function saveBetaUniversalExercise(){
      const id=typeof editingExerciseId!=="undefined"?editingExerciseId:"";
      const setCount=document.querySelector("#editorSetCount")?.value||1;
      const extra=readBetaExerciseFields(setCount);
      saveBeforeBeta();
      if(!id||typeof workoutEditorState==="undefined"||typeof saveWorkoutEditorState!=="function")return;
      workoutEditorState.overrides=workoutEditorState.overrides||{};
      workoutEditorState.overrides[id]={...(workoutEditorState.overrides[id]||{}),...extra};
      saveWorkoutEditorState();
      if(typeof renderWorkout==="function")renderWorkout();
    };

    ensureBetaExerciseFields();
  }

  function refresh(){
    cleanEditControls();
    installBetaExerciseEditorExtras();
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
      display:inline-flex!important;align-items:center;justify-content:center;overflow:hidden;
      min-width:auto!important;border-color:rgb(255 142 142 / 28%)!important;
      background:transparent!important;color:var(--danger)!important
    }
    .beta-remove-icon{display:none}
    body.is-editing-workout .timer-launcher{opacity:.35;pointer-events:none}
    .beta-editor-extra-fields{grid-column:1/-1;display:grid;gap:10px;margin-top:4px;padding-top:12px;border-top:1px solid var(--border)}
    .beta-editor-extra-heading{display:grid;gap:2px}.beta-editor-extra-heading strong{color:var(--accent);font-size:.82rem}.beta-editor-extra-heading span{color:var(--muted);font-size:.68rem}
    .beta-editor-extra-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
    .beta-editor-extra-fields textarea{width:100%;min-height:78px;margin-top:5px;padding:8px 11px;border:1px solid var(--border);border-radius:11px;background:var(--bg);color:var(--text);resize:vertical}
    @media(max-width:640px){.universal-editor-fields input,.universal-editor-fields select,.universal-editor-fields textarea,.universal-editor-filters input,.universal-editor-filters select{font-size:16px!important}}
    @media(max-width:430px){
      body.is-editing-workout .exercise-edit-controls{flex-direction:row!important}
      body.is-editing-workout .exercise-order-editor{width:auto!important;margin-left:auto!important}
      body.is-editing-workout .exercise-edit-controls button{padding:0 7px!important}
      body.is-editing-workout .exercise-remove-preset{flex:0 0 34px;width:34px!important;min-width:34px!important;padding:0!important}
      body.is-editing-workout .exercise-remove-preset .beta-remove-label{display:none!important}
      body.is-editing-workout .exercise-remove-preset .beta-remove-icon{display:block!important;font-size:1rem;font-weight:900;line-height:1}
      .beta-editor-extra-grid{grid-template-columns:1fr}
    }
  `;
  document.head.append(style);
  refresh();
})();
