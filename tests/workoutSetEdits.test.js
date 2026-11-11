import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteWorkoutSetRecords, updateWorkoutSetRecords, validateWorkoutSetEdit } from '../src/workoutSetEdits.js';

test('validates and normalizes editable set values', () => {
  assert.deepEqual(validateWorkoutSetEdit({ exercise: '  Seated row ', reps: '8', kg: 22.5 }), { exercise: 'Seated row', reps: 8, kg: 22.5 });
  for (const values of [
    { exercise: '', reps: 8, kg: 10 },
    { exercise: 'Row', reps: 0, kg: 10 },
    { exercise: 'Row', reps: 1.5, kg: 10 },
    { exercise: 'Row', reps: 101, kg: 10 },
    { exercise: 'Row', reps: 8, kg: -0.1 },
    { exercise: 'Row', reps: 8, kg: 1000.1 },
    { exercise: 'Row', reps: 8, kg: 'bad' },
  ]) assert.equal(validateWorkoutSetEdit(values), null);
  assert.deepEqual(validateWorkoutSetEdit({ exercise: 'Bodyweight squat', reps: 10, kg: 0 }), { exercise: 'Bodyweight squat', reps: 10, kg: 0 });
});

test('updates only the selected set and preserves unrelated records', () => {
  const sets = [{ id: 's1', sessionId: 'w1', exercise: 'Row', reps: 6, kg: 20, createdAt: 1 }, { id: 's2', sessionId: 'w2', exercise: 'Press', reps: 8, kg: 10 }];
  const result = updateWorkoutSetRecords({ sets, setId: 's1', changes: { exercise: 'Cable row', reps: 7, kg: 22 } });
  assert.equal(result.updated, true);
  assert.deepEqual(result.sets, [{ ...sets[0], exercise: 'Cable row', reps: 7, kg: 22 }, sets[1]]);
  assert.deepEqual(sets[0], { id: 's1', sessionId: 'w1', exercise: 'Row', reps: 6, kg: 20, createdAt: 1 });
  assert.equal(updateWorkoutSetRecords({ sets, setId: 'missing', changes: {} }).updated, false);
});

test('deletes only the selected set and synchronizes its session set count', () => {
  const sets = [{ id: 's1', sessionId: 'w1' }, { id: 's2', sessionId: 'w1' }, { id: 's3', sessionId: 'w2' }];
  const workouts = [{ id: 'w1', sets: 2, name: 'Push' }, { id: 'w2', sets: 1, name: 'Pull' }];
  const result = deleteWorkoutSetRecords({ sets, workouts, setId: 's1' });
  assert.deepEqual(result.sets, [sets[1], sets[2]]);
  assert.deepEqual(result.workouts, [{ ...workouts[0], sets: 1 }, workouts[1]]);
  assert.equal(result.deleted, true);
  assert.deepEqual(deleteWorkoutSetRecords({ sets, workouts, setId: 'missing' }), { sets, workouts, deleted: false });
});
