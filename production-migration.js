"use strict";
(function migrateBetaDataToProduction(){
  const BETA_PREFIX="fitness-beta:";
  const MIGRATION_KEY=`${BETA_PREFIX}production-migration-v1`;
  const LEGACY_MIGRATION_KEY="fitness-beta-to-production-migration-v1";
  const MIGRATABLE_KEYS=[
    "fitness-workout-progress-v1",
    "fitness-custom-exercises-v1",
    "fitness-active-day-v1",
    "fitness-workout-editor-v1",
    "fitness-workout-days-v1",
    "fitness-workout-names-v1",
    "fitness-exercise-language-v1",
    "fitness-ios-shortcut-timer-v1",
    "fitness-workout-sessions-v1",
    "fitness-workoutx-cache-v1",
    "fitness-visual-mode-v1",
    "fitness-accent-color-v1"
  ];
  if(localStorage.getItem(MIGRATION_KEY))return;
  const legacyMarker=localStorage.getItem(LEGACY_MIGRATION_KEY);
  if(legacyMarker){localStorage.setItem(MIGRATION_KEY,legacyMarker);return}
  let copied=0;
  MIGRATABLE_KEYS.forEach(key=>{
    const betaValue=localStorage.getItem(`${BETA_PREFIX}${key}`);
    if(betaValue===null||localStorage.getItem(key)!==null)return;
    localStorage.setItem(key,betaValue);copied+=1;
  });
  localStorage.setItem(MIGRATION_KEY,JSON.stringify({migratedAt:new Date().toISOString(),copied}));
})();
