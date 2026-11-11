import test from 'node:test';
import assert from 'node:assert/strict';
import { getRecoveryRecommendation } from '../src/recoveryRecommendation.js';

test('does not infer recovery signals from missing or invalid check-in fields', () => {
  assert.equal(getRecoveryRecommendation(null), null);
  assert.equal(getRecoveryRecommendation({}), null);
  assert.equal(getRecoveryRecommendation({ sleepHours: 'unknown', energy: null }), null);
});

test('follows the user’s explicit rest choice without diagnosing', () => {
  const note = getRecoveryRecommendation({ workoutReadiness: 'rest', soreness: 5 });
  assert.equal(note.kind, 'rest');
  assert.match(note.body, /Skip strenuous training/);
  assert.match(note.body, /only if it feels okay/);
});

test('combines reported low sleep and energy into a cautious optional suggestion', () => {
  const note = getRecoveryRecommendation({ sleepHours: 5.5, energy: 2, workoutReadiness: 'ready' });
  assert.equal(note.kind, 'caution');
  assert.match(note.body, /under 6 hours of sleep, low energy rating/);
  assert.match(note.body, /Consider a lighter session or rest/);
});

test('high soreness triggers a pain-aware suggestion but never changes the workout', () => {
  const note = getRecoveryRecommendation({ soreness: 4 });
  assert.match(note.title, /easier session/);
  assert.match(note.body, /stop any movement that hurts/);
});

test('unsure readiness remains gentle and uses only available check-in data', () => {
  const note = getRecoveryRecommendation({ workoutReadiness: 'unsure' });
  assert.equal(note.kind, 'caution');
  assert.match(note.body, /Start gently and reassess/);
  assert.doesNotMatch(note.body, /sleep|energy|soreness/i);
});
