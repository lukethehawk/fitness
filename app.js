"use strict";

// Modifica questa struttura per cambiare la scheda di base.
const WORKOUTS = {
  upperA: {
    weekday: "Lunedì",
    title: "Upper A",
    subtitle: "Palestra + Wing Chun",
    exercises: [
      {
        id: "upper-a-incline-press",
        name: "Spinta inclinata",
        setsReps: "3x6-8",
        focus: "Petto alto / spinta",
        description: "Scapole addotte e petto alto. Scendi controllato, poi spingi senza chiudere le spalle in avanti."
      },
      {
        id: "upper-a-horizontal-pull",
        name: "Tirata orizzontale",
        setsReps: "3x8-12",
        focus: "Dorso / remata",
        description: "Tira portando i gomiti indietro, non le mani. Mantieni busto stabile e chiudi bene le scapole."
      },
      {
        id: "upper-a-fly",
        name: "Croci",
        setsReps: "2x8-12",
        focus: "Petto in isolamento",
        description: "Gomiti leggermente flessi e movimento ampio. Cerca allungamento sul petto, senza caricare troppo le spalle."
      },
      {
        id: "upper-a-lateral-raise",
        name: "Alzate laterali",
        setsReps: "3x8-12",
        focus: "Deltoidi laterali",
        description: "Alza fino circa alla linea delle spalle. Polsi neutri, gomiti morbidi, niente slancio del busto."
      },
      {
        id: "upper-a-biceps",
        name: "Bicipiti",
        setsReps: "2x8-12",
        focus: "Braccia",
        description: "Tieni i gomiti fermi vicino al busto. Sali controllato e scendi lentamente senza perdere tensione."
      },
      {
        id: "upper-a-triceps",
        name: "Tricipiti",
        setsReps: "2x8-12",
        focus: "Braccia",
        description: "Gomiti fermi e spalle basse. Estendi completamente senza compensare con busto o deltoidi."
      }
    ]
  },
  lower: {
    weekday: "Mercoledì",
    title: "Lower",
    subtitle: "Palestra + Wing Chun",
    exercises: [
      {
        id: "lower-calves",
        name: "Polpacci",
        setsReps: "3x8-12",
        focus: "Polpacci",
        description: "Massima escursione: scendi bene in allungamento e sali fino in punta. Evita rimbalzi."
      },
      {
        id: "lower-squat",
        name: "Accosciata",
        setsReps: "3x6-8",
        focus: "Quadricipiti / glutei",
        description: "Schiena stabile e piedi ben piantati. Scendi controllato, poi spingi mantenendo ginocchia in linea coi piedi."
      },
      {
        id: "lower-hip-hinge",
        name: "Hip hinge",
        setsReps: "3x6-8",
        focus: "Femorali / glutei",
        description: "Movimento dai fianchi: bacino indietro, schiena neutra. Senti tirare i femorali, non la zona lombare."
      },
      {
        id: "lower-leg-curl",
        name: "Leg curl",
        setsReps: "2x8-12",
        focus: "Femorali",
        description: "Blocca il bacino e fletti le ginocchia in modo controllato. Non staccare il corpo dalla macchina."
      },
      {
        id: "lower-leg-extension-sissy",
        name: "Leg extension mono / Sissy squat",
        setsReps: "2x8-12",
        focus: "Quadricipiti",
        description: "Scegli uno dei due. Movimento controllato, enfasi sul quadricipite e senza rimbalzi a fine corsa."
      },
      {
        id: "lower-abductor-adductor",
        name: "Abductor / Adductor",
        setsReps: "2x8-12",
        focus: "Glutei / interno coscia",
        description: "Alterna a settimane. Controlla sia apertura sia ritorno, senza chiudere il peso di colpo."
      },
      {
        id: "lower-crunch",
        name: "Crunch machine",
        setsReps: "2x8-12",
        focus: "Addome",
        description: "Arrotola il busto contraendo l’addome. Non tirare con braccia o collo e ritorna lentamente."
      }
    ]
  },
  upperB: {
    weekday: "Venerdì",
    title: "Upper B",
    subtitle: "Palestra",
    exercises: [
      {
        id: "upper-b-horizontal-pull",
        name: "Tirata orizzontale",
        setsReps: "3x6-8",
        focus: "Dorso / remata pesante",
        description: "Usa un carico più alto mantenendo tecnica pulita. Tira coi gomiti e ferma un attimo in chiusura."
      },
      {
        id: "upper-b-incline-press",
        name: "Spinta inclinata",
        setsReps: "3x8-12",
        focus: "Petto alto / spinta",
        description: "Versione più controllata e a ripetizioni medio-alte. Evita rimbalzi e mantieni traiettoria stabile."
      },
      {
        id: "upper-b-vertical-pull",
        name: "Tirata verticale",
        setsReps: "3x8-12",
        focus: "Gran dorsale",
        description: "Porta i gomiti verso il basso, non pensare solo a tirare la barra. Petto aperto e spalle basse."
      },
      {
        id: "upper-b-lateral-raise",
        name: "Alzate laterali",
        setsReps: "3x8-12",
        focus: "Deltoidi laterali",
        description: "Carico gestibile e movimento pulito. Fermati prima che trapezi e slancio prendano il controllo."
      },
      {
        id: "upper-b-biceps",
        name: "Bicipiti",
        setsReps: "2x6-8",
        focus: "Braccia pesante",
        description: "Range più pesante: poche ripetizioni ma senza oscillare. Gomiti stabili e discesa controllata."
      },
      {
        id: "upper-b-triceps",
        name: "Tricipiti",
        setsReps: "2x6-8",
        focus: "Braccia pesante",
        description: "Scegli una variante stabile. Estendi con forza, ma senza muovere spalle e gomiti."
      }
    ]
  }
};

