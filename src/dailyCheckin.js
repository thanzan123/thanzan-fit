export function saveDailyCheckin({ recovery = [], weights = [], profile = {}, date, idFactory, createdAt = Date.now(), sleepHours, sleepQuality, energy, soreness, readiness, workoutReadiness = '', weightKg = null }) {
  const existing = recovery.find(entry => entry.date === date);
  const nextRecovery = {
    ...existing,
    id: existing?.id || idFactory(),
    date,
    sleepHours: Number(sleepHours),
    sleepQuality: Number(sleepQuality),
    energy: Number(energy),
    soreness: Number(soreness),
    ...(readiness === '' || readiness === null || readiness === undefined ? {} : { readiness: Number(readiness) }),
    workoutReadiness: workoutReadiness || null,
    createdAt,
  };
  const nextRecoveryList = existing
    ? recovery.map(entry => entry.id === existing.id ? nextRecovery : entry)
    : [nextRecovery, ...recovery];

  if (weightKg === null || weightKg === undefined || weightKg === '') {
    return { recovery: nextRecoveryList, weights, profile };
  }

  const kg = Number(weightKg);
  if (!Number.isFinite(kg) || kg < 20 || kg > 400) throw new RangeError('Weight must be between 20 and 400 kg.');
  const existingToday = [...weights]
    .filter(entry => entry.date === date)
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))[0];
  const nextWeight = existingToday
    ? { ...existingToday, kg, note: existingToday.note || 'Daily check-in' }
    : { id: idFactory(), date, kg, note: 'Daily check-in', createdAt };
  const nextWeights = existingToday
    ? weights.map(entry => entry.id === existingToday.id ? nextWeight : entry)
    : [nextWeight, ...weights];
  return { recovery: nextRecoveryList, weights: nextWeights, profile: { ...profile, currentWeightKg: String(kg) } };
}
