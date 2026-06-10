"use strict";

window.EXERCISE_CATALOG_HAS_ITALIAN = true;

const EXERCISE_CATALOG_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const EXERCISE_CATALOG_CACHE = "fitness-free-exercise-catalog-v1";
const EXERCISE_CATALOG_PAGE_SIZE = 24;

const MUSCLE_LABELS = {
  abdominals: "Addominali",
  abductors: "Abduttori",
  adductors: "Adduttori",
  biceps: "Bicipiti",
  calves: "Polpacci",
  chest: "Petto",
  forearms: "Avambracci",
  glutes: "Glutei",
  hamstrings: "Femorali",
  lats: "Gran dorsale",
  "lower back": "Lombari",
  "middle back": "Dorso centrale",
  neck: "Collo",
  quadriceps: "Quadricipiti",
  shoulders: "Spalle",
  traps: "Trapezi",
  triceps: "Tricipiti"
};

const EQUIPMENT_LABELS = {
  bands: "Elastici",
  barbell: "Bilanciere",
  body_only: "Corpo libero",
  cable: "Cavi",
  dumbbell: "Manubri",
  "e-z curl bar": "Bilanciere EZ",
  exercise_ball: "Fitball",
  foam_roll: "Foam roller",
  kettlebells: "Kettlebell",
  machine: "Macchina",
  medicine_ball: "Palla medica",
  other: "Altro"
};

const EXERCISE_NAME_OVERRIDES = {
  "3/4 sit-up": "Sit-up a tre quarti",
  "90/90 hamstring": "Allungamento femorali 90/90",
  "ab crunch machine": "Crunch alla macchina",
  "ab roller": "Ruota per addominali",
  "air bike": "Crunch bicicletta",
  "all fours quad stretch": "Allungamento quadricipiti a quattro appoggi",
  "alternate heel touchers": "Tocchi alternati ai talloni",
  "alternating floor press": "Distensioni a terra alternate",
  "around the worlds": "Giro del mondo con pesi",
  "barbell bench press - medium grip": "Panca piana con bilanciere, presa media",
  "barbell guillotine bench press": "Distensioni a ghigliottina su panca con bilanciere",
  "barbell incline bench press - medium grip": "Panca inclinata con bilanciere, presa media",
  "barbell incline shoulder raise": "Sollevamento spalle su panca inclinata con bilanciere",
  "barbell shoulder press": "Military press con bilanciere",
  "barbell curl": "Curl con bilanciere",
  "barbell squat": "Squat con bilanciere",
  "bench dips": "Dip su panca",
  "bench press - powerlifting": "Panca piana da powerlifting",
  "bench press - with bands": "Panca piana con elastici",
  "bench press with chains": "Panca piana con catene",
  "bent-arm barbell pullover": "Pullover a braccia flesse con bilanciere",
  "bent-arm dumbbell pullover": "Pullover a braccia flesse con manubrio",
  "bodyweight flyes": "Croci a corpo libero",
  "butterfly": "Croci alla pec deck",
  "cable crossover": "Croci ai cavi",
  "cable chest press": "Distensioni per il petto ai cavi",
  "close-grip barbell bench press": "Panca piana con bilanciere a presa stretta",
  "concentration curls": "Curl di concentrazione",
  "dips - chest version": "Dip per il petto",
  "dips - triceps version": "Dip per i tricipiti",
  "dumbbell alternate bicep curl": "Curl alternato con manubri",
  "dumbbell bench press": "Panca piana con manubri",
  "dumbbell floor press": "Distensioni a terra con manubri",
  "dumbbell flyes": "Croci con manubri",
  "front barbell squat": "Front squat con bilanciere",
  "goblet squat": "Goblet squat",
  "good morning": "Good morning con bilanciere",
  "hack squat": "Hack squat",
  "incline dumbbell press": "Panca inclinata con manubri",
  "behind head chest stretch": "Allungamento del petto con mani dietro la testa",
  "lying leg curls": "Leg curl da sdraiato",
  "romanian deadlift": "Stacco rumeno",
  "seated cable rows": "Rematore al cavo da seduto",
  "seated leg curl": "Leg curl da seduto",
  "side lateral raise": "Alzate laterali in piedi",
  "standing calf raises": "Calf raise in piedi",
  "triceps pushdown": "Pushdown per tricipiti",
  "wide-grip lat pulldown": "Lat machine a presa larga"
};

