"use strict";
(function initializeBetaWorkoutHistory() {
  if (typeof createExerciseCard !== "function" || typeof renderWorkout !== "function" || !document.querySelector("#workoutDayActions")) {
    window.setTimeout(initializeBetaWorkoutHistory, 40);
    return;
  }

  const HISTORY_KEY = "fitness-workout-sessions-v1";
  const WEEKDAYS = ["Domenica", "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato"];
  let sessions = loadJson(HISTORY_KEY, []);
  let historyMode = "sessions";
  let selectedExerciseKey = "";

  function saveSessions() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
  }

  function parseBetaDate(value) {
    if (!value) return new Date();
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return new Date(`${value}T12:00:00`);
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  function formatDateInput(date = new Date()) {
    const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`;
  }

  function weekdayForDate(value) {
    return WEEKDAYS[parseBetaDate(value).getDay()];
  }

  function displayDate(value, includeTime = true) {
    const options = includeTime
      ? { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
      : { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Intl.DateTimeFormat("it-IT", options).format(parseBetaDate(value));
  }

  function dayDate(value) {
    return new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(parseBetaDate(value));
  }

  function currentPerformedMeta() {
    const dateInput = document.querySelector("#betaPerformedDate");
    const weekdaySelect = document.querySelector("#betaPerformedWeekday");
    const performedDate = dateInput?.value || formatDateInput();
    const performedWeekday = weekdaySelect?.value || weekdayForDate(performedDate);
    return {
      performedDate,
      performedWeekday,
      exportDate: parseBetaDate(performedDate),
    };
  }

  function numberValue(value) {
    const normalized = String(value ?? "").replace(",", ".").trim();
    return normalized === "" ? "" : Number(normalized);
  }

  function exerciseKey(exercise) {
    return exercise.freeExerciseId || exercise.exerciseId || exercise.id || String(exercise.name || "").toLocaleLowerCase("it-IT");
  }

  function setLabel(set) {
    const weight = set.weight !== "" ? `${set.weight} kg` : "- kg";
    const reps = set.reps !== "" ? `${set.reps} rep` : "- rep";
    return `${weight} x ${reps}`;
  }

  function completedSetLine(exercise) {
    const completed = exercise.sets.filter((set) => set.completed);
    return completed.length
      ? completed.map((set) => `${set.weight !== "" ? set.weight : "-"}x${set.reps !== "" ? set.reps : "-"}`).join(" · ")
      : "Nessuna serie completata";
  }

  function latestExerciseSession(exercise, excludeId = "") {
    const key = exerciseKey(exercise);
    return sessions
      .filter((session) => session.id !== excludeId)
      .flatMap((session) => session.exercises.map((item) => ({ session, item })))
      .filter((entry) => exerciseKey(entry.item) === key || entry.item.name === exercise.name)
      .sort((a, b) => parseBetaDate(b.session.performedDate || b.session.completedAt) - parseBetaDate(a.session.performedDate || a.session.completedAt))[0] || null;
  }

  function baseDetailsFor(exercise, setCount) {
    const base = Array.isArray(exercise.baseSetDetails) ? exercise.baseSetDetails : [];
    return Array.from({ length: setCount }, (_, index) => ({
      weight: base[index]?.weight ?? base[0]?.weight ?? "",
      reps: base[index]?.reps ?? base[0]?.reps ?? "",
    }));
  }

  function setDetailsFor(day, exercise, setCount) {
    const saved = progress[day]?.[exercise.id] || {};
    const legacyWeight = saved.weight ?? "";
    const stored = Array.isArray(saved.setDetails) ? saved.setDetails : [];
    const base = baseDetailsFor(exercise, setCount);

    return Array.from({ length: setCount }, (_, index) => ({
      weight: stored[index]?.weight ?? (stored.length ? "" : base[index]?.weight || legacyWeight),
      reps: stored[index]?.reps ?? (stored.length ? "" : base[index]?.reps || ""),
      completed: Boolean(stored[index]?.completed ?? saved.sets?.[index]),
    }));
  }

  function persistSetDetails(day, exerciseId, details) {
    updateExerciseState(day, exerciseId, {
      setDetails: details,
      sets: details.map((set) => set.completed),
      weight: details.find((set) => set.weight !== "")?.weight ?? "",
    });
  }

  function prefillBaseNotes(card, exercise) {
    const saved = progress[activeDay]?.[exercise.id] || {};
    const textarea = card.querySelector(".notes-field textarea, .exercise-notes textarea");
    if (!textarea || saved.notes || !exercise.baseNotes || textarea.value.trim()) return;
    textarea.value = exercise.baseNotes;
    updateExerciseState(activeDay, exercise.id, { notes: exercise.baseNotes });
  }

  function enhanceSetTracking(card, exercise) {
    if (card.querySelector(".beta-set-tracker")) return;
    const setCount = parseSetCount(exercise.setsReps);
    const details = setDetailsFor(activeDay, exercise, setCount);
    const legacyFields = card.querySelector(".exercise-fields");
    if (legacyFields) legacyFields.hidden = true;
    prefillBaseNotes(card, exercise);

    const tracker = document.createElement("section");
    tracker.className = "beta-set-tracker";
    tracker.dataset.exerciseId = exercise.id;
    tracker.innerHTML = '<div class="beta-set-heading"><strong>Serie di oggi</strong><span>Peso e ripetizioni per ogni serie</span></div><div class="beta-set-rows"></div>';
    const rows = tracker.querySelector(".beta-set-rows");

    details.forEach((set, index) => {
      const row = document.createElement("div");
      row.className = "beta-set-row";
      row.classList.toggle("is-complete", set.completed);
      row.innerHTML = `<span class="beta-set-number">${index + 1}</span><label><span>Peso kg</span><input class="beta-set-weight" type="number" min="0" step="0.5" inputmode="decimal" placeholder="kg"></label><label><span>Ripetizioni</span><input class="beta-set-reps" type="number" min="0" max="999" step="1" inputmode="numeric" placeholder="rep"></label><button class="beta-set-complete" type="button" aria-pressed="${set.completed}" aria-label="Serie ${index + 1} completata">✓</button>`;
      const weight = row.querySelector(".beta-set-weight");
      const reps = row.querySelector(".beta-set-reps");
      const done = row.querySelector(".beta-set-complete");
      weight.value = set.weight;
      reps.value = set.reps;
      weight.addEventListener("input", () => {
        details[index].weight = weight.value;
        persistSetDetails(activeDay, exercise.id, details);
      });
      reps.addEventListener("input", () => {
        details[index].reps = reps.value;
        persistSetDetails(activeDay, exercise.id, details);
      });
      done.addEventListener("click", () => {
        details[index].completed = !details[index].completed;
        done.setAttribute("aria-pressed", String(details[index].completed));
        row.classList.toggle("is-complete", details[index].completed);
        persistSetDetails(activeDay, exercise.id, details);
        updateCardCompletion(card, details.map((item) => item.completed));
      });
      rows.append(row);
    });

    const latest = latestExerciseSession(exercise);
    if (latest) {
      const previous = document.createElement("button");
      previous.type = "button";
      previous.className = "beta-previous-performance";
      previous.innerHTML = `<span>Ultima volta · ${displayDate(latest.session.performedDate || latest.session.completedAt, false)}</span><strong>${completedSetLine(latest.item)}</strong>`;
      previous.addEventListener("click", () => openHistory("progress", exerciseKey(exercise)));
      tracker.append(previous);
    }

    const notes = card.querySelector(".notes-field");
    notes?.before(tracker);
  }

  const createCardBeforeHistory = createExerciseCard;
  createExerciseCard = function createBetaHistoryCard(exercise, index) {
    const card = createCardBeforeHistory(exercise, index);
    enhanceSetTracking(card, exercise);
    return card;
  };

  const renderBeforeHistory = renderWorkout;
  renderWorkout = function renderBetaHistoryWorkout() {
    renderBeforeHistory();
    document.querySelectorAll("#exerciseList .exercise-card").forEach((card, index) => {
      const exercise = getAllExercises(activeDay)[index];
      if (exercise) enhanceSetTracking(card, exercise);
    });
  };

  function sessionSnapshot() {
    const workout = WORKOUTS[activeDay];
    const performed = currentPerformedMeta();
    const exercises = getAllExercises(activeDay);
    const completedAt = new Date().toISOString();
    const snapshotExercises = exercises.map((exercise) => {
      const setCount = parseSetCount(exercise.setsReps);
      const saved = progress[activeDay]?.[exercise.id] || {};
      const base = baseDetailsFor(exercise, setCount);
      const sets = setDetailsFor(activeDay, exercise, setCount).map((set, index) => ({
        number: index + 1,
        weight: numberValue(set.weight),
        reps: numberValue(set.reps),
        baseWeight: numberValue(base[index]?.weight),
        baseReps: numberValue(base[index]?.reps),
        completed: Boolean(set.completed),
      }));
      const completedSets = sets.filter((set) => set.completed);
      const volume = completedSets.reduce((sum, set) => sum + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0);
      return {
        exerciseId: exercise.id,
        freeExerciseId: exercise.freeExerciseId || "",
        name: exercise.name,
        focus: exercise.focus || "",
        setsReps: exercise.setsReps,
        restSeconds: Number(exercise.restSeconds || 0),
        notes: String(saved.notes || "").trim(),
        sets,
        completedSets: completedSets.length,
        volume,
        skipped: completedSets.length === 0,
      };
    });
    const completedSets = snapshotExercises.reduce((sum, item) => sum + item.completedSets, 0);
    const volume = snapshotExercises.reduce((sum, item) => sum + item.volume, 0);

    return {
      id: `session-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      completedAt,
      performedDate: performed.performedDate,
      performedWeekday: performed.performedWeekday,
      dayId: activeDay,
      workoutDayId: activeDay,
      workoutName: workout.title,
      programmedWeekday: workout.weekday,
      workout: { title: workout.title, weekday: workout.weekday, subtitle: workout.subtitle },
      exercises: snapshotExercises,
      completedSets,
      completedExercises: snapshotExercises.filter((item) => !item.skipped).length,
      totalExercises: snapshotExercises.length,
      volume,
    };
  }

  function sessionFingerprint(session) {
    return JSON.stringify({
      dayId: session.dayId,
      performedDate: session.performedDate,
      exercises: session.exercises.map((item) => ({ id: item.exerciseId, sets: item.sets, notes: item.notes })),
    });
  }

  function finishAndSaveWorkout() {
    const session = sessionSnapshot();
    if (!session.completedSets) {
      window.alert("Completa almeno una serie prima di salvare l'allenamento nello storico.");
      return;
    }

    const latest = sessions[0];
    const latestAgeMs = latest ? Date.now() - parseBetaDate(latest.completedAt).getTime() : Infinity;
    if (latest && latestAgeMs < 10000 && sessionFingerprint(latest) === sessionFingerprint(session)) {
      window.alert("Questo allenamento risulta gia salvato nello storico.");
      return;
    }

    const dateLine = `${session.performedWeekday} ${displayDate(session.performedDate, false)}`;
    if (!window.confirm(`Salvare ${session.workout.title} nello storico?\n\nEseguito: ${dateLine}\n${session.completedExercises} esercizi · ${session.completedSets} serie completate`)) return;

    sessions.unshift(session);
    saveSessions();
    renderWorkout();
    renderHistory();

    if (window.confirm("Allenamento salvato. Vuoi azzerare ora i dati della giornata?")) {
      delete progress[activeDay];
      saveProgress();
      renderWorkout();
    } else {
      window.alert("Allenamento salvato. I dati della giornata restano disponibili finche non li azzeri.");
    }
  }

  function sessionMarkup(session) {
    const effectiveDate = session.performedDate || session.completedAt;
    const effectiveWeekday = session.performedWeekday || weekdayForDate(effectiveDate);
    const programmed = session.programmedWeekday && session.programmedWeekday !== effectiveWeekday ? ` · scheda ${session.programmedWeekday}` : "";
    return `<article class="beta-history-session"><button class="beta-history-session-toggle" type="button" aria-expanded="false"><span><strong>${escapeHistoryHtml(session.workoutName || session.workout.title)}</strong><small>${effectiveWeekday} ${dayDate(effectiveDate)}${programmed}</small></span><span>${session.completedSets} serie</span></button><div class="beta-history-session-detail" hidden><div class="beta-history-summary"><span>${session.completedExercises}/${session.totalExercises} esercizi svolti</span><span>${Math.round(session.volume)} kg di volume</span></div>${session.exercises.map((exercise) => `<section class="beta-history-exercise${exercise.skipped ? " is-skipped" : ""}"><div><strong>${exercise.skipped ? "Saltato · " : ""}${escapeHistoryHtml(exercise.name)}</strong><span>${escapeHistoryHtml(exercise.focus || exercise.setsReps)}</span></div><div class="beta-history-sets">${exercise.sets.map((set) => `<span class="${set.completed ? "is-complete" : ""}">S${set.number}: ${setLabel(set)}</span>`).join("")}</div>${exercise.notes ? `<p>${escapeHistoryHtml(exercise.notes)}</p>` : ""}</section>`).join("")}<button class="beta-delete-session danger-text" type="button" data-session-id="${session.id}">Elimina dallo storico</button></div></article>`;
  }

  function escapeHistoryHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  }

  function exerciseOptions() {
    const map = new Map();
    sessions.forEach((session) => session.exercises.forEach((exercise) => {
      if (!exercise.skipped) {
        const key = exerciseKey(exercise);
        if (!map.has(key)) map.set(key, exercise.name);
      }
    }));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "it"));
  }

  function progressMarkup() {
    const options = exerciseOptions();
    if (!options.length) return '<p class="beta-history-empty">Salva almeno un allenamento per vedere la progressione.</p>';
    if (!selectedExerciseKey || !options.some(([key]) => key === selectedExerciseKey)) selectedExerciseKey = options[0][0];
    const entries = sessions
      .flatMap((session) => session.exercises.filter((exercise) => !exercise.skipped && exerciseKey(exercise) === selectedExerciseKey).map((exercise) => ({ session, exercise })))
      .sort((a, b) => parseBetaDate(b.session.performedDate || b.session.completedAt) - parseBetaDate(a.session.performedDate || a.session.completedAt));
    const latest = entries[0];
    const first = entries[entries.length - 1];
    return `<label class="beta-progress-select">Esercizio<select id="betaProgressExercise">${options.map(([key, name]) => `<option value="${escapeHistoryHtml(key)}"${key === selectedExerciseKey ? " selected" : ""}>${escapeHistoryHtml(name)}</option>`).join("")}</select></label>${entries.length > 1 ? `<div class="beta-progress-summary"><span>Prima registrazione<strong>${completedSetLine(first.exercise)}</strong></span><span>Ultima registrazione<strong>${completedSetLine(latest.exercise)}</strong></span></div>` : ""}<div class="beta-progress-timeline">${entries.map(({ session, exercise }) => `<article><time>${displayDate(session.performedDate || session.completedAt, false)}</time><strong>${completedSetLine(exercise)}</strong><span>${exercise.completedSets} serie · ${Math.round(exercise.volume)} kg volume</span>${exercise.notes ? `<p>${escapeHistoryHtml(exercise.notes)}</p>` : ""}</article>`).join("")}</div>`;
  }

  function renderHistory() {
    const overlay = document.querySelector("#betaHistoryOverlay");
    if (!overlay) return;
    overlay.querySelectorAll("[data-history-mode]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.historyMode === historyMode)));
    const content = overlay.querySelector("#betaHistoryContent");
    content.innerHTML = historyMode === "sessions"
      ? (sessions.length ? sessions.map(sessionMarkup).join("") : '<p class="beta-history-empty">Non hai ancora salvato allenamenti.</p>')
      : progressMarkup();
    content.querySelectorAll(".beta-history-session-toggle").forEach((button) => button.addEventListener("click", () => {
      const detail = button.nextElementSibling;
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      detail.hidden = expanded;
    }));
    content.querySelectorAll(".beta-delete-session").forEach((button) => button.addEventListener("click", () => deleteSession(button.dataset.sessionId)));
    content.querySelector("#betaProgressExercise")?.addEventListener("change", (event) => {
      selectedExerciseKey = event.target.value;
      renderHistory();
    });
  }

  function deleteSession(id) {
    const session = sessions.find((item) => item.id === id);
    if (!session || !window.confirm(`Eliminare ${session.workoutName || session.workout.title} del ${displayDate(session.performedDate || session.completedAt, false)} dallo storico?`)) return;
    sessions = sessions.filter((item) => item.id !== id);
    saveSessions();
    renderHistory();
    renderWorkout();
  }

  function openHistory(mode = "sessions", exercise = "") {
    historyMode = mode;
    if (exercise) selectedExerciseKey = exercise;
    renderHistory();
    const overlay = document.querySelector("#betaHistoryOverlay");
    overlay.hidden = false;
    document.body.classList.add("has-open-menu");
    overlay.querySelector("#closeBetaHistory").focus();
  }

  function closeHistory() {
    document.querySelector("#betaHistoryOverlay").hidden = true;
    document.body.classList.remove("has-open-menu");
    document.querySelector("#openBetaHistory")?.focus();
  }

  function installPerformedExportBridge() {
    if (typeof buildWorkoutDayData !== "function" || buildWorkoutDayData.__betaPerformedDateBridge) return;
    const originalBuildWorkoutDayData = buildWorkoutDayData;
    buildWorkoutDayData = function buildBetaPerformedWorkoutDayData(day, dateValue) {
      const usePerformed = typeof activeDay !== "undefined" && day === activeDay;
      const performed = usePerformed ? currentPerformedMeta() : null;
      const data = originalBuildWorkoutDayData(day, performed?.exportDate || dateValue);
      if (!performed || !data) return data;
      data.performedDate = performed.performedDate;
      data.performedWeekday = performed.performedWeekday;
      data.workoutDayId = day;
      data.workoutName = data.workout?.title || WORKOUTS[day]?.title || "Allenamento";
      data.workout = { ...(data.workout || {}), weekday: performed.performedWeekday };
      data.exercises = (data.exercises || []).map((exportExercise) => {
        const source = getAllExercises(day).find((exercise) => exercise.id === exportExercise.id || exercise.name === exportExercise.name);
        if (!source) return exportExercise;
        const base = baseDetailsFor(source, parseSetCount(source.setsReps));
        return { ...exportExercise, baseSetDetails: base, restSeconds: Number(source.restSeconds || 0) };
      });
      return data;
    };
    buildWorkoutDayData.__betaPerformedDateBridge = true;
  }

  function injectHistoryUi() {
    const footer = document.querySelector("#workoutDayActions");
    if (!footer || document.querySelector("#finishBetaWorkout")) return;
    const group = document.createElement("div");
    group.className = "beta-history-actions";
    const today = formatDateInput();
    group.innerHTML = `<div class="beta-performed-date-panel"><span>Allenamento eseguito</span><label>Data<input id="betaPerformedDate" type="date" value="${today}"></label><label>Giorno<select id="betaPerformedWeekday">${WEEKDAYS.slice(1).concat(WEEKDAYS[0]).map((day) => `<option value="${day}"${day === weekdayForDate(today) ? " selected" : ""}>${day}</option>`).join("")}</select></label></div><button id="finishBetaWorkout" class="primary-button" type="button">Termina e salva allenamento</button><button id="openBetaHistory" class="secondary-button" type="button">Storico allenamenti</button><p>Salva peso e ripetizioni di ogni serie per confrontare la progressione nel tempo.</p>`;
    footer.prepend(group);
    const dateInput = group.querySelector("#betaPerformedDate");
    const weekdaySelect = group.querySelector("#betaPerformedWeekday");
    dateInput.addEventListener("change", () => {
      weekdaySelect.value = weekdayForDate(dateInput.value);
    });
    group.querySelector("#finishBetaWorkout").addEventListener("click", finishAndSaveWorkout);
    group.querySelector("#openBetaHistory").addEventListener("click", () => openHistory());

    const overlay = document.createElement("div");
    overlay.id = "betaHistoryOverlay";
    overlay.className = "overlay";
    overlay.hidden = true;
    overlay.innerHTML = '<section class="beta-history-sheet" role="dialog" aria-modal="true" aria-labelledby="betaHistoryTitle"><div class="sheet-header"><div><p class="eyebrow">Versione di prova</p><h2 id="betaHistoryTitle">Storico allenamenti</h2></div><button id="closeBetaHistory" class="close-button" type="button" aria-label="Chiudi storico">×</button></div><div class="beta-history-modes" role="group" aria-label="Vista storico"><button type="button" data-history-mode="sessions" aria-pressed="true">Allenamenti</button><button type="button" data-history-mode="progress" aria-pressed="false">Progressione</button></div><div id="betaHistoryContent" class="beta-history-content"></div></section>';
    document.body.append(overlay);
    overlay.querySelector("#closeBetaHistory").addEventListener("click", closeHistory);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeHistory();
    });
    overlay.querySelectorAll("[data-history-mode]").forEach((button) => button.addEventListener("click", () => {
      historyMode = button.dataset.historyMode;
      renderHistory();
    }));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !overlay.hidden) closeHistory();
    });
    injectHistoryStyles();
    installPerformedExportBridge();
    renderHistory();
  }

  function injectHistoryStyles() {
    if (document.querySelector("#betaWorkoutHistoryStyles")) return;
    const style = document.createElement("style");
    style.id = "betaWorkoutHistoryStyles";
    style.textContent = `
      .beta-set-tracker{display:grid;gap:10px;margin-top:15px;padding-top:14px;border-top:1px solid var(--border)}
      .beta-set-heading{display:flex;align-items:end;justify-content:space-between;gap:10px}
      .beta-set-heading strong{font-size:.82rem}.beta-set-heading span{color:var(--muted);font-size:.66rem}
      .beta-set-rows{display:grid;gap:7px}.beta-set-row{display:grid;grid-template-columns:28px minmax(0,1fr) minmax(0,1fr) 38px;align-items:end;gap:7px;padding:8px;border:1px solid var(--border);border-radius:12px;background:var(--surface-strong)}
      .beta-set-row.is-complete{border-color:rgb(126 226 173 / 42%);background:rgb(126 226 173 / 7%)}
      .beta-set-number{align-self:center;color:var(--muted);font-size:.72rem;font-weight:900;text-align:center}
      .beta-set-row label{display:grid;gap:4px;color:var(--muted);font-size:.58rem;font-weight:750}
      .beta-set-row input{width:100%;min-width:0;min-height:38px;padding:7px 8px;border:1px solid var(--border);border-radius:9px;background:var(--bg);color:var(--text);font-size:.82rem}
      .beta-set-complete{min-height:38px;border:1px solid var(--border);border-radius:9px;background:transparent;color:var(--muted);font-weight:900}
      .beta-set-complete[aria-pressed="true"]{border-color:var(--accent);background:var(--accent);color:var(--accent-ink)}
      .beta-previous-performance{display:grid;gap:3px;padding:9px 11px;border:1px solid rgb(126 226 173 / 20%);border-radius:11px;background:rgb(126 226 173 / 5%);color:var(--text);text-align:left}
      .beta-previous-performance span{color:var(--muted);font-size:.62rem}.beta-previous-performance strong{font-size:.73rem}
      .beta-history-actions{grid-column:1/-1;display:grid;grid-template-columns:1.2fr 1fr;gap:8px;padding-bottom:8px}
      .beta-history-actions button{width:100%}.beta-history-actions p{grid-column:1/-1;margin:0 3px;color:var(--muted);font-size:.68rem;line-height:1.4}
      .beta-performed-date-panel{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1fr) minmax(0,1fr);align-items:end;gap:8px;padding:10px;border:1px solid var(--border);border-radius:14px;background:var(--surface-strong)}
      .beta-performed-date-panel>span{color:var(--accent);font-size:.72rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.beta-performed-date-panel label{display:grid;gap:5px;color:var(--muted);font-size:.68rem;font-weight:800}
      .beta-performed-date-panel input,.beta-performed-date-panel select{min-height:42px;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);padding:8px 10px}
      .beta-history-sheet{width:min(100%,720px);height:min(92dvh,800px);margin:auto 0 0;padding:22px 16px max(28px,env(safe-area-inset-bottom));border-radius:26px 26px 0 0;background:var(--surface);overflow-y:auto}
      .beta-history-modes{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:16px 0;padding:4px;border:1px solid var(--border);border-radius:13px;background:var(--surface-strong)}
      .beta-history-modes button{min-height:39px;border:0;border-radius:9px;background:transparent;color:var(--muted);font-weight:850}.beta-history-modes button[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink)}
      .beta-history-content{display:grid;gap:10px}.beta-history-empty{padding:25px 15px;border:1px dashed var(--border);border-radius:14px;color:var(--muted);text-align:center}
      .beta-history-session{border:1px solid var(--border);border-radius:14px;background:var(--surface-strong);overflow:hidden}.beta-history-session-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:14px;border:0;background:transparent;color:var(--text);text-align:left}
      .beta-history-session-toggle>span:first-child{display:grid;gap:3px}.beta-history-session-toggle small{color:var(--muted);font-size:.67rem}.beta-history-session-toggle>span:last-child{color:var(--accent);font-size:.72rem;font-weight:850}
      .beta-history-session-detail{display:grid;gap:9px;padding:0 12px 13px}.beta-history-summary{display:flex;gap:8px;flex-wrap:wrap}.beta-history-summary span{padding:5px 8px;border-radius:999px;background:rgb(126 226 173 / 8%);color:var(--muted);font-size:.65rem}
      .beta-history-exercise{display:grid;gap:7px;padding:11px;border:1px solid var(--border);border-radius:11px;background:var(--bg)}.beta-history-exercise.is-skipped{opacity:.58}.beta-history-exercise>div:first-child{display:grid;gap:2px}.beta-history-exercise>div:first-child span{color:var(--muted);font-size:.65rem}
      .beta-history-sets{display:flex;gap:5px;flex-wrap:wrap}.beta-history-sets span{padding:5px 7px;border-radius:8px;background:var(--surface);color:var(--muted);font-size:.63rem}.beta-history-sets span.is-complete{color:var(--accent)}
      .beta-history-exercise p{margin:0;color:var(--muted);font-size:.7rem;line-height:1.45}.beta-delete-session{justify-self:start;border:0;background:transparent;font-size:.7rem}
      .beta-progress-select{display:grid;gap:6px;color:var(--muted);font-size:.72rem;font-weight:800}.beta-progress-select select{min-height:46px;padding:9px 11px;border:1px solid var(--border);border-radius:11px;background:var(--surface-strong);color:var(--text)}
      .beta-progress-summary{display:grid;grid-template-columns:1fr 1fr;gap:8px}.beta-progress-summary span{display:grid;gap:5px;padding:11px;border:1px solid var(--border);border-radius:12px;color:var(--muted);font-size:.63rem}.beta-progress-summary strong{color:var(--text);font-size:.72rem;line-height:1.4}
      .beta-progress-timeline{display:grid;gap:8px}.beta-progress-timeline article{display:grid;gap:4px;padding:12px;border-left:3px solid var(--accent);border-radius:0 11px 11px 0;background:var(--surface-strong)}.beta-progress-timeline time,.beta-progress-timeline span{color:var(--muted);font-size:.64rem}.beta-progress-timeline strong{font-size:.78rem}.beta-progress-timeline p{margin:3px 0 0;color:var(--muted);font-size:.68rem}
      @media(max-width:520px){.beta-history-actions{grid-template-columns:1fr}.beta-set-row{grid-template-columns:24px minmax(0,1fr) minmax(0,1fr) 36px}.beta-progress-summary{grid-template-columns:1fr}.beta-performed-date-panel{grid-template-columns:1fr}}
      @media(min-width:600px){.beta-history-sheet{height:min(84dvh,800px);margin:6vh auto;border-radius:26px}}
    `;
    document.head.append(style);
  }

  injectHistoryUi();
  renderWorkout();
})();
