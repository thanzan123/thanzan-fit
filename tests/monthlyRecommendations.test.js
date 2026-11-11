import test from 'node:test';
import assert from 'node:assert/strict';
import { getNextMonthRecommendations } from '../src/monthlyRecommendations.js';

const period = { startDate: '2026-10-01', endDate: '2026-10-31' };

test('reports sparse food, weight and workout records without treating blanks as zero', () => {
  const result = getNextMonthRecommendations(period);
  assert.equal(result.length, 3);
  assert.match(result[0], /no food entries were saved/);
  assert.match(result[1], /No weigh-ins were saved/);
  assert.match(result[2], /No completed workout sessions were saved/);
  assert.match(result[0], /representative days/);
});

test('recommendations reflect dated coverage and ignore active workout sessions', () => {
  const result = getNextMonthRecommendations({
    ...period,
    meals: [{ date: '2026-10-02' }, { date: '2026-10-03' }],
    weights: [{ date: '2026-10-01' }, { date: '2026-10-08' }, { date: '2026-10-15' }],
    workouts: [{ date: '2026-10-10', active: true }],
    recovery: [{ date: '2026-10-10' }],
  });
  assert.equal(result.length, 3);
  assert.match(result[0], /2 of 31 days/);
  assert.match(result[1], /3 days/);
  assert.match(result[2], /No completed workout sessions/);
  assert.ok(result.every(text => !/kcal|calorie target|weight loss/i.test(text)));
});

test('offers consistency guidance for adequate records and an optional recovery cue', () => {
  const meals = Array.from({ length: 20 }, (_, i) => ({ date: `2026-10-${String(i + 1).padStart(2, '0')}` }));
  const weights = Array.from({ length: 5 }, (_, i) => ({ date: `2026-10-${String(i * 6 + 1).padStart(2, '0')}` }));
  const workouts = [{ date: '2026-10-07', active: false }];
  const result = getNextMonthRecommendations({ ...period, meals, weights, workouts, recovery: [] });
  assert.equal(result.length, 2);
  assert.match(result[0], /weekly averages/);
  assert.match(result[1], /Recovery check-ins are optional/);
});

test('requires a valid period', () => {
  assert.throws(() => getNextMonthRecommendations({ startDate: 'bad', endDate: '2026-10-31' }), /valid report period/);
});
