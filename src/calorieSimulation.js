const finitePositive = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) && Number(value) > 0;

/** Returns a bounded, illustrative calorie scenario; it never changes saved profile targets. */
export function getCalorieSimulation({ maintenanceKcal, deficitKcal, currentWeightKg, targetWeightKg } = {}) {
  if (!finitePositive(maintenanceKcal)) return null;
  const maintenance = Number(maintenanceKcal);
  const maxDeficit = Math.min(500, maintenance * 0.2);
  const requested = Number(deficitKcal);
  if (!Number.isFinite(requested)) return null;
  const deficit = Math.max(0, Math.min(maxDeficit, requested));
  const dailyTarget = Math.round(maintenance - deficit);
  const fourWeekChangeKg = deficit * 28 / 7700;
  const current = finitePositive(currentWeightKg) ? Number(currentWeightKg) : null;
  const target = finitePositive(targetWeightKg) ? Number(targetWeightKg) : null;
  const weeksToTarget = deficit > 0 && current !== null && target !== null && current > target
    ? (current - target) / (deficit * 7 / 7700)
    : null;
  return { maintenanceKcal: Math.round(maintenance), maxDeficitKcal: maxDeficit, deficitKcal: deficit, dailyTargetKcal: dailyTarget, fourWeekChangeKg, weeksToTarget };
}