const STORAGE_KEYS = {
  progress: "fitness-workout-progress-v1",
  customExercises: "fitness-custom-exercises-v1",
  activeDay: "fitness-active-day-v1"
};

const DAY_ORDER = ["upperA", "lower", "upperB"];

const elements = {
  exerciseList: document.querySelector("#exerciseList"),
  cardTemplate: document.querySelector("#exerciseCardTemplate"),
  workoutWeekday: document.querySelector("#workoutWeekday"),
  workoutTitle: document.querySelector("#workoutTitle"),
  workoutSubtitle: document.querySelector("#workoutSubtitle"),
  lowerRotationNote: document.querySelector("#lowerRotationNote"),
  tabButtons: [...document.querySelectorAll(".tab-button")],
  recommendedWorkout: document.querySelector("#recommendedWorkout"),
  openRecommendedButton: document.querySelector("#openRecommendedButton"),
  resetDayButton: document.querySelector("#resetDayButton"),
  menuOverlay: document.querySelector("#menuOverlay"),
  openMenuButton: document.querySelector("#openMenuButton"),
  closeMenuButton: document.querySelector("#closeMenuButton"),
  customExerciseForm: document.querySelector("#customExerciseForm"),
  customExerciseList: document.querySelector("#customExerciseList"),
  customExerciseCount: document.querySelector("#customExerciseCount"),
  resetAllButton: document.querySelector("#resetAllButton"),
  timerPanel: document.querySelector(".timer-panel"),
  timerDisplay: document.querySelector("#timerDisplay"),
  timerPresets: [...document.querySelectorAll(".timer-presets button")],
  timerStartButton: document.querySelector("#timerStartButton"),
  timerStopButton: document.querySelector("#timerStopButton"),
  timerResetButton: document.querySelector("#timerResetButton")
};

let progress = loadJson(STORAGE_KEYS.progress, {});
let customExercises = loadJson(STORAGE_KEYS.customExercises, []);
let activeDay = localStorage.getItem(STORAGE_KEYS.activeDay) || recommendedDay();
let timerDuration = 90;
let timerRemaining = timerDuration;
let timerId = null;
let timerEndTime = null;

if (!WORKOUTS[activeDay]) {
  activeDay = "upperA";
}

function loadJson(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.warn(`Impossibile leggere ${key} da localStorage.`, error);
    return fallback;
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
}

function saveCustomExercises() {
  localStorage.setItem(STORAGE_KEYS.customExercises, JSON.stringify(customExercises));
}

function recommendedDay(date = new Date()) {
  const weekday = date.getDay();
  if (weekday === 1) return "upperA";
  if (weekday === 3) return "lower";
  if (weekday === 5) return "upperB";
  if (weekday === 0 || weekday === 6) return "upperA";
  if (weekday === 2) return "lower";
  return "upperB";
}

function getAllExercises(day) {
  const customForDay = customExercises
    .filter((exercise) => exercise.day === day)
    .map((exercise) => ({ ...exercise, isCustom: true }));
  return [...WORKOUTS[day].exercises, ...customForDay];
}

function parseSetCount(setsReps) {
  const match = String(setsReps).match(/^\s*(\d+)/);
  return match ? Math.max(1, Math.min(Number(match[1]), 12)) : 1;
}

function exerciseState(day, exerciseId, setCount) {
  const dayProgress = progress[day] || {};
  const saved = dayProgress[exerciseId] || {};
  return {
    weight: saved.weight ?? "",
    notes: saved.notes ?? "",
    sets: Array.from({ length: setCount }, (_, index) => Boolean(saved.sets?.[index]))
  };
}

function updateExerciseState(day, exerciseId, update) {
  progress[day] ||= {};
  progress[day][exerciseId] ||= {};
  Object.assign(progress[day][exerciseId], update);
  saveProgress();
}

