import test from 'node:test';
import assert from 'node:assert/strict';
import { blankProfile, starterProfile } from '../src/profileDefaults.js';

test('starter profile fills only the editable values supplied in the original brief', () => {
  const profile = starterProfile();
  assert.equal(profile.name, 'Thanzan Thari');
  assert.equal(profile.age, '24');
  assert.equal(profile.heightCm, '181');
  assert.equal(profile.startingWeightKg, '132.4');
  assert.equal(profile.currentWeightKg, '');
  assert.equal(profile.targetWeightKg, '80');
  assert.equal(profile.gymStartDate, '2026-10-26');
  assert.equal(profile.goal, 'Fat loss + muscle building');
  assert.equal(profile.experience, 'Beginner');
  assert.equal(profile.workoutsPerWeek, '6');
  assert.equal(profile.workoutMinutes, '60');
  for (const key of ['gender', 'activityLevel', 'sleepHours', 'dailySteps', 'dietaryPreferences', 'allergies', 'medicalConditions', 'exerciseRestrictions', 'previousInjuries', 'equipment']) {
    assert.equal(profile[key], '', `${key} should remain unset`);
  }
});

test('blank profile factory remains fully blank for existing-profile normalization', () => {
  assert.ok(Object.values(blankProfile()).every(value => value === ''));
});
