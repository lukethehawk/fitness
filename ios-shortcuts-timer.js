"use strict";

const IOS_SHORTCUT_TIMER_SETTINGS_KEY = "fitness-ios-shortcut-timer-v1";
const IOS_SHORTCUT_TIMER_STATE_KEY = "fitness-rest-timer-state-v1";

function loadIosShortcutTimerSettings() {
  try {
    return {
      enabled: false,
      shortcutName: "Timer Palestra",
      ...JSON.parse(localStorage.getItem(IOS_SHORTCUT_TIMER_SETTINGS_KEY) || "{}")
    };
  } catch {
    return { enabled: false, shortcutName: "Timer Palestra" };
  }
}

function saveIosShortcutTimerSettings(settings) {
  localStorage.setItem(IOS_SHORTCUT_TIMER_SETTINGS_KEY, JSON.stringify(settings));
}

function showIosShortcutTimerMessage(message, isError = false) {
  const status = document.querySelector("#iosShortcutTimerStatus");
  if (status) {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }

  let toast = document.querySelector("#iosShortcutTimerToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "iosShortcutTimerToast";
    toast.className = "ios-shortcut-toast";
    toast.setAttribute("role", "status");
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.toggle("is-error", isError);
  toast.classList.add("is-visible");
  window.clearTimeout(showIosShortcutTimerMessage.timeoutId);
  showIosShortcutTimerMessage.timeoutId = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 4000);
}

function persistIosFallbackTimer(seconds) {
  localStorage.setItem(IOS_SHORTCUT_TIMER_STATE_KEY, JSON.stringify({
    duration: seconds,
    remaining: seconds,
    endTime: Date.now() + seconds * 1000,
    running: true
  }));
}

function startLocalFallbackTimer(seconds) {
  const preset = document.querySelector(`.timer-presets button[data-seconds="${seconds}"]`);
  if (preset) {
    chooseTimerDuration(seconds);
  } else {
    stopTimer();
    timerDuration = seconds;
    timerRemaining = seconds;
    updateTimerDisplay();
  }

  persistIosFallbackTimer(seconds);
  startTimer();
  window.setTimeout(() => persistIosFallbackTimer(seconds));
}

function startIosShortcutTimer(seconds) {
  const settings = loadIosShortcutTimerSettings();
  const shortcutName = settings.shortcutName.trim();
  const numericSeconds = Math.max(1, Math.round(Number(seconds)));

  if (!shortcutName) {
    showIosShortcutTimerMessage("Inserisci prima il nome del Comando Rapido.", true);
    document.querySelector("#iosShortcutName")?.focus();
    return false;
  }

  if (!Number.isFinite(numericSeconds)) {
    showIosShortcutTimerMessage("La durata del timer non è valida.", true);
    return false;
  }

  const shortcutUrl =
    `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}` +
    `&input=text&text=${encodeURIComponent(String(numericSeconds))}`;

  showIosShortcutTimerMessage(
    `Apertura Comandi Rapidi per avviare il timer iOS da ${numericSeconds} secondi.`
  );
  window.location.href = shortcutUrl;
  return true;
}

window.startIosShortcutTimer = startIosShortcutTimer;