const EXERCISE_NAME_PHRASES = [
  ["close-grip", "a presa stretta"],
  ["wide-grip", "a presa larga"],
  ["medium grip", "a presa media"],
  ["reverse grip", "a presa inversa"],
  ["neutral grip", "a presa neutra"],
  ["overhead", "sopra la testa"],
  ["behind the neck", "dietro la nuca"],
  ["behind head", "dietro la testa"],
  ["single-arm", "a un braccio"],
  ["one-arm", "a un braccio"],
  ["single-leg", "a una gamba"],
  ["one leg", "a una gamba"],
  ["alternating", "alternato"],
  ["alternate", "alternato"],
  ["incline", "inclinato"],
  ["decline", "declinato"],
  ["seated", "da seduto"],
  ["standing", "in piedi"],
  ["kneeling", "in ginocchio"],
  ["lying", "da sdraiato"],
  ["bent over", "con busto inclinato"],
  ["bent-over", "con busto inclinato"],
  ["bent-arm", "a braccia flesse"],
  ["bodyweight", "a corpo libero"],
  ["with bands", "con elastici"],
  ["with band", "con elastico"],
  ["with chains", "con catene"],
  ["with rope", "con corda"],
  ["exercise ball", "su fitball"],
  ["stability ball", "su fitball"],
  ["medicine ball", "con palla medica"],
  ["foam roll", "con foam roller"],
  ["smith machine", "alla Smith machine"],
  ["e-z bar", "con bilanciere EZ"],
  ["ez-bar", "con bilanciere EZ"],
  ["barbell", "con bilanciere"],
  ["dumbbell", "con manubrio"],
  ["dumbbells", "con manubri"],
  ["kettlebell", "con kettlebell"],
  ["cable", "al cavo"],
  ["machine", "alla macchina"],
  ["resistance band", "con elastico"],
  ["bench press", "distensioni su panca"],
  ["floor press", "distensioni a terra"],
  ["shoulder press", "distensioni per le spalle"],
  ["chest press", "distensioni per il petto"],
  ["leg press", "pressa per le gambe"],
  ["push-up", "piegamenti"],
  ["push up", "piegamenti"],
  ["pull-up", "trazioni"],
  ["pull up", "trazioni"],
  ["chin-up", "trazioni supine"],
  ["pulldown", "lat machine"],
  ["row", "rematore"],
  ["flyes", "croci"],
  ["flye", "croce"],
  ["lateral raise", "alzate laterali"],
  ["front raise", "alzate frontali"],
  ["calf raise", "calf raise"],
  ["leg raise", "sollevamento gambe"],
  ["hip raise", "sollevamento bacino"],
  ["leg extension", "leg extension"],
  ["leg curl", "leg curl"],
  ["triceps extension", "estensione per tricipiti"],
  ["wrist curl", "curl dei polsi"],
  ["biceps curl", "curl per bicipiti"],
  ["deadlift", "stacco"],
  ["lunge", "affondo"],
  ["shrug", "scrollata"],
  ["stretch", "allungamento"],
  ["rotation", "rotazione"],
  ["twist", "torsione"],
  ["jump", "salto"],
  ["throw", "lancio"],
  ["raise", "sollevamento"],
  ["extension", "estensione"],
  ["adduction", "adduzione"],
  ["abduction", "abduzione"],
  ["chest", "petto"],
  ["shoulder", "spalla"],
  ["triceps", "tricipiti"],
  ["biceps", "bicipiti"],
  ["hamstring", "femorali"],
  ["quadriceps", "quadricipiti"],
  ["glute", "gluteo"],
  ["calf", "polpaccio"],
  ["forearm", "avambraccio"],
  ["wrist", "polso"],
  ["neck", "collo"],
  ["hip", "anca"],
  ["knee", "ginocchio"],
  ["ankle", "caviglia"],
  ["arm", "braccio"],
  ["leg", "gamba"],
  ["back", "schiena"],
  ["front", "frontale"],
  ["side", "laterale"],
  ["rear", "posteriore"],
  ["reverse", "inverso"],
  ["weighted", "zavorrato"],
  ["assisted", "assistito"],
  ["dynamic", "dinamico"],
  ["isometric", "isometrico"],
  ["powerlifting", "powerlifting"]
];

