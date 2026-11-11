const numericFields = [
  { key: 'age', min: 13, max: 120, integer: true },
  { key: 'heightCm', min: 100, max: 250 },
  { key: 'startingWeightKg', min: 20, max: 400 },
  { key: 'currentWeightKg', min: 20, max: 400 },
  { key: 'targetWeightKg', min: 20, max: 400 },
  { key: 'workoutsPerWeek', min: 0, max: 7, integer: true },
  { key: 'workoutMinutes', min: 1, max: 300, integer: true },
  { key: 'sleepHours', min: 0, max: 24 },
  { key: 'dailySteps', min: 1, max: 200000, integer: true },
];

export function validateProfile(profile = {}) {
  for (const field of numericFields) {
    const raw = profile[field.key];
    if (raw === null || raw === undefined || String(raw).trim() === '') continue;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < field.min || value > field.max || (field.integer && !Number.isInteger(value))) {
      return { ...field };
    }
  }
  return null;
}
