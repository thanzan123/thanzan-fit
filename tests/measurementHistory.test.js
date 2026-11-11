import test from 'node:test';
import assert from 'node:assert/strict';
import { getMeasurementHistory, getMeasurementTrend } from '../src/measurementHistory.js';

const rows = Array.from({ length: 35 }, (_, index) => ({
  id: String(index), date: `2026-${String(Math.floor(index / 28) + 1).padStart(2, '0')}-${String(index % 28 + 1).padStart(2, '0')}`,
  createdAt: index, waist: index + 60,
}));

test('measurement list sorts newest first and supports bounded and all ranges', () => {
  assert.equal(getMeasurementHistory(rows, '8').length, 8);
  assert.equal(getMeasurementHistory(rows, '30').length, 30);
  assert.equal(getMeasurementHistory(rows, '90').length, 35);
  assert.equal(getMeasurementHistory(rows, 'all').length, 35);
  assert.equal(getMeasurementHistory(rows, '8')[0].id, '34');
});

test('measurement trend filters invalid values and returns chronological points within the selected range', () => {
  const input = [
    { id:'later', date:'2026-03-02', waist:72 },
    { id:'bad', date:'2026-03-03', waist:'bad' },
    { id:'missing', date:'2026-03-04', waist:null },
    { id:'earlier', date:'2026-03-01', waist:70 },
    { id:'zero', date:'2026-03-05', waist:0 },
  ];
  assert.deepEqual(getMeasurementTrend(input, 'waist', '8').map(item => item.id), ['earlier','later']);
});

test('same-date entries use createdAt as a stable chronological tie-breaker', () => {
  const input = [
    { id:'new', date:'2026-03-01', createdAt:20, waist:72 },
    { id:'old', date:'2026-03-01', createdAt:10, waist:70 },
  ];
  assert.deepEqual(getMeasurementTrend(input, 'waist', 'all').map(item => item.id), ['old','new']);
  assert.deepEqual(getMeasurementHistory(input, 'all').map(item => item.id), ['new','old']);
});
