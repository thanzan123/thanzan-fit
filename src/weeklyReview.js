const validDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
const finite = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
const mean = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

export function getWeeklyReview({ today, meals = [], waters = [], workouts = [], weights = [], recovery = [] }) {
  if (!validDate(today) || !Number.isFinite(Date.parse(`${today}T00:00:00Z`))) throw new Error('A valid review date is required.');
  const end = new Date(`${today}T12:00:00Z`);
  end.setUTCDate(end.getUTCDate() - 6);
  const startDate = end.toISOString().slice(0, 10);
  const inWindow = (items) => items.filter(item => validDate(item.date) && item.date >= startDate && item.date <= today);

  const mealDays = new Map();
  inWindow(meals).forEach(item => {
    const day = mealDays.get(item.date) || { calories: 0, protein: 0 };
    day.calories += finite(item.kcal) ? Number(item.kcal) : 0;
    day.protein += finite(item.p) ? Number(item.p) : 0;
    mealDays.set(item.date, day);
  });
  const waterDays = new Map();
  inWindow(waters).forEach(item => {
    waterDays.set(item.date, (waterDays.get(item.date) || 0) + (finite(item.ml) ? Number(item.ml) : 0));
  });
  const sleepEntries = inWindow(recovery).filter(item => finite(item.sleepHours) && Number(item.sleepHours) >= 0 && Number(item.sleepHours) <= 24);
  const weighIns = inWindow(weights)
    .filter(item => finite(item.kg) && Number(item.kg) > 0)
    .sort((a, b) => a.date.localeCompare(b.date) || (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0));

  return {
    startDate,
    endDate: today,
    completedWorkouts: inWindow(workouts).filter(item => item.active !== true).length,
    nutrition: {
      loggedDays: mealDays.size,
      averageCalories: mean([...mealDays.values()].map(day => day.calories)),
      averageProtein: mean([...mealDays.values()].map(day => day.protein)),
    },
    water: { loggedDays: waterDays.size, averageMl: mean([...waterDays.values()]) },
    sleep: { checkIns: sleepEntries.length, averageHours: mean(sleepEntries.map(item => Number(item.sleepHours))) },
    weight: {
      entries: weighIns.length,
      first: weighIns[0] ? { date: weighIns[0].date, kg: Number(weighIns[0].kg) } : null,
      latest: weighIns.length ? { date: weighIns.at(-1).date, kg: Number(weighIns.at(-1).kg) } : null,
    },
  };
}
