"use strict";

const WORKOUT_EDITOR_STORAGE_KEY = "fitness-workout-editor-v1";

const WORKOUT_MUSCLE_GROUPS = {
  Petto: ["Spinta inclinata", "Croci"],
  Dorso: ["Tirata orizzontale", "Tirata verticale"],
  Spalle: ["Alzate laterali"],
  Braccia: ["Bicipiti", "Tricipiti"],
  Gambe: ["Accosciata", "Hip hinge", "Leg curl", "Leg extension mono / Sissy squat", "Abductor / Adductor", "Polpacci"],
  Core: ["Crunch machine"]
};

let workoutEditorState = loadWorkoutEditorState();
let workoutEditMode = false;
STORAGE_KEYS.workoutEditor = WORKOUT_EDITOR_STORAGE_KEY;

function loadWorkoutEditorState() {
  try {
    return { overrides: {}, order: {}, ...JSON.parse(localStorage.getItem(WORKOUT_EDITOR_STORAGE_KEY) || "{}") };
  } catch { return { overrides: {}, order: {} }; }
}
function saveWorkoutEditorState() { localStorage.setItem(WORKOUT_EDITOR_STORAGE_KEY, JSON.stringify(workoutEditorState)); }
function categoryVariants(category) { return typeof FREE_EXERCISE_VARIANTS !== "undefined" ? FREE_EXERCISE_VARIANTS[category] || [] : []; }
function categoryGroup(category) { return Object.entries(WORKOUT_MUSCLE_GROUPS).find(([, categories]) => categories.includes(category))?.[0] || "Altro"; }
function applyExerciseOverride(exercise) { return { ...exercise, ...(workoutEditorState.overrides[exercise.id] || {}) }; }

const originalGetAllExercisesForEditor = getAllExercises;
getAllExercises = function getEditedExercises(day) {
  const exercises = originalGetAllExercisesForEditor(day).map(applyExerciseOverride);
  const savedOrder = workoutEditorState.order[day] || [];
  const positions = new Map(savedOrder.map((id, index) => [id, index]));
  return exercises.map((exercise, index) => ({ exercise, index })).sort((a, b) => {
    const aPosition = positions.has(a.exercise.id) ? positions.get(a.exercise.id) : savedOrder.length + a.index;
    const bPosition = positions.has(b.exercise.id) ? positions.get(b.exercise.id) : savedOrder.length + b.index;
    return aPosition - bPosition;
  }).map(({ exercise }) => exercise);
};

function ensureVariantButton(card, exercise) {
  if (exercise.freeExerciseId && exercise.freeExerciseName) {
    card.dataset.freeExerciseId = exercise.freeExerciseId;
    let directButton = card.querySelector(".exercise-guide-button");
    let actions = card.querySelector(".exercise-card-actions");
    const badge = card.querySelector(".reps-badge");
    if (!actions) {
      actions = document.createElement("div"); actions.className = "exercise-card-actions";
      badge.before(actions); actions.append(badge);
    }
    if (!directButton) {
      directButton = document.createElement("button"); directButton.type = "button";
      directButton.className = "exercise-guide-button"; actions.prepend(directButton);
    } else {
      const cleanButton = directButton.cloneNode(true); directButton.replaceWith(cleanButton); directButton = cleanButton;
    }
    directButton.textContent = "Esercizio"; directButton.hidden = false;
    directButton.addEventListener("click", () => openSingleFreeExercise({
      id: exercise.freeExerciseId,
      name: exercise.freeExerciseName,
      equipment: exercise.freeExerciseEquipment || "Attrezzatura varia"
    }));
    return;
  }

  const category = exercise.variantCategory || (typeof FREE_EXERCISE_VARIANTS !== "undefined" && FREE_EXERCISE_VARIANTS[exercise.name] ? exercise.name : "");
  if (!category) return;
  card.dataset.variantCategory = category;
  let actions = card.querySelector(".exercise-card-actions");
  const badge = card.querySelector(".reps-badge");
  if (!actions) {
    actions = document.createElement("div"); actions.className = "exercise-card-actions";
    badge.before(actions); actions.append(badge);
  }
  let guideButton = card.querySelector(".exercise-guide-button");
  if (!guideButton) {
    guideButton = document.createElement("button"); guideButton.type = "button";
    guideButton.className = "exercise-guide-button"; actions.prepend(guideButton);
  } else {
    const cleanButton = guideButton.cloneNode(true); guideButton.replaceWith(cleanButton); guideButton = cleanButton;
  }
  guideButton.textContent = "Esercizi"; guideButton.hidden = false; guideButton.dataset.freeVariants = "true";
  guideButton.addEventListener("click", () => openFreeExerciseOverlay(category));
}

