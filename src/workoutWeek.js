const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

function shiftDate(dateKey, days) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 10);
}

function isCalendarDate(value) {
  if (!DATE_KEY.test(String(value || ''))) return false;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function dayLabel(dateKey) {
  return new Intl.DateTimeFormat('en', { weekday: 'short' }).format(new Date(`${dateKey}T12:00:00`));
}

export function getWorkoutWeek({ today, workouts = [], weeklyTarget = null }) {
  if (!isCalendarDate(today)) throw new RangeError('A valid calendar date is required.');
  const dates = Array.from({ length: 7 }, (_, index) => shiftDate(today, index - 6));
  const byDate = new Map(dates.map(date => [date, 0]));
  for (const workout of workouts) {
    if (workout?.active || !byDate.has(workout?.date)) continue;
    byDate.set(workout.date, byDate.get(workout.date) + 1);
  }
  const days = dates.map(date => ({ date, label: dayLabel(date), count: byDate.get(date) }));
  const targetValue = weeklyTarget === null || weeklyTarget === undefined || weeklyTarget === '' ? NaN : Number(weeklyTarget);
  const target = Number.isFinite(targetValue) && targetValue > 0 ? targetValue : null;
  const completed = days.reduce((sum, day) => sum + day.count, 0);
  return {
    startDate: dates[0],
    endDate: dates[6],
    days,
    completed,
    target,
    targetProgressPercent: target === null ? null : Math.min(100, completed / target * 100),
  };
}
