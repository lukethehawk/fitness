"use strict";

(() => {
  if (window.WORKOUT_DRAG_V2) return;
  let draggedCard = null;
  let activePointerId = null;

  function moveCard(clientY) {
    if (!draggedCard) return;
    const cards = [...draggedCard.parentElement.querySelectorAll(".exercise-card")]
      .filter((card) => card !== draggedCard);
    const nextCard = cards.find((card) => {
      const box = card.getBoundingClientRect();
      return clientY < box.top + box.height / 2;
    });
    draggedCard.parentElement.insertBefore(draggedCard, nextCard || null);
    if (clientY < 90) window.scrollBy(0, -12);
    if (clientY > window.innerHeight - 90) window.scrollBy(0, 12);
  }

  function saveOrder() {
    let state;
    try { state = JSON.parse(localStorage.getItem("fitness-workout-editor-v1") || "{}"); }
    catch { state = {}; }
    state.overrides ||= {};
    state.order ||= {};
    state.order[activeDay] = [...document.querySelectorAll("#exerciseList .exercise-card")]
      .map((card) => card.dataset.exerciseId);
    localStorage.setItem("fitness-workout-editor-v1", JSON.stringify(state));
  }

  document.addEventListener("pointerdown", (event) => {
    const handle = event.target.closest(".exercise-drag-handle");
    if (!handle || !document.body.classList.contains("is-editing-workout")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    draggedCard = handle.closest(".exercise-card");
    activePointerId = event.pointerId;
    draggedCard.classList.add("is-dragging");
    document.body.classList.add("is-dragging-exercise");
    handle.setAttribute("aria-pressed", "true");
  }, { capture: true, passive: false });

  document.addEventListener("pointermove", (event) => {
    if (!draggedCard || event.pointerId !== activePointerId) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    moveCard(event.clientY);
  }, { capture: true, passive: false });

  function finishDrag(event) {
    if (!draggedCard || event.pointerId !== activePointerId) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    draggedCard.querySelector(".exercise-drag-handle")?.setAttribute("aria-pressed", "false");
    draggedCard.classList.remove("is-dragging");
    document.body.classList.remove("is-dragging-exercise");
    saveOrder();
    draggedCard = null;
    activePointerId = null;
  }

  document.addEventListener("pointerup", finishDrag, { capture: true, passive: false });
  document.addEventListener("pointercancel", finishDrag, { capture: true, passive: false });

  const style = document.createElement("style");
  style.textContent = `.exercise-drag-handle{touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}body.is-dragging-exercise{overflow-anchor:none;user-select:none;-webkit-user-select:none}`;
  document.head.append(style);
})();
