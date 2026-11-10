import test from 'node:test';
import assert from 'node:assert/strict';
import { getPersonalRecords } from '../src/personalRecords.js';

const workouts = [
  { id: 'old', date: '2026-01-01', active: false },
  { id: 'new', date: '2026-02-01', active: false },
  { id: 'active', date: '2026-03-01', active: true },
];
const set = (sessionId, exercise, kg, reps) => ({ sessionId, exercise, kg, reps });

test('selects the heaviest completed-session set per exercise', () => {
  assert.deepEqual(getPersonalRecords(workouts, [
    set('old', '  Squat ', 40, 8), set('new', 'Squat', 45, 5), set('new', 'Bench', 30, 10),
  ]), [
    { exercise: 'Bench', kg: 30, reps: 10, date: '2026-02-01', sessionId: 'new' },
    { exercise: 'Squat', kg: 45, reps: 5, date: '2026-02-01', sessionId: 'new' },
  ]);
});

test('uses higher reps for equal load and a later date for an equal record', () => {
  const result = getPersonalRecords(workouts, [
    set('old', 'Row', 20, 8), set('new', 'Row', 20, 10), set('old', 'Row', 20, 10),
  ]);
  assert.deepEqual(result, [{ exercise: 'Row', kg: 20, reps: 10, date: '2026-02-01', sessionId: 'new' }]);
});

test('omits active sessions, bodyweight-only sets and invalid entries', () => {
  assert.deepEqual(getPersonalRecords(workouts, [
    set('active', 'Dead bug', 5, 10), set('old', 'Push-up', 0, 12),
    set('old', '', 10, 5), set('old', 'Press', NaN, 4), set('old', 'Press', 25, 0),
  ]), []);
});

test('handles missing collections without inventing records', () => {
  assert.deepEqual(getPersonalRecords(null, null), []);
});
