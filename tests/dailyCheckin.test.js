import test from 'node:test';
import assert from 'node:assert/strict';
import { saveDailyCheckin } from '../src/dailyCheckin.js';

const makeId = (() => { let n = 0; return () => `new-${++n}`; })();

test('daily check-in stores recovery and readiness without altering prior dates', () => {
  const prior = { id: 'old', date: '2026-11-10', sleepHours: 7 };
  const result = saveDailyCheckin({
    recovery: [prior], weights: [{ id: 'w1', date: '2026-11-10', kg: 80 }], profile: { currentWeightKg: '80' },
    date: '2026-11-11', idFactory: makeId, createdAt: 42, sleepHours: 6.5,
    sleepQuality: 3, energy: 2, soreness: 4, readiness: 2, workoutReadiness: 'unsure',
  });
  assert.equal(result.recovery.length, 2);
  assert.deepEqual(result.recovery[0], { id: 'new-1', date: '2026-11-11', sleepHours: 6.5, sleepQuality: 3, energy: 2, soreness: 4, readiness: 2, workoutReadiness: 'unsure', createdAt: 42 });
  assert.deepEqual(result.recovery[1], prior);
  assert.equal(result.weights.length, 1);
  assert.equal(result.profile.currentWeightKg, '80');
});

test('daily check-in updates the latest same-day weigh-in rather than duplicating it', () => {
  const weights = [
    { id: 'today-old', date: '2026-11-11', kg: 80, createdAt: 10 },
    { id: 'yesterday', date: '2026-11-10', kg: 81, createdAt: 20 },
    { id: 'today-latest', date: '2026-11-11', kg: 79.5, createdAt: 30 },
  ];
  const result = saveDailyCheckin({
    recovery: [], weights, profile: { name: 'T', currentWeightKg: '' }, date: '2026-11-11',
    idFactory: makeId, createdAt: 40, sleepHours: 7, sleepQuality: 4, energy: 4,
    soreness: 1, readiness: '', workoutReadiness: 'ready', weightKg: 79,
  });
  assert.equal(result.weights.length, 3);
  assert.equal(result.weights.find(item => item.id === 'today-latest').kg, 79);
  assert.equal(result.weights.find(item => item.id === 'today-old').kg, 80);
  assert.equal(result.weights.find(item => item.id === 'yesterday').kg, 81);
  assert.equal(result.profile.name, 'T');
  assert.equal(result.profile.currentWeightKg, '79');
  assert.equal(result.recovery[0].workoutReadiness, 'ready');
});

test('blank weight leaves weight history and profile untouched', () => {
  const weights = [{ id: 'w', date: '2026-11-11', kg: 80 }];
  const profile = { currentWeightKg: '80' };
  const result = saveDailyCheckin({ recovery: [], weights, profile, date: '2026-11-11', idFactory: makeId,
    sleepHours: 7, sleepQuality: 3, energy: 3, soreness: 2, readiness: '', weightKg: '' });
  assert.equal(result.weights, weights);
  assert.equal(result.profile, profile);
});

test('daily check-in can clear a previously selected workout-readiness answer', () => {
  const result = saveDailyCheckin({ recovery: [{ id: 'today', date: '2026-11-11', workoutReadiness: 'rest' }], weights: [], profile: {}, date: '2026-11-11', idFactory: makeId, sleepHours: 7, sleepQuality: 3, energy: 3, soreness: 2, readiness: '', workoutReadiness: '' });
  assert.equal(result.recovery[0].workoutReadiness, null);
});
