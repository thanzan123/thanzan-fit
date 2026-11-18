import test from 'node:test';
import assert from 'node:assert/strict';
import { getRecoveryReportSummary } from '../src/recoveryReport.js';

test('recovery averages use only explicitly recorded valid values for each measure', () => {
  const result = getRecoveryReportSummary([
    { sleepHours: 7, sleepQuality: 4, energy: 3, soreness: 2, readiness: 4 },
    { sleepHours: null, sleepQuality: '', energy: 5, soreness: null, readiness: undefined },
    { sleepHours: 9, sleepQuality: 2, energy: undefined, soreness: 4, readiness: '' },
  ]);
  assert.deepEqual(result.sleepHours, { entries: 2, average: 8 });
  assert.deepEqual(result.sleepQuality, { entries: 2, average: 3 });
  assert.deepEqual(result.energy, { entries: 2, average: 4 });
  assert.deepEqual(result.soreness, { entries: 2, average: 3 });
  assert.deepEqual(result.readiness, { entries: 1, average: 4 });
});

test('empty, blank, boolean, non-finite and out-of-range values remain unavailable', () => {
  const result = getRecoveryReportSummary([
    { sleepHours: '', sleepQuality: true, energy: NaN, soreness: 0, readiness: 6 },
    { sleepHours: 25, sleepQuality: 'unknown', energy: null, soreness: false, readiness: -1 },
  ]);
  for (const key of ['sleepHours', 'sleepQuality', 'energy', 'soreness', 'readiness']) {
    assert.deepEqual(result[key], { entries: 0, average: null });
  }
  assert.deepEqual(getRecoveryReportSummary([]).sleepHours, { entries: 0, average: null });
});

test('workout readiness counts only recognized self-reports', () => {
  const result = getRecoveryReportSummary([
    { workoutReadiness: 'ready' },
    { workoutReadiness: 'unsure' },
    { workoutReadiness: 'rest' },
    { workoutReadiness: 'maybe' },
    {},
  ]);
  assert.deepEqual(result.workoutReadiness, { ready: 1, unsure: 1, rest: 1, entries: 3 });
});
