import test from 'node:test';
import assert from 'node:assert/strict';
import { getGuideRestRecommendation, parseGuideRestSeconds } from '../src/guideRest.js';

test('parses exercise guide second ranges and recommends the nearest available midpoint preset', () => {
  assert.deepEqual(parseGuideRestSeconds('45–60 sec'), { minSeconds: 45, maxSeconds: 60 });
  assert.deepEqual(getGuideRestRecommendation('60–90 sec'), { minSeconds: 60, maxSeconds: 90, seconds: 60 });
  assert.deepEqual(getGuideRestRecommendation('90–120 sec'), { minSeconds: 90, maxSeconds: 120, seconds: 90 });
});

test('parses minute guidance and single durations', () => {
  assert.deepEqual(parseGuideRestSeconds('1–2 minutes'), { minSeconds: 60, maxSeconds: 120 });
  assert.deepEqual(parseGuideRestSeconds('2 min'), { minSeconds: 120, maxSeconds: 120 });
  assert.equal(getGuideRestRecommendation('As needed'), null);
});

test('rejects malformed, reversed, zero and implausibly long guidance', () => {
  for (const value of ['', '—', '0 sec', '120–60 sec', '11 min']) {
    assert.equal(getGuideRestRecommendation(value), null, value);
  }
  assert.equal(parseGuideRestSeconds(null), null);
});
