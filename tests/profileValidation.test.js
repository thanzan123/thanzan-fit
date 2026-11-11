import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProfile } from '../src/profileValidation.js';

test('blank optional numeric fields are valid', () => {
  assert.equal(validateProfile({}), null);
  assert.equal(validateProfile({ age: '', heightCm: null, dailySteps: '   ' }), null);
});

test('starter profile numeric values remain valid', () => {
  assert.equal(validateProfile({
    age: '24', heightCm: '181', startingWeightKg: '132.4', currentWeightKg: '', targetWeightKg: '80',
    workoutsPerWeek: '6', workoutMinutes: '60', sleepHours: '', dailySteps: '',
  }), null);
});

test('numeric profile fields enforce safe, sensible bounds and integer requirements', () => {
  const cases = [
    [{ age: '12' }, 'age'], [{ age: '121' }, 'age'], [{ age: '24.5' }, 'age'], [{ age: 'NaN' }, 'age'],
    [{ heightCm: '99.9' }, 'heightCm'], [{ heightCm: '251' }, 'heightCm'],
    [{ currentWeightKg: '19.9' }, 'currentWeightKg'], [{ targetWeightKg: '401' }, 'targetWeightKg'],
    [{ workoutsPerWeek: '-1' }, 'workoutsPerWeek'], [{ workoutsPerWeek: '7.5' }, 'workoutsPerWeek'], [{ workoutsPerWeek: '8' }, 'workoutsPerWeek'],
    [{ workoutMinutes: '0' }, 'workoutMinutes'], [{ workoutMinutes: '301' }, 'workoutMinutes'], [{ workoutMinutes: '30.5' }, 'workoutMinutes'],
    [{ sleepHours: '-0.1' }, 'sleepHours'], [{ sleepHours: '24.1' }, 'sleepHours'],
    [{ dailySteps: '0' }, 'dailySteps'], [{ dailySteps: '200001' }, 'dailySteps'], [{ dailySteps: '1000.5' }, 'dailySteps'],
  ];
  for (const [profile, key] of cases) assert.equal(validateProfile(profile)?.key, key, JSON.stringify(profile));
});

test('inclusive profile boundaries are accepted', () => {
  assert.equal(validateProfile({ age: '13', heightCm: '100', startingWeightKg: '20', currentWeightKg: '400', targetWeightKg: '20', workoutsPerWeek: '0', workoutMinutes: '300', sleepHours: '24', dailySteps: '200000' }), null);
});
