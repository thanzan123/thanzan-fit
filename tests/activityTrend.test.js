import test from 'node:test';
import assert from 'node:assert/strict';
import { getActivityMetricTrend } from '../src/activityTrend.js';

test('keeps missing values blank and returns only recorded metric days', () => {
  const trend = getActivityMetricTrend([
    { date: '2026-11-01', steps: 4000 },
    { date: '2026-11-02', steps: null },
    { date: '2026-11-03', steps: 6500 },
  ]);
  assert.deepEqual(trend.entries.map(point => [point.date, point.value]), [
    ['2026-11-01', 4000], ['2026-11-03', 6500],
  ]);
  assert.equal(trend.average, 5250);
});

test('uses only the most recent record for each date', () => {
  const trend = getActivityMetricTrend([
    { date: '2026-11-01', steps: 4000, createdAt: 1 },
    { date: '2026-11-01', steps: 7000, createdAt: 2 },
  ]);
  assert.equal(trend.entries.length, 1);
  assert.equal(trend.entries[0].value, 7000);
});

test('ignores malformed dates and invalid values', () => {
  const trend = getActivityMetricTrend([
    { date: 'bad-date', steps: 3000 },
    { date: '2026-11-01', steps: -1 },
    { date: '2026-11-02', steps: 2.5 },
    { date: '2026-11-03', steps: 9000 },
  ]);
  assert.deepEqual(trend.entries.map(point => point.date), ['2026-11-03']);
});

test('supports distance and active-minute trends', () => {
  assert.equal(getActivityMetricTrend([{date:'2026-11-01', distanceKm:2.4}], 'distanceKm').unit, 'km');
  assert.equal(getActivityMetricTrend([{date:'2026-11-01', activeMinutes:35}], 'activeMinutes').average, 35);
});

test('limits the trend to the latest saved dates and handles empty data', () => {
  const entries = Array.from({length:16}, (_, i) => ({ date:`2026-10-${String(i+1).padStart(2,'0')}`, steps:i+1 }));
  assert.equal(getActivityMetricTrend(entries).entries.length, 14);
  assert.equal(getActivityMetricTrend([]).average, null);
});
