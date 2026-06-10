"use strict";

(() => {
  const exactNames = {
    "3/4 sit-up":"Sit-up a tre quarti","90/90 hamstring":"Allungamento femorali 90/90","ab crunch machine":"Crunch alla macchina","ab roller":"Ruota per addominali","air bike":"Crunch bicicletta","all fours quad stretch":"Allungamento quadricipiti a quattro appoggi","alternate heel touchers":"Tocchi alternati ai talloni","alternating floor press":"Distensioni a terra alternate","around the worlds":"Giro del mondo con pesi","barbell bench press - medium grip":"Panca piana con bilanciere, presa media","barbell guillotine bench press":"Distensioni a ghigliottina su panca con bilanciere","barbell incline bench press - medium grip":"Panca inclinata con bilanciere, presa media","barbell shoulder press":"Military press con bilanciere","barbell curl":"Curl con bilanciere","barbell squat":"Squat con bilanciere","bench dips":"Dip su panca","bench press - powerlifting":"Panca piana da powerlifting","bench press - with bands":"Panca piana con elastici","bench press with chains":"Panca piana con catene","bent-arm barbell pullover":"Pullover a braccia flesse con bilanciere","bent-arm dumbbell pullover":"Pullover a braccia flesse con manubrio","bodyweight flyes":"Croci a corpo libero","butterfly":"Croci alla pec deck","cable chest press":"Distensioni per il petto ai cavi","cable crossover":"Croci ai cavi","close-grip barbell bench press":"Panca piana con bilanciere a presa stretta","concentration curls":"Curl di concentrazione","dips - chest version":"Dip per il petto","dips - triceps version":"Dip per i tricipiti","dumbbell alternate bicep curl":"Curl alternato con manubri","dumbbell bench press":"Panca piana con manubri","dumbbell floor press":"Distensioni a terra con manubri","dumbbell flyes":"Croci con manubri","front barbell squat":"Front squat con bilanciere","goblet squat":"Goblet squat","good morning":"Good morning con bilanciere","hack squat":"Hack squat","incline dumbbell press":"Panca inclinata con manubri","lying leg curls":"Leg curl da sdraiato","romanian deadlift":"Stacco rumeno","seated cable rows":"Rematore al cavo da seduto","seated leg curl":"Leg curl da seduto","side lateral raise":"Alzate laterali in piedi","standing calf raises":"Calf raise in piedi","triceps pushdown":"Pushdown per tricipiti","wide-grip lat pulldown":"Lat machine a presa larga"
  };
  const terms = [
    ["close-grip","a presa stretta"],["wide-grip","a presa larga"],["medium grip","a presa media"],["reverse grip","a presa inversa"],["neutral grip","a presa neutra"],["overhead","sopra la testa"],["single-arm","a un braccio"],["one-arm","a un braccio"],["single-leg","a una gamba"],["alternating","alternato"],["alternate","alternato"],["incline","inclinato"],["decline","declinato"],["seated","da seduto"],["standing","in piedi"],["kneeling","in ginocchio"],["lying","da sdraiato"],["bent-over","con busto inclinato"],["bent-arm","a braccia flesse"],["bodyweight","a corpo libero"],["with bands","con elastici"],["with chains","con catene"],["exercise ball","su fitball"],["stability ball","su fitball"],["medicine ball","con palla medica"],["smith machine","alla Smith machine"],["e-z bar","con bilanciere EZ"],["ez-bar","con bilanciere EZ"],["barbell","con bilanciere"],["dumbbells","con manubri"],["dumbbell","con manubrio"],["kettlebell","con kettlebell"],["cable","al cavo"],["machine","alla macchina"],["bench press","distensioni su panca"],["floor press","distensioni a terra"],["shoulder press","distensioni per le spalle"],["chest press","distensioni per il petto"],["leg press","pressa per le gambe"],["push-up","piegamenti"],["pull-up","trazioni"],["chin-up","trazioni supine"],["pulldown","lat machine"],["row","rematore"],["flyes","croci"],["flye","croce"],["lateral raise","alzate laterali"],["front raise","alzate frontali"],["leg raise","sollevamento gambe"],["hip raise","sollevamento bacino"],["triceps extension","estensione per tricipiti"],["wrist curl","curl dei polsi"],["deadlift","stacco"],["lunge","affondo"],["shrug","scrollata"],["stretch","allungamento"],["rotation","rotazione"],["twist","torsione"],["jump","salto"],["throw","lancio"],["raise","sollevamento"],["extension","estensione"],["adduction","adduzione"],["abduction","abduzione"],["chest","petto"],["shoulder","spalla"],["triceps","tricipiti"],["biceps","bicipiti"],["hamstring","femorali"],["quadriceps","quadricipiti"],["glute","gluteo"],["calf","polpaccio"],["forearm","avambraccio"],["wrist","polso"],["neck","collo"],["hip","anca"],["knee","ginocchio"],["ankle","caviglia"],["arm","braccio"],["leg","gamba"],["back","schiena"],["front","frontale"],["side","laterale"],["rear","posteriore"],["reverse","inverso"],["weighted","zavorrato"],["assisted","assistito"],["dynamic","dinamico"],["isometric","isometrico"]
  ];

  window.translateExerciseName = function(name) {
    const exact = exactNames[name.trim().toLowerCase()];
    if (exact) return exact;
    let result = name.trim().toLowerCase();
    terms.forEach(([english, italian]) => {
      const escaped = english.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(`\\b${escaped}\\b`, "g"), italian);
    });
    result = result.replace(/\s*-\s*/g, ", ").replace(/\bwith\b/g,"con").replace(/\bfrom\b/g,"da").replace(/\bon\b/g,"su").replace(/\bto\b/g,"verso").replace(/\band\b/g,"e").replace(/\bof\b/g,"di").replace(/\bthe\b/g,"").replace(/\s+/g," ").replace(/\s+,/g,",").trim().replace(/^(con bilanciere|con manubrio|con manubri|con kettlebell|al cavo|alla macchina) (.+)$/i,"$2 $1").replace(/^a corpo libero (.+)$/i,"$1 a corpo libero").replace(/^alternato (.+)$/i,"$1 alternato").replace(/^inclinato (.+)$/i,"$1 inclinato").replace(/^declinato (.+)$/i,"$1 declinato").replace(/^da seduto (.+)$/i,"$1 da seduto").replace(/^in piedi (.+)$/i,"$1 in piedi");
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  const originalCreateCatalogCard = createCatalogCard;
  createCatalogCard = function(exercise) {
    const card = originalCreateCatalogCard(exercise);
    card.querySelector("h3").textContent = translateExerciseName(exercise.name);
    return card;
  };
  const originalUpdateCatalogSelection = updateCatalogSelection;
  updateCatalogSelection = function() {
    originalUpdateCatalogSelection();
    const name = document.querySelector("#catalogSelectedName");
    if (name && selectedCatalogExercise) name.textContent = translateExerciseName(selectedCatalogExercise.name);
  };
  document.querySelector("#confirmCatalogExercise")?.addEventListener("click", () => {
    if (selectedCatalogExercise) selectedCatalogExercise.name = translateExerciseName(selectedCatalogExercise.name);
  }, { capture: true });
})();
