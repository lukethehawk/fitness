"use strict";
(function installBrandingAndLightweightCatalogAdd(){
function installBranding(){
const header=document.querySelector(".app-header"),heading=header?.querySelector("h1");
if(!header||!heading||header.querySelector(".app-brand"))return;
const copy=heading.parentElement;
copy.classList.add("app-brand-copy");
copy.querySelector(".eyebrow")?.remove();
heading.innerHTML="<span>Scheda</span> Palestra";
const logoSvg='<svg viewBox="0 0 64 64" role="img" aria-label="Logo Scheda Palestra" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="10" y1="8" x2="54" y2="58" gradientUnits="userSpaceOnUse"><stop stop-color="#9af0c1"/><stop offset="1" stop-color="#4fc58c"/></linearGradient></defs><rect width="64" height="64" rx="18" fill="#18231f"/><path d="M14 24v16m7-20v24m22-24v24m7-20v16M21 32h22" fill="none" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/><path d="m25 34 5 5 10-13" fill="none" stroke="#f4f8f6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const brand=document.createElement("div"),mark=document.createElement("span");
brand.className="app-brand";mark.className="app-brand-mark";mark.setAttribute("aria-hidden","true");mark.innerHTML=logoSvg;
header.insertBefore(brand,copy);brand.append(mark,copy);
const style=document.createElement("style");
style.textContent='.app-brand{display:flex;min-width:0;align-items:center;gap:11px}.app-brand-mark{display:block;flex:0 0 48px;width:48px;height:48px;filter:drop-shadow(0 8px 18px rgb(79 197 140 / 18%))}.app-brand-mark svg{display:block;width:100%;height:100%}.app-brand-copy{min-width:0}.app-header .app-brand h1{margin:0;font-family:ui-rounded,"SF Pro Rounded","Avenir Next",Avenir,Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:clamp(1.45rem,6.4vw,2.05rem);font-weight:850;line-height:.96;letter-spacing:-.055em;text-wrap:balance}.app-header .app-brand h1 span{display:block;color:var(--accent);font-size:.5em;font-weight:800;line-height:1.15;letter-spacing:.13em;text-transform:uppercase}.app-header{gap:12px}.app-header .icon-button{flex:0 0 auto}@media(max-width:380px){.app-brand-mark{flex-basis:43px;width:43px;height:43px}.app-header .app-brand h1{font-size:1.35rem}.app-header .icon-button{padding-inline:12px}}';
document.head.append(style);
document.title="Scheda Palestra";
let favicon=document.querySelector('link[rel="icon"]');if(!favicon){favicon=document.createElement("link");favicon.rel="icon";document.head.append(favicon)}favicon.type="image/svg+xml";favicon.href=`data:image/svg+xml,${encodeURIComponent(logoSvg)}`;
}
installBranding();
const oldButton=document.querySelector("#confirmCatalogExercise");
if(!oldButton||oldButton.dataset.lightweightAdd)return;
const button=oldButton.cloneNode(true);
button.dataset.lightweightAdd="true";
oldButton.replaceWith(button);
function releaseCatalog(){const overlay=document.querySelector("#exerciseCatalogOverlay");if(overlay)overlay.hidden=true;document.body.classList.remove("has-open-menu");document.querySelector("#catalogGrid")?.replaceChildren();filteredCatalog=[];selectedCatalogExercise=null}
function addExercise(){if(!selectedCatalogExercise)return;button.disabled=true;button.textContent="Aggiunta...";const day=document.querySelector("#catalogDay").value;const setCount=Math.max(1,Math.min(12,Number(document.querySelector("#catalogSets").value)));const reps=document.querySelector("#catalogReps").value.trim()||"8-12";const source=selectedCatalogExercise;const primaryMuscle=source.primaryMuscles?.[0]||"";const translated=translateExerciseName(source.name);const exercise={id:`custom-${Date.now()}-${Math.random().toString(16).slice(2)}`,day,name:translated,setsReps:`${setCount}x${reps}`,focus:[MUSCLE_LABELS[primaryMuscle]||primaryMuscle,EQUIPMENT_LABELS[source.equipment]||source.equipment].filter(Boolean).join(" · "),description:"Esercizio dal catalogo free-exercise-db. Apri Esercizio per immagini e istruzioni.",freeExerciseId:source.id,freeExerciseOriginalName:source.name,freeExerciseName:translated,freeExerciseEquipment:EQUIPMENT_LABELS[source.equipment]||source.equipment||"Altro",isCustom:true};customExercises.push(exercise);saveCustomExercises();const saved=workoutEditorState.order[day]||[];const known=new Set(saved);workoutEditorState.order[day]=[...saved,...getAllExercises(day).map(item=>item.id).filter(id=>!known.has(id))];saveWorkoutEditorState();activeDay=day;releaseCatalog();requestAnimationFrame(()=>{renderWorkout();renderCustomExerciseList();button.textContent="Aggiungi alla scheda";button.disabled=false})}
button.addEventListener("click",addExercise);
document.querySelector("#closeExerciseCatalogButton")?.addEventListener("click",()=>requestAnimationFrame(releaseCatalog));document.querySelector("#exerciseCatalogOverlay")?.addEventListener("click",event=>{if(event.target.id==="exerciseCatalogOverlay")requestAnimationFrame(releaseCatalog)});
})();