const LEVEL_LABELS = {
  beginner: "principiante",
  intermediate: "intermedio",
  expert: "avanzato"
};

const MECHANIC_LABELS = {
  compound: "multiarticolare",
  isolation: "isolamento"
};

let exerciseCatalog = [];
let filteredCatalog = [];
let visibleCatalogCount = EXERCISE_CATALOG_PAGE_SIZE;
let selectedCatalogExercise = null;

function catalogImageUrl(path) {
  return `${FREE_EXERCISE_IMAGE_ROOT}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function translateExerciseName(name) {
  if (localStorage.getItem("fitness-exercise-language-v1") === "en") {
    return name;
  }
  const source = name.trim();
  const exact = EXERCISE_NAME_OVERRIDES[source.toLowerCase()];
  if (exact) return exact;

  let translated = source.toLowerCase();
  EXERCISE_NAME_PHRASES.forEach(([english, italian]) => {
    const escaped = english.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    translated = translated.replace(new RegExp(`\\b${escaped}\\b`, "g"), italian);
  });
  translated = translated
    .replace(/\s*-\s*/g, ", ")
    .replace(/\bwith\b/g, "con")
    .replace(/\bfrom\b/g, "da")
    .replace(/\bon\b/g, "su")
    .replace(/\bto\b/g, "verso")
    .replace(/\band\b/g, "e")
    .replace(/\bof\b/g, "di")
    .replace(/\bthe\b/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
  translated = translated
    .replace(/^(con bilanciere|con manubrio|con manubri|con kettlebell|al cavo|alla macchina) (.+)$/i, "$2 $1")
    .replace(/^a corpo libero (.+)$/i, "$1 a corpo libero")
    .replace(/^alternato (.+)$/i, "$1 alternato")
    .replace(/^inclinato (.+)$/i, "$1 inclinato")
    .replace(/^declinato (.+)$/i, "$1 declinato")
    .replace(/^da seduto (.+)$/i, "$1 da seduto")
    .replace(/^in piedi (.+)$/i, "$1 in piedi");
  return translated.charAt(0).toUpperCase() + translated.slice(1);
}

async function loadExerciseCatalog() {
  if (exerciseCatalog.length) return exerciseCatalog;

  let response = null;
  if ("caches" in window) {
    const cache = await caches.open(EXERCISE_CATALOG_CACHE);
    response = await cache.match(EXERCISE_CATALOG_URL);
    if (!response) {
      response = await fetch(EXERCISE_CATALOG_URL);
      if (response.ok) await cache.put(EXERCISE_CATALOG_URL, response.clone());
    }
  } else {
    response = await fetch(EXERCISE_CATALOG_URL);
  }

  if (!response?.ok) throw new Error("Catalogo esercizi non disponibile.");
  exerciseCatalog = await response.json();
  return exerciseCatalog;
}

function injectCatalogStyles() {
  const style = document.createElement("style");
  style.textContent = `
    #customExerciseForm{display:none}
    .catalog-launcher{display:grid;gap:7px;margin-top:20px}
    .catalog-launcher p{margin:0;color:var(--muted);font-size:.78rem}
    .catalog-sheet{width:min(100%,820px);min-height:100dvh;margin:0 auto;padding:22px 16px max(30px,env(safe-area-inset-bottom));background:var(--surface)}
    .catalog-filters{display:grid;gap:10px;margin-top:18px;padding:14px;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--surface-strong)}
    .catalog-filters label{color:var(--muted);font-size:.75rem;font-weight:750}
    .catalog-filters select,.catalog-filters input{width:100%;min-height:45px;margin-top:5px;padding:8px 11px;border:1px solid var(--border);border-radius:11px;background:var(--bg);color:var(--text)}
    .catalog-filter-row{display:grid;grid-template-columns:1fr 1fr;gap:9px}
    .catalog-results-meta{display:flex;justify-content:space-between;gap:12px;margin:15px 2px 8px;color:var(--muted);font-size:.75rem}
    .catalog-grid{display:grid;gap:12px}
    .catalog-card{padding:11px;border:1px solid var(--border);border-radius:16px;background:var(--surface-strong)}
    .catalog-card.is-selected{border-color:var(--accent);box-shadow:0 0 0 2px rgb(126 226 173 / 16%)}
    .catalog-preview{position:relative;aspect-ratio:4/3;border-radius:12px;background:#fff;overflow:hidden}
    .catalog-preview img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;animation:catalogFrames 1.8s steps(1,end) infinite}
    .catalog-preview img:nth-child(2){animation-delay:.9s}
    .catalog-card h3{margin:10px 0 4px;font-size:.95rem}
    .catalog-card-meta{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}
    .catalog-card-meta span{padding:4px 7px;border-radius:999px;background:var(--surface-soft);color:var(--accent);font-size:.66rem;font-weight:750}
    .catalog-card button{width:100%;min-height:42px}
    .catalog-selection{position:sticky;z-index:3;bottom:0;display:grid;gap:10px;margin:16px -4px -8px;padding:14px;border:1px solid rgb(126 226 173 / 25%);border-radius:16px;background:rgb(19 27 24 / 96%);box-shadow:0 -10px 30px rgb(0 0 0 / 28%);backdrop-filter:blur(14px)}
    .catalog-selection strong{color:var(--accent)}
    .catalog-add-fields{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
    .catalog-add-fields label{color:var(--muted);font-size:.7rem;font-weight:750}
    .catalog-add-fields select,.catalog-add-fields input{width:100%;min-height:42px;margin-top:4px;padding:7px 9px;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text)}
    .catalog-empty{padding:30px;border:1px dashed var(--border);border-radius:14px;color:var(--muted);text-align:center}
    .catalog-load-more{width:100%;margin-top:12px}
    @keyframes catalogFrames{0%,49.9%{opacity:1}50%,100%{opacity:0}}
    @media(min-width:620px){.catalog-sheet{min-height:auto;margin-top:3vh;margin-bottom:3vh;border-radius:26px}.catalog-grid{grid-template-columns:repeat(3,1fr)}.catalog-filters{grid-template-columns:1fr 1fr}.catalog-filters .catalog-search{grid-column:1/-1}}
    @media(max-width:480px){.catalog-add-fields{grid-template-columns:1fr 1fr}.catalog-add-fields label:first-child{grid-column:1/-1}}
  `;
  document.head.append(style);
}

function injectCatalogLauncher() {
  const form = document.querySelector("#customExerciseForm");
  if (!form || document.querySelector(".catalog-launcher")) return;
  const launcher = document.createElement("section");
  launcher.className = "catalog-launcher";
  launcher.innerHTML = `
    <button id="openExerciseCatalogButton" class="primary-button full-width" type="button">
      Aggiungi esercizio
    </button>
    <p>Scegli dal catalogo completo con anteprima animata.</p>
  `;
  form.before(launcher);
  launcher.querySelector("button").addEventListener("click", openExerciseCatalog);
}

function injectCatalogOverlay() {
  if (document.querySelector("#exerciseCatalogOverlay")) return;
  const overlay = document.createElement("div");
  overlay.id = "exerciseCatalogOverlay";
  overlay.className = "overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <section class="catalog-sheet" role="dialog" aria-modal="true" aria-labelledby="exerciseCatalogTitle">
      <div class="sheet-header">
        <div><p class="eyebrow">Catalogo completo</p><h2 id="exerciseCatalogTitle">Aggiungi esercizio</h2></div>
        <button id="closeExerciseCatalogButton" class="close-button" type="button" aria-label="Chiudi catalogo">×</button>
      </div>
      <div class="catalog-filters">
        <label>Muscolo<select id="catalogMuscle"></select></label>
        <label>Attrezzatura<select id="catalogEquipment"></select></label>
        <label class="catalog-search">Cerca esercizio<input id="catalogSearch" type="search" placeholder="Es. curl, press, squat..."></label>
      </div>
      <div class="catalog-results-meta"><span id="catalogResultCount"></span><span>Immagini: free-exercise-db</span></div>
      <div id="catalogGrid" class="catalog-grid"></div>
      <button id="catalogLoadMore" class="secondary-button catalog-load-more" type="button">Mostra altri</button>
      <div class="catalog-selection">
        <div>Selezionato: <strong id="catalogSelectedName">nessuno</strong></div>
        <div class="catalog-add-fields">
          <label>Giorno<select id="catalogDay"><option value="upperA">Upper A</option><option value="lower">Lower</option><option value="upperB">Upper B</option></select></label>
          <label>Serie<input id="catalogSets" type="number" min="1" max="12" value="3"></label>
          <label>Ripetizioni<input id="catalogReps" type="text" maxlength="16" value="8-12"></label>
        </div>
        <button id="confirmCatalogExercise" class="primary-button" type="button" disabled>Aggiungi alla scheda</button>
      </div>
    </section>
  `;
  document.body.append(overlay);

  overlay.querySelector("#closeExerciseCatalogButton")
    .addEventListener("click", closeExerciseCatalog);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeExerciseCatalog();
  });
  overlay.querySelector("#catalogMuscle").addEventListener("change", applyCatalogFilters);
  overlay.querySelector("#catalogEquipment").addEventListener("change", applyCatalogFilters);
  overlay.querySelector("#catalogSearch").addEventListener("input", applyCatalogFilters);
  overlay.querySelector("#catalogLoadMore").addEventListener("click", () => {
    visibleCatalogCount += EXERCISE_CATALOG_PAGE_SIZE;
    renderCatalogResults();
  });
  overlay.querySelector("#confirmCatalogExercise")
    .addEventListener("click", addSelectedCatalogExercise);
}

