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


test('supports a calendar-day window ending on the selected date', () => {
  const trend = getActivityMetricTrend([
    { date: '2026-10-01', steps: 2000 },
    { date: '2026-11-01', steps: 4000 },
    { date: '2026-11-18', steps: 6000 },
    { date: '2026-11-19', steps: 9000 },
  ], 'steps', 14, '2026-11-18');
  assert.deepEqual(trend.entries.map(point => [point.date, point.value, point.dateOffset]), [
    ['2026-11-18', 6000, 13],
  ]);
  assert.equal(trend.rangeDays, 14);
  assert.equal(trend.rangeStartDate, '2026-11-05');
  assert.equal(trend.rangeEndDate, '2026-11-18');
});

test('calendar window keeps logged dates and places gaps at their actual date offsets', () => {
  const trend = getActivityMetricTrend([
    { date: '2026-11-01', steps: 1000 },
    { date: '2026-11-04', steps: 4000 },
    { date: '2026-11-04', steps: 5000, createdAt: 2 },
    { date: '2026-11-05', steps: null },
  ], 'steps', 7, '2026-11-07');
  assert.deepEqual(trend.entries.map(point => [point.date, point.value, point.dateOffset]), [
    ['2026-11-01', 1000, 0], ['2026-11-04', 5000, 3],
  ]);
  assert.equal(trend.average, 3000);
});

test('calendar window rejects impossible dates and excludes future records', () => {
  const trend = getActivityMetricTrend([
    { date: '2026-02-30', steps: 2000 },
    { date: '2026-11-10', steps: 3000 },
    { date: '2026-11-21', steps: 9000 },
  ], 'steps', 14, '2026-11-20');
  assert.deepEqual(trend.entries.map(point => point.date), ['2026-11-10']);
});
