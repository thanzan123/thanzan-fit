import test from 'node:test';
import assert from 'node:assert/strict';
import { getRecoveryMetricTrend } from '../src/recoveryTrend.js';

test('summarizes selected sleep, quality, energy, soreness and readiness values', () => {
  const entries = [
    { id: '1', date: '2026-11-09', sleepHours: 7.5, sleepQuality: 4, energy: 3, soreness: 2, readiness: null },
    { id: '2', date: '2026-11-10', sleepHours: 6, sleepQuality: 2, energy: 4, soreness: 4, readiness: 3 },
  ];
  assert.equal(getRecoveryMetricTrend(entries, 'sleepHours').average, 6.75);
  assert.equal(getRecoveryMetricTrend(entries, 'sleepQuality').average, 3);
  assert.equal(getRecoveryMetricTrend(entries, 'energy').average, 3.5);
  assert.equal(getRecoveryMetricTrend(entries, 'soreness').average, 3);
  const readiness = getRecoveryMetricTrend(entries, 'readiness');
  assert.equal(readiness.average, 3);
  assert.equal(readiness.entries.length, 1);
  assert.equal(readiness.entries[0].date, '2026-11-10');
});

test('leaves missing and invalid ratings blank and uses only recent check-ins', () => {
  const entries = Array.from({ length: 16 }, (_, i) => ({
    id: String(i), date: `2026-11-${String(i + 1).padStart(2, '0')}`,
    sleepHours: 7, energy: i === 15 ? 6 : (i < 2 ? null : 4),
  }));
  const result = getRecoveryMetricTrend(entries, 'energy', 14);
  assert.equal(result.entries.length, 13);
  assert.equal(result.average, 4);
  assert.equal(result.entries[0].date, '2026-11-03');
  assert.equal(result.entries.at(-1).date, '2026-11-15');
});

test('falls back safely for unknown metrics and handles an empty history', () => {
  const result = getRecoveryMetricTrend([], 'unknown');
  assert.equal(result.label, 'Sleep duration');
  assert.equal(result.average, null);
  assert.deepEqual(result.entries, []);
});
