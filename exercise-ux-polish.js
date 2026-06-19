"use strict";
(function installExerciseUxPolish(){
  const PLACEHOLDER_DESCRIPTIONS=new Set([
    "Esercizio dal catalogo free-exercise-db. Apri Esercizio per immagini e istruzioni.",
    "Esercizio collegato a free-exercise-db. Apri Esercizio per immagini e istruzioni.",
    "Variante dal catalogo free-exercise-db. Apri Esercizi per immagini e istruzioni.",
    "Variante selezionata: . Apri Esercizi per immagini e istruzioni.",
    "Scegli la variante più adatta dalla raccolta Esercizi.",
    "Aggiungi le tue indicazioni nelle note."
  ]);

  function isPlaceholderDescription(value){
    return !String(value||"").trim()||PLACEHOLDER_DESCRIPTIONS.has(String(value).trim())||String(value).includes("free-exercise-db. Apri");
  }
  function cleanDescription(value){return isPlaceholderDescription(value)?"":String(value||"").trim()}

  function cleanStoredCustomDescriptions(){
    if(!Array.isArray(customExercises))return;
    let changed=false;
    customExercises.forEach(exercise=>{
      if(exercise&&isPlaceholderDescription(exercise.description)){exercise.description="";changed=true}
    });
    if(changed&&typeof saveCustomExercises==="function")saveCustomExercises();
  }

  function ensureInstructionField(exercise){
    const fields=document.querySelector(".universal-editor-fields");
    if(!fields)return null;
    let label=fields.querySelector("#editorExecutionInstructions")?.closest("label");
    if(!label){
      label=document.createElement("label");
      label.className="editor-instruction-field";
      label.textContent="Istruzioni di esecuzione";
      const textarea=document.createElement("textarea");
      textarea.id="editorExecutionInstructions";
      textarea.rows=3;
      textarea.maxLength=360;
      textarea.placeholder="Es. gomiti fermi, movimento controllato, fermo in chiusura...";
      label.append(textarea);
      fields.append(label);
    }
    const textarea=label.querySelector("textarea");
    if(exercise)textarea.value=cleanDescription(exercise.description);
    return textarea;
  }

  function installEditorHooks(){
    if(window.__exerciseUxEditorHooksInstalled||typeof openExerciseEditor!=="function"||typeof saveUniversalExercise!=="function")return false;
    window.__exerciseUxEditorHooksInstalled=true;
    const openBefore=openExerciseEditor;
    openExerciseEditor=async function openExerciseEditorWithInstructions(exercise){
      const result=await openBefore(exercise);
      const current=typeof getAllExercises==="function"?getAllExercises(activeDay).find(item=>item.id===exercise.id)||exercise:exercise;
      ensureInstructionField(current);
      return result;
    };
    const saveBefore=saveUniversalExercise;
    saveUniversalExercise=function saveExerciseWithInstructions(){
      const id=typeof editingExerciseId!=="undefined"?editingExerciseId:"";
      const textarea=document.querySelector("#editorExecutionInstructions");
      const instructions=textarea?textarea.value.trim():"";
      saveBefore();
      if(!id||typeof workoutEditorState==="undefined"||typeof saveWorkoutEditorState!=="function")return;
      workoutEditorState.overrides=workoutEditorState.overrides||{};
      workoutEditorState.overrides[id]={...(workoutEditorState.overrides[id]||{}),description:instructions};
      saveWorkoutEditorState();
      if(typeof renderWorkout==="function")renderWorkout();
    };
    return true;
  }

  function removeCustomFromEdit(exercise){
    if(typeof removeCustomExercise!=="function")return;
    removeCustomExercise(exercise.id);
  }

  function addUnifiedRemoveControl(card,exercise){
    const legacy=card.querySelector(".delete-custom-button");
    if(legacy)legacy.hidden=true;
    if(!exercise?.isCustom)return;
    const controls=card.querySelector(".exercise-edit-controls");
    if(!controls||controls.querySelector(".exercise-remove-custom"))return;
    const remove=document.createElement("button");
    remove.type="button";
    remove.className="exercise-remove-preset exercise-remove-custom danger-text";
    remove.setAttribute("aria-label",`Rimuovi ${exercise.name||"esercizio"}`);
    remove.innerHTML='<span class="beta-remove-label">Rimuovi</span><span class="beta-remove-icon" aria-hidden="true">×</span>';
    remove.addEventListener("click",()=>removeCustomFromEdit(exercise));
    controls.append(remove);
  }

  function polishCardDescription(card,exercise){
    const description=card.querySelector(".exercise-description");
    if(!description)return;
    if(isPlaceholderDescription(exercise?.description)||isPlaceholderDescription(description.textContent)){
      description.textContent="";
      description.hidden=true;
    }else{
      description.hidden=false;
    }
  }

  function installCardHook(){
    if(window.__exerciseUxCardHookInstalled||typeof createExerciseCard!=="function")return false;
    window.__exerciseUxCardHookInstalled=true;
    const createBefore=createExerciseCard;
    createExerciseCard=function createPolishedExerciseCard(exercise,index){
      const card=createBefore(exercise,index);
      polishCardDescription(card,exercise);
      addUnifiedRemoveControl(card,exercise);
      return card;
    };
    return true;
  }

  function installStyles(){
    if(document.querySelector("#exerciseUxPolishStyles"))return;
    const style=document.createElement("style");
    style.id="exerciseUxPolishStyles";
    style.textContent=`
      .delete-custom-button,.delete-custom-list-button{display:none!important}
      .editor-instruction-field{grid-column:1/-1;display:grid;gap:6px;color:var(--muted);font-size:.75rem;font-weight:750}
      .editor-instruction-field textarea{width:100%;min-height:92px;margin-top:5px;padding:9px 11px;border:1px solid var(--border);border-radius:11px;background:var(--bg);color:var(--text);resize:vertical}
      body.is-editing-workout .exercise-remove-custom{display:inline-flex!important;align-items:center;justify-content:center}
    `;
    document.head.append(style);
  }

  function run(){
    installStyles();
    cleanStoredCustomDescriptions();
    const ready=installEditorHooks()&&installCardHook();
    if(ready&&typeof renderWorkout==="function")renderWorkout();
    return ready;
  }

  if(!run()){
    const observer=new MutationObserver(()=>{if(run())observer.disconnect()});
    observer.observe(document.body,{childList:true,subtree:true});
    window.setTimeout(()=>observer.disconnect(),8000);
  }
})();