function changeExerciseSeries(exercise, delta) {
  const currentCount = parseSetCount(exercise.setsReps);
  const nextCount = Math.max(1, Math.min(12, currentCount + delta));
  const suffix = String(exercise.setsReps).replace(/^\s*\d+\s*x?\s*/i, "");
  workoutEditorState.overrides[exercise.id] = { ...(workoutEditorState.overrides[exercise.id] || {}), setsReps: `${nextCount}x${suffix || "8-12"}` };
  saveWorkoutEditorState(); renderWorkout();
}
function moveExercise(exerciseId, direction) {
  const ids = getAllExercises(activeDay).map((exercise) => exercise.id);
  const currentIndex = ids.indexOf(exerciseId); const nextIndex = currentIndex + direction;
  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= ids.length) return;
  [ids[currentIndex], ids[nextIndex]] = [ids[nextIndex], ids[currentIndex]];
  workoutEditorState.order[activeDay] = ids; saveWorkoutEditorState(); renderWorkout();
}
function saveVisibleExerciseOrder() {
  workoutEditorState.order[activeDay] = [...document.querySelectorAll("#exerciseList .exercise-card")].map((card) => card.dataset.exerciseId);
  saveWorkoutEditorState();
}
function installExerciseDragHandle(handle, card) {
  let dragging = false;
  handle.addEventListener("pointerdown", (event) => {
    if (!workoutEditMode) return;
    dragging = true; handle.setPointerCapture(event.pointerId);
    card.classList.add("is-dragging"); document.body.classList.add("is-dragging-exercise");
  });
  handle.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".exercise-card");
    if (!target || target === card || target.parentElement !== card.parentElement) return;
    const targetBox = target.getBoundingClientRect();
    target.parentElement.insertBefore(card, event.clientY > targetBox.top + targetBox.height / 2 ? target.nextSibling : target);
  });
  const finishDrag = (event) => {
    if (!dragging) return; dragging = false;
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    card.classList.remove("is-dragging"); document.body.classList.remove("is-dragging-exercise"); saveVisibleExerciseOrder();
  };
  handle.addEventListener("pointerup", finishDrag); handle.addEventListener("pointercancel", finishDrag);
}

function addExerciseEditControls(card, exercise) {
  const controls = document.createElement("div"); controls.className = "exercise-edit-controls";
  controls.innerHTML = `<div class="exercise-series-editor" aria-label="Modifica numero di serie"><button type="button" aria-label="Rimuovi una serie">−</button><span>${parseSetCount(exercise.setsReps)} serie</span><button type="button" aria-label="Aggiungi una serie">+</button></div><div class="exercise-order-editor"><button type="button" class="exercise-drag-handle" aria-label="Trascina per riordinare" title="Trascina per riordinare">☰</button><button type="button" class="edit-exercise-button">Modifica</button></div>`;
  const seriesButtons = controls.querySelectorAll(".exercise-series-editor button");
  seriesButtons[0].addEventListener("click", () => changeExerciseSeries(exercise, -1));
  seriesButtons[1].addEventListener("click", () => changeExerciseSeries(exercise, 1));
  const orderButtons = controls.querySelectorAll(".exercise-order-editor button");
  installExerciseDragHandle(orderButtons[0], card);
  orderButtons[0].addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") { event.preventDefault(); moveExercise(exercise.id, -1); }
    if (event.key === "ArrowDown") { event.preventDefault(); moveExercise(exercise.id, 1); }
  });
  orderButtons[1].addEventListener("click", () => openExerciseEditor(exercise)); card.append(controls);
}

