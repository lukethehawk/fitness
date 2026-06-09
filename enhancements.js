"use strict";

const FITNESS_DAYS = {
  upperA: { weekday: "Lunedì", title: "Upper A", subtitle: "Palestra + Wing Chun" },
  lower: { weekday: "Mercoledì", title: "Lower", subtitle: "Palestra + Wing Chun" },
  upperB: { weekday: "Venerdì", title: "Upper B", subtitle: "Palestra" }
};

const WORKOUTX_IDS = {
  "Spinta inclinata": "0047",
  "Tirata orizzontale": "0861",
  "Croci": "0188",
  "Alzate laterali": "0334",
  "Bicipiti": "0294",
  "Tricipiti": "0241",
  "Polpacci": "0605",
  "Accosciata": "0043",
  "Hip hinge": "0085",
  "Leg curl": "0599",
  "Leg extension mono / Sissy squat": "0585",
  "Abductor / Adductor": "0597",
  "Crunch machine": "0212",
  "Tirata verticale": "2330"
};

const WORKOUTX_KEY_STORAGE = "fitness-workoutx-api-key-v1";
const WORKOUTX_CACHE_STORAGE = "fitness-workoutx-cache-v1";

function nextWorkoutDay(date = new Date()) {
  const weekday = date.getDay();
  if (weekday === 1) return "upperA";
  if (weekday === 2 || weekday === 3) return "lower";
  if (weekday === 4 || weekday === 5) return "upperB";
  return "upperA";
}

const recommendedKey = nextWorkoutDay();
const recommended = FITNESS_DAYS[recommendedKey];
const recommendedText = document.querySelector("#recommendedWorkout");
const recommendedButton = document.querySelector("#openRecommendedButton");
const recommendedTab = document.querySelector(`[data-day="${recommendedKey}"]`);
const sixtySecondButton = document.querySelector('[data-seconds="60"]');
const timerPanel = document.querySelector(".timer-panel");
const timerStartButton = document.querySelector("#timerStartButton");
const notificationStatus = document.querySelector("#notificationStatus");
let serviceWorkerRegistration = null;
let notificationSent = false;

recommendedText.textContent = `${recommended.weekday}: ${recommended.title} · ${recommended.subtitle}`;
recommendedButton.dataset.day = recommendedKey;
recommendedTab?.click();
sixtySecondButton?.click();

function injectWorkoutxStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .exercise-card-actions{display:grid;flex:0 0 auto;justify-items:end;gap:7px}
    .exercise-guide-button{min-height:36px;padding:0 11px;border:1px solid rgb(126 226 173 / 35%);border-radius:999px;background:rgb(126 226 173 / 10%);color:var(--accent);font-size:.72rem;font-weight:800;cursor:pointer}
    .workoutx-settings{margin-top:18px;padding:18px;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--surface-strong)}
    .workoutx-settings p{margin:6px 0 14px;color:var(--muted);font-size:.82rem}
    .workoutx-settings label{color:var(--muted);font-size:.78rem;font-weight:750}
    .workoutx-settings input{width:100%;min-height:48px;margin-top:7px;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text)}
    .workoutx-key-actions{display:flex;align-items:center;gap:15px;margin-top:10px}
    .workoutx-key-status{min-height:1.2em;margin-bottom:0!important;color:var(--accent)!important}
    .workoutx-guide-sheet{width:min(100%,680px);min-height:calc(100dvh - max(20px,env(safe-area-inset-top)));margin:0 auto;padding:22px 18px max(30px,env(safe-area-inset-bottom));border-radius:26px 26px 0 0;background:var(--surface)}
    .workoutx-guide-message{margin-top:24px;padding:24px;border:1px dashed var(--border);border-radius:var(--radius-md);color:var(--muted);text-align:center}
    .workoutx-guide-error{border-color:rgb(255 142 142 / 40%);color:var(--danger)}
    .workoutx-guide-gif{display:block;width:min(100%,420px);max-height:430px;margin:20px auto 16px;border-radius:var(--radius-md);background:#fff;object-fit:contain}
    .workoutx-guide-meta{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:15px}
    .workoutx-guide-meta span{padding:6px 9px;border-radius:999px;background:var(--surface-soft);color:var(--accent);font-size:.75rem;font-weight:750}
    .workoutx-guide-description,.workoutx-guide-instructions{color:var(--muted)}
    .workoutx-guide-instructions{display:grid;gap:10px;padding-left:24px}
    .workoutx-guide-instructions li::marker{color:var(--accent);font-weight:850}
    .workoutx-cache-notice{margin:18px 0 0;color:var(--muted);font-size:.72rem}
    @media (min-width:600px){.workoutx-guide-sheet{min-height:auto;margin-top:5vh;margin-bottom:5vh;border-radius:26px}}
  `;
  document.head.append(style);
}

function injectWorkoutxSettings() {
  const customListHeading = document.querySelector(".custom-list-heading");
  if (!customListHeading) return;
  const section = document.createElement("section");
  section.className = "workoutx-settings";
  section.innerHTML = `
    <h3>WorkoutX API</h3>
    <p>La chiave resta salvata solo su questo dispositivo e non viene pubblicata su GitHub.</p>
    <label>API key<input id="workoutxApiKeyInput" type="password" autocomplete="off" placeholder="wx_..."></label>
    <div class="workoutx-key-actions">
      <button id="saveWorkoutxKeyButton" class="secondary-button" type="button">Salva chiave</button>
      <button id="removeWorkoutxKeyButton" class="text-button danger-text" type="button">Rimuovi</button>
    </div>
    <p id="workoutxKeyStatus" class="workoutx-key-status" aria-live="polite"></p>
  `;
  customListHeading.before(section);
  document.querySelector("#saveWorkoutxKeyButton").addEventListener("click", saveWorkoutxKey);
  document.querySelector("#removeWorkoutxKeyButton").addEventListener("click", removeWorkoutxKey);
  updateWorkoutxKeyStatus();
}

function injectWorkoutxGuide() {
  const overlay = document.createElement("div");
  overlay.id = "workoutxGuideOverlay";
  overlay.className = "overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <section class="workoutx-guide-sheet" role="dialog" aria-modal="true" aria-labelledby="workoutxGuideTitle">
      <div class="sheet-header">
        <div><p class="eyebrow">WorkoutX</p><h2 id="workoutxGuideTitle">Guida esercizio</h2></div>
        <button id="closeWorkoutxGuideButton" class="close-button" type="button" aria-label="Chiudi guida">×</button>
      </div>
      <div id="workoutxGuideLoading" class="workoutx-guide-message">Caricamento guida...</div>
      <div id="workoutxGuideError" class="workoutx-guide-message workoutx-guide-error" hidden></div>
      <div id="workoutxGuideContent" hidden>
        <img id="workoutxGuideGif" class="workoutx-guide-gif" src="" alt="">
        <div class="workoutx-guide-meta"><span id="workoutxGuideTarget"></span><span id="workoutxGuideEquipment"></span><span id="workoutxGuideDifficulty"></span></div>
        <p id="workoutxGuideDescription" class="workoutx-guide-description"></p>
        <h3>Istruzioni</h3>
        <ol id="workoutxGuideInstructions" class="workoutx-guide-instructions"></ol>
        <p id="workoutxCacheNotice" class="workoutx-cache-notice"></p>
      </div>
    </section>
  `;
  document.body.append(overlay);
  document.querySelector("#closeWorkoutxGuideButton").addEventListener("click", closeWorkoutxGuide);
  overlay.addEventListener("click", (event) => { if (event.target === overlay) closeWorkoutxGuide(); });
}

