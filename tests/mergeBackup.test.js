import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeBackupState } from '../src/mergeBackup.js';

const state = (overrides = {}) => ({
  profile: { name: 'Local profile' },
  units: 'metric',
  theme: 'dark',
  waterGoalMl: 2000,
  reminders: [{ id: 'local-reminder', time: '08:00' }],
  weights: [], meals: [], mealTemplates: [], waters: [], workouts: [], sets: [], measurements: [],
  recovery: [], activityLogs: [], favorites: [], customFoods: [], customExercises: [], customRoutines: [],
  routineEdits: {},
  ...overrides,
});

test('adds records absent locally while retaining local records and profile settings', () => {
  const local = state({ weights: [{ id: 'w1', kg: 80 }], profile: { name: 'Local profile', currentWeightKg: 80 } });
  const backup = state({
    weights: [{ id: 'w1', kg: 70 }, { id: 'w2', kg: 79 }],
    profile: { name: 'Old backup profile', currentWeightKg: 70 },
    units: 'imperial', theme: 'light', waterGoalMl: 2500,
    reminders: [{ id: 'backup-reminder', time: '09:00' }],
  });

  const result = mergeBackupState(local, backup);

  assert.deepEqual(result.state.weights, [{ id: 'w1', kg: 80 }, { id: 'w2', kg: 79 }]);
  assert.deepEqual(result.state.profile, local.profile);
  assert.equal(result.state.units, 'metric');
  assert.equal(result.state.theme, 'dark');
  assert.equal(result.state.waterGoalMl, 2000);
  assert.deepEqual(result.state.reminders, local.reminders);
  assert.equal(result.added, 1);
  assert.equal(result.byCollection.weights, 1);
});

test('merges every supported log and custom-library collection', () => {
  const local = state({ meals: [{ id: 'meal-local' }], favorites: ['food-a'], routineEdits: { monday: { local: true } } });
  const backup = state({ meals: [{ id: 'meal-import' }], favorites: ['food-a', 'food-b'], customExercises: [{ id: 'exercise-a' }], routineEdits: { monday: { local: true }, tuesday: { imported: true } } });

  const result = mergeBackupState(local, backup);

  assert.deepEqual(result.state.meals, [{ id: 'meal-local' }, { id: 'meal-import' }]);
  assert.deepEqual(result.state.favorites, ['food-a', 'food-b']);
  assert.deepEqual(result.state.customExercises, [{ id: 'exercise-a' }]);
  assert.deepEqual(result.state.routineEdits, { monday: { local: true }, tuesday: { imported: true } });
  assert.equal(result.added, 4);
});

test('deduplicates id-less exact entries independent of object-key order', () => {
  const result = mergeBackupState(state({ meals: [{ name: 'Oats', kcal: 300 }] }), state({ meals: [{ kcal: 300, name: 'Oats' }, { name: 'Eggs', kcal: 150 }] }));

  assert.deepEqual(result.state.meals, [{ name: 'Oats', kcal: 300 }, { name: 'Eggs', kcal: 150 }]);
  assert.equal(result.added, 1);
});

test('keeps current routine edits when backup has conflicting values', () => {
  const result = mergeBackupState(state({ routineEdits: { monday: ['current'] } }), state({ routineEdits: { monday: ['backup'], tuesday: ['new'] } }));

  assert.deepEqual(result.state.routineEdits, { monday: ['current'], tuesday: ['new'] });
  assert.equal(result.byCollection.routineEdits, 1);
});

test('rejects invalid top-level backups', () => {
  assert.throws(() => mergeBackupState(state(), null), /Invalid backup/);
  assert.throws(() => mergeBackupState(state(), []), /Invalid backup/);
  assert.throws(() => mergeBackupState([], state()), /Invalid backup/);
});