const originalCreateExerciseCardForEditor = createExerciseCard;
createExerciseCard = function createEditableExerciseCard(exercise, index) {
  const card = originalCreateExerciseCardForEditor(exercise, index); ensureVariantButton(card, exercise); addExerciseEditControls(card, exercise); return card;
};
function setEditMode(enabled) {
  workoutEditMode = enabled; document.body.classList.toggle("is-editing-workout", enabled);
  const button = document.querySelector("#toggleWorkoutEditButton");
  if (button) { button.textContent = enabled ? "Fine modifica" : "Modifica scheda"; button.setAttribute("aria-pressed", String(enabled)); }
}
function populateSelect(select, options, selectedValue = "") {
  select.replaceChildren(); options.forEach(({ value, label }) => {
    const option = document.createElement("option"); option.value = value; option.textContent = label; option.selected = value === selectedValue; select.append(option);
  });
}
function populateCategorySelect(groupSelect, categorySelect, selectedCategory = "") {
  const categories = WORKOUT_MUSCLE_GROUPS[groupSelect.value] || [];
  populateSelect(categorySelect, categories.map((category) => ({ value: category, label: category })), categories.includes(selectedCategory) ? selectedCategory : categories[0]);
}
function populateVariantSelect(categorySelect, variantSelect, selectedId = "") {
  const variants = categoryVariants(categorySelect.value);
  populateSelect(variantSelect, [{ value: "", label: `Categoria generica: ${categorySelect.value}` }, ...variants.map((variant) => ({ value: variant.id, label: `${variant.name} · ${variant.equipment}` }))], selectedId);
}
function selectedVariant(category, variantId) { return categoryVariants(category).find((variant) => variant.id === variantId); }

function injectExerciseEditorOverlay() {
  if (document.querySelector("#exerciseEditorOverlay")) return;
  const overlay = document.createElement("div"); overlay.id = "exerciseEditorOverlay"; overlay.className = "overlay"; overlay.hidden = true;
  overlay.innerHTML = `<section class="exercise-editor-sheet" role="dialog" aria-modal="true" aria-labelledby="exerciseEditorTitle"><div class="sheet-header"><div><p class="eyebrow">Modifica scheda</p><h2 id="exerciseEditorTitle">Esercizio</h2></div><button id="closeExerciseEditorButton" class="close-button" type="button" aria-label="Chiudi modifica">×</button></div><form id="exerciseEditorForm" class="exercise-form"><input name="exerciseId" type="hidden"><label>Gruppo muscolare<select name="muscleGroup"></select></label><label>Tipologia<select name="variantCategory"></select></label><label>Esercizio<select name="freeExerciseId"></select></label><div class="form-row"><label>Serie<input name="setCount" type="number" min="1" max="12" required></label><label>Ripetizioni<input name="repRange" type="text" maxlength="16" required placeholder="8-12"></label></div><button class="primary-button full-width" type="submit">Salva modifiche</button></form></section>`;
  document.body.append(overlay);
  const form = overlay.querySelector("#exerciseEditorForm"); const groupSelect = form.elements.muscleGroup; const categorySelect = form.elements.variantCategory; const variantSelect = form.elements.freeExerciseId;
  populateSelect(groupSelect, Object.keys(WORKOUT_MUSCLE_GROUPS).map((group) => ({ value: group, label: group })));
  groupSelect.addEventListener("change", () => { populateCategorySelect(groupSelect, categorySelect); populateVariantSelect(categorySelect, variantSelect); });
  categorySelect.addEventListener("change", () => populateVariantSelect(categorySelect, variantSelect));
  form.addEventListener("submit", saveExerciseEdit); overlay.querySelector("#closeExerciseEditorButton").addEventListener("click", closeExerciseEditor);
  overlay.addEventListener("click", (event) => { if (event.target === overlay) closeExerciseEditor(); });
}
function openExerciseEditor(exercise) {
  const overlay = document.querySelector("#exerciseEditorOverlay"); const form = overlay.querySelector("#exerciseEditorForm");
  const category = exercise.variantCategory || (FREE_EXERCISE_VARIANTS[exercise.name] ? exercise.name : "Spinta inclinata"); const group = categoryGroup(category);
  form.elements.exerciseId.value = exercise.id; form.elements.muscleGroup.value = group;
  populateCategorySelect(form.elements.muscleGroup, form.elements.variantCategory, category);
  populateVariantSelect(form.elements.variantCategory, form.elements.freeExerciseId, exercise.freeExerciseId || "");
  form.elements.setCount.value = parseSetCount(exercise.setsReps); form.elements.repRange.value = String(exercise.setsReps).replace(/^\s*\d+\s*x?\s*/i, "") || "8-12";
  document.querySelector("#exerciseEditorTitle").textContent = exercise.name; overlay.hidden = false; document.body.classList.add("has-open-menu");
}
function closeExerciseEditor() { document.querySelector("#exerciseEditorOverlay").hidden = true; document.body.classList.remove("has-open-menu"); }
function saveExerciseEdit(event) {
  event.preventDefault(); const form = event.currentTarget; const exerciseId = form.elements.exerciseId.value; const category = form.elements.variantCategory.value;
  const variant = selectedVariant(category, form.elements.freeExerciseId.value); const setCount = Math.max(1, Math.min(12, Number(form.elements.setCount.value))); const repRange = form.elements.repRange.value.trim() || "8-12";
  workoutEditorState.overrides[exerciseId] = { ...(workoutEditorState.overrides[exerciseId] || {}), name: variant?.name || category, focus: variant ? `${category} · ${variant.equipment}` : category, description: variant ? `Variante selezionata: ${variant.name}. Apri Esercizi per immagini e istruzioni.` : "Scegli la variante più adatta dalla raccolta Esercizi.", setsReps: `${setCount}x${repRange}`, variantCategory: category, freeExerciseId: variant?.id || "" };
  saveWorkoutEditorState(); closeExerciseEditor(); renderWorkout();
}