function populateCatalogFilters() {
  const muscleSelect = document.querySelector("#catalogMuscle");
  const equipmentSelect = document.querySelector("#catalogEquipment");
  const muscles = [...new Set(exerciseCatalog.flatMap((exercise) => [
    ...(exercise.primaryMuscles || []),
    ...(exercise.secondaryMuscles || [])
  ]))].sort((a, b) =>
    (MUSCLE_LABELS[a] || a).localeCompare(MUSCLE_LABELS[b] || b, "it")
  );
  const equipment = [...new Set(exerciseCatalog.map((exercise) => exercise.equipment)
    .filter(Boolean))].sort();

  muscleSelect.replaceChildren();
  muscles.forEach((muscle) => {
    const option = document.createElement("option");
    option.value = muscle;
    option.textContent = MUSCLE_LABELS[muscle] || muscle;
    muscleSelect.append(option);
  });

  equipmentSelect.innerHTML = `<option value="">Tutte</option>`;
  equipment.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = EQUIPMENT_LABELS[item] || item;
    equipmentSelect.append(option);
  });
  muscleSelect.value = "chest";
}

async function openExerciseCatalog() {
  const overlay = document.querySelector("#exerciseCatalogOverlay");
  overlay.hidden = false;
  document.body.classList.add("has-open-menu");
  document.querySelector("#catalogGrid").innerHTML =
    `<p class="catalog-empty">Caricamento catalogo...</p>`;
  selectedCatalogExercise = null;
  updateCatalogSelection();

  try {
    await loadExerciseCatalog();
    populateCatalogFilters();
    document.querySelector("#catalogDay").value = activeDay;
    applyCatalogFilters();
  } catch (error) {
    document.querySelector("#catalogGrid").innerHTML =
      `<p class="catalog-empty">${error.message}</p>`;
  }
}

