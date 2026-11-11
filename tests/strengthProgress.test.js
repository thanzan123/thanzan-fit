import test from 'node:test';
import assert from 'node:assert/strict';
import { getStrengthProgress } from '../src/strengthProgress.js';

const workouts = [
  { id: 'old', date: '2026-11-02', startedAt: 10, active: false },
  { id: 'middle', date: '2026-11-05', startedAt: 20, active: false },
  { id: 'latest', date: '2026-11-08', startedAt: 30, active: false },
  { id: 'active', date: '2026-11-09', startedAt: 40, active: true },
  { id: 'outside', date: '2026-10-31', startedAt: 1, active: false },
];
const set = (sessionId, exercise, kg, reps) => ({ sessionId, exercise, kg, reps });

test('reports first and latest best weighted sets per exercise in the selected period', () => {
  assert.deepEqual(getStrengthProgress(workouts, [
    set('old', ' Squat ', 40, 8), set('old', 'Squat', 35, 12),
    set('middle', 'Squat', 42.5, 8), set('latest', 'Squat', 45, 6),
    set('latest', 'Bench press', 30, 10), set('active', 'Squat', 60, 5),
    set('outside', 'Squat', 70, 5),
  ], '2026-11-01', '2026-11-10'), [
    { exercise: 'Squat', sessions: 3,
      first: { date: '2026-11-02', startedAt: 10, kg: 40, reps: 8 },
      latest: { date: '2026-11-08', startedAt: 30, kg: 45, reps: 6 } },
  ]);
});

test('prefers more reps for equal load and orders same-day workouts by start time', () => {
  const sameDay = [
    { id: 'later', date: '2026-11-04', startedAt: 20, active: false },
    { id: 'earlier', date: '2026-11-04', startedAt: 10, active: false },
  ];
  assert.deepEqual(getStrengthProgress(sameDay, [
    set('earlier', 'Row', 20, 8), set('earlier', 'Row', 20, 10),
    set('later', 'Row', 20, 12),
  ], '2026-11-04', '2026-11-04'), [{ exercise: 'Row', sessions: 2,
    first: { date: '2026-11-04', startedAt: 10, kg: 20, reps: 10 },
    latest: { date: '2026-11-04', startedAt: 20, kg: 20, reps: 12 } }]);
});

test('does not call one-session, bodyweight-only, missing or invalid sets progress', () => {
  assert.deepEqual(getStrengthProgress(workouts, [
    set('old', 'Single visit', 15, 8), set('old', 'Push-up', 0, 12),
    set('middle', 'Invalid', 20, 0), set('missing', 'No session', 10, 5),
  ], '2026-11-01', '2026-11-10'), []);
});

test('missing collections produce no inferred strength progress', () => {
  assert.deepEqual(getStrengthProgress(null, null, '2026-11-01', '2026-11-10'), []);
});
