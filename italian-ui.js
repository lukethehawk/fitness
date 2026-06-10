"use strict";

window.ITALIAN_UI_READY = true;

window.exerciseNameInItalian = function exerciseNameInItalian(name) {
  const exact = {
    "Alternating Floor Press": "Distensioni a terra alternate",
    "Around The Worlds": "Giro del mondo con pesi",
    "Barbell Bench Press - Medium Grip": "Panca piana con bilanciere, presa media",
    "Barbell Guillotine Bench Press": "Distensioni a ghigliottina su panca con bilanciere",
    "Barbell Incline Bench Press - Medium Grip": "Panca inclinata con bilanciere, presa media",
    "Bench Press - With Bands": "Panca piana con elastici",
    "Bent-Arm Dumbbell Pullover": "Pullover a braccia flesse con manubrio",
    "Bodyweight Flyes": "Croci a corpo libero",
    "Butterfly": "Croci alla pec deck",
    "Cable Chest Press": "Distensioni per il petto ai cavi",
    "Cable Crossover": "Croci ai cavi",
    "Dumbbell Bench Press": "Panca piana con manubri",
    "Dumbbell Floor Press": "Distensioni a terra con manubri",
    "Dumbbell Flyes": "Croci con manubri",
    "Barbell Curl": "Curl con bilanciere",
    "Barbell Squat": "Squat con bilanciere",
    "Front Barbell Squat": "Front squat con bilanciere",
    "Goblet Squat": "Goblet squat",
    "Hack Squat": "Hack squat",
    "Romanian Deadlift": "Stacco rumeno",
    "Seated Cable Rows": "Rematore al cavo da seduto",
    "Lying Leg Curls": "Leg curl da sdraiato",
    "Seated Leg Curl": "Leg curl da seduto",
    "Side Lateral Raise": "Alzate laterali in piedi",
    "Standing Calf Raises": "Calf raise in piedi",
    "Triceps Pushdown": "Pushdown per tricipiti",
    "Wide-Grip Lat Pulldown": "Lat machine a presa larga",
    "Ab Crunch Machine": "Crunch alla macchina",
    "Ab Roller": "Ruota per addominali",
    "Air Bike": "Crunch bicicletta",
    "Bench Dips": "Dip su panca",
    "Concentration Curls": "Curl di concentrazione",
    "Incline Dumbbell Press": "Panca inclinata con manubri"
  };
  if (exact[name]) return exact[name];

  let result = ` ${name.toLowerCase()} `;
  const terms = [
    ["close-grip", "presa stretta"], ["wide-grip", "presa larga"],
    ["alternating", "alternato"], ["alternate", "alternato"],
    ["single-arm", "a un braccio"], ["one-arm", "a un braccio"],
    ["single-leg", "a una gamba"], ["overhead", "sopra la testa"],
    ["incline", "inclinato"], ["decline", "declinato"],
    ["seated", "da seduto"], ["standing", "in piedi"],
    ["kneeling", "in ginocchio"], ["lying", "da sdraiato"],
    ["bodyweight", "a corpo libero"], ["with bands", "con elastici"],
    ["smith machine", "Smith machine"], ["medicine ball", "palla medica"],
    ["stability ball", "fitball"], ["barbell", "bilanciere"],
    ["dumbbells", "manubri"], ["dumbbell", "manubrio"],
    ["kettlebell", "kettlebell"], ["cable", "cavo"],
    ["bench press", "distensioni su panca"], ["floor press", "distensioni a terra"],
    ["chest press", "distensioni per il petto"], ["shoulder press", "military press"],
    ["push-up", "piegamenti"], ["pull-up", "trazioni"],
    ["pulldown", "lat machine"], ["row", "rematore"],
    ["flyes", "croci"], ["lateral raise", "alzate laterali"],
    ["deadlift", "stacco"], ["lunge", "affondo"],
    ["shrug", "scrollata"], ["stretch", "allungamento"],
    ["rotation", "rotazione"], ["jump", "salto"],
    ["raise", "sollevamento"], ["extension", "estensione"],
    ["chest", "petto"], ["shoulder", "spalla"],
    ["triceps", "tricipiti"], ["biceps", "bicipiti"],
    ["hamstring", "femorali"], ["quadriceps", "quadricipiti"],
    ["glute", "gluteo"], ["calf", "polpaccio"],
    ["forearm", "avambraccio"], ["wrist", "polso"],
    ["neck", "collo"], ["hip", "anca"], ["knee", "ginocchio"],
    ["ankle", "caviglia"], ["arm", "braccio"], ["leg", "gamba"],
    ["back", "schiena"], ["front", "frontale"], ["side", "laterale"],
    ["rear", "posteriore"], ["reverse", "inverso"], ["weighted", "zavorrato"]
  ];
  terms.forEach(([english, italian]) => {
    result = result.split(english).join(italian);
  });
  result = result
    .split(" with ").join(" con ")
    .split(" and ").join(" e ")
    .split(" of ").join(" di ")
    .split(" the ").join(" ")
    .split(" - ").join(", ")
    .replaceAll("  ", " ")
    .trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
};

function translateCatalogInterface() {
  document.querySelectorAll(".catalog-card h3, #catalogSelectedName").forEach((node) => {
    if (!node.dataset.englishName && /[A-Za-z]/.test(node.textContent)) {
      node.dataset.englishName = node.textContent.trim();
    }
    if (node.dataset.englishName && node.dataset.englishName !== "nessuno") {
      node.textContent = exerciseNameInItalian(node.dataset.englishName);
    }
  });
}

new MutationObserver(translateCatalogInterface).observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});
translateCatalogInterface();
