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

export function formatWeeklyReviewAnswer(review, formatWeight = value => `${Number(value).toFixed(1)} kg`) {
  const parts = [`Last 7 days (${review.startDate}–${review.endDate})`];
  parts.push(`${review.completedWorkouts} completed ${review.completedWorkouts === 1 ? 'workout' : 'workouts'} saved.`);
  if (review.nutrition.loggedDays) {
    const calories = review.nutrition.averageCalories === null ? 'calorie average unavailable' : `${Math.round(review.nutrition.averageCalories).toLocaleString()} kcal/day`;
    const protein = review.nutrition.averageProtein === null ? 'protein average unavailable' : `${review.nutrition.averageProtein.toFixed(1)} g protein/day`;
    const foodDayLabel = review.nutrition.loggedDays === 1 ? 'day' : 'days';
    parts.push(`Food was logged on ${review.nutrition.loggedDays} ${foodDayLabel}; those logged days averaged ${calories} and ${protein}.`);
  } else parts.push('No food entries were saved this week.');
  if (review.water.loggedDays) parts.push(`Water was logged on ${review.water.loggedDays} ${review.water.loggedDays === 1 ? 'day' : 'days'}, averaging ${Math.round(review.water.averageMl).toLocaleString()} ml on logged days.`);
  else parts.push('No water entries were saved this week.');
  if (review.sleep.checkIns) parts.push(`${review.sleep.checkIns} sleep ${review.sleep.checkIns === 1 ? 'check-in averaged' : 'check-ins averaged'} ${review.sleep.averageHours.toFixed(1)} hours.`);
  else parts.push('No sleep check-ins were saved this week.');
  if (review.weight.first && review.weight.latest) {
    const first = review.weight.first;
    const latest = review.weight.latest;
    parts.push(`${review.weight.entries} weigh-ins: ${formatWeight(first.kg)} on ${first.date} to ${formatWeight(latest.kg)} on ${latest.date}; this is a simple comparison, not a smoothed trend.`);
  } else if (review.weight.entries) parts.push(`${review.weight.entries} weigh-in${review.weight.entries === 1 ? '' : 's'} saved; there aren’t two to compare.`);
  else parts.push('No weigh-ins were saved this week.');
  return `${parts.join(' ')} Blank days stay unknown, not zero.`;
}
