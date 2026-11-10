import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewWeightStall } from '../src/weightStallReview.js';

const weights = [
  { date: '2026-10-15', kg: 100 }, { date: '2026-10-20', kg: 99.9 },
  { date: '2026-11-08', kg: 99.8 }, { date: '2026-11-10', kg: 99.7 },
];

test('compares first and last week averages and preserves missing-log caveat', () => {
  const answer = reviewWeightStall({ today: '2026-11-11', weights, meals: [
    { date: '2026-11-10', kcal: 900 }, { date: '2026-11-10', kcal: 300 },
  ], weightUnit: 'kg' });
  assert.match(answer, /first-week and last-week logged averages are 100\.0 and 99\.8 kg/);
  assert.match(answer, /down 0\.2 kg/);
  assert.match(answer, /Food is logged on 1 of 28 days/);
  assert.match(answer, /complete logged days average 1,200 kcal across 1 days/);
  assert.match(answer, /can’t explain the weight change by itself/);
});

test('does not infer a trend from sparse weigh-ins', () => {
  const answer = reviewWeightStall({ today: '2026-11-11', weights: [{ date: '2026-11-01', kg: 100 }, { date: '2026-11-10', kg: 99 }] });
  assert.match(answer, /aren’t enough weigh-ins/);
  assert.doesNotMatch(answer, /first-week and last-week logged averages/);
});

test('excludes out-of-window, malformed, and invalid weight entries', () => {
  const answer = reviewWeightStall({ today: '2026-11-11', weights: [
    { date: '2026-10-14', kg: 100 }, { date: '2026-10-15', kg: 100 },
    { date: '2026-10-20', kg: 100 }, { date: '2026-10-21', kg: 'bad' },
    { date: '2026-10-31', kg: 100 }, { date: '2026-11-01', kg: 100 },
    { date: '2026-11-08', kg: 100 }, { date: '2026-11-10', kg: 100 },
  ] });
  assert.match(answer, /100\.0 and 100\.0 kg/);
});

test('converts stored kilograms correctly for imperial display', () => {
  const answer = reviewWeightStall({ today: '2026-11-11', weights: [
    { date: '2026-10-15', kg: 100 }, { date: '2026-10-20', kg: 100 },
    { date: '2026-11-08', kg: 99.0927 }, { date: '2026-11-10', kg: 99.0927 },
  ], weightUnit: 'lb' });
  assert.match(answer, /220\.5 and 218\.5 lb/);
  assert.match(answer, /down 2\.0 lb/);
});

test('reports no food entries and does not infer calories', () => {
  const answer = reviewWeightStall({ today: '2026-11-11', weights: [
    { date: '2026-10-15', kg: 100 }, { date: '2026-10-20', kg: 100 },
    { date: '2026-11-08', kg: 100 }, { date: '2026-11-10', kg: 100 },
  ] });
  assert.match(answer, /No food entries are saved/);
});

test('does not average calorie totals on days with incomplete nutrition data', () => {
  const answer = reviewWeightStall({ today: '2026-11-11', meals: [
    { date: '2026-11-09', kcal: 1500 }, { date: '2026-11-09', kcal: null },
  ] });
  assert.match(answer, /complete calorie totals aren’t available for a logged day/);
});

test('rejects impossible calendar dates', () => {
  assert.throws(() => reviewWeightStall({ today: '2026-02-31' }), /valid review date/);
});
