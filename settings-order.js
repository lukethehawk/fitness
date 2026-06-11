"use strict";
(function orderSettingsSections(){
  const menu=document.querySelector(".menu-sheet");
  if(!menu)return;

  const sections=[
    menu.querySelector(".catalog-launcher"),
    menu.querySelector("#customExerciseForm"),
    menu.querySelector("#exerciseLanguageSettings"),
    [...menu.querySelectorAll(".ios-shortcut-settings")].find(section=>section.id!=="iosShortcutTimerSettings"),
    menu.querySelector("#iosShortcutTimerSettings"),
    menu.querySelector(".workoutx-settings"),
    menu.querySelector(".custom-list-heading"),
    menu.querySelector("#customExerciseList"),
    menu.querySelector(".data-actions")
  ].filter(Boolean);

  sections.forEach(section=>menu.append(section));
})();
