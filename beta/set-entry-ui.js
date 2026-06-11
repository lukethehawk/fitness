"use strict";
(function initializeBetaSetEntryUi(){
  let scheduled=false;

  function dispatchInput(input,value){
    input.value=value;
    input.dispatchEvent(new Event("input",{bubbles:true}));
  }

  function enhanceTracker(tracker){
    if(tracker.dataset.compactEntryReady==="true")return;
    const rows=[...tracker.querySelectorAll(".beta-set-row")];
    if(!rows.length)return;

    tracker.dataset.compactEntryReady="true";
    tracker.classList.add("beta-set-tracker-compact");
    const heading=tracker.querySelector(".beta-set-heading");
    if(heading){
      heading.querySelector("strong").textContent="Registra le serie";
      heading.querySelector("span").textContent="Seleziona una serie, poi inserisci kg e ripetizioni";
    }

    const editor=document.createElement("div");
    editor.className="beta-set-entry";
    editor.innerHTML='<div class="beta-set-selector" role="group" aria-label="Seleziona la serie"></div><div class="beta-active-set"><div class="beta-active-set-title"><span>Serie selezionata</span><strong></strong></div><div class="beta-active-set-fields"><label><span>Peso kg</span><input class="beta-active-weight" type="number" min="0" step="0.5" inputmode="decimal" placeholder="kg"></label><label><span>Ripetizioni</span><input class="beta-active-reps" type="number" min="0" max="999" step="1" inputmode="numeric" placeholder="rep"></label></div><button class="beta-active-complete" type="button"></button></div>';
    tracker.querySelector(".beta-set-rows").before(editor);

    const selector=editor.querySelector(".beta-set-selector");
    const title=editor.querySelector(".beta-active-set-title strong");
    const weight=editor.querySelector(".beta-active-weight");
    const reps=editor.querySelector(".beta-active-reps");
    const complete=editor.querySelector(".beta-active-complete");
    let activeIndex=Math.max(0,rows.findIndex(row=>!row.classList.contains("is-complete")));

    const controls=rows.map((row,index)=>{
      const button=document.createElement("button");
      button.type="button";
      button.className="beta-set-choice";
      button.addEventListener("click",()=>{activeIndex=index;render()});
      selector.append(button);
      return button;
    });

    function rowData(index){
      const row=rows[index];
      return{
        row,
        weight:row.querySelector(".beta-set-weight"),
        reps:row.querySelector(".beta-set-reps"),
        complete:row.querySelector(".beta-set-complete"),
        done:row.classList.contains("is-complete")
      };
    }

    function render(){
      rows.forEach((row,index)=>{
        const data=rowData(index);
        const summary=data.weight.value||data.reps.value?`${data.weight.value||"—"} kg · ${data.reps.value||"—"} rep`:"Da compilare";
        controls[index].classList.toggle("is-selected",index===activeIndex);
        controls[index].classList.toggle("is-complete",data.done);
        controls[index].setAttribute("aria-pressed",String(index===activeIndex));
        controls[index].innerHTML=`<span>Serie ${index+1}</span><small>${data.done?"✓ ":""}${summary}</small>`;
      });
      const data=rowData(activeIndex);
      title.textContent=`Serie ${activeIndex+1}`;
      weight.value=data.weight.value;
      reps.value=data.reps.value;
      complete.classList.toggle("is-complete",data.done);
      complete.textContent=data.done?"Serie completata · Riapri":"Segna serie completata";
      complete.setAttribute("aria-pressed",String(data.done));
    }

    weight.addEventListener("input",()=>{dispatchInput(rowData(activeIndex).weight,weight.value);render()});
    reps.addEventListener("input",()=>{dispatchInput(rowData(activeIndex).reps,reps.value);render()});
    complete.addEventListener("click",()=>{rowData(activeIndex).complete.click();render()});
    render();
  }

  function enhanceAll(){
    document.querySelectorAll(".beta-set-tracker").forEach(enhanceTracker);
  }

  const observer=new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;enhanceAll()});
  });
  observer.observe(document.body,{childList:true,subtree:true});

  const style=document.createElement("style");
  style.textContent='.exercise-fields[hidden]{display:none!important}.beta-set-tracker-compact .beta-set-rows{display:none!important}.beta-set-entry{display:grid;gap:9px}.beta-set-selector{display:grid;grid-template-columns:repeat(auto-fit,minmax(82px,1fr));gap:6px}.beta-set-choice{display:grid;gap:2px;min-width:0;min-height:48px;padding:7px 8px;border:1px solid var(--border);border-radius:10px;background:var(--surface-strong);color:var(--text);text-align:left}.beta-set-choice span{font-size:.7rem;font-weight:850}.beta-set-choice small{overflow:hidden;color:var(--muted);font-size:.56rem;text-overflow:ellipsis;white-space:nowrap}.beta-set-choice.is-selected{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}.beta-set-choice.is-complete small{color:var(--accent)}.beta-active-set{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;padding:10px;border:1px solid var(--border);border-radius:12px;background:var(--surface-strong)}.beta-active-set-title{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:10px}.beta-active-set-title span{color:var(--muted);font-size:.62rem}.beta-active-set-title strong{font-size:.78rem}.beta-active-set-fields{display:contents}.beta-active-set label{display:grid;gap:4px;color:var(--muted);font-size:.58rem;font-weight:750}.beta-active-set input{width:100%;min-width:0;min-height:40px;padding:7px 9px;border:1px solid var(--border);border-radius:9px;background:var(--bg);color:var(--text);font-size:.86rem}.beta-active-complete{grid-column:1/-1;min-height:40px;border:1px solid var(--accent);border-radius:9px;background:transparent;color:var(--accent);font-size:.72rem;font-weight:850}.beta-active-complete.is-complete{background:var(--accent);color:var(--accent-ink)}@media(max-width:390px){.beta-set-selector{grid-template-columns:repeat(2,minmax(0,1fr))}}';
  document.head.append(style);
  enhanceAll();
})();
