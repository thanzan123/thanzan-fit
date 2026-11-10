import test from 'node:test';
import assert from 'node:assert/strict';
import { getWaterProgress } from '../src/waterProgress.js';

test('water progress stays unset without a usable daily goal', () => {
  assert.equal(getWaterProgress(500, ''), null);
  assert.equal(getWaterProgress(500, 0), null);
});

test('missing water logs remain unknown instead of being counted as zero', () => {
  assert.deepEqual(getWaterProgress(null, 2000), {
    goal: 2000, total: null, remaining: null, complete: false,
  });
});

test('reports water remaining when there are logged drinks', () => {
  assert.deepEqual(getWaterProgress(750, 2000), {
    goal: 2000, total: 750, remaining: 1250, complete: false,
  });
});

test('caps remaining at zero when the water goal is reached or exceeded', () => {
  assert.deepEqual(getWaterProgress(2000, 2000), {
    goal: 2000, total: 2000, remaining: 0, complete: true,
  });
  assert.equal(getWaterProgress(2500, 2000).remaining, 0);
});

test('invalid totals do not produce false progress', () => {
  assert.equal(getWaterProgress(-1, 2000).total, null);
  assert.equal(getWaterProgress('oops', 2000).total, null);
});
