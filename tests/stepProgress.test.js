import test from 'node:test';
import assert from 'node:assert/strict';
import { getDailyStepProgress } from '../src/stepProgress.js';

test('step goal stays unset rather than assuming a target', () => {
  assert.equal(getDailyStepProgress(4200, ''), null);
  assert.equal(getDailyStepProgress(4200, null), null);
});

test('missing step entries remain blank while a saved goal is shown', () => {
  assert.deepEqual(getDailyStepProgress(null, '8000'), {
    goal: 8000, steps: null, remaining: null, percent: null, complete: false,
  });
});

test('progress reports remaining steps and an accessible percent', () => {
  const progress = getDailyStepProgress(3000, 8000);
  assert.equal(progress.remaining, 5000);
  assert.equal(progress.percent, 37.5);
  assert.equal(progress.complete, false);
});

test('goal completion is capped at 100 percent without changing the recorded count', () => {
  const progress = getDailyStepProgress(9500, 8000);
  assert.equal(progress.steps, 9500);
  assert.equal(progress.percent, 100);
  assert.equal(progress.remaining, 0);
  assert.equal(progress.complete, true);
});

test('invalid or out-of-range values do not produce progress', () => {
  assert.equal(getDailyStepProgress(100, 0), null);
  assert.equal(getDailyStepProgress(100, 8000.5), null);
  assert.equal(getDailyStepProgress(100, 200001), null);
  assert.equal(getDailyStepProgress(-1, 8000).steps, null);
  assert.equal(getDailyStepProgress(1.5, 8000).steps, null);
});
