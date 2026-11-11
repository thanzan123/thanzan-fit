const validDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

const countDays = (startDate, endDate) => {
  if (!validDate(startDate) || !validDate(endDate) || startDate > endDate) return 0;
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return Math.floor((end - start) / 86400000) + 1;
};

/** Create modest, record-grounded next-month ideas; never infer missing entries as zero. */
export function getNextMonthRecommendations({
  startDate,
  endDate,
  meals = [],
  weights = [],
  workouts = [],
  recovery = [],
} = {}) {
  const days = countDays(startDate, endDate);
  if (!days) throw new Error('A valid report period is required.');
  const inRange = (items) => items.filter(item => validDate(item.date) && item.date >= startDate && item.date <= endDate);
  const foodDays = new Set(inRange(meals).map(item => item.date));
  const weighInDays = new Set(inRange(weights).map(item => item.date));
  const completedWorkouts = inRange(workouts).filter(item => item.active !== true);
  const recoveryDays = new Set(inRange(recovery).map(item => item.date));
  const recommendations = [];

  if (!foodDays.size) {
    recommendations.push('If nutrition feedback would be useful, log a few representative days next month; no food entries were saved in this period.');
  } else if (foodDays.size < Math.ceil(days / 2)) {
    recommendations.push(`Food was logged on ${foodDays.size} of ${days} days; a few more representative days next month would make the averages more useful. Blank days are unknown, not zero.`);
  }

  if (weighInDays.size < 4) {
    recommendations.push(weighInDays.size
      ? `Weigh-ins were saved on ${weighInDays.size} ${weighInDays.size === 1 ? 'day' : 'days'}; if weight trends matter to you, a few more consistently timed entries next month can make comparisons more informative.`
      : 'No weigh-ins were saved this period; if weight trends matter to you, add occasional dated entries next month and compare weekly averages.');
  } else {
    recommendations.push('Keep weigh-in timing reasonably consistent and compare weekly averages next month; single readings can fluctuate.');
  }

  if (!completedWorkouts.length) {
    recommendations.push('No completed workout sessions were saved this period; if you trained, recording sessions next month will make the workout summary more useful.');
  } else if (!recoveryDays.size) {
    recommendations.push('Recovery check-ins are optional; adding a few next month can give your training notes more context without changing your plan automatically.');
  }

  return recommendations.slice(0, 3);
}