function enhanceCustomExerciseForm() {
  const form = document.querySelector("#customExerciseForm"); if (!form || form.querySelector(".guided-exercise-fields")) return;
  const fields = document.createElement("fieldset"); fields.className = "guided-exercise-fields";
  fields.innerHTML = `<legend>Scegli dal catalogo gratuito</legend><label>Gruppo muscolare<select name="guidedMuscleGroup"></select></label><label>Tipologia<select name="guidedVariantCategory"></select></label><label>Esercizio<select name="guidedFreeExerciseId"></select></label>`; form.prepend(fields);
  const groupSelect = form.elements.guidedMuscleGroup; const categorySelect = form.elements.guidedVariantCategory; const variantSelect = form.elements.guidedFreeExerciseId;
  populateSelect(groupSelect, Object.keys(WORKOUT_MUSCLE_GROUPS).map((group) => ({ value: group, label: group })));
  function syncGuidedExercise() {
    const category = categorySelect.value; const variant = selectedVariant(category, variantSelect.value); if (!variant) return;
    form.elements.name.value = variant.name; form.elements.focus.value = `${category} · ${variant.equipment}`; form.elements.description.value = "Variante dal catalogo free-exercise-db. Apri Esercizi per immagini e istruzioni.";
  }
  groupSelect.addEventListener("change", () => { populateCategorySelect(groupSelect, categorySelect); populateVariantSelect(categorySelect, variantSelect); syncGuidedExercise(); });
  categorySelect.addEventListener("change", () => { populateVariantSelect(categorySelect, variantSelect); syncGuidedExercise(); }); variantSelect.addEventListener("change", syncGuidedExercise);
  populateCategorySelect(groupSelect, categorySelect); populateVariantSelect(categorySelect, variantSelect); variantSelect.value = categoryVariants(categorySelect.value)[0]?.id || ""; syncGuidedExercise();
  form.addEventListener("submit", () => { const category = categorySelect.value; const variantId = variantSelect.value; queueMicrotask(() => { const exercise = customExercises[customExercises.length - 1]; if (!exercise) return; exercise.variantCategory = category; exercise.freeExerciseId = variantId; saveCustomExercises(); workoutEditorState.order[exercise.day] = getAllExercises(exercise.day).map((item) => item.id); saveWorkoutEditorState(); renderWorkout(); }); }, true);
}