function attachWorkoutxButtons() {
  document.querySelectorAll(".exercise-card").forEach((card) => {
    if (card.querySelector(".exercise-guide-button")) return;
    const name = card.querySelector(".exercise-name")?.textContent.trim();
    const workoutxId = WORKOUTX_IDS[name];
    if (!workoutxId) return;
    const header = card.querySelector(".exercise-card-header");
    const badge = card.querySelector(".reps-badge");
    const actions = document.createElement("div");
    const button = document.createElement("button");
    actions.className = "exercise-card-actions";
    button.className = "exercise-guide-button";
    button.type = "button";
    button.textContent = "Guida GIF";
    button.addEventListener("click", () => openWorkoutxGuide(name, workoutxId));
    actions.append(button, badge);
    header.append(actions);
  });
}

function updateWorkoutxKeyStatus(message = "") {
  const status = document.querySelector("#workoutxKeyStatus");
  const input = document.querySelector("#workoutxApiKeyInput");
  if (!status || !input) return;
  const hasKey = Boolean(localStorage.getItem(WORKOUTX_KEY_STORAGE));
  status.textContent = message || (hasKey ? "Chiave salvata su questo dispositivo." : "Nessuna chiave salvata.");
  input.placeholder = hasKey ? "Chiave già salvata" : "wx_...";
}

function saveWorkoutxKey() {
  const input = document.querySelector("#workoutxApiKeyInput");
  const key = input.value.trim();
  if (!key.startsWith("wx_")) { updateWorkoutxKeyStatus("Inserisci una chiave WorkoutX valida."); return; }
  localStorage.setItem(WORKOUTX_KEY_STORAGE, key);
  input.value = "";
  updateWorkoutxKeyStatus("Chiave salvata. Ora puoi aprire le guide GIF.");
}

function removeWorkoutxKey() {
  localStorage.removeItem(WORKOUTX_KEY_STORAGE);
  document.querySelector("#workoutxApiKeyInput").value = "";
  updateWorkoutxKeyStatus("Chiave rimossa.");
}

function closeWorkoutxGuide() {
  const overlay = document.querySelector("#workoutxGuideOverlay");
  overlay.hidden = true;
  document.body.classList.remove("has-open-menu");
  document.querySelector("#workoutxGuideGif").src = "";
}

async function openWorkoutxGuide(name, workoutxId) {
  const overlay = document.querySelector("#workoutxGuideOverlay");
  const loading = document.querySelector("#workoutxGuideLoading");
  const error = document.querySelector("#workoutxGuideError");
  const content = document.querySelector("#workoutxGuideContent");
  overlay.hidden = false;
  document.body.classList.add("has-open-menu");
  document.querySelector("#workoutxGuideTitle").textContent = name;
  loading.hidden = false;
  error.hidden = true;
  content.hidden = true;
  const cache = loadWorkoutxCache();
  if (cache[workoutxId]) { renderWorkoutxGuide(cache[workoutxId], true); return; }
  const apiKey = localStorage.getItem(WORKOUTX_KEY_STORAGE);
  if (!apiKey) {
    loading.hidden = true;
    error.hidden = false;
    error.textContent = "Salva prima la tua API key WorkoutX dal pulsante Menu. La chiave resterà solo su questo dispositivo.";
    return;
  }
  try {
    const response = await fetch(`https://api.workoutxapp.com/v1/exercises/exercise/${encodeURIComponent(workoutxId)}`, { headers: { "X-WorkoutX-Key": apiKey } });
    if (!response.ok) {
      throw new Error(response.status === 401 ? "Chiave API non valida." : response.status === 429 ? "Quota WorkoutX terminata o troppe richieste." : `WorkoutX ha risposto con errore ${response.status}.`);
    }
    const data = await response.json();
    cache[workoutxId] = data;
    localStorage.setItem(WORKOUTX_CACHE_STORAGE, JSON.stringify(cache));
    renderWorkoutxGuide(data, false);
  } catch (requestError) {
    loading.hidden = true;
    error.hidden = false;
    error.textContent = requestError.message || "Impossibile caricare la guida WorkoutX.";
  }
}

function loadWorkoutxCache() {
  try { return JSON.parse(localStorage.getItem(WORKOUTX_CACHE_STORAGE) || "{}"); }
  catch { return {}; }
}