function closeExerciseCatalog() {
  document.querySelector("#exerciseCatalogOverlay").hidden = true;
  document.body.classList.remove("has-open-menu");
}

function applyCatalogFilters() {
  const muscle = document.querySelector("#catalogMuscle").value;
  const equipment = document.querySelector("#catalogEquipment").value;
  const query = document.querySelector("#catalogSearch").value.trim().toLowerCase();
  visibleCatalogCount = EXERCISE_CATALOG_PAGE_SIZE;

  filteredCatalog = exerciseCatalog
    .filter((exercise) => {
      const muscles = [...(exercise.primaryMuscles || []), ...(exercise.secondaryMuscles || [])];
      return muscles.includes(muscle) &&
        (!equipment || exercise.equipment === equipment) &&
        (!query || exercise.name.toLowerCase().includes(query) ||
          translateExerciseName(exercise.name).toLowerCase().includes(query));
    })
    .sort((a, b) => {
      const aPrimary = a.primaryMuscles?.includes(muscle) ? 0 : 1;
      const bPrimary = b.primaryMuscles?.includes(muscle) ? 0 : 1;
      return aPrimary - bPrimary || a.name.localeCompare(b.name);
    });
  renderCatalogResults();
}

function renderCatalogResults() {
  const grid = document.querySelector("#catalogGrid");
  const count = document.querySelector("#catalogResultCount");
  const loadMore = document.querySelector("#catalogLoadMore");
  grid.replaceChildren();
  count.textContent = `${filteredCatalog.length} esercizi disponibili`;

  if (!filteredCatalog.length) {
    grid.innerHTML = `<p class="catalog-empty">Nessun esercizio corrisponde ai filtri.</p>`;
    loadMore.hidden = true;
    return;
  }

  filteredCatalog.slice(0, visibleCatalogCount).forEach((exercise) => {
    grid.append(createCatalogCard(exercise));
  });
  loadMore.hidden = visibleCatalogCount >= filteredCatalog.length;
}

