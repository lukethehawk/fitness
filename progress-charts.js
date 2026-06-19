"use strict";
(function initializeBetaProgressCharts(){
  const HISTORY_KEY="fitness-workout-sessions-v1";
  const SVG_NS="http://www.w3.org/2000/svg";
  const COLORS=["#7ee2ad","#69aef8","#f5bd65","#cf8cff","#ff7f96","#72d7d1"];
  let selectedMetric="sets";
  let scheduled=false;

  function loadSessions(){
    try{
      const value=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]");
      return Array.isArray(value)?value:[];
    }catch{return[]}
  }

  function exerciseKey(exercise){
    return exercise.freeExerciseId||exercise.exerciseId||exercise.id||String(exercise.name||"").toLocaleLowerCase("it-IT");
  }

  function selectedEntries(){
    const select=document.querySelector("#betaProgressExercise");
    if(!select)return[];
    return loadSessions().flatMap(session=>(session.exercises||[])
      .filter(exercise=>!exercise.skipped&&exerciseKey(exercise)===select.value)
      .map(exercise=>({session,exercise})))
      .sort((a,b)=>new Date(a.session.completedAt)-new Date(b.session.completedAt));
  }

  function completedSets(exercise){
    return(exercise.sets||[]).filter(set=>set.completed);
  }

  function dateLabel(value,short=false){
    return new Intl.DateTimeFormat("it-IT",short?{day:"2-digit",month:"2-digit"}:{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(value));
  }

  function number(value){
    const parsed=Number(String(value??"").replace(",","."));
    return Number.isFinite(parsed)?parsed:null;
  }

  function metricDefinition(entries){
    if(selectedMetric==="volume"){
      return{
        title:"Volume per allenamento",
        unit:"kg",
        series:[{label:"Volume",color:COLORS[0],values:entries.map(({exercise})=>completedSets(exercise).reduce((sum,set)=>sum+(number(set.weight)||0)*(number(set.reps)||0),0))}]
      };
    }
    if(selectedMetric==="reps"){
      return{
        title:"Ripetizioni completate",
        unit:"rep",
        series:[{label:"Ripetizioni",color:COLORS[1],values:entries.map(({exercise})=>completedSets(exercise).reduce((sum,set)=>sum+(number(set.reps)||0),0))}]
      };
    }
    const maxSets=entries.reduce((max,{exercise})=>Math.max(max,...completedSets(exercise).map(set=>Number(set.number)||0)),0);
    return{
      title:"Peso usato in ogni serie",
      unit:"kg",
      series:Array.from({length:maxSets},(_,index)=>({
        label:`Serie ${index+1}`,
        color:COLORS[index%COLORS.length],
        values:entries.map(({exercise})=>{
          const set=completedSets(exercise).find(item=>(Number(item.number)||0)===index+1);
          return set?number(set.weight):null;
        })
      }))
    };
  }

  function svgElement(name,attributes={}){
    const element=document.createElementNS(SVG_NS,name);
    Object.entries(attributes).forEach(([key,value])=>element.setAttribute(key,String(value)));
    return element;
  }

  function addSvgText(svg,text,x,y,attributes={}){
    const element=svgElement("text",{x,y,...attributes});
    element.textContent=text;
    svg.append(element);
  }

  function renderChart(container,entries,definition){
    const width=640,height=270,left=52,right=18,top=20,bottom=44;
    const plotWidth=width-left-right,plotHeight=height-top-bottom;
    const values=definition.series.flatMap(series=>series.values).filter(value=>value!==null&&Number.isFinite(value));
    if(!values.length){
      const empty=document.createElement("p");
      empty.className="beta-chart-empty";
      empty.textContent="Completa almeno una serie con peso e ripetizioni per vedere il grafico.";
      container.append(empty);
      return;
    }
    let min=Math.min(...values),max=Math.max(...values);
    if(selectedMetric!=="sets")min=0;
    if(min===max){const padding=Math.max(1,max*.1);min=Math.max(0,min-padding);max+=padding}
    else{const padding=(max-min)*.12;min=Math.max(0,min-padding);max+=padding}
    const x=index=>entries.length===1?left+plotWidth/2:left+(index/(entries.length-1))*plotWidth;
    const y=value=>top+plotHeight-((value-min)/(max-min))*plotHeight;
    const svg=svgElement("svg",{viewBox:`0 0 ${width} ${height}`,role:"img","aria-label":`${definition.title}, ${entries.length} allenamenti`});
    svg.classList.add("beta-progress-svg");

    for(let index=0;index<=4;index++){
      const yPosition=top+(plotHeight/4)*index;
      svg.append(svgElement("line",{x1:left,y1:yPosition,x2:width-right,y2:yPosition,class:"beta-chart-grid"}));
      const label=max-((max-min)/4)*index;
      addSvgText(svg,formatValue(label),left-9,yPosition+4,{class:"beta-chart-axis","text-anchor":"end"});
    }

    const labelIndexes=entries.length<=3?entries.map((_,index)=>index):[0,Math.floor((entries.length-1)/2),entries.length-1];
    [...new Set(labelIndexes)].forEach(index=>addSvgText(svg,dateLabel(entries[index].session.completedAt,true),x(index),height-15,{class:"beta-chart-axis","text-anchor":"middle"}));

    definition.series.forEach(series=>{
      const points=series.values.map((value,index)=>value===null?null:{value,index,x:x(index),y:y(value)});
      let segment=[];
      const drawSegment=()=>{
        if(segment.length>1)svg.append(svgElement("path",{d:segment.map((point,index)=>`${index?"L":"M"}${point.x} ${point.y}`).join(" "),fill:"none",stroke:series.color,"stroke-width":4,"stroke-linecap":"round","stroke-linejoin":"round"}));
        segment=[];
      };
      points.forEach(point=>{if(point)segment.push(point);else drawSegment()});
      drawSegment();
      points.filter(Boolean).forEach(point=>{
        const circle=svgElement("circle",{cx:point.x,cy:point.y,r:5,fill:series.color,stroke:"#111a17","stroke-width":3});
        const title=svgElement("title");
        title.textContent=`${dateLabel(entries[point.index].session.completedAt)} · ${series.label}: ${formatValue(point.value)} ${definition.unit}`;
        circle.append(title);svg.append(circle);
      });
    });
    container.append(svg);
  }

  function formatValue(value){
    return new Intl.NumberFormat("it-IT",{maximumFractionDigits:1}).format(value);
  }

  function representativeValue(entry){
    const sets=completedSets(entry.exercise);
    if(selectedMetric==="volume")return sets.reduce((sum,set)=>sum+(number(set.weight)||0)*(number(set.reps)||0),0);
    if(selectedMetric==="reps")return sets.reduce((sum,set)=>sum+(number(set.reps)||0),0);
    return Math.max(...sets.map(set=>number(set.weight)).filter(value=>value!==null),0);
  }

  function metricUnit(){return selectedMetric==="reps"?"rep":"kg"}

  function renderSummary(root,entries){
    const first=representativeValue(entries[0]);
    const latest=representativeValue(entries[entries.length-1]);
    const difference=latest-first;
    const cards=document.createElement("div");
    cards.className="beta-chart-summary";
    [
      ["Allenamenti",String(entries.length)],
      [selectedMetric==="sets"?"Primo massimo":"Primo valore",`${formatValue(first)} ${metricUnit()}`],
      [selectedMetric==="sets"?"Ultimo massimo":"Ultimo valore",`${formatValue(latest)} ${metricUnit()}`],
      ["Variazione",`${difference>0?"+":""}${formatValue(difference)} ${metricUnit()}`]
    ].forEach(([label,value])=>{
      const card=document.createElement("span");
      const small=document.createElement("small");small.textContent=label;
      const strong=document.createElement("strong");strong.textContent=value;
      card.append(small,strong);cards.append(card);
    });
    root.append(cards);
  }

  function renderLegend(root,definition){
    if(definition.series.length<2)return;
    const legend=document.createElement("div");legend.className="beta-chart-legend";
    definition.series.forEach(series=>{
      const item=document.createElement("span");
      const swatch=document.createElement("i");swatch.style.background=series.color;
      item.append(swatch,document.createTextNode(series.label));legend.append(item);
    });
    root.append(legend);
  }

  function renderRecentSessions(root,entries){
    const details=document.createElement("details");details.className="beta-chart-details";
    const summary=document.createElement("summary");summary.textContent="Valori delle ultime sessioni";details.append(summary);
    const list=document.createElement("div");
    entries.slice(-5).reverse().forEach(({session,exercise})=>{
      const row=document.createElement("div");
      const time=document.createElement("time");time.textContent=dateLabel(session.completedAt);
      const value=document.createElement("span");
      const sets=completedSets(exercise);
      value.textContent=sets.map(set=>`S${set.number}: ${set.weight!==""?set.weight:"—"} kg × ${set.reps!==""?set.reps:"—"}`).join(" · ")||"Nessuna serie completata";
      row.append(time,value);list.append(row);
    });
    details.append(list);root.append(details);
  }

  function renderProgressChart(){
    const select=document.querySelector("#betaProgressExercise");
    if(!select||document.querySelector(".beta-progress-chart"))return;
    const entries=selectedEntries();
    if(!entries.length)return;
    const root=document.createElement("section");root.className="beta-progress-chart";root.setAttribute("aria-label","Grafico progressione");
    const header=document.createElement("div");header.className="beta-chart-header";
    const heading=document.createElement("div");
    const eyebrow=document.createElement("span");eyebrow.textContent="Andamento";
    const title=document.createElement("strong");title.textContent="Grafico progressione";
    heading.append(eyebrow,title);
    const controls=document.createElement("div");controls.className="beta-chart-metrics";controls.setAttribute("role","group");controls.setAttribute("aria-label","Dato da mostrare");
    [["sets","Peso per serie"],["volume","Volume"],["reps","Ripetizioni"]].forEach(([metric,label])=>{
      const button=document.createElement("button");button.type="button";button.dataset.chartMetric=metric;button.textContent=label;button.setAttribute("aria-pressed",String(metric===selectedMetric));
      button.addEventListener("click",()=>{selectedMetric=metric;root.remove();renderProgressChart()});controls.append(button);
    });
    header.append(heading,controls);root.append(header);
    renderSummary(root,entries);
    const definition=metricDefinition(entries);
    const chart=document.createElement("div");chart.className="beta-chart-canvas";
    renderChart(chart,entries,definition);root.append(chart);
    renderLegend(root,definition);
    renderRecentSessions(root,entries);
    select.closest(".beta-progress-select")?.after(root);
  }

  function scheduleRender(){
    if(scheduled)return;scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;renderProgressChart()});
  }

  const observer=new MutationObserver(scheduleRender);
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener("change",event=>{if(event.target.matches("#betaProgressExercise"))scheduleRender()});

  const style=document.createElement("style");
  style.textContent='.beta-progress-chart{display:grid;gap:12px;padding:13px;border:1px solid rgb(126 226 173 / 24%);border-radius:15px;background:rgb(126 226 173 / 5%)}.beta-chart-header{display:grid;gap:10px}.beta-chart-header>div:first-child{display:grid;gap:2px}.beta-chart-header span{color:var(--muted);font-size:.62rem}.beta-chart-header strong{font-size:.86rem}.beta-chart-metrics{display:grid;grid-template-columns:1.2fr .8fr 1fr;gap:4px;padding:3px;border:1px solid var(--border);border-radius:10px;background:var(--surface-strong)}.beta-chart-metrics button{min-height:34px;padding:5px;border:0;border-radius:7px;background:transparent;color:var(--muted);font-size:.62rem;font-weight:850}.beta-chart-metrics button[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink)}.beta-chart-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.beta-chart-summary>span{display:grid;gap:3px;min-width:0;padding:8px;border:1px solid var(--border);border-radius:9px;background:var(--surface-strong)}.beta-chart-summary small{color:var(--muted);font-size:.52rem}.beta-chart-summary strong{font-size:.68rem;white-space:nowrap}.beta-chart-canvas{min-height:180px;padding:5px 2px 0;border-radius:11px;background:var(--bg);overflow:hidden}.beta-progress-svg{display:block;width:100%;height:auto;min-height:180px}.beta-chart-grid{stroke:rgb(255 255 255 / 8%);stroke-width:1}.beta-chart-axis{fill:var(--muted);font:600 15px system-ui,sans-serif}.beta-chart-legend{display:flex;flex-wrap:wrap;gap:7px 12px}.beta-chart-legend span{display:flex;align-items:center;gap:5px;color:var(--muted);font-size:.6rem}.beta-chart-legend i{width:8px;height:8px;border-radius:99px}.beta-chart-empty{margin:0;padding:26px 14px;color:var(--muted);font-size:.7rem;line-height:1.45;text-align:center}.beta-chart-details{border-top:1px solid var(--border);padding-top:9px}.beta-chart-details summary{color:var(--muted);font-size:.65rem;font-weight:800;cursor:pointer}.beta-chart-details>div{display:grid;gap:7px;margin-top:9px}.beta-chart-details>div>div{display:grid;gap:2px;padding:8px;border-radius:9px;background:var(--surface-strong)}.beta-chart-details time{color:var(--accent);font-size:.58rem;font-weight:800}.beta-chart-details span{color:var(--muted);font-size:.61rem;line-height:1.4}@media(max-width:430px){.beta-chart-summary{grid-template-columns:1fr 1fr}.beta-chart-summary strong{font-size:.72rem}}@media(min-width:600px){.beta-chart-header{grid-template-columns:1fr auto;align-items:center}.beta-chart-metrics{min-width:310px}}';
  document.head.append(style);
  scheduleRender();
})();