function renderWorkoutxGuide(data, fromCache) {
  document.querySelector("#workoutxGuideLoading").hidden = true;
  document.querySelector("#workoutxGuideError").hidden = true;
  document.querySelector("#workoutxGuideContent").hidden = false;
  document.querySelector("#workoutxGuideTitle").textContent = data.name;
  const gif = document.querySelector("#workoutxGuideGif");
  gif.src = data.gifUrl;
  gif.alt = `Animazione di ${data.name}`;
  document.querySelector("#workoutxGuideTarget").textContent = data.target || "Focus non indicato";
  document.querySelector("#workoutxGuideEquipment").textContent = data.equipment || "Attrezzatura non indicata";
  document.querySelector("#workoutxGuideDifficulty").textContent = data.difficulty || "Livello non indicato";
  document.querySelector("#workoutxGuideDescription").textContent = data.description || "";
  const instructions = document.querySelector("#workoutxGuideInstructions");
  instructions.replaceChildren();
  (data.instructions || []).forEach((instruction) => {
    const item = document.createElement("li");
    item.textContent = instruction;
    instructions.append(item);
  });
  document.querySelector("#workoutxCacheNotice").textContent = fromCache ? "Guida caricata dalla cache locale: nessuna richiesta API consumata." : "Guida salvata nella cache locale per le prossime aperture.";
}

async function setupFitnessNotifications() {
  if (!("Notification" in window)) { notificationStatus.textContent = "Notifiche non supportate: resta attiva la vibrazione quando disponibile."; return; }
  if ("serviceWorker" in navigator && window.isSecureContext) {
    try { serviceWorkerRegistration = await navigator.serviceWorker.register("./sw.js"); }
    catch (error) { console.warn("Service Worker non disponibile.", error); }
  }
  updateFitnessNotificationStatus();
}

function updateFitnessNotificationStatus() {
  if (!("Notification" in window)) return;
  notificationStatus.classList.toggle("is-enabled", Notification.permission === "granted");
  notificationStatus.textContent = Notification.permission === "granted" ? "Notifiche di sistema attive." : Notification.permission === "denied" ? "Notifiche bloccate nelle impostazioni del browser." : "Avviando il timer puoi abilitare le notifiche di sistema.";
}

async function requestFitnessNotificationPermission() {
  if (!("Notification" in window) || Notification.permission !== "default") return;
  try { await Notification.requestPermission(); updateFitnessNotificationStatus(); }
  catch (error) { console.warn("Richiesta notifiche non riuscita.", error); }
}

async function showFitnessTimerNotification() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const options = { body: "La pausa è terminata. Puoi iniziare la prossima serie.", tag: "fitness-rest-timer", renotify: true, requireInteraction: true };
  try {
    const registration = serviceWorkerRegistration || (("serviceWorker" in navigator) ? await navigator.serviceWorker.ready : null);
    if (registration) await registration.showNotification("Recupero terminato", options);
    else new Notification("Recupero terminato", options);
  } catch (error) { console.warn("Notifica timer non riuscita.", error); }
}

timerStartButton?.addEventListener("click", () => { notificationSent = false; requestFitnessNotificationPermission(); });
if (timerPanel) {
  new MutationObserver(() => {
    if (timerPanel.classList.contains("is-finished") && !notificationSent) { notificationSent = true; showFitnessTimerNotification(); }
  }).observe(timerPanel, { attributes: true, attributeFilter: ["class"] });
}
const exerciseList = document.querySelector("#exerciseList");
if (exerciseList) new MutationObserver(attachWorkoutxButtons).observe(exerciseList, { childList: true });
document.querySelector("#resetAllButton")?.addEventListener("click", () => {
  localStorage.removeItem(WORKOUTX_KEY_STORAGE);
  localStorage.removeItem(WORKOUTX_CACHE_STORAGE);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !document.querySelector("#workoutxGuideOverlay")?.hidden) closeWorkoutxGuide();
});

injectWorkoutxStyles();
injectWorkoutxSettings();
injectWorkoutxGuide();
attachWorkoutxButtons();
setupFitnessNotifications();
