"use strict";
(function initializeSettingsBackup(){
  const BACKUP_KEYS=[
    "fitness-workout-progress-v1","fitness-custom-exercises-v1","fitness-active-day-v1",
    "fitness-workout-editor-v1","fitness-workout-days-v1","fitness-workout-names-v1",
    "fitness-exercise-language-v1","fitness-ios-shortcut-timer-v1","fitness-workout-sessions-v1"
  ];
  const JSON_KEYS=new Set(BACKUP_KEYS.filter(key=>!["fitness-active-day-v1","fitness-exercise-language-v1"].includes(key)));
  const SENSITIVE_KEYS=["fitness-workoutx-api-key-v1"];
  const DANGEROUS_MARKUP=/<\s*(?:script|iframe|object|embed|svg|img|style|link|meta|form|input|button)|on[a-z]+\s*=/i;

  function fileDate(){const now=new Date();return`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`}
  function collectBackup(){const data={};BACKUP_KEYS.forEach(key=>{const value=localStorage.getItem(key);if(value!==null)data[key]=value});return{format:"fitness-webapp-backup",version:1,exportedAt:new Date().toISOString(),includes:{workouts:true,settings:true,progress:true,history:true},excluded:SENSITIVE_KEYS,data}}
  function downloadBackup(){const backup=collectBackup(),blob=new Blob([JSON.stringify(backup,null,2)],{type:"application/json"}),fileName=`fitness-backup-${fileDate()}.json`,file=new File([blob],fileName,{type:"application/json"});if(navigator.canShare?.({files:[file]})){navigator.share({files:[file],title:"Backup Fitness",text:"Backup di schede, impostazioni, progressi e storico."}).catch(error=>{if(error?.name!=="AbortError")saveBlob(blob,fileName)});return}saveBlob(blob,fileName)}
  function saveBlob(blob,fileName){const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=fileName;document.body.append(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000)}
  function validBackup(backup){return backup&&backup.format==="fitness-webapp-backup"&&backup.version===1&&backup.data&&typeof backup.data==="object"&&!Array.isArray(backup.data)}
  function safeTree(value,depth=0){if(depth>12)return false;if(typeof value==="string")return value.length<=10000&&!DANGEROUS_MARKUP.test(value);if(value===null||typeof value==="number"||typeof value==="boolean")return true;if(Array.isArray(value))return value.length<=5000&&value.every(item=>safeTree(item,depth+1));if(typeof value!=="object")return false;return Object.entries(value).every(([key,item])=>!["__proto__","prototype","constructor"].includes(key)&&safeTree(item,depth+1))}
  function safeEntry(key,value){if(typeof value!=="string"||value.length>5000000||DANGEROUS_MARKUP.test(value))return false;if(!JSON_KEYS.has(key))return value.length<=100;try{return safeTree(JSON.parse(value))}catch{return false}}

  async function importBackup(file){
    if(file.size>10000000){window.alert("Il backup supera il limite di 10 MB.");return}
    let backup;try{backup=JSON.parse(await file.text())}catch{window.alert("Il file selezionato non contiene un backup JSON valido.");return}
    if(!validBackup(backup)){window.alert("Il file non è un backup compatibile con Fitness.");return}
    const candidates=Object.entries(backup.data).filter(([key])=>BACKUP_KEYS.includes(key));
    const entries=candidates.filter(([key,value])=>safeEntry(key,value));
    if(entries.length!==candidates.length){window.alert("Il backup contiene dati non validi o potenzialmente pericolosi e non è stato importato.");return}
    if(!entries.length){window.alert("Il backup non contiene schede o impostazioni da importare.");return}
    if(!window.confirm(`Importare ${entries.length} elementi dal backup?\n\nLe impostazioni corrispondenti presenti su questo dispositivo verranno sostituite. Le chiavi API non saranno modificate.`))return;
    entries.forEach(([key,value])=>localStorage.setItem(key,value));
    window.alert("Backup importato correttamente. La pagina verrà ricaricata.");window.location.reload();
  }

  function injectBackupUi(){const menu=document.querySelector(".menu-sheet"),resetActions=menu?.querySelector(".data-actions");if(!menu||!resetActions||document.querySelector("#settingsBackupSection"))return false;const section=document.createElement("section");section.id="settingsBackupSection";section.className="settings-backup-section";section.innerHTML='<div><strong>Backup e trasferimento</strong><p>Salva schede, impostazioni, progressi e storico in un file. Puoi importarlo su un altro telefono o PC. Le chiavi API restano escluse.</p></div><div class="settings-backup-actions"><button id="exportSettingsBackup" class="secondary-button" type="button">Esporta backup</button><button id="importSettingsBackup" class="secondary-button" type="button">Importa backup</button><input id="settingsBackupFile" type="file" accept="application/json,.json" hidden></div>';resetActions.before(section);const input=section.querySelector("#settingsBackupFile");section.querySelector("#exportSettingsBackup").addEventListener("click",downloadBackup);section.querySelector("#importSettingsBackup").addEventListener("click",()=>input.click());input.addEventListener("change",()=>{const file=input.files?.[0];if(file)importBackup(file);input.value=""});return true}
  const style=document.createElement("style");style.textContent='.settings-backup-section{display:grid;gap:11px;margin-top:17px;padding:14px;border:1px solid var(--border);border-radius:14px;background:var(--surface-strong)}.settings-backup-section strong{font-size:.82rem}.settings-backup-section p{margin:5px 0 0;color:var(--muted);font-size:.7rem;line-height:1.5}.settings-backup-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.settings-backup-actions button{width:100%;min-height:42px}@media(max-width:380px){.settings-backup-actions{grid-template-columns:1fr}}';document.head.append(style);
  if(!injectBackupUi()){const observer=new MutationObserver(()=>{if(injectBackupUi())observer.disconnect()});observer.observe(document.body,{childList:true,subtree:true})}
})();
