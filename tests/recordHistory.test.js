import test from 'node:test';
import assert from 'node:assert/strict';
import { getVisibleHistory } from '../src/recordHistory.js';

test('shows the newest records first without changing the saved array', () => {
  const records = [
    { id: 'old', date: '2026-01-02' },
    { id: 'new', date: '2026-03-10' },
    { id: 'middle', date: '2026-02-05' },
  ];
  const visible = getVisibleHistory(records, false, 2);
  assert.deepEqual(visible.map(item => item.id), ['new', 'middle']);
  assert.deepEqual(records.map(item => item.id), ['old', 'new', 'middle']);
});

test('expansion exposes every saved record and handles invalid inputs', () => {
  const records = Array.from({ length: 16 }, (_, index) => ({ id: String(index), date: `2026-01-${String(index + 1).padStart(2, '0')}` }));
  assert.equal(getVisibleHistory(records).length, 14);
  assert.equal(getVisibleHistory(records, true).length, 16);
  assert.deepEqual(getVisibleHistory(null), []);
  assert.deepEqual(getVisibleHistory(records, false, -2), []);
});
