"use strict";
(function initializeBetaShell(){
  const BETA_VERSION="0.9";
  const VISUAL_MODE_KEY="fitness-visual-mode-v1";
  const CLEAN_MODE="clean-contrast";

  function visualMode(){return localStorage.getItem(VISUAL_MODE_KEY)||"default"}
  function applyVisualMode(){
    document.body.classList.toggle("beta-clean-contrast",visualMode()===CLEAN_MODE);
    const checkbox=document.querySelector("#betaCleanContrastToggle");
    if(checkbox)checkbox.checked=visualMode()===CLEAN_MODE;
  }
  function setVisualMode(enabled){
    if(enabled)localStorage.setItem(VISUAL_MODE_KEY,CLEAN_MODE);
    else localStorage.removeItem(VISUAL_MODE_KEY);
    applyVisualMode();
  }

  const banner=document.createElement("aside");
  banner.className="beta-banner";
  banner.setAttribute("aria-label","Versione sperimentale");
  banner.innerHTML=`<div><strong>Versione di prova</strong><span>Beta ${BETA_VERSION} · dati separati dalla webapp pubblica</span></div><button id="importProductionData" type="button">Copia i miei dati</button>`;
  document.body.prepend(banner);

  const importButton=banner.querySelector("#importProductionData");
  importButton.addEventListener("click",()=>{
    if(!window.confirm("Copiare nella beta la scheda e i dati della versione pubblica? La versione pubblica non verrà modificata."))return;
    const count=window.betaStorageSandbox.importProduction();
    window.alert(count?"Dati copiati nella beta. La pagina verrà ricaricata.":"Non sono stati trovati dati della versione pubblica su questo browser.");
    if(count)window.location.reload();
  });

  const footer=document.createElement("aside");
  footer.className="beta-footer";
  footer.innerHTML=`<span>Beta ${BETA_VERSION}</span><button id="clearBetaData" type="button">Azzera solo la beta</button><button id="openBetaChangelog" type="button">Novità beta</button><a class="beta-public-link" href="../">Torna alla versione pubblica</a>`;
  const placeFooter=()=>{const actions=document.querySelector("#workoutDayActions");if(!actions)return false;if(footer.parentElement!==actions)actions.append(footer);return true};
  if(!placeFooter()){const observer=new MutationObserver(()=>{if(placeFooter())observer.disconnect()});observer.observe(document.body,{childList:true,subtree:true})}
  footer.querySelector("#clearBetaData").addEventListener("click",()=>{if(!window.confirm("Cancellare tutti i dati salvati nella versione beta? I dati della versione pubblica resteranno invariati."))return;window.betaStorageSandbox.clearBeta();window.location.reload()});

  function injectVisualModeSetting(){
    const menu=document.querySelector(".menu-sheet");
    if(!menu||document.querySelector("#betaVisualModeSettings"))return false;
    const section=document.createElement("section");
    section.id="betaVisualModeSettings";
    section.className="beta-visual-mode-settings";
    section.innerHTML=`<div><strong>Tema alto contrasto</strong><span>Riduce gradienti, ombre e colori poco leggibili per testare una UI più pulita.</span></div><label class="beta-switch"><input id="betaCleanContrastToggle" type="checkbox"><span>Attiva</span></label>`;
    const anchor=menu.querySelector("#exerciseLanguageSettings")||menu.querySelector(".ios-shortcut-settings")||menu.querySelector(".workoutx-settings")||menu.querySelector(".data-actions");
    if(anchor)anchor.after(section);else menu.append(section);
    section.querySelector("#betaCleanContrastToggle").addEventListener("change",event=>setVisualMode(event.target.checked));
    applyVisualMode();
    return true;
  }
  if(!injectVisualModeSetting()){
    const visualObserver=new MutationObserver(()=>{if(injectVisualModeSetting())visualObserver.disconnect()});
    visualObserver.observe(document.body,{childList:true,subtree:true});
  }

  const style=document.createElement("style");
  style.textContent=`
    .beta-banner{position:sticky;z-index:120;top:0;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:max(9px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) 9px max(14px,env(safe-area-inset-left));border-bottom:1px solid rgb(255 204 102 / 35%);background:#2a2112;color:#fff3d1;box-shadow:0 6px 18px rgb(0 0 0 / 22%)}
    .beta-banner div{display:grid;gap:2px}.beta-banner strong{font-size:.78rem}.beta-banner span{color:#dccca7;font-size:.62rem;line-height:1.3}
    .beta-banner button,.beta-footer button{min-height:32px;padding:0 10px;border:1px solid rgb(255 216 133 / 38%);border-radius:9px;background:rgb(255 216 133 / 12%);color:#ffe2a0;font-size:.68rem;font-weight:850;white-space:nowrap;cursor:pointer}
    .beta-footer{grid-column:1/-1;display:flex;align-items:center;gap:8px;width:100%;padding-top:8px;color:var(--muted);font-size:.62rem}.beta-footer a{color:var(--accent);font-weight:800;text-decoration:none}.beta-footer button{min-height:27px;padding:0 7px;border-color:var(--border);background:transparent;color:var(--muted);font-size:.6rem}
    .beta-visual-mode-settings{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;margin:14px 0;padding:13px;border:1px solid var(--border);border-radius:14px;background:var(--surface-strong)}
    .beta-visual-mode-settings strong{display:block;color:var(--text);font-size:.86rem}.beta-visual-mode-settings span{display:block;color:var(--muted);font-size:.7rem;line-height:1.4}
    .beta-switch{display:flex;align-items:center;gap:8px;color:var(--text);font-size:.72rem;font-weight:850}.beta-switch input{width:22px;height:22px;accent-color:var(--accent)}

    body.beta-clean-contrast{--bg:#050806;--surface:#0d1411;--surface-strong:#101915;--surface-soft:#17221d;--text:#fbfffd;--muted:#d2ddd7;--accent:#a8f0c8;--accent-strong:#7de0aa;--accent-ink:#06120c;--border:#55645d;--shadow:none;background:var(--bg)!important;color:var(--text)}
    body.beta-clean-contrast .dashboard,
    body.beta-clean-contrast .quick-notes article,
    body.beta-clean-contrast .exercise-card,
    body.beta-clean-contrast .timer-panel,
    body.beta-clean-contrast .menu-sheet,
    body.beta-clean-contrast .catalog-sheet,
    body.beta-clean-contrast .universal-editor-sheet,
    body.beta-clean-contrast .beta-history-sheet,
    body.beta-clean-contrast .beta-changelog-sheet,
    body.beta-clean-contrast .beta-set-entry,
    body.beta-clean-contrast .beta-performed-date-panel,
    body.beta-clean-contrast .beta-history-session,
    body.beta-clean-contrast .beta-history-exercise,
    body.beta-clean-contrast .beta-progress-summary span,
    body.beta-clean-contrast .beta-progress-timeline article,
    body.beta-clean-contrast .beta-visual-mode-settings{background:var(--surface)!important;background-image:none!important;border-color:var(--border)!important;box-shadow:none!important}
    body.beta-clean-contrast .exercise-card{border-width:1.5px!important}
    body.beta-clean-contrast .primary-button{background:var(--accent)!important;color:var(--accent-ink)!important;box-shadow:none!important}
    body.beta-clean-contrast .secondary-button,
    body.beta-clean-contrast .icon-button,
    body.beta-clean-contrast .tab-button,
    body.beta-clean-contrast .timer-presets button,
    body.beta-clean-contrast .beta-set-chip,
    body.beta-clean-contrast .beta-active-complete,
    body.beta-clean-contrast .beta-card-summary{background:var(--surface-soft)!important;border:1.5px solid var(--border)!important;box-shadow:none!important;color:var(--text)!important}
    body.beta-clean-contrast .tab-button.is-active,
    body.beta-clean-contrast .timer-presets button.is-selected,
    body.beta-clean-contrast .beta-set-chip.is-active{border-color:var(--accent)!important;background:#183226!important;color:var(--text)!important}
    body.beta-clean-contrast .eyebrow,
    body.beta-clean-contrast .icon-button span:first-child,
    body.beta-clean-contrast .reps-badge,
    body.beta-clean-contrast .beta-set-chip.is-done small{color:var(--accent)!important}
    body.beta-clean-contrast input,
    body.beta-clean-contrast textarea,
    body.beta-clean-contrast select{background:#030504!important;border-color:var(--border)!important;color:var(--text)!important}
    body.beta-clean-contrast .beta-banner{background:#10130d!important;border-color:#6c735f!important;box-shadow:none!important;color:#fff6d0!important}
    body.beta-clean-contrast .overlay{background:rgb(0 0 0 / 72%)!important}
    body.beta-clean-contrast .exercise-description,
    body.beta-clean-contrast .dashboard-copy,
    body.beta-clean-contrast .quick-notes span{color:var(--muted)!important}
    body.beta-clean-contrast .workout-tabs{background:transparent!important;border-color:var(--border)!important}
    @media(max-width:460px){.beta-banner{align-items:stretch;flex-direction:column}.beta-banner button{align-self:start}.beta-footer{align-items:flex-start;flex-wrap:wrap}.beta-footer .beta-public-link{width:100%}.beta-visual-mode-settings{grid-template-columns:1fr}}
  `;
  document.head.append(style);
  applyVisualMode();

  if(!document.querySelector('script[data-beta-changelog]')){const changelog=document.createElement("script");changelog.src=`beta/changelog.js?v=${BETA_VERSION}`;changelog.dataset.betaChangelog="true";document.body.append(changelog)}
  if("serviceWorker" in navigator){const betaRoot=new URL("./",window.location.href);navigator.serviceWorker.register(new URL("sw.js",betaRoot).href,{scope:betaRoot.pathname}).catch(error=>console.warn("Modalità offline beta non disponibile.",error))}
})();
