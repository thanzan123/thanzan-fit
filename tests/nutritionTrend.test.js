import test from 'node:test';
import assert from 'node:assert/strict';
import { getNutritionTrend } from '../src/nutritionTrend.js';

const meal = (date, kcal, extra = {}) => ({ date, kcal, ...extra });

test('uses the selected inclusive calendar window and omits days without logs', () => {
  const entries = [meal('2026-10-01', 999), meal('2026-10-13', 100), meal('2026-10-13', 150), meal('2026-10-14', 200), meal('2026-10-15', 888)];
  assert.deepEqual(getNutritionTrend(entries, 'kcal', '2026-10-14', 2), {
    rangeDays: 2,
    entries: [
      { date: '2026-10-13', value: 250, count: 2, dateOffset: 0 },
      { date: '2026-10-14', value: 200, count: 1, dateOffset: 1 },
    ],
  });
});

test('keeps incomplete sugar days unknown instead of treating them as zero', () => {
  const entries = [meal('2026-11-09', 1, { sugar: 3 }), meal('2026-11-09', 2), meal('2026-11-10', 3, { sugar: 4 })];
  assert.deepEqual(getNutritionTrend(entries, 'sugar', '2026-11-10', 14).entries, [
    { date: '2026-11-10', value: 4, count: 1, dateOffset: 13 },
  ]);
});

test('falls back to calories for an unsupported metric and ignores invalid or future dates', () => {
  const entries = [meal('2026-11-10', 80), meal('2026-11-11', 90), meal('not-a-date', 500), meal('2026-02-31', 700)];
  assert.deepEqual(getNutritionTrend(entries, 'not-a-nutrient', '2026-11-10', 1).entries, [
    { date: '2026-11-10', value: 80, count: 1, dateOffset: 0 },
  ]);
});

test('returns no points for an invalid end date and clamps a zero range to one day', () => {
  assert.deepEqual(getNutritionTrend([meal('2026-11-10', 80)], 'kcal', 'bad', 30), { rangeDays: 30, entries: [] });
  assert.deepEqual(getNutritionTrend([meal('2026-11-10', 80)], 'kcal', '2026-02-31', 30), { rangeDays: 30, entries: [] });
  assert.deepEqual(getNutritionTrend([meal('2026-11-10', 80)], 'kcal', '2026-11-10', 0), {
    rangeDays: 1,
    entries: [{ date: '2026-11-10', value: 80, count: 1, dateOffset: 0 }],
  });
});
