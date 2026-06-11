"use strict";
(function initializeBetaShell(){
  const BETA_VERSION="0.1";
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
  footer.innerHTML=`<span>Beta ${BETA_VERSION}</span><button id="clearBetaData" type="button">Azzera solo la beta</button><a href="../">Torna alla versione pubblica</a>`;
  const placeFooter=()=>{
    const actions=document.querySelector("#workoutDayActions");
    if(!actions)return false;
    if(footer.parentElement!==actions)actions.append(footer);
    return true;
  };
  if(!placeFooter()){
    const observer=new MutationObserver(()=>{if(placeFooter())observer.disconnect()});
    observer.observe(document.body,{childList:true,subtree:true});
  }
  footer.querySelector("#clearBetaData").addEventListener("click",()=>{
    if(!window.confirm("Cancellare tutti i dati salvati nella versione beta? I dati della versione pubblica resteranno invariati."))return;
    window.betaStorageSandbox.clearBeta();
    window.location.reload();
  });

  const style=document.createElement("style");
  style.textContent='.beta-banner{position:sticky;z-index:120;top:0;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:max(9px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) 9px max(14px,env(safe-area-inset-left));border-bottom:1px solid rgb(255 204 102 / 35%);background:#2a2112;color:#fff3d1;box-shadow:0 6px 18px rgb(0 0 0 / 22%)}.beta-banner div{display:grid;gap:2px}.beta-banner strong{font-size:.78rem}.beta-banner span{color:#dccca7;font-size:.62rem;line-height:1.3}.beta-banner button,.beta-footer button{min-height:32px;padding:0 10px;border:1px solid rgb(255 216 133 / 38%);border-radius:9px;background:rgb(255 216 133 / 12%);color:#ffe2a0;font-size:.68rem;font-weight:850;white-space:nowrap;cursor:pointer}.beta-footer{grid-column:1/-1;display:flex;align-items:center;gap:10px;width:100%;padding-top:8px;color:var(--muted);font-size:.62rem}.beta-footer a{margin-left:auto;color:var(--accent);font-weight:800;text-decoration:none}.beta-footer button{min-height:27px;padding:0 7px;border-color:var(--border);background:transparent;color:var(--muted);font-size:.6rem}@media(max-width:460px){.beta-banner{align-items:stretch;flex-direction:column}.beta-banner button{align-self:start}.beta-footer{align-items:flex-start;flex-wrap:wrap}.beta-footer a{margin-left:0;width:100%}}';
  document.head.append(style);

  if("serviceWorker" in navigator){
    const betaRoot=new URL("./",window.location.href);
    navigator.serviceWorker.register(new URL("sw.js",betaRoot).href,{scope:betaRoot.pathname}).catch(error=>console.warn("Modalità offline beta non disponibile.",error));
  }
})();