function injectIosShortcutTimerSettings() {
  const menuSheet = document.querySelector(".menu-sheet");
  if (!menuSheet || document.querySelector("#iosShortcutTimerSettings")) return;

  const settings = loadIosShortcutTimerSettings();
  const style = document.createElement("style");
  style.textContent = `
    .ios-shortcut-settings{margin-top:18px;padding:18px;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--surface-strong)}
    .ios-shortcut-settings h3{margin-bottom:14px}
    .ios-shortcut-toggle{display:flex;align-items:flex-start;gap:10px;color:var(--text);font-size:.85rem;font-weight:800}
    .ios-shortcut-toggle input{width:20px;height:20px;flex:0 0 auto;margin:1px 0 0;accent-color:var(--accent)}
    .ios-shortcut-name-label{display:block;margin-top:16px;color:var(--muted);font-size:.78rem;font-weight:750}
    .ios-shortcut-name-label input{width:100%;min-height:48px;margin-top:7px;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text)}
    .ios-shortcut-help{margin:12px 0;color:var(--muted);font-size:.78rem}
    .ios-shortcut-status{min-height:1.2em;margin:10px 0 0;color:var(--accent);font-size:.75rem}
    .ios-shortcut-status.is-error{color:var(--danger)}
    .timer-panel.is-ios-shortcut .timer-actions{grid-template-columns:1fr 1fr}
    .ios-shortcut-toast{position:fixed;z-index:200;right:14px;bottom:calc(90px + env(safe-area-inset-bottom));left:14px;max-width:520px;margin:auto;padding:12px 15px;border:1px solid rgb(126 226 173 / 35%);border-radius:14px;background:rgb(19 27 24 / 97%);color:var(--accent);box-shadow:var(--shadow);font-size:.8rem;font-weight:750;opacity:0;pointer-events:none;transform:translateY(8px);transition:opacity .18s ease,transform .18s ease}
    .ios-shortcut-toast.is-visible{opacity:1;transform:translateY(0)}
    .ios-shortcut-toast.is-error{border-color:rgb(255 142 142 / 40%);color:var(--danger)}
  `;
  document.head.append(style);

  const section = document.createElement("section");
  section.id = "iosShortcutTimerSettings";
  section.className = "ios-shortcut-settings";
  section.innerHTML = `
    <h3>Timer iOS</h3>
    <label class="ios-shortcut-toggle">
      <input id="useIosShortcutTimer" type="checkbox">
      <span>Usa timer nativo iOS tramite Comandi Rapidi</span>
    </label>
    <label class="ios-shortcut-name-label">
      Nome comando rapido
      <input id="iosShortcutName" type="text" maxlength="80" value="">
    </label>
    <p class="ios-shortcut-help">
      Crea un comando rapido chiamato <strong>Timer Palestra</strong> che riceve
      un numero di secondi e avvia un timer iOS.
    </p>
    <p class="ios-shortcut-help">
      In questa modalità il timer locale resta solo un riferimento visivo.
      L'avviso a schermo bloccato è affidato al timer nativo avviato da
      Comandi Rapidi. Il pulsante Stop viene nascosto perché non potrebbe
      fermare il timer di iOS.
    </p>
    <button id="testIosShortcutTimer" class="secondary-button" type="button">
      Test timer iOS 10 secondi
    </button>
    <p id="iosShortcutTimerStatus" class="ios-shortcut-status" aria-live="polite"></p>
  `;

  const insertionPoint =
    menuSheet.querySelector(".custom-list-heading") ||
    menuSheet.querySelector(".data-actions");
  insertionPoint?.before(section);

  const toggle = section.querySelector("#useIosShortcutTimer");
  const nameInput = section.querySelector("#iosShortcutName");
  toggle.checked = settings.enabled;
  nameInput.value = settings.shortcutName;

  function updateTimerControls() {
    const stopButton = document.querySelector("#timerStopButton");
    document.querySelector(".timer-panel")?.classList.toggle(
      "is-ios-shortcut",
      toggle.checked
    );
    if (stopButton) stopButton.hidden = toggle.checked;
  }

  function storeSettings() {
    saveIosShortcutTimerSettings({
      enabled: toggle.checked,
      shortcutName: nameInput.value.trim()
    });
    updateTimerControls();
    showIosShortcutTimerMessage(
      toggle.checked
        ? "Modalità iOS attiva: scegli la durata e premi Avvia."
        : "Modalità iOS disattivata: verrà usato solo il timer della webapp."
    );
  }

  toggle.addEventListener("change", storeSettings);
  nameInput.addEventListener("change", storeSettings);
  updateTimerControls();
  section.querySelector("#testIosShortcutTimer").addEventListener("click", () => {
    storeSettings();
    if (!toggle.checked) {
      showIosShortcutTimerMessage(
        "Attiva prima la modalità timer nativo iOS.",
        true
      );
      return;
    }
    startLocalFallbackTimer(10);
    startIosShortcutTimer(10);
  });
}

function setupIosShortcutTimerBridge() {
  injectIosShortcutTimerSettings();

  document.querySelector("#timerStartButton")?.addEventListener("click", () => {
    const settings = loadIosShortcutTimerSettings();
    if (!settings.enabled) return;
    if (
      timerRemaining <= 0 ||
      document.querySelector(".timer-panel")?.classList.contains("is-finished")
    ) {
      return;
    }
    startIosShortcutTimer(timerRemaining > 0 ? timerRemaining : timerDuration);
  });
}

setupIosShortcutTimerBridge();
