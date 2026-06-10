"use strict";

function openSingleFreeExercise(exercise) {
  clearFreeExerciseAnimations();
  const overlay = document.querySelector("#freeExerciseOverlay");
  const list = document.querySelector("#freeExerciseList");
  document.querySelector("#freeExerciseTitle").textContent = exercise.name;
  document.querySelector("#freeExerciseIntro").textContent =
    "Anteprima e istruzioni dell’esercizio selezionato.";
  list.replaceChildren(createFreeExerciseItem(exercise));
  document.querySelector("#freeExerciseWorkoutx").hidden = true;
  overlay.hidden = false;
  document.body.classList.add("has-open-menu");
}
