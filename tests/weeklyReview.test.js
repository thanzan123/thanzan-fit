import test from 'node:test';
import assert from 'node:assert/strict';
import { getWeeklyReview } from '../src/weeklyReview.js';

const base = { today: '2026-11-10', meals: [], waters: [], workouts: [], weights: [], recovery: [] };

test('summarizes logged-day nutrition and water without counting blank days as zero', () => {
  const result = getWeeklyReview({
    ...base,
    meals: [
      { date: '2026-11-03', kcal: 800, p: 25 }, // just outside the seven-day window
      { date: '2026-11-05', kcal: 1400, p: 80 },
      { date: '2026-11-05', kcal: 600, p: 20 },
      { date: '2026-11-09', kcal: 1800, p: 100 },
    ],
    waters: [{ date: '2026-11-05', ml: 1000 }, { date: '2026-11-05', ml: 500 }, { date: '2026-11-10', ml: 2000 }],
  });
  assert.equal(result.startDate, '2026-11-04');
  assert.equal(result.nutrition.loggedDays, 2);
  assert.equal(result.nutrition.averageCalories, 1900);
  assert.equal(result.nutrition.averageProtein, 100);
  assert.equal(result.water.loggedDays, 2);
  assert.equal(result.water.averageMl, 1750);
});

test('counts only completed sessions and valid in-range sleep check-ins', () => {
  const result = getWeeklyReview({
    ...base,
    workouts: [
      { date: '2026-11-04', active: false },
      { date: '2026-11-10', active: true },
      { date: '2026-11-03', active: false },
    ],
    recovery: [
      { date: '2026-11-05', sleepHours: 7 },
      { date: '2026-11-10', sleepHours: 8 },
      { date: '2026-11-08', sleepHours: 30 },
    ],
  });
  assert.equal(result.completedWorkouts, 1);
  assert.equal(result.sleep.checkIns, 2);
  assert.equal(result.sleep.averageHours, 7.5);
});

test('shows first and latest valid weigh-ins in the window without inventing a trend', () => {
  const result = getWeeklyReview({
    ...base,
    weights: [
      { date: '2026-11-05', kg: 80 },
      { date: '2026-11-10', kg: 79.5 },
      { date: '2026-11-03', kg: 82 },
      { date: '2026-11-09', kg: 0 },
    ],
  });
  assert.equal(result.weight.entries, 2);
  assert.deepEqual(result.weight.first, { date: '2026-11-05', kg: 80 });
  assert.deepEqual(result.weight.latest, { date: '2026-11-10', kg: 79.5 });
});

test('returns null averages and weight values when no eligible records exist', () => {
  const result = getWeeklyReview(base);
  assert.equal(result.nutrition.averageCalories, null);
  assert.equal(result.nutrition.averageProtein, null);
  assert.equal(result.water.averageMl, null);
  assert.equal(result.sleep.averageHours, null);
  assert.equal(result.weight.first, null);
  assert.equal(result.weight.latest, null);
});

test('rejects invalid reference dates', () => {
  assert.throws(() => getWeeklyReview({ ...base, today: '' }), /valid review date/);
});
