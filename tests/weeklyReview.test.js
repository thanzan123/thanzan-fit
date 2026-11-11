import test from 'node:test';
import assert from 'node:assert/strict';
import { formatWeeklyReviewAnswer, getWeeklyReview } from '../src/weeklyReview.js';

const base = { today: '2026-11-10', meals: [], waters: [], workouts: [], weights: [], recovery: [] };

test('summarizes logged-day nutrition and water without counting blank days as zero', () => {
  const result = getWeeklyReview({
    ...base,
    meals: [
      { date: '2026-11-03', kcal: 800, p: 25 }, // just outside the seven-day window
      { date: '2026-11-05', kcal: 1400, p: 80, c: 150, f: 50 },
      { date: '2026-11-05', kcal: 600, p: 20, c: 50, f: 20 },
      { date: '2026-11-09', kcal: 1800, p: 100, c: 200, f: 60 },
    ],
    waters: [{ date: '2026-11-05', ml: 1000 }, { date: '2026-11-05', ml: 500 }, { date: '2026-11-10', ml: 2000 }],
  });
  assert.equal(result.startDate, '2026-11-04');
  assert.equal(result.nutrition.loggedDays, 2);
  assert.equal(result.nutrition.averageCalories, 1900);
  assert.equal(result.nutrition.averageProtein, 100);
  assert.equal(result.nutrition.averageCarbohydrates, 200);
  assert.equal(result.nutrition.carbohydrateDays, 2);
  assert.equal(result.nutrition.averageFat, 65);
  assert.equal(result.nutrition.fatDays, 2);
  assert.equal(result.water.loggedDays, 2);
  assert.equal(result.water.averageMl, 1750);
});

test('averages each macro only across days where every food entry has that value', () => {
  const result = getWeeklyReview({
    ...base,
    meals: [
      { date: '2026-11-05', kcal: 100, p: 10, c: 20, f: 5 },
      { date: '2026-11-05', kcal: 200, p: 20, c: 30, f: 10 },
      { date: '2026-11-06', kcal: 300, p: 30, c: 40 }, // incomplete fat is unknown, not zero
      { date: '2026-11-07', kcal: 400, p: 40, f: 15 }, // incomplete carbs are unknown, not zero
    ],
  });
  assert.equal(result.nutrition.loggedDays, 3);
  assert.equal(result.nutrition.averageCalories, 1000 / 3);
  assert.equal(result.nutrition.averageProtein, 100 / 3);
  assert.equal(result.nutrition.averageCarbohydrates, 45);
  assert.equal(result.nutrition.carbohydrateDays, 2);
  assert.equal(result.nutrition.averageFat, 15);
  assert.equal(result.nutrition.fatDays, 2);
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


test('averages each saved recovery rating independently and ignores missing, invalid, and out-of-window values', () => {
  const result = getWeeklyReview({
    ...base,
    recovery: [
      { date: '2026-11-04', sleepQuality: 4, energy: 3, soreness: 2, readiness: null },
      { date: '2026-11-06', sleepQuality: 5, energy: '', soreness: 4, readiness: 5 },
      { date: '2026-11-10', sleepQuality: 0, energy: 7, soreness: 3, readiness: 4 },
      { date: '2026-11-03', sleepQuality: 1, energy: 1, soreness: 1, readiness: 1 },
      { date: '2026-11-08', sleepQuality: true, energy: 'unknown', soreness: 5.5, readiness: false },
    ],
  });
  assert.deepEqual(result.recoveryRatings, {
    sleepQuality: { entries: 2, average: 4.5 },
    energy: { entries: 1, average: 3 },
    soreness: { entries: 3, average: 3 },
    readiness: { entries: 2, average: 4.5 },
  });
  const answer = formatWeeklyReviewAnswer(result);
  assert.match(answer, /sleep quality 4\.5\/5 across 2 ratings/);
  assert.match(answer, /energy 3\.0\/5 across 1 rating/);
  assert.match(answer, /soreness 3\.0\/5 across 3 ratings/);
  assert.match(answer, /readiness 4\.5\/5 across 2 ratings/);
});

test('leaves unrated recovery scales unknown rather than treating them as zero', () => {
  const result = getWeeklyReview({
    ...base,
    recovery: [{ date: '2026-11-10', sleepHours: 7, sleepQuality: null, energy: undefined, soreness: '', readiness: null }],
  });
  assert.deepEqual(result.recoveryRatings, {
    sleepQuality: { entries: 0, average: null },
    energy: { entries: 0, average: null },
    soreness: { entries: 0, average: null },
    readiness: { entries: 0, average: null },
  });
  assert.doesNotMatch(formatWeeklyReviewAnswer(result), /Average saved check-in ratings/);
});
