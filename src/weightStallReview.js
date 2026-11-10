const validDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const finite = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
const shiftDate = (date, days) => {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};
const asDisplayWeight = (kg, weightUnit) => weightUnit === 'lb' ? kg / 0.45359237 : kg;

/** A cautious local comparison of early and late logged-weight averages, not a diagnosis of why weight changed. */
export function reviewWeightStall({ today, weights = [], meals = [], weightUnit = 'kg' } = {}) {
  if (!validDate(today)) throw new Error('A valid review date is required.');
  const start = shiftDate(today, -27);
  const weightDays = new Map();
  for (const item of weights) {
    if (!validDate(item.date) || item.date < start || item.date > today || !finite(item.kg) || Number(item.kg) < 20 || Number(item.kg) > 400) continue;
    const values = weightDays.get(item.date) || [];
    values.push(Number(item.kg));
    weightDays.set(item.date, values);
  }
  const dailyWeights = [...weightDays].map(([date, values]) => ({ date, kg: values.reduce((sum, value) => sum + value, 0) / values.length })).sort((a, b) => a.date.localeCompare(b.date));
  const early = dailyWeights.filter(item => item.date <= shiftDate(start, 6));
  const late = dailyWeights.filter(item => item.date >= shiftDate(today, -6));
  const first = early.length >= 2 ? early.reduce((sum, item) => sum + item.kg, 0) / early.length : null;
  const last = late.length >= 2 ? late.reduce((sum, item) => sum + item.kg, 0) / late.length : null;
  const enoughSpan = early.length >= 2 && late.length >= 2 && early.at(-1).date <= shiftDate(today, -14);

  const foodByDay = new Map();
  for (const item of meals) {
    if (!validDate(item.date) || item.date < start || item.date > today) continue;
    const entries = foodByDay.get(item.date) || [];
    entries.push(item);
    foodByDay.set(item.date, entries);
  }
  const completeCalorieDays = [...foodByDay.values()]
    .filter(entries => entries.length && entries.every(item => finite(item.kcal) && Number(item.kcal) >= 0))
    .map(entries => entries.reduce((sum, item) => sum + Number(item.kcal), 0));
  const calorieAverage = completeCalorieDays.length ? completeCalorieDays.reduce((sum, value) => sum + value, 0) / completeCalorieDays.length : null;
  const foodCoverage = foodByDay.size
    ? `Food is logged on ${foodByDay.size} of 28 days${calorieAverage === null ? '; complete calorie totals aren’t available for a logged day' : `; complete logged days average ${Math.round(calorieAverage).toLocaleString()} kcal across ${completeCalorieDays.length} days`}. That may be incomplete, so it can’t explain the weight change by itself.`
    : 'No food entries are saved in this 28-day window, so the app can’t compare logged intake with weight.';

  if (!enoughSpan) {
    return `There aren’t enough weigh-ins to compare the first and last weeks of ${start}–${today}; log at least two dates in each week across a two-week span. ${foodCoverage}`;
  }
  const changeKg = last - first;
  const change = asDisplayWeight(Math.abs(changeKg), weightUnit);
  const firstDisplay = asDisplayWeight(first, weightUnit);
  const lastDisplay = asDisplayWeight(last, weightUnit);
  const rounded = change.toFixed(1);
  const changeText = changeKg < -0.05 ? `down ${rounded} ${weightUnit}` : changeKg > 0.05 ? `up ${rounded} ${weightUnit}` : `changed by ${rounded} ${weightUnit}`;
  return `Your first-week and last-week logged averages are ${firstDisplay.toFixed(1)} and ${lastDisplay.toFixed(1)} ${weightUnit}; that’s ${changeText} across ${start}–${today}. These two averages can’t identify why; daily fluctuations and the completeness of your logs matter. ${foodCoverage}`;
}
