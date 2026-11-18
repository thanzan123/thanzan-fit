import test from 'node:test';
import assert from 'node:assert/strict';
import { getTrainingNotes } from '../src/trainingNotes.js';

test('returns only saved medical and movement notes in a stable display order', () => {
  assert.deepEqual(getTrainingNotes({
    medicalConditions: '  Asthma  ',
    exerciseRestrictions: 'Avoid overhead pressing',
    previousInjuries: 'Left ankle sprain',
  }), [
    { label: 'Medical conditions', value: 'Asthma' },
    { label: 'Exercise restrictions', value: 'Avoid overhead pressing' },
    { label: 'Previous injuries', value: 'Left ankle sprain' },
  ]);
});

test('omits blank, whitespace-only, and non-text fields', () => {
  assert.deepEqual(getTrainingNotes({
    medicalConditions: '  ',
    exerciseRestrictions: '',
    previousInjuries: null,
  }), []);
});

test('missing profile details remain absent rather than inferred', () => {
  assert.deepEqual(getTrainingNotes(), []);
  assert.deepEqual(getTrainingNotes({ equipment: 'dumbbells' }), []);
});
