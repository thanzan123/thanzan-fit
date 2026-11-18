import test from 'node:test';
import assert from 'node:assert/strict';
import { getWorkoutHistory } from '../src/workoutHistory.js';

const workouts = [
  { id: 'old', date: '2026-10-01', active: false },
  { id: 'today', date: '2026-11-18', active: false, finishedAt: 4 },
  { id: 'yesterday-later', date: '2026-11-17', active: false, finishedAt: 8 },
  { id: 'yesterday-earlier', date: '2026-11-17', active: false, finishedAt: 3 },
  { id: 'active', date: '2026-11-18', active: true },
  { id: 'invalid', date: '2026-02-30', active: false },
];

test('returns completed workout history newest first, retaining all dates by default', () => {
  assert.deepEqual(getWorkoutHistory({ workouts, today: '2026-11-18' }).map(item => item.id), [
    'today', 'yesterday-later', 'yesterday-earlier', 'old', 'invalid',
  ]);
});

test('applies inclusive calendar-day ranges and excludes undated or invalid sessions', () => {
  const rows = [...workouts, { id: 'boundary', date: '2026-10-20', active: false }, { id: 'future', date: '2026-11-19', active: false }, { id: 'no-date', active: false }];
  assert.deepEqual(getWorkoutHistory({ workouts: rows, range: '30', today: '2026-11-18' }).map(item => item.id), [
    'today', 'yesterday-later', 'yesterday-earlier', 'boundary',
  ]);
});

test('falls back to full history for an invalid range or review date', () => {
  assert.deepEqual(getWorkoutHistory({ workouts, range: 'invalid', today: 'bad' }).map(item => item.id), [
    'today', 'yesterday-later', 'yesterday-earlier', 'old', 'invalid',
  ]);
});
