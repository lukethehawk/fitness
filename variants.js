"use strict";

const FREE_EXERCISE_IMAGE_ROOT = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";
const FREE_EXERCISE_JSON_ROOT = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";
const FREE_EXERCISE_CACHE_KEY = "fitness-free-exercise-details-v1";

const FREE_EXERCISE_VARIANTS = {
  "Spinta inclinata": [
    variant("Barbell_Incline_Bench_Press_-_Medium_Grip", "Panca inclinata con bilanciere", "Bilanciere"),
    variant("Incline_Dumbbell_Press", "Panca inclinata con manubri", "Manubri"),
    variant("Smith_Machine_Incline_Bench_Press", "Panca inclinata alla Smith machine", "Macchina")
  ],
  "Tirata orizzontale": [
    variant("Seated_Cable_Rows", "Rematore al cavo da seduto", "Cavo"),
    variant("Bent_Over_Barbell_Row", "Rematore con bilanciere", "Bilanciere"),
    variant("One-Arm_Dumbbell_Row", "Rematore a un braccio", "Manubrio")
  ],
  "Croci": [
    variant("Butterfly", "Pec deck / Butterfly", "Macchina"),
    variant("Cable_Crossover", "Croci ai cavi", "Cavo"),
    variant("Dumbbell_Flyes", "Croci con manubri", "Manubri")
  ],
  "Alzate laterali": [
    variant("Side_Lateral_Raise", "Alzate laterali in piedi", "Manubri"),
    variant("Seated_Side_Lateral_Raise", "Alzate laterali da seduto", "Manubri"),
    variant("Cable_Seated_Lateral_Raise", "Alzate laterali al cavo", "Cavo"),
    variant("Lateral_Raise_-_With_Bands", "Alzate laterali con elastico", "Elastico")
  ],
  "Bicipiti": [
    variant("Dumbbell_Alternate_Bicep_Curl", "Curl alternato", "Manubri"),
    variant("Alternate_Hammer_Curl", "Hammer curl alternato", "Manubri"),
    variant("Alternate_Incline_Dumbbell_Curl", "Curl inclinato alternato", "Manubri"),
    variant("Concentration_Curls", "Curl di concentrazione", "Manubrio"),
    variant("Barbell_Curl", "Curl con bilanciere", "Bilanciere"),
    variant("Cable_Hammer_Curls_-_Rope_Attachment", "Hammer curl al cavo", "Cavo")
  ],
  "Tricipiti": [
    variant("Triceps_Pushdown", "Pushdown", "Cavo"),
    variant("Cable_Rope_Overhead_Triceps_Extension", "Estensione sopra la testa", "Cavo"),
    variant("Dips_-_Triceps_Version", "Dip per tricipiti", "Corpo libero"),
    variant("Dumbbell_One-Arm_Triceps_Extension", "Estensione a un braccio", "Manubrio"),
    variant("Close-Grip_Barbell_Bench_Press", "Panca presa stretta", "Bilanciere")
  ],
  "Polpacci": [
    variant("Standing_Calf_Raises", "Calf raise in piedi", "Macchina"),
    variant("Seated_Calf_Raise", "Calf raise da seduto", "Macchina"),
    variant("Smith_Machine_Calf_Raise", "Calf raise alla Smith machine", "Macchina"),
    variant("Standing_Dumbbell_Calf_Raise", "Calf raise con manubri", "Manubri"),
    variant("Donkey_Calf_Raises", "Donkey calf raise", "Corpo libero")
  ],
  "Accosciata": [
    variant("Barbell_Squat", "Squat con bilanciere", "Bilanciere"),
    variant("Front_Barbell_Squat", "Front squat", "Bilanciere"),
    variant("Dumbbell_Squat", "Squat con manubri", "Manubri"),
    variant("Goblet_Squat", "Goblet squat", "Kettlebell"),
    variant("Hack_Squat", "Hack squat", "Macchina")
  ],
  "Hip hinge": [
    variant("Romanian_Deadlift", "Stacco rumeno", "Bilanciere"),
    variant("Stiff-Legged_Barbell_Deadlift", "Stacco a gambe tese", "Bilanciere"),
    variant("Good_Morning", "Good morning", "Bilanciere")
  ],
  "Leg curl": [
    variant("Lying_Leg_Curls", "Leg curl sdraiato", "Macchina"),
    variant("Seated_Leg_Curl", "Leg curl da seduto", "Macchina"),
    variant("Standing_Leg_Curl", "Leg curl in piedi", "Macchina")
  ],
  "Leg extension mono / Sissy squat": [
    variant("Single-Leg_Leg_Extension", "Leg extension mono", "Macchina"),
    variant("Leg_Extensions", "Leg extension", "Macchina"),
    variant("Weighted_Sissy_Squat", "Sissy squat zavorrato", "Bilanciere")
  ],
  "Abductor / Adductor": [
    variant("Thigh_Abductor", "Abductor machine", "Macchina"),
    variant("Thigh_Adductor", "Adductor machine", "Macchina"),
    variant("Band_Hip_Adductions", "Adduzione con elastico", "Elastico"),
    variant("Cable_Hip_Adduction", "Adduzione al cavo", "Cavo")
  ],
  "Crunch machine": [
    variant("Ab_Crunch_Machine", "Crunch machine", "Macchina"),
    variant("Cable_Crunch", "Crunch al cavo", "Cavo"),
    variant("Cable_Seated_Crunch", "Crunch al cavo da seduto", "Cavo"),
    variant("Crunches", "Crunch a corpo libero", "Corpo libero")
  ],
  "Tirata verticale": [
    variant("Wide-Grip_Lat_Pulldown", "Lat machine presa larga", "Cavo"),
    variant("Close-Grip_Front_Lat_Pulldown", "Lat machine presa stretta", "Cavo"),
    variant("Underhand_Cable_Pulldowns", "Lat machine presa supina", "Cavo"),
    variant("V-Bar_Pulldown", "Lat machine con triangolo", "Cavo")
  ]
};

