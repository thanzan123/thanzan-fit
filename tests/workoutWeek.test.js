import test from 'node:test';
import assert from 'node:assert/strict';
import { getWorkoutWeek } from '../src/workoutWeek.js';

test('builds seven calendar days ending today and counts only completed sessions', () => {
  const result = getWorkoutWeek({
    today: '2026-11-10',
    weeklyTarget: 6,
    workouts: [
      { date: '2026-11-04', active: false },
      { date: '2026-11-05', active: true },
      { date: '2026-11-10', active: false },
      { date: '2026-11-10', active: false },
      { date: '2026-11-11', active: false },
      { date: '2026-11-03', active: false },
    ],
  });
  assert.equal(result.startDate, '2026-11-04');
  assert.equal(result.endDate, '2026-11-10');
  assert.deepEqual(result.days.map(day => day.date), [
    '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10',
  ]);
  assert.deepEqual(result.days.map(day => day.count), [1, 0, 0, 0, 0, 0, 2]);
  assert.equal(result.completed, 3);
  assert.equal(result.target, 6);
  assert.equal(result.targetProgressPercent, 50);
});

test('clamps target progress and leaves missing or invalid targets unset', () => {
  const workouts = Array.from({ length: 8 }, () => ({ date: '2026-11-10' }));
  assert.equal(getWorkoutWeek({ today: '2026-11-10', workouts, weeklyTarget: 6 }).targetProgressPercent, 100);
  for (const weeklyTarget of [null, undefined, '', 0, -1, 'invalid']) {
    const result = getWorkoutWeek({ today: '2026-11-10', weeklyTarget });
    assert.equal(result.target, null);
    assert.equal(result.targetProgressPercent, null);
  }
});

test('rejects malformed and impossible calendar dates', () => {
  for (const today of ['', '2026-02-30', '2026-1-01', 'not-a-date']) {
    assert.throws(() => getWorkoutWeek({ today }), RangeError);
  }
});
