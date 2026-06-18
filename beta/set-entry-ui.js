(function () {
  if (window.__betaSetEntryUi) return;
  window.__betaSetEntryUi = true;

  const IOS_TIMER_SETTINGS_KEY = "fitness-ios-shortcut-timer-v1";
  const TIMER_DEBOUNCE_MS = 1200;
  let lastAutoTimer = { key: "", at: 0 };

  const style = document.createElement("style");
  style.textContent = `
    @media (max-width: 640px) {
      input,
      select,
      textarea,
      .beta-set-entry input,
      .beta-performed-date-panel input,
      .beta-performed-date-panel select,
      .beta-editor-extra-fields input,
      .beta-editor-extra-fields select,
      .beta-editor-extra-fields textarea {
        font-size: 16px !important;
      }
    }

    .exercise-card:has(.beta-set-tracker) .exercise-fields,
    .exercise-card .exercise-fields[hidden] {
      display: none !important;
    }

    .beta-set-entry { margin-top: 12px; border: 1px solid rgba(120, 232, 165, 0.18); background: rgba(120, 232, 165, 0.045); border-radius: 16px; padding: 12px; display: grid; gap: 10px; }
    .beta-set-selector { display: grid; grid-template-columns: repeat(auto-fit, minmax(92px, 1fr)); gap: 8px; }
    .beta-set-chip { border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; background: rgba(255,255,255,0.03); color: var(--text, #f5f5f5); padding: 9px 10px; text-align: left; cursor: pointer; display: grid; gap: 2px; }
    .beta-set-chip strong { font-size: 0.84rem; }
    .beta-set-chip small { color: var(--muted, #a7b1ac); font-size: 0.72rem; }
    .beta-set-chip.is-active { border-color: var(--accent, #78e8a5); box-shadow: 0 0 0 1px rgba(120,232,165,0.25); }
    .beta-set-chip.is-done { background: rgba(120,232,165,0.12); }
    .beta-active-set { display: grid; gap: 10px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px; }
    .beta-active-heading { display: flex; align-items: center; justify-content: space-between; color: var(--muted, #a7b1ac); font-size: 0.78rem; gap: 10px; }
    .beta-active-heading strong { color: var(--text, #f5f5f5); font-size: 0.86rem; }
    .beta-active-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .beta-active-fields label { display: grid; gap: 6px; color: var(--muted, #a7b1ac); font-size: 0.78rem; font-weight: 700; }
    .beta-active-fields input { width: 100%; border-radius: 11px; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.35); color: var(--text, #f5f5f5); padding: 10px 11px; min-height: 42px; }
    .beta-active-complete { width: 100%; border-radius: 12px; min-height: 42px; border: 1px solid rgba(120,232,165,0.65); background: transparent; color: var(--accent, #78e8a5); font-weight: 800; cursor: pointer; }
    .beta-card-summary { display: none; width: calc(100% - 24px); margin: 0 12px 12px; border: 1px solid rgba(120,232,165,0.18); background: rgba(120,232,165,0.07); color: var(--text, #f5f5f5); border-radius: 14px; padding: 10px 12px; text-align: left; cursor: pointer; }
    .beta-card-summary strong { display: block; font-size: 0.92rem; margin-bottom: 3px; }
    .beta-card-summary span { color: var(--muted, #a7b1ac); font-size: 0.78rem; }
    .exercise-card.beta-exercise-collapsed .beta-card-summary { display: block; }
    .exercise-card.beta-exercise-collapsed .exercise-focus,
    .exercise-card.beta-exercise-collapsed .exercise-description,
    .exercise-card.beta-exercise-collapsed .exercise-notes,
    .exercise-card.beta-exercise-collapsed .beta-set-tracker,
    .exercise-card.beta-exercise-collapsed .exercise-card-actions,
    .exercise-card.beta-exercise-collapsed .workoutx-result,
    .exercise-card.beta-exercise-collapsed .exercise-guides { display: none !important; }
    @media (max-width: 520px) { .beta-active-fields { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(style);

  function rowsFromTracker(tracker) {
    return Array.from(tracker.querySelectorAll(".beta-set-row"));
  }

  function rowData(row) {
    return {
      row,
      weight: row.querySelector(".beta-set-weight"),
      reps: row.querySelector(".beta-set-reps"),
      complete: row.querySelector(".beta-set-complete"),
      done: row.classList.contains("is-complete"),
    };
  }

  function exerciseForTracker(tracker) {
    const id = tracker.dataset.exerciseId || tracker.closest(".exercise-card")?.dataset.exerciseId;
    if (!id || typeof getAllExercises !== "function") return null;
    const day = typeof activeDay !== "undefined" ? activeDay : null;
    return getAllExercises(day).find((exercise) => exercise.id === id) || null;
  }

  function setInputValue(input, value) {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function applyBaseValues(tracker) {
    const exercise = exerciseForTracker(tracker);
    const base = Array.isArray(exercise?.baseSetDetails) ? exercise.baseSetDetails : [];
    if (!base.length) return;

    rowsFromTracker(tracker).forEach((row, index) => {
      const data = rowData(row);
      const defaults = base[index] || base[0] || {};
      if (data.weight && !data.weight.value && defaults.weight) setInputValue(data.weight, defaults.weight);
      if (data.reps && !data.reps.value && defaults.reps) setInputValue(data.reps, defaults.reps);
    });
  }

  function isIosShortcutEnabled() {
    try {
      const settings = JSON.parse(localStorage.getItem(IOS_TIMER_SETTINGS_KEY) || "{}");
      return Boolean(settings.enabled);
    } catch (error) {
      return false;
    }
  }

  function startInternalTimer(seconds) {
    const safeSeconds = Number(seconds);
    if (!Number.isFinite(safeSeconds) || safeSeconds <= 0) return;
    try { if (typeof stopTimer === "function") stopTimer(); } catch (error) {}
    if (typeof chooseTimerDuration === "function") {
      chooseTimerDuration(safeSeconds);
    } else {
      try {
        timerDuration = safeSeconds;
        timerRemaining = safeSeconds;
        if (typeof updateTimerDisplay === "function") updateTimerDisplay();
      } catch (error) { return; }
    }
    if (typeof startTimer === "function") startTimer();
  }

  function maybeStartRestTimer(tracker, activeIndex) {
    const exercise = exerciseForTracker(tracker);
    const seconds = Number(exercise?.restSeconds || 0);
    const rows = rowsFromTracker(tracker);
    if (!seconds || activeIndex >= rows.length - 1) return;
    const key = `${exercise?.id || "exercise"}:${activeIndex}:${seconds}`;
    const now = Date.now();
    if (lastAutoTimer.key === key && now - lastAutoTimer.at < TIMER_DEBOUNCE_MS) return;
    lastAutoTimer = { key, at: now };
    startInternalTimer(seconds);
    if (isIosShortcutEnabled() && typeof window.startIosShortcutTimer === "function") window.startIosShortcutTimer(seconds);
  }

  function summaryText(rows) {
    const completed = rows.map(rowData).filter((data) => data.done);
    const values = completed.map((data) => {
      const weight = data.weight?.value?.trim();
      const reps = data.reps?.value?.trim();
      if (weight && reps) return `${weight} kg x ${reps}`;
      if (weight) return `${weight} kg`;
      if (reps) return `${reps} rep`;
      return "serie completata";
    }).slice(0, 3);
    return { title: `${completed.length}/${rows.length} serie completate`, details: values.join(" · ") || "Tocca per riaprire i dettagli" };
  }

  function ensureSummary(card, tracker) {
    let summary = card.querySelector(".beta-card-summary");
    if (!summary) {
      summary = document.createElement("button");
      summary.type = "button";
      summary.className = "beta-card-summary";
      const header = card.querySelector(".exercise-card-header");
      if (header) header.after(summary);
      else card.prepend(summary);
      summary.addEventListener("click", () => {
        const collapsed = card.classList.toggle("beta-exercise-collapsed");
        card.dataset.betaUserExpanded = collapsed ? "" : "1";
        if (!collapsed) tracker.querySelector(".beta-active-weight, .beta-active-reps")?.focus({ preventScroll: true });
      });
    }
    const text = summaryText(rowsFromTracker(tracker));
    summary.innerHTML = `<strong>${text.title}</strong><span>${text.details}</span>`;
    return summary;
  }

  function updateCollapsedState(tracker, forceCollapse = false) {
    const card = tracker.closest(".exercise-card");
    if (!card) return;
    const rows = rowsFromTracker(tracker);
    if (!rows.length) return;
    ensureSummary(card, tracker);
    const allDone = rows.every((row) => row.classList.contains("is-complete"));
    if (!allDone) {
      card.classList.remove("beta-exercise-collapsed");
      delete card.dataset.betaUserExpanded;
      return;
    }
    if (forceCollapse || !card.dataset.betaUserExpanded) {
      card.classList.add("beta-exercise-collapsed");
      delete card.dataset.betaUserExpanded;
    }
  }

  function enhance(tracker) {
    if (tracker.dataset.betaCompact === "true") return;
    tracker.dataset.betaCompact = "true";
    const rows = rowsFromTracker(tracker);
    if (!rows.length) return;

    applyBaseValues(tracker);
    tracker.closest(".exercise-card")?.querySelector(".exercise-fields")?.setAttribute("hidden", "");
    tracker.querySelectorAll(".beta-set-row").forEach((row) => { row.style.display = "none"; });

    let activeIndex = rows.findIndex((row) => !row.classList.contains("is-complete"));
    if (activeIndex < 0) activeIndex = 0;

    const entry = document.createElement("div");
    entry.className = "beta-set-entry";
    tracker.prepend(entry);

    function render(focusWeight = false) {
      const currentRows = rowsFromTracker(tracker);
      if (!currentRows[activeIndex]) activeIndex = 0;
      const active = rowData(currentRows[activeIndex]);
      const chips = currentRows.map((row, index) => {
        const data = rowData(row);
        const weight = data.weight?.value?.trim();
        const reps = data.reps?.value?.trim();
        const status = data.done ? "Completata" : weight || reps ? "In compilazione" : "Da compilare";
        return `<button type="button" class="beta-set-chip ${index === activeIndex ? "is-active" : ""} ${data.done ? "is-done" : ""}" data-index="${index}"><strong>Serie ${index + 1}</strong><small>${status}</small></button>`;
      }).join("");

      entry.innerHTML = `
        <div class="beta-set-selector">${chips}</div>
        <div class="beta-active-set">
          <div class="beta-active-heading"><span>Serie selezionata</span><strong>Serie ${activeIndex + 1}</strong></div>
          <div class="beta-active-fields">
            <label>Peso kg<input class="beta-active-weight" inputmode="decimal" autocomplete="off" placeholder="kg" value="${active.weight?.value || ""}"></label>
            <label>Ripetizioni<input class="beta-active-reps" inputmode="numeric" autocomplete="off" placeholder="rep" value="${active.reps?.value || ""}"></label>
          </div>
          <button type="button" class="beta-active-complete">${active.done ? "Riapri serie" : "Segna serie completata"}</button>
        </div>
      `;

      entry.querySelectorAll(".beta-set-chip").forEach((button) => {
        button.addEventListener("click", () => {
          activeIndex = Number(button.dataset.index || 0);
          tracker.closest(".exercise-card")?.classList.remove("beta-exercise-collapsed");
          tracker.closest(".exercise-card")?.setAttribute("data-beta-user-expanded", "1");
          render(true);
        });
      });

      const weightInput = entry.querySelector(".beta-active-weight");
      const repsInput = entry.querySelector(".beta-active-reps");
      weightInput.addEventListener("input", () => setInputValue(active.weight, weightInput.value));
      repsInput.addEventListener("input", () => setInputValue(active.reps, repsInput.value));

      entry.querySelector(".beta-active-complete").addEventListener("click", () => {
        const latestRows = rowsFromTracker(tracker);
        const before = rowData(latestRows[activeIndex]);
        const wasDone = before.done;
        before.complete?.click();
        const afterRows = rowsFromTracker(tracker);
        const after = rowData(afterRows[activeIndex]);
        const isDone = after.done;
        if (!wasDone && isDone) {
          const nextIndex = afterRows.findIndex((row, index) => index > activeIndex && !row.classList.contains("is-complete"));
          maybeStartRestTimer(tracker, activeIndex);
          if (nextIndex >= 0) {
            activeIndex = nextIndex;
            render(true);
          } else {
            render(false);
            updateCollapsedState(tracker, true);
          }
          return;
        }
        render(true);
        updateCollapsedState(tracker, false);
      });

      updateCollapsedState(tracker, false);
      if (focusWeight) setTimeout(() => entry.querySelector(".beta-active-weight, .beta-active-reps")?.focus({ preventScroll: true }), 0);
    }

    render(false);
  }

  function refresh() {
    document.querySelectorAll(".beta-set-tracker").forEach(enhance);
  }

  const observer = new MutationObserver(refresh);
  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh);
  else refresh();
})();
