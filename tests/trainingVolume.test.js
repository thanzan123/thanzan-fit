import test from 'node:test';
import assert from 'node:assert/strict';
import { getWeeklyTrainingVolume } from '../src/trainingVolume.js';

const guides = [
  { name: 'Machine Chest Press', muscle: 'Chest · upper body' },
  { name: 'Triceps Rope Pushdown', muscle: 'Triceps' },
];

test('counts saved sets by primary guide muscle in completed sessions over the last seven calendar days', () => {
  const result = getWeeklyTrainingVolume({
    today: '2026-11-13',
    workouts: [
      { id: 'recent', date: '2026-11-08', active: false },
      { id: 'today', date: '2026-11-13', active: false },
      { id: 'active', date: '2026-11-13', active: true },
      { id: 'old', date: '2026-11-06', active: false },
    ],
    sets: [
      { sessionId: 'recent', exercise: 'Machine Chest Press', reps: 10, kg: 0 },
      { sessionId: 'recent', exercise: 'Machine Chest Press', reps: 8, kg: 20 },
      { sessionId: 'today', exercise: 'machine chest press', reps: 12, kg: 20 },
      { sessionId: 'today', exercise: 'Triceps Rope Pushdown', reps: 9, kg: 10 },
      { sessionId: 'active', exercise: 'Machine Chest Press', reps: 10, kg: 20 },
      { sessionId: 'old', exercise: 'Triceps Rope Pushdown', reps: 10, kg: 10 },
      { sessionId: 'today', exercise: 'Machine Chest Press', reps: 0, kg: 20 },
    ],
    exerciseGuides: guides,
  });
  assert.deepEqual(result, {
    startDate: '2026-11-07', endDate: '2026-11-13', totalSets: 4, sessionCount: 2,
    entries: [
      { muscle: 'Chest', sets: 3, exercises: 1, sessions: 2 },
      { muscle: 'Triceps', sets: 1, exercises: 1, sessions: 1 },
    ],
  });
});

test('retains unlisted exercises under a neutral label and sorts ties alphabetically', () => {
  const result = getWeeklyTrainingVolume({
    today: '2026-11-13',
    workouts: [{ id: 'w', date: '2026-11-13' }],
    sets: [
      { sessionId: 'w', exercise: 'Custom Move', reps: 6, kg: 0 },
      { sessionId: 'w', exercise: 'Triceps Rope Pushdown', reps: 8, kg: 4 },
    ],
    exerciseGuides: guides,
  });
  assert.deepEqual(result.entries.map(item => [item.muscle, item.sets]), [['Other / unlisted', 1], ['Triceps', 1]]);
});

test('returns an empty review and rejects an invalid review date', () => {
  assert.deepEqual(getWeeklyTrainingVolume({ today: '2026-11-13' }), {
    startDate: '2026-11-07', endDate: '2026-11-13', totalSets: 0, sessionCount: 0, entries: [],
  });
  assert.throws(() => getWeeklyTrainingVolume({ today: 'not-a-date' }), /valid review date/);
});