function renderWorkout() {
  const workout = WORKOUTS[activeDay];
  const exercises = getAllExercises(activeDay);

  elements.workoutWeekday.textContent = workout.weekday;
  elements.workoutTitle.textContent = workout.title;
  elements.workoutSubtitle.textContent = workout.subtitle;
  elements.lowerRotationNote.hidden = activeDay !== "lower";
  elements.exerciseList.replaceChildren();

  elements.tabButtons.forEach((button) => {
    const isActive = button.dataset.day === activeDay;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });

  exercises.forEach((exercise, index) => {
    elements.exerciseList.append(createExerciseCard(exercise, index));
  });

  localStorage.setItem(STORAGE_KEYS.activeDay, activeDay);
}

function createExerciseCard(exercise, index) {
  const card = elements.cardTemplate.content.firstElementChild.cloneNode(true);
  const setCount = parseSetCount(exercise.setsReps);
  const state = exerciseState(activeDay, exercise.id, setCount);

  card.dataset.exerciseId = exercise.id;
  card.querySelector(".exercise-number").textContent =
    exercise.isCustom ? `Personalizzato · ${index + 1}` : `Esercizio ${index + 1}`;
  card.querySelector(".exercise-name").textContent = exercise.name;
  card.querySelector(".reps-badge").textContent = exercise.setsReps;
  card.querySelector(".exercise-focus").textContent = exercise.focus || "Focus personalizzato";
  card.querySelector(".exercise-description").textContent =
    exercise.description || "Aggiungi le tue indicazioni nelle note.";

  const weightInput = card.querySelector(".weight-input");
  weightInput.value = state.weight;
  weightInput.addEventListener("input", () => {
    updateExerciseState(activeDay, exercise.id, { weight: weightInput.value });
  });

  const notesInput = card.querySelector(".notes-input");
  notesInput.value = state.notes;
  notesInput.addEventListener("input", () => {
    updateExerciseState(activeDay, exercise.id, { notes: notesInput.value });
  });

  const setButtonsContainer = card.querySelector(".set-buttons");
  state.sets.forEach((isDone, setIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "set-button";
    button.textContent = setIndex + 1;
    button.setAttribute("aria-label", `Serie ${setIndex + 1}`);
    button.setAttribute("aria-pressed", String(isDone));
    button.classList.toggle("is-done", isDone);
    button.addEventListener("click", () => {
      state.sets[setIndex] = !state.sets[setIndex];
      button.classList.toggle("is-done", state.sets[setIndex]);
      button.setAttribute("aria-pressed", String(state.sets[setIndex]));
      updateExerciseState(activeDay, exercise.id, { sets: state.sets });
      updateCardCompletion(card, state.sets);
    });
    setButtonsContainer.append(button);
  });

  updateCardCompletion(card, state.sets);

  const deleteButton = card.querySelector(".delete-custom-button");
  if (exercise.isCustom) {
    deleteButton.hidden = false;
    deleteButton.addEventListener("click", () => removeCustomExercise(exercise.id));
  }

  return card;
}

function updateCardCompletion(card, sets) {
  card.classList.toggle("is-complete", sets.length > 0 && sets.every(Boolean));
}

