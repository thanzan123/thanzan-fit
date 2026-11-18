const validDate = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const shiftDate = (date, days) => {
  const value = new Date(`${date}T12:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};

/** Return completed sessions, newest first, optionally bounded by a calendar-day window. */
export function getWorkoutHistory({ workouts = [], range = 'all', today } = {}) {
  const rows = Array.isArray(workouts) ? workouts.filter(item => item && !item.active) : [];
  const days = Number(range);
  const hasWindow = validDate(today) && Number.isInteger(days) && days > 0;
  const start = hasWindow ? shiftDate(today, -(days - 1)) : null;
  return rows
    .filter(item => !hasWindow || (validDate(item.date) && item.date >= start && item.date <= today))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) ||
      Number(b.finishedAt || b.startedAt || b.createdAt || 0) - Number(a.finishedAt || a.startedAt || a.createdAt || 0));
}
