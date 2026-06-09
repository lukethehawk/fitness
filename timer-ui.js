"use strict";

const TIMER_STATE_KEY = "fitness-rest-timer-state-v1";
const timerPanelElement = document.querySelector(".timer-panel");
const timerDisplayElement = document.querySelector("#timerDisplay");
const timerStartElement = document.querySelector("#timerStartButton");
const timerStopElement = document.querySelector("#timerStopButton");
const timerResetElement = document.querySelector("#timerResetButton");
const timerPresetElements = [...document.querySelectorAll(".timer-presets button")];
const timerNotificationStatus = document.querySelector("#notificationStatus");

function injectTimerBubbleStyles() {
  const style = document.createElement("style");
  style.textContent = `
    body{padding-bottom:calc(86px + env(safe-area-inset-bottom))}
    .timer-panel{position:fixed;z-index:70;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));left:auto;width:min(calc(100% - 28px),390px);max-height:calc(100dvh - 28px - env(safe-area-inset-top) - env(safe-area-inset-bottom));margin:0;overflow-y:auto;transform-origin:bottom right;transition:opacity .18s ease,transform .18s ease,visibility .18s}
    .timer-panel.is-collapsed{visibility:hidden;pointer-events:none;opacity:0;transform:translateY(12px) scale(.96)}
    .timer-close-button{display:grid;width:40px;height:40px;flex:0 0 auto;place-items:center;border:1px solid var(--border);border-radius:50%;background:var(--surface-soft);color:var(--text);font-size:1.35rem;line-height:1;cursor:pointer}
    .timer-fab{position:fixed;z-index:69;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));display:flex;min-width:76px;height:62px;align-items:center;justify-content:center;gap:8px;padding:0 17px;border:1px solid rgb(126 226 173 / 42%);border-radius:999px;background:rgb(19 27 24 / 96%);color:var(--accent);box-shadow:0 14px 36px rgb(0 0 0 / 48%);backdrop-filter:blur(16px);font-weight:900;font-variant-numeric:tabular-nums;cursor:pointer}
    .timer-fab[hidden]{display:none}
    .timer-fab::before{content:"";width:9px;height:9px;border-radius:50%;background:currentColor}
    .timer-fab.is-running::before{animation:timerBubblePulse 1s ease-in-out infinite}
    .timer-fab.is-finished{background:var(--accent);color:var(--accent-ink);animation:timerBubbleFinished .7s ease-in-out 3}
    @keyframes timerBubblePulse{50%{opacity:.25;transform:scale(.75)}}
    @keyframes timerBubbleFinished{50%{transform:scale(1.08)}}
    @media (min-width:600px){.timer-panel{right:max(22px,env(safe-area-inset-right));bottom:max(22px,env(safe-area-inset-bottom))}.timer-fab{right:max(22px,env(safe-area-inset-right));bottom:max(22px,env(safe-area-inset-bottom))}}
  `;
  document.head.append(style);
}

function readTimerState() {
  try {
    return JSON.parse(localStorage.getItem(TIMER_STATE_KEY) || "null");
  } catch {
    return null;
  }
}

function writeTimerState(running = Boolean(timerId)) {
  localStorage.setItem(TIMER_STATE_KEY, JSON.stringify({
    duration: timerDuration,
    remaining: timerRemaining,
    endTime: running ? timerEndTime : null,
    running
  }));
}

function restoreTimerState() {
  const state = readTimerState();
  if (!state) return;

  const duration = Number(state.duration) || 60;
  chooseTimerDuration(duration);

  if (state.running && Number(state.endTime)) {
    timerRemaining = Math.max(0, Math.ceil((Number(state.endTime) - Date.now()) / 1000));
    updateTimerDisplay();
    if (timerRemaining > 0) {
      startTimer();
    } else {
      finishTimer();
    }
    return;
  }

  timerRemaining = Math.max(0, Number(state.remaining) || duration);
  updateTimerDisplay();
}

function setupTimerBubble() {
  if (!timerPanelElement || !timerDisplayElement) return;

  injectTimerBubbleStyles();

  const bubble = document.createElement("button");
  bubble.type = "button";
  bubble.className = "timer-fab";
  bubble.setAttribute("aria-label", "Apri timer recupero");
  bubble.setAttribute("aria-expanded", "false");

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "timer-close-button";
  closeButton.setAttribute("aria-label", "Riduci timer");
  closeButton.textContent = "×";
  timerPanelElement.querySelector(".timer-topline")?.append(closeButton);

  timerPanelElement.before(bubble);
  timerPanelElement.classList.add("is-collapsed");

  function refreshBubble() {
    bubble.textContent = timerDisplayElement.textContent;
    bubble.classList.toggle("is-running", Boolean(timerId));
    bubble.classList.toggle("is-finished", timerPanelElement.classList.contains("is-finished"));
  }

  function openTimer() {
    timerPanelElement.classList.remove("is-collapsed");
    bubble.hidden = true;
    bubble.setAttribute("aria-expanded", "true");
    closeButton.focus();
  }

  function closeTimer() {
    timerPanelElement.classList.add("is-collapsed");
    bubble.hidden = false;
    bubble.setAttribute("aria-expanded", "false");
    bubble.focus();
  }

  bubble.addEventListener("click", openTimer);
  closeButton.addEventListener("click", closeTimer);

  new MutationObserver(refreshBubble).observe(timerDisplayElement, {
    childList: true,
    characterData: true,
    subtree: true
  });
  new MutationObserver(() => {
    refreshBubble();
    if (timerPanelElement.classList.contains("is-finished")) {
      timerStartElement.textContent = "Nuovo timer";
      writeTimerState(false);
    }
  }).observe(timerPanelElement, { attributes: true, attributeFilter: ["class"] });

  timerStartElement?.addEventListener("click", (event) => {
    if (
      timerRemaining <= 0 ||
      timerPanelElement.classList.contains("is-finished")
    ) {
      event.stopImmediatePropagation();
      resetTimer();
      writeTimerState(false);
    }
  });
  timerStartElement?.addEventListener("click", () => setTimeout(() => writeTimerState(true)));
  timerStopElement?.addEventListener("click", () => setTimeout(() => writeTimerState(false)));
  timerResetElement?.addEventListener("click", () => setTimeout(() => writeTimerState(false)));
  timerPresetElements.forEach((button) => {
    button.addEventListener("click", () => setTimeout(() => writeTimerState(false)));
  });

  window.addEventListener("pagehide", () => writeTimerState(Boolean(timerId)));
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      const state = readTimerState();
      if (state?.running && Number(state.endTime)) {
        timerEndTime = Number(state.endTime);
        tickTimer();
      }
    }
  });

  if (
    timerNotificationStatus &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    timerNotificationStatus.textContent =
      "Permesso notifiche attivo. Su iOS l'avviso a schermo bloccato richiede una Web Push inviata da un server.";
  }

  if (timerPanelElement.classList.contains("is-finished")) {
    timerStartElement.textContent = "Nuovo timer";
  }
  refreshBubble();
}

restoreTimerState();
setupTimerBubble();
