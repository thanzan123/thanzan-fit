export function isValidCheckinDate(value, today) {
  const valid = date => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    Number.isFinite(new Date(`${date}T00:00:00.000Z`).getTime()) &&
    new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10) === date;
  return valid(value) && valid(today) && value <= today;
}

export function saveDailyCheckin({ recovery = [], weights = [], profile = {}, date, idFactory, createdAt = Date.now(), sleepHours, sleepQuality, energy, soreness, readiness, workoutReadiness = '', weightKg = null, updateCurrentWeight = true }) {
  const existing = recovery.find(entry => entry.date === date);
  const nextRecovery = {
    ...existing,
    id: existing?.id || idFactory(),
    date,
    sleepHours: Number(sleepHours),
    sleepQuality: sleepQuality === '' || sleepQuality === null || sleepQuality === undefined ? null : Number(sleepQuality),
    energy: energy === '' || energy === null || energy === undefined ? null : Number(energy),
    soreness: soreness === '' || soreness === null || soreness === undefined ? null : Number(soreness),
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
  return { recovery: nextRecoveryList, weights: nextWeights, profile: updateCurrentWeight ? { ...profile, currentWeightKg: String(kg) } : profile };
}
