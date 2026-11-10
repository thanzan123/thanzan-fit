export function getWeightJourney(profile = {}) {
  const positive = (value) => {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
  };
  const starting = positive(profile.startingWeightKg);
  const current = positive(profile.currentWeightKg);
  const target = positive(profile.targetWeightKg);
  const changeKg = starting !== null && current !== null ? starting - current : null;
  const remainingKg = current !== null && target !== null ? current - target : null;
  const span = starting !== null && target !== null ? target - starting : null;
  const progressPercent = current !== null && span !== null && span !== 0
    ? Math.max(0, Math.min(100, ((current - starting) / span) * 100))
    : null;
  return { startingKg: starting, currentKg: current, targetKg: target, changeKg, remainingKg, progressPercent };
}
