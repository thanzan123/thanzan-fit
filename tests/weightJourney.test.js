import test from 'node:test';
import assert from 'node:assert/strict';
import { getWeightJourney } from '../src/weightJourney.js';

test('keeps change and progress blank until a current weight is known', () => {
  assert.deepEqual(getWeightJourney({ startingWeightKg: '132.4', targetWeightKg: '80' }), {
    startingKg: 132.4, currentKg: null, targetKg: 80, changeKg: null, remainingKg: null, progressPercent: null,
  });
});

test('calculates weight-loss progress from supplied profile weights', () => {
  assert.deepEqual(getWeightJourney({ startingWeightKg: 100, currentWeightKg: 90, targetWeightKg: 80 }), {
    startingKg: 100, currentKg: 90, targetKg: 80, changeKg: 10, remainingKg: 10, progressPercent: 50,
  });
});

test('supports a gain target and caps progress at the target', () => {
  assert.equal(getWeightJourney({ startingWeightKg: 60, currentWeightKg: 65, targetWeightKg: 70 }).progressPercent, 50);
  assert.equal(getWeightJourney({ startingWeightKg: 100, currentWeightKg: 70, targetWeightKg: 80 }).progressPercent, 100);
});

test('does not invent progress for invalid or identical endpoints', () => {
  assert.equal(getWeightJourney({ startingWeightKg: 'unknown', currentWeightKg: 90, targetWeightKg: 80 }).changeKg, null);
  assert.equal(getWeightJourney({ startingWeightKg: 80, currentWeightKg: 80, targetWeightKg: 80 }).progressPercent, null);
});
