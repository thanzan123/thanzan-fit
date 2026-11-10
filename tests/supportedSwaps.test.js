import test from 'node:test';
import assert from 'node:assert/strict';
import { getSupportedSwaps, replaceRoutineExercise } from '../src/supportedSwaps.js';

test('lists only supported swaps present in the selected routines', () => {
  const choices = getSupportedSwaps([
    { day: 'Saturday', name: 'Legs B + core', exercises: ['Romanian deadlift variation', 'Plank'] },
    { id: 'custom-1', name: 'Back day', exercises: ['Seated cable row'] },
  ]);
  assert.deepEqual(choices.map(({ from, to, routineName }) => [from, to, routineName]), [
    ['Romanian deadlift variation', 'Seated leg curl', 'Legs B + core'],
    ['Plank', 'Dead bug', 'Legs B + core'],
    ['Seated cable row', 'Chest-supported row', 'Back day'],
  ]);
  assert.equal(new Set(choices.map((choice) => choice.key)).size, choices.length);
});

test('replaces one saved movement without mutating other exercises', () => {
  const original = ['Leg press', 'Supported squat variation', 'Leg extension'];
  const updated = replaceRoutineExercise(original, 1, 'Supported squat variation', 'Leg extension');
  assert.deepEqual(updated, ['Leg press', 'Leg extension', 'Leg extension']);
  assert.deepEqual(original, ['Leg press', 'Supported squat variation', 'Leg extension']);
});

test('refuses stale or invalid substitution targets', () => {
  assert.throws(() => replaceRoutineExercise(['Plank'], 0, 'Romanian deadlift variation', 'Dead bug'), /changed/);
  assert.throws(() => replaceRoutineExercise(['Plank'], 2, 'Plank', 'Dead bug'), /Choose an exercise/);
  assert.throws(() => replaceRoutineExercise(['Plank'], 0, 'Plank', ''), /replacement/);
});