function selectDay(day, shouldScroll = false) {
  if (!WORKOUTS[day]) return;
  activeDay = day;
  renderWorkout();
  if (shouldScroll) {
    document.querySelector(".workout-tabs").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderRecommendation() {
  const day = recommendedDay();
  const workout = WORKOUTS[day];
  const today = new Intl.DateTimeFormat("it-IT", { weekday: "long" }).format(new Date());
  elements.recommendedWorkout.textContent =
    `${today.charAt(0).toUpperCase() + today.slice(1)}: ${workout.title} · ${workout.subtitle}`;
  elements.openRecommendedButton.dataset.day = day;
}

function resetCurrentDay() {
  const workout = WORKOUTS[activeDay];
  if (!window.confirm(`Cancellare pesi, serie e note di ${workout.title}?`)) return;
  delete progress[activeDay];
  saveProgress();
  renderWorkout();
}

function openMenu() {
  renderCustomExerciseList();
  elements.menuOverlay.hidden = false;
  document.body.classList.add("has-open-menu");
  elements.closeMenuButton.focus();
}

function closeMenu() {
  elements.menuOverlay.hidden = true;
  document.body.classList.remove("has-open-menu");
  elements.openMenuButton.focus();
}

function addCustomExercise(formData) {
  const exercise = {
    id: `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    day: formData.get("day"),
    name: formData.get("name").trim(),
    setsReps: formData.get("setsReps").trim(),
    focus: formData.get("focus").trim(),
    description: formData.get("description").trim()
  };
  customExercises.push(exercise);
  saveCustomExercises();
  renderCustomExerciseList();
  if (activeDay === exercise.day) renderWorkout();
}

function removeCustomExercise(exerciseId) {
  const exercise = customExercises.find((item) => item.id === exerciseId);
  if (!exercise || !window.confirm(`Rimuovere "${exercise.name}"?`)) return;
  customExercises = customExercises.filter((item) => item.id !== exerciseId);
  DAY_ORDER.forEach((day) => {
    if (progress[day]) delete progress[day][exerciseId];
  });
  saveCustomExercises();
  saveProgress();
  renderCustomExerciseList();
  renderWorkout();
}

function renderCustomExerciseList() {
  elements.customExerciseCount.textContent = customExercises.length;
  elements.customExerciseList.replaceChildren();

  if (customExercises.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "Non hai ancora aggiunto esercizi.";
    elements.customExerciseList.append(emptyState);
    return;
  }

  customExercises.forEach((exercise) => {
    const item = document.createElement("article");
    item.className = "custom-list-item";

    const text = document.createElement("div");
    const name = document.createElement("strong");
    const details = document.createElement("p");
    name.textContent = exercise.name;
    details.textContent = `${WORKOUTS[exercise.day].title} · ${exercise.setsReps}`;
    text.append(name, details);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "delete-custom-list-button danger-text";
    removeButton.textContent = "Rimuovi";
    removeButton.addEventListener("click", () => removeCustomExercise(exercise.id));

    item.append(text, removeButton);
    elements.customExerciseList.append(item);
  });
}

function resetAllData() {
  if (!window.confirm("Cancellare tutti i pesi, le serie, le note e gli esercizi personalizzati?")) return;
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  progress = {};
  customExercises = [];
  activeDay = recommendedDay();
  elements.customExerciseForm.reset();
  renderCustomExerciseList();
  renderWorkout();
  closeMenu();
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  elements.timerDisplay.textContent = formatTime(timerRemaining);
  document.title = timerId
    ? `${formatTime(timerRemaining)} · Timer palestra`
    : "Scheda palestra 3 giorni";
}

function chooseTimerDuration(seconds) {
  stopTimer();
  timerDuration = seconds;
  timerRemaining = seconds;
  elements.timerPanel.classList.remove("is-finished");
  elements.timerPresets.forEach((button) => {
    button.classList.toggle("is-selected", Number(button.dataset.seconds) === seconds);
  });
  updateTimerDisplay();
}

function startTimer() {
  if (timerId || timerRemaining <= 0) return;
  elements.timerPanel.classList.remove("is-finished");
  timerEndTime = Date.now() + timerRemaining * 1000;
  timerId = window.setInterval(tickTimer, 250);
  elements.timerStartButton.textContent = "In corso";
  tickTimer();
}

function tickTimer() {
  timerRemaining = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
  updateTimerDisplay();
  if (timerRemaining === 0) finishTimer();
}

function stopTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = null;
  timerEndTime = null;
  elements.timerStartButton.textContent = "Avvia";
  updateTimerDisplay();
}

function resetTimer() {
  stopTimer();
  timerRemaining = timerDuration;
  elements.timerPanel.classList.remove("is-finished");
  updateTimerDisplay();
}

function finishTimer() {
  stopTimer();
  elements.timerPanel.classList.add("is-finished");
  elements.timerStartButton.textContent = "Finito";
  if ("vibrate" in navigator) navigator.vibrate([250, 120, 250, 120, 400]);
}

elements.tabButtons.forEach((button) => {
  button.addEventListener("click", () => selectDay(button.dataset.day));
});

elements.openRecommendedButton.addEventListener("click", () => {
  selectDay(elements.openRecommendedButton.dataset.day, true);
});
elements.resetDayButton.addEventListener("click", resetCurrentDay);
elements.openMenuButton.addEventListener("click", openMenu);
elements.closeMenuButton.addEventListener("click", closeMenu);
elements.menuOverlay.addEventListener("click", (event) => {
  if (event.target === elements.menuOverlay) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.menuOverlay.hidden) closeMenu();
});
elements.customExerciseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addCustomExercise(new FormData(event.currentTarget));
  event.currentTarget.reset();
});
elements.resetAllButton.addEventListener("click", resetAllData);

elements.timerPresets.forEach((button) => {
  button.addEventListener("click", () => chooseTimerDuration(Number(button.dataset.seconds)));
});
elements.timerStartButton.addEventListener("click", startTimer);
elements.timerStopButton.addEventListener("click", stopTimer);
elements.timerResetButton.addEventListener("click", resetTimer);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && timerId) tickTimer();
});

renderRecommendation();
renderWorkout();
renderCustomExerciseList();
updateTimerDisplay();