function createCatalogCard(exercise) {
  const card = document.createElement("article");
  card.className = "catalog-card";
  card.dataset.exerciseId = exercise.id;
  card.classList.toggle("is-selected", selectedCatalogExercise?.id === exercise.id);

  const preview = document.createElement("div");
  preview.className = "catalog-preview";
  (exercise.images || []).slice(0, 2).forEach((path) => {
    const image = document.createElement("img");
    image.src = catalogImageUrl(path);
    image.alt = `Esecuzione di ${exercise.name}`;
    image.loading = "lazy";
    preview.append(image);
  });

  const title = document.createElement("h3");
  title.dataset.englishName = exercise.name;
  title.textContent = translateExerciseName(exercise.name);
  const meta = document.createElement("div");
  meta.className = "catalog-card-meta";
  [
    EQUIPMENT_LABELS[exercise.equipment] || exercise.equipment || "Altro",
    LEVEL_LABELS[exercise.level] || exercise.level,
    MECHANIC_LABELS[exercise.mechanic] || exercise.mechanic
  ].filter(Boolean).forEach((text) => {
    const chip = document.createElement("span");
    chip.textContent = text;
    meta.append(chip);
  });
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary-button";
  button.textContent = selectedCatalogExercise?.id === exercise.id ? "Selezionato" : "Scegli";
  button.addEventListener("click", () => {
    selectedCatalogExercise = exercise;
    updateCatalogSelection();
    renderCatalogResults();
  });
  card.append(preview, title, meta, button);
  return card;
}

function updateCatalogSelection() {
  const name = document.querySelector("#catalogSelectedName");
  const confirm = document.querySelector("#confirmCatalogExercise");
  if (!name || !confirm) return;
  name.textContent = selectedCatalogExercise
    ? translateExerciseName(selectedCatalogExercise.name)
    : "nessuno";
  name.dataset.englishName = selectedCatalogExercise?.name || "";
  confirm.disabled = !selectedCatalogExercise;
}

function addSelectedCatalogExercise() {
  if (!selectedCatalogExercise) return;
  const day = document.querySelector("#catalogDay").value;
  const setCount = Math.max(1, Math.min(12, Number(
    document.querySelector("#catalogSets").value
  )));
  const reps = document.querySelector("#catalogReps").value.trim() || "8-12";
  const primaryMuscle = selectedCatalogExercise.primaryMuscles?.[0] || "";
  const exercise = {
    id: `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    day,
    name: translateExerciseName(selectedCatalogExercise.name),
    setsReps: `${setCount}x${reps}`,
    focus: [
      MUSCLE_LABELS[primaryMuscle] || primaryMuscle,
      EQUIPMENT_LABELS[selectedCatalogExercise.equipment] ||
        selectedCatalogExercise.equipment
    ].filter(Boolean).join(" · "),
    description: "Esercizio dal catalogo free-exercise-db. Apri Esercizio per immagini e istruzioni.",
    freeExerciseId: selectedCatalogExercise.id,
    freeExerciseOriginalName: selectedCatalogExercise.name,
    freeExerciseName: translateExerciseName(selectedCatalogExercise.name),
    freeExerciseEquipment:
      EQUIPMENT_LABELS[selectedCatalogExercise.equipment] ||
      selectedCatalogExercise.equipment ||
      "Altro",
    isCustom: true
  };
  customExercises.push(exercise);
  saveCustomExercises();
  workoutEditorState.order[day] = getAllExercises(day).map((item) => item.id);
  saveWorkoutEditorState();
  activeDay = day;
  renderWorkout();
  renderCustomExerciseList();
  closeExerciseCatalog();
  document.querySelector(".workout-tabs")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function installExerciseCatalog() {
  injectCatalogStyles();
  injectCatalogOverlay();
  injectCatalogLauncher();
}

installExerciseCatalog();