let freeExerciseAnimationIds = [];

function variant(id, name, equipment) { return { id, name, equipment }; }
function freeExerciseImageUrl(id, frame) { return `${FREE_EXERCISE_IMAGE_ROOT}/${encodeURIComponent(id)}/${frame}.jpg`; }

function installFreeExerciseSelector() {
  injectFreeExerciseStyles();
  injectFreeExerciseOverlay();
  replaceGuideButtons();
  const exerciseList = document.querySelector("#exerciseList");
  if (exerciseList) new MutationObserver(replaceGuideButtons).observe(exerciseList, { childList: true });
}

function injectFreeExerciseStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .free-exercise-sheet{width:min(100%,760px);min-height:calc(100dvh - max(20px,env(safe-area-inset-top)));margin:0 auto;padding:22px 18px max(30px,env(safe-area-inset-bottom));border-radius:26px 26px 0 0;background:var(--surface)}
    .free-exercise-intro{color:var(--muted);font-size:.88rem}
    .free-exercise-list{display:grid;gap:14px;margin-top:18px}
    .free-exercise-item{padding:14px;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--surface-strong)}
    .free-exercise-preview{display:block;width:100%;aspect-ratio:4/3;border-radius:14px;background:#fff;object-fit:contain}
    .free-exercise-title{display:flex;align-items:start;justify-content:space-between;gap:10px;margin-top:12px}
    .free-exercise-title h3{font-size:1rem}
    .free-exercise-equipment{flex:0 0 auto;padding:5px 8px;border-radius:999px;background:var(--surface-soft);color:var(--accent);font-size:.7rem;font-weight:800}
    .free-exercise-actions{display:flex;align-items:center;gap:14px;margin-top:10px}
    .free-exercise-details{margin-top:12px;padding-top:12px;border-top:1px solid var(--border);color:var(--muted);font-size:.85rem}
    .free-exercise-details ol{display:grid;gap:8px;padding-left:22px}
    .free-exercise-workoutx{margin:20px 0 0;padding:16px;border:1px dashed rgb(126 226 173 / 35%);border-radius:var(--radius-md);text-align:center}
    .free-exercise-source{margin:18px 0 0;color:var(--muted);font-size:.7rem;text-align:center}
    @media(min-width:620px){.free-exercise-list{grid-template-columns:repeat(2,1fr)}.free-exercise-sheet{min-height:auto;margin-top:4vh;margin-bottom:4vh;border-radius:26px}}
  `;
  document.head.append(style);
}

function injectFreeExerciseOverlay() {
  if (document.querySelector("#freeExerciseOverlay")) return;
  const overlay = document.createElement("div");
  overlay.id = "freeExerciseOverlay";
  overlay.className = "overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <section class="free-exercise-sheet" role="dialog" aria-modal="true" aria-labelledby="freeExerciseTitle">
      <div class="sheet-header">
        <div><p class="eyebrow">Varianti</p><h2 id="freeExerciseTitle">Esercizi</h2></div>
        <button id="closeFreeExerciseButton" class="close-button" type="button" aria-label="Chiudi esercizi">×</button>
      </div>
      <p id="freeExerciseIntro" class="free-exercise-intro"></p>
      <div id="freeExerciseList" class="free-exercise-list"></div>
      <div id="freeExerciseWorkoutx" class="free-exercise-workoutx" hidden></div>
      <p class="free-exercise-source">Immagini e dati: free-exercise-db, pubblico dominio (Unlicense).</p>
    </section>`;
  document.body.append(overlay);
  document.querySelector("#closeFreeExerciseButton").addEventListener("click", closeFreeExerciseOverlay);
  overlay.addEventListener("click", (event) => { if (event.target === overlay) closeFreeExerciseOverlay(); });
}

