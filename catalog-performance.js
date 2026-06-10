"use strict";
(function installLightweightCatalogAdd(){
const oldButton=document.querySelector("#confirmCatalogExercise");
if(!oldButton||oldButton.dataset.lightweightAdd)return;
const button=oldButton.cloneNode(true);
button.dataset.lightweightAdd="true";
oldButton.replaceWith(button);
function releaseCatalog(){const overlay=document.querySelector("#exerciseCatalogOverlay");if(overlay)overlay.hidden=true;document.body.classList.remove("has-open-menu");document.querySelector("#catalogGrid")?.replaceChildren();filteredCatalog=[];selectedCatalogExercise=null}
function addExercise(){if(!selectedCatalogExercise)return;button.disabled=true;button.textContent="Aggiunta...";const day=document.querySelector("#catalogDay").value;const setCount=Math.max(1,Math.min(12,Number(document.querySelector("#catalogSets").value)));const reps=document.querySelector("#catalogReps").value.trim()||"8-12";const source=selectedCatalogExercise;const primaryMuscle=source.primaryMuscles?.[0]||"";const translated=translateExerciseName(source.name);const exercise={id:`custom-${Date.now()}-${Math.random().toString(16).slice(2)}`,day,name:translated,setsReps:`${setCount}x${reps}`,focus:[MUSCLE_LABELS[primaryMuscle]||primaryMuscle,EQUIPMENT_LABELS[source.equipment]||source.equipment].filter(Boolean).join(" · "),description:"Esercizio dal catalogo free-exercise-db. Apri Esercizio per immagini e istruzioni.",freeExerciseId:source.id,freeExerciseOriginalName:source.name,freeExerciseName:translated,freeExerciseEquipment:EQUIPMENT_LABELS[source.equipment]||source.equipment||"Altro",isCustom:true};customExercises.push(exercise);saveCustomExercises();const order=workoutEditorState.order[day]||[];if(!order.includes(exercise.id))workoutEditorState.order[day]=[...order,exercise.id];saveWorkoutEditorState();activeDay=day;releaseCatalog();requestAnimationFrame(()=>{renderWorkout();renderCustomExerciseList();button.textContent="Aggiungi alla scheda"})}
button.addEventListener("click",addExercise);
document.querySelector("#closeExerciseCatalogButton")?.addEventListener("click",()=>requestAnimationFrame(releaseCatalog));document.querySelector("#exerciseCatalogOverlay")?.addEventListener("click",event=>{if(event.target.id==="exerciseCatalogOverlay")requestAnimationFrame(releaseCatalog)});
})();
