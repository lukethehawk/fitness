"use strict";

const FITNESS_DAYS = {
  upperA: { weekday: "Lunedì", title: "Upper A", subtitle: "Palestra + Wing Chun" },
  lower: { weekday: "Mercoledì", title: "Lower", subtitle: "Palestra + Wing Chun" },
  upperB: { weekday: "Venerdì", title: "Upper B", subtitle: "Palestra" }
};

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

async function setupFitnessNotifications() {
  if (!("Notification" in window)) {
    notificationStatus.textContent = "Notifiche non supportate: resta attiva la vibrazione quando disponibile.";
    return;
  }

  if ("serviceWorker" in navigator && window.isSecureContext) {
    try {
      serviceWorkerRegistration = await navigator.serviceWorker.register("./sw.js");
    } catch (error) {
      console.warn("Service Worker non disponibile.", error);
    }
  }

  updateFitnessNotificationStatus();
}

function updateFitnessNotificationStatus() {
  if (!("Notification" in window)) return;
  notificationStatus.classList.toggle("is-enabled", Notification.permission === "granted");
  notificationStatus.textContent = Notification.permission === "granted"
    ? "Notifiche di sistema attive."
    : Notification.permission === "denied"
      ? "Notifiche bloccate nelle impostazioni del browser."
      : "Avviando il timer puoi abilitare le notifiche di sistema.";
}

async function requestFitnessNotificationPermission() {
  if (!("Notification" in window) || Notification.permission !== "default") return;
  try {
    await Notification.requestPermission();
    updateFitnessNotificationStatus();
  } catch (error) {
    console.warn("Richiesta notifiche non riuscita.", error);
  }
}

async function showFitnessTimerNotification() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const options = {
    body: "La pausa è terminata. Puoi iniziare la prossima serie.",
    tag: "fitness-rest-timer",
    renotify: true,
    requireInteraction: true
  };

  try {
    const registration = serviceWorkerRegistration ||
      (("serviceWorker" in navigator) ? await navigator.serviceWorker.ready : null);
    if (registration) await registration.showNotification("Recupero terminato", options);
    else new Notification("Recupero terminato", options);
  } catch (error) {
    console.warn("Notifica timer non riuscita.", error);
  }
}

timerStartButton?.addEventListener("click", () => {
  notificationSent = false;
  requestFitnessNotificationPermission();
});

if (timerPanel) {
  new MutationObserver(() => {
    if (timerPanel.classList.contains("is-finished") && !notificationSent) {
      notificationSent = true;
      showFitnessTimerNotification();
    }
  }).observe(timerPanel, { attributes: true, attributeFilter: ["class"] });
}

setupFitnessNotifications();