function replaceGuideButtons() {
  document.querySelectorAll(".exercise-card").forEach((card) => {
    const name = card.querySelector(".exercise-name")?.textContent.trim();
    if (!FREE_EXERCISE_VARIANTS[name]) return;
    const current = card.querySelector(".exercise-guide-button");
    if (!current || current.dataset.freeVariants === "true") return;
    const replacement = current.cloneNode(true);
    replacement.textContent = "Esercizi";
    replacement.dataset.freeVariants = "true";
    replacement.addEventListener("click", () => openFreeExerciseOverlay(name));
    current.replaceWith(replacement);
  });
}

function openFreeExerciseOverlay(categoryName) {
  clearFreeExerciseAnimations();
  const overlay = document.querySelector("#freeExerciseOverlay");
  const list = document.querySelector("#freeExerciseList");
  document.querySelector("#freeExerciseTitle").textContent = categoryName;
  document.querySelector("#freeExerciseIntro").textContent = "Scegli la variante che corrisponde all’attrezzo e al movimento che userai oggi.";
  list.replaceChildren();
  FREE_EXERCISE_VARIANTS[categoryName].forEach((exercise) => list.append(createFreeExerciseItem(exercise)));
  configureWorkoutxFallback(categoryName);
  overlay.hidden = false;
  document.body.classList.add("has-open-menu");
}

function createFreeExerciseItem(exercise) {
  const item = document.createElement("article");
  item.className = "free-exercise-item";
  const image = document.createElement("img");
  image.className = "free-exercise-preview";
  image.src = freeExerciseImageUrl(exercise.id, 0);
  image.alt = `Esecuzione di ${exercise.name}`;
  image.loading = "lazy";
  let frame = 0;
  const animationId = window.setInterval(() => { frame = frame === 0 ? 1 : 0; image.src = freeExerciseImageUrl(exercise.id, frame); }, 900);
  freeExerciseAnimationIds.push(animationId);
  const title = document.createElement("div");
  title.className = "free-exercise-title";
  title.innerHTML = `<h3>${exercise.name}</h3><span class="free-exercise-equipment">${exercise.equipment}</span>`;
  const actions = document.createElement("div");
  actions.className = "free-exercise-actions";
  const detailsButton = document.createElement("button");
  detailsButton.className = "secondary-button";
  detailsButton.type = "button";
  detailsButton.textContent = "Istruzioni";
  const details = document.createElement("div");
  details.className = "free-exercise-details";
  details.hidden = true;
  detailsButton.addEventListener("click", () => toggleFreeExerciseDetails(exercise, details, detailsButton));
  actions.append(detailsButton);
  item.append(image, title, actions, details);
  return item;
}

async function toggleFreeExerciseDetails(exercise, container, button) {
  if (!container.hidden) { container.hidden = true; button.textContent = "Istruzioni"; return; }
  container.hidden = false;
  button.textContent = "Nascondi";
  if (container.childElementCount) return;
  container.textContent = "Caricamento...";
  try {
    const data = await loadFreeExerciseDetails(exercise.id);
    container.replaceChildren();
    const list = document.createElement("ol");
    (data.instructions || []).forEach((instruction) => { const item = document.createElement("li"); item.textContent = instruction; list.append(item); });
    container.append(list);
  } catch { container.textContent = "Istruzioni non disponibili in questo momento."; }
}

async function loadFreeExerciseDetails(id) {
  let cache = {};
  try { cache = JSON.parse(localStorage.getItem(FREE_EXERCISE_CACHE_KEY) || "{}"); } catch { cache = {}; }
  if (cache[id]) return cache[id];
  const response = await fetch(`${FREE_EXERCISE_JSON_ROOT}/${encodeURIComponent(id)}.json`);
  if (!response.ok) throw new Error(`Errore ${response.status}`);
  const data = await response.json();
  cache[id] = data;
  localStorage.setItem(FREE_EXERCISE_CACHE_KEY, JSON.stringify(cache));
  return data;
}

function configureWorkoutxFallback(categoryName) {
  const area = document.querySelector("#freeExerciseWorkoutx");
  area.replaceChildren();
  const workoutxId = typeof WORKOUTX_IDS !== "undefined" ? WORKOUTX_IDS[categoryName] : null;
  if (!workoutxId || typeof openWorkoutxGuide !== "function") { area.hidden = true; return; }
  area.hidden = false;
  const text = document.createElement("p");
  text.textContent = "Vuoi anche la guida animata e dettagliata di WorkoutX?";
  const button = document.createElement("button");
  button.className = "primary-button";
  button.type = "button";
  button.textContent = "Apri guida WorkoutX";
  button.addEventListener("click", () => { closeFreeExerciseOverlay(); openWorkoutxGuide(categoryName, workoutxId); });
  area.append(text, button);
}

function closeFreeExerciseOverlay() {
  clearFreeExerciseAnimations();
  document.querySelector("#freeExerciseOverlay").hidden = true;
  document.body.classList.remove("has-open-menu");
}
function clearFreeExerciseAnimations() { freeExerciseAnimationIds.forEach((id) => window.clearInterval(id)); freeExerciseAnimationIds = []; }
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !document.querySelector("#freeExerciseOverlay")?.hidden) closeFreeExerciseOverlay(); });
installFreeExerciseSelector();
