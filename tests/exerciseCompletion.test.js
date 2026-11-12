import test from 'node:test';
import assert from 'node:assert/strict';
import { toggleExerciseCompletion } from '../src/exerciseCompletion.js';

test('marks a planned exercise complete without changing other progress', () => {
  assert.deepEqual(toggleExerciseCompletion(['Machine Chest Press'], 'Cable Chest Fly', true), [
    'Machine Chest Press', 'Cable Chest Fly'
  ]);
});

test('unmarks completion and leaves unrelated exercises intact', () => {
  assert.deepEqual(toggleExerciseCompletion(['Machine Chest Press', 'Cable Chest Fly'], 'Machine Chest Press', false), [
    'Cable Chest Fly'
  ]);
});

test('normalizes duplicate and blank history values and ignores empty names', () => {
  assert.deepEqual(toggleExerciseCompletion([' Row ', 'Row', ''], '', true), ['Row']);
});

test('is idempotent when the selected state already matches', () => {
  assert.deepEqual(toggleExerciseCompletion(['Row'], 'Row', true), ['Row']);
  assert.deepEqual(toggleExerciseCompletion(['Row'], 'Press', false), ['Row']);
});
