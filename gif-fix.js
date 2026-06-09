"use strict";

const WORKOUTX_GIF_CACHE = "fitness-workoutx-gifs-v1";
const WORKOUTX_GIF_KEY_STORAGE = "fitness-workoutx-api-key-v1";
let workoutxGifObjectUrl = null;

const originalRenderWorkoutxGuide = renderWorkoutxGuide;
renderWorkoutxGuide = async function renderWorkoutxGuideWithAuthenticatedGif(data, fromCache) {
  originalRenderWorkoutxGuide(data, fromCache);

  const gif = document.querySelector("#workoutxGuideGif");
  const error = document.querySelector("#workoutxGuideError");
  gif.removeAttribute("src");
  gif.alt = `Caricamento animazione di ${data.name}`;

  try {
    const result = await loadWorkoutxGif(data.gifUrl);
    revokeWorkoutxGifObjectUrl();
    workoutxGifObjectUrl = URL.createObjectURL(result.blob);
    gif.src = workoutxGifObjectUrl;
    gif.alt = `Animazione di ${data.name}`;

    const notice = document.querySelector("#workoutxCacheNotice");
    if (result.fromCache) {
      notice.textContent += " GIF caricata dalla cache del dispositivo.";
    } else {
      notice.textContent += " GIF salvata nella cache del dispositivo.";
    }
  } catch (loadError) {
    gif.removeAttribute("src");
    gif.alt = "Animazione non disponibile";
    error.hidden = false;
    error.textContent = loadError.message || "Impossibile caricare la GIF WorkoutX.";
  }
};

async function loadWorkoutxGif(gifUrl) {
  const cache = "caches" in window ? await caches.open(WORKOUTX_GIF_CACHE) : null;
  let response = cache ? await cache.match(gifUrl) : null;
  let fromCache = Boolean(response);

  if (!response) {
    const apiKey = localStorage.getItem(WORKOUTX_GIF_KEY_STORAGE);
    if (!apiKey) throw new Error("API key WorkoutX non disponibile.");

    response = await fetch(gifUrl, {
      headers: { "X-WorkoutX-Key": apiKey }
    });

    if (!response.ok) {
      throw new Error(response.status === 401
        ? "La chiave WorkoutX non è valida per caricare la GIF."
        : `Caricamento GIF non riuscito (${response.status}).`);
    }

    if (cache) await cache.put(gifUrl, response.clone());
    fromCache = false;
  }

  return { blob: await response.blob(), fromCache };
}

function revokeWorkoutxGifObjectUrl() {
  if (!workoutxGifObjectUrl) return;
  URL.revokeObjectURL(workoutxGifObjectUrl);
  workoutxGifObjectUrl = null;
}

const originalCloseWorkoutxGuide = closeWorkoutxGuide;
closeWorkoutxGuide = function closeWorkoutxGuideAndReleaseGif() {
  revokeWorkoutxGifObjectUrl();
  originalCloseWorkoutxGuide();
};