function injectWorkoutEditorStyles() {
  const style = document.createElement("style"); style.textContent = `.workout-heading-actions{display:flex;align-items:center;gap:12px}#toggleWorkoutEditButton{white-space:nowrap}.exercise-edit-controls{display:none;align-items:center;justify-content:space-between;gap:10px;margin-top:16px;padding-top:14px;border-top:1px dashed rgb(126 226 173 / 34%)}body.is-editing-workout .exercise-edit-controls{display:flex}body.is-editing-workout .exercise-card{border-color:rgb(126 226 173 / 35%)}.exercise-series-editor,.exercise-order-editor{display:flex;align-items:center;gap:7px}.exercise-edit-controls button{min-width:38px;min-height:38px;padding:0 10px;border:1px solid var(--border);border-radius:10px;background:var(--surface-soft);color:var(--text);font-weight:850;cursor:pointer}.exercise-drag-handle{touch-action:none;cursor:grab!important;color:var(--accent)!important;font-size:1.1rem}.exercise-drag-handle:active{cursor:grabbing!important}.exercise-card.is-dragging{z-index:30;border-color:var(--accent);box-shadow:0 18px 42px rgb(0 0 0 / 45%);opacity:.88;transform:scale(1.015)}body.is-dragging-exercise{user-select:none}.exercise-series-editor span{min-width:54px;color:var(--muted);font-size:.75rem;text-align:center}.edit-exercise-button{color:var(--accent)!important}.exercise-editor-sheet{width:min(100%,560px);margin:0 auto;padding:22px 18px max(30px,env(safe-area-inset-bottom));border-radius:26px 26px 0 0;background:var(--surface)}.guided-exercise-fields{display:grid;gap:12px;margin:0;padding:0 0 16px;border:0;border-bottom:1px solid var(--border)}.guided-exercise-fields legend{margin-bottom:10px;color:var(--accent);font-size:.78rem;font-weight:850}.guided-exercise-fields label{color:var(--muted);font-size:.78rem;font-weight:750}.guided-exercise-fields select{width:100%;min-height:48px;margin-top:7px;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text)}@media(min-width:600px){.exercise-editor-sheet{margin-top:8vh;border-radius:26px}}@media(max-width:520px){.workout-heading{align-items:flex-start}.workout-heading-actions{flex-direction:column;align-items:flex-end}.exercise-edit-controls{align-items:flex-start;flex-direction:column}.exercise-order-editor{width:100%}.edit-exercise-button{margin-left:auto}}`; document.head.append(style);
}
function installWorkoutEditor() {
  injectWorkoutEditorStyles(); injectExerciseEditorOverlay(); enhanceCustomExerciseForm();
  const heading = document.querySelector(".workout-heading"); const resetButton = document.querySelector("#resetDayButton");
  if (heading && resetButton && !document.querySelector("#toggleWorkoutEditButton")) {
    const actions = document.createElement("div"); actions.className = "workout-heading-actions"; const editButton = document.createElement("button");
    editButton.id = "toggleWorkoutEditButton"; editButton.className = "secondary-button"; editButton.type = "button"; editButton.textContent = "Modifica scheda"; editButton.setAttribute("aria-pressed", "false"); editButton.addEventListener("click", () => setEditMode(!workoutEditMode));
    resetButton.before(actions); actions.append(editButton, resetButton);
  }
  document.querySelector("#resetAllButton")?.addEventListener("click", () => window.setTimeout(() => { if (localStorage.getItem(WORKOUT_EDITOR_STORAGE_KEY) !== null) return; workoutEditorState = { overrides: {}, order: {} }; setEditMode(false); renderWorkout(); }));
  renderWorkout();
}
installWorkoutEditor();
