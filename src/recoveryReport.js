const numericValue = (value, min, max) => {
  if (typeof value === 'boolean' || value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
};

const average = values => values.length
  ? values.reduce((sum, value) => sum + value, 0) / values.length
  : null;

/** Summarize only explicitly recorded, in-range recovery values. */
export function getRecoveryReportSummary(entries = []) {
  const fields = {
    sleepHours: [0, 24],
    sleepQuality: [1, 5],
    energy: [1, 5],
    soreness: [1, 5],
    readiness: [1, 5],
  };
  const metrics = Object.fromEntries(Object.entries(fields).map(([key, [min, max]]) => {
    const values = entries.map(entry => numericValue(entry?.[key], min, max)).filter(value => value !== null);
    return [key, { entries: values.length, average: average(values) }];
  }));
  const workoutReadiness = { ready: 0, unsure: 0, rest: 0 };
  entries.forEach(entry => {
    if (Object.hasOwn(workoutReadiness, entry?.workoutReadiness)) workoutReadiness[entry.workoutReadiness] += 1;
  });
  return {
    ...metrics,
    workoutReadiness: {
      ...workoutReadiness,
      entries: Object.values(workoutReadiness).reduce((sum, value) => sum + value, 0),
    },
  };
}
