import test from 'node:test';
import assert from 'node:assert/strict';
import { compareMeasurementEntries } from '../src/measurementComparison.js';

test('compares recorded measurements without changing the source entries', () => {
  const earlier = { date: '2026-01-01', waist: 110, chest: 120, arms: 40, hips: 115, thighs: 65, neck: 42 };
  const later = { date: '2026-02-01', waist: 105, chest: 122, arms: 41, hips: 113, thighs: 65, neck: 41 };
  const result = compareMeasurementEntries(earlier, later);
  assert.deepEqual(result.map(row => row.change), [-5, 2, 1, -2, 0, -1]);
  assert.equal(earlier.waist, 110);
  assert.equal(later.waist, 105);
});

test('missing, invalid, and zero measurements are not treated as zero-valued changes', () => {
  const result = compareMeasurementEntries(
    { waist: 100, chest: null, arms: 'bad', hips: 0 },
    { waist: null, chest: 90, arms: 40, hips: 80 },
  );
  assert.deepEqual(result.slice(0, 4).map(row => [row.earlierValue, row.laterValue, row.change]), [
    [100, null, null], [null, 90, null], [null, 40, null], [null, 80, null],
  ]);
  assert.deepEqual(result.slice(4).map(row => row.change), [null, null]);
});

test('empty entries produce six unavailable comparisons', () => {
  assert.equal(compareMeasurementEntries(null, null).length, 6);
  assert.ok(compareMeasurementEntries(null, null).every(row => row.change === null));
});
