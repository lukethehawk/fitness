"use strict";
(function initializeBetaChangelog(){
  const RELEASES=[
    {version:"0.9",date:"18/06/2026",items:[
      "Aggiunta una modalità visiva ad alto contrasto, attivabile dal menu, per testare una UI meno decorativa e più leggibile.",
      "Il nuovo tema riduce gradienti, ombre e trasparenze, rendendo card, pulsanti e campi più separati visivamente.",
      "Il tema attuale resta disponibile: il toggle permette di confrontare le due varianti senza perdere preferenze o dati."
    ]},
    {version:"0.8",date:"18/06/2026",items:[
      "I valori base di peso e ripetizioni ora vengono preinseriti nella scheda quando la serie è ancora vuota.",
      "I valori precompilati restano modificabili durante l'allenamento, come in una scheda cartacea compilata e corretta al bisogno.",
      "La precompilazione non sovrascrive pesi o ripetizioni già modificati nella sessione corrente."
    ]},
    {version:"0.7",date:"18/06/2026",items:[
      "Interfaccia della scheda più pulita durante l'allenamento: rimane visibile solo la compilazione serie-per-serie.",
      "Rimosso dalla pagina principale il pulsante per salvare i valori base, che ora restano nella modifica esercizio.",
      "Nascosto in modo più netto il vecchio blocco Peso usato / Serie completate quando è attivo il tracker beta."
    ]},
    {version:"0.6",date:"18/06/2026",items:[
      "Compilazione dell'allenamento più comoda su iPhone: niente zoom automatico nei campi e passaggio rapido alla serie successiva.",
      "Gli esercizi completati si richiudono da soli, così la scheda resta più pulita durante l'allenamento.",
      "Prima di salvare puoi indicare la data e il giorno reale in cui hai fatto l'allenamento, anche se la scheda era programmata per un altro giorno.",
      "Ogni esercizio può avere peso, ripetizioni, note e recupero predefiniti per partire più velocemente nella sessione successiva.",
      "Il recupero automatico può avviare il timer interno o, se configurato, il timer iOS tramite Comandi Rapidi."
    ]},
    {version:"0.5",date:"15/06/2026",items:[
      "Aggiunti grafici di progressione per ogni esercizio salvato nello storico.",
      "Il peso viene mostrato separatamente per ogni serie, così è possibile vedere se lo stesso carico viene mantenuto più a lungo.",
      "Disponibili anche le viste Volume e Ripetizioni, con confronto tra primo e ultimo allenamento.",
      "Aggiunto un riepilogo consultabile degli ultimi valori registrati."
    ]},
    {version:"0.4",date:"15/06/2026",items:[
      "Ricerca degli esercizi resa più fluida, soprattutto durante la digitazione su smartphone.",
      "Consentito salvare allenamenti realmente ripetuti con gli stessi pesi e ripetizioni.",
      "Esportazioni più coerenti con la lingua scelta e pesi Excel riconosciuti come numeri.",
      "Reset, backup, finestre sovrapposte e salvataggio locale resi più affidabili.",
      "Aggiunte protezioni contro backup non validi e contenuti potenzialmente pericolosi."
    ]},
    {version:"0.3",date:"15/06/2026",items:[
      "Backup e ripristino di schede, impostazioni, progressi e storico tramite file JSON.",
      "Modalità modifica ridisegnata come lista compatta, più comoda su smartphone.",
      "Compilazione delle serie semplificata: selezioni la serie e inserisci peso e ripetizioni.",
      "Correzione del pulsante per rimuovere gli esercizi su schermi piccoli."
    ]},
    {version:"0.2",date:"11/06/2026",items:[
      "Salvataggio completo dell'allenamento con peso e ripetizioni per ogni serie.",
      "Storico degli allenamenti consultabile direttamente dalla webapp.",
      "Vista progressione per confrontare nel tempo le prestazioni dello stesso esercizio.",
      "Riepilogo dell'ultima prestazione mostrato nella scheda corrente."
    ]},
    {version:"0.1",date:"11/06/2026",items:[
      "Creata una versione beta separata dalla webapp pubblica.",
      "Dati beta isolati, con possibilità di copiare la configurazione della versione pubblica.",
      "Aggiunto il ritorno rapido alla versione pubblica e il reset dei soli dati beta."
    ]}
  ];
  function releaseMarkup(release){return`<article class="beta-changelog-release"><header><strong>Beta ${release.version}</strong><time>${release.date}</time></header><ul>${release.items.map(item=>`<li>${item}</li>`).join("")}</ul></article>`}
  const overlay=document.createElement("div");overlay.id="betaChangelogOverlay";overlay.className="overlay";overlay.hidden=true;overlay.innerHTML=`<section class="beta-changelog-sheet" role="dialog" aria-modal="true" aria-labelledby="betaChangelogTitle"><div class="sheet-header"><div><p class="eyebrow">Versione di prova</p><h2 id="betaChangelogTitle">Novità beta</h2></div><button id="closeBetaChangelog" class="close-button" type="button" aria-label="Chiudi novità beta">×</button></div><p class="beta-changelog-intro">Funzioni in prova prima del possibile arrivo nella versione pubblica.</p><div class="beta-changelog-list">${RELEASES.map(releaseMarkup).join("")}</div></section>`;document.body.append(overlay);
  function open(){overlay.hidden=false;document.body.classList.add("has-open-menu");overlay.querySelector("#closeBetaChangelog").focus()}
  function close(){overlay.hidden=true;document.body.classList.remove("has-open-menu");document.querySelector("#openBetaChangelog")?.focus()}
  function connectButton(){const button=document.querySelector("#openBetaChangelog");if(!button||button.dataset.ready)return false;button.dataset.ready="true";button.addEventListener("click",open);return true}
  overlay.querySelector("#closeBetaChangelog").addEventListener("click",close);overlay.addEventListener("click",event=>{if(event.target===overlay)close()});document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!overlay.hidden)close()});if(!connectButton()){const observer=new MutationObserver(()=>{if(connectButton())observer.disconnect()});observer.observe(document.body,{childList:true,subtree:true})}
  const style=document.createElement("style");style.textContent='.beta-changelog-sheet{width:min(100%,620px);max-height:90dvh;margin:auto 0 0;padding:22px 16px max(28px,env(safe-area-inset-bottom));border-radius:26px 26px 0 0;background:var(--surface);overflow-y:auto}.beta-changelog-intro{margin:10px 0 17px;color:var(--muted);font-size:.75rem;line-height:1.5}.beta-changelog-list{display:grid;gap:11px}.beta-changelog-release{padding:13px;border:1px solid var(--border);border-radius:14px;background:var(--surface-strong)}.beta-changelog-release header{display:flex;align-items:center;justify-content:space-between;gap:12px}.beta-changelog-release strong{color:var(--accent);font-size:.85rem}.beta-changelog-release time{color:var(--muted);font-size:.65rem}.beta-changelog-release ul{display:grid;gap:7px;margin:11px 0 0;padding-left:18px;color:var(--text);font-size:.72rem;line-height:1.45}.beta-footer #openBetaChangelog{margin-left:auto}.beta-footer #openBetaChangelog+.beta-public-link{margin-left:0}@media(min-width:600px){.beta-changelog-sheet{margin:5vh auto;border-radius:26px}}';document.head.append(style)
})();