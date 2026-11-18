import test from 'node:test';
import assert from 'node:assert/strict';
import { getWeightTrendRange } from '../src/weightTrendRange.js';

const points = [
  { date: '2026-09-01', value: 120 },
  { date: '2026-10-20', value: 118 },
  { date: '2026-11-01', value: 117 },
  { date: '2026-11-18', value: 116 },
];

test('filters rolling-weight points to the selected inclusive calendar window', () => {
  assert.deepEqual(getWeightTrendRange(points, '30', '2026-11-18').map(item => item.date), ['2026-10-20', '2026-11-01', '2026-11-18']);
  assert.deepEqual(getWeightTrendRange(points, '90', '2026-11-18').map(item => item.date), ['2026-09-01', '2026-10-20', '2026-11-01', '2026-11-18']);
});

test('all-history mode retains older saved points while excluding future dates', () => {
  const result = getWeightTrendRange([...points, { date: '2026-11-19', value: 115 }], 'all', '2026-11-18');
  assert.deepEqual(result.map(item => item.date), points.map(item => item.date));
});

test('rejects malformed dates and returns no data when today is invalid', () => {
  assert.deepEqual(getWeightTrendRange([...points, { date: '2026-02-30', value: 1 }, { date: 'n/a', value: 2 }], 'all', '2026-11-18').map(item => item.date), points.map(item => item.date));
  assert.deepEqual(getWeightTrendRange(points, '30', 'not-a-date'), []);
});
