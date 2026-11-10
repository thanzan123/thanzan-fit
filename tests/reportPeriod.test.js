import test from 'node:test';
import assert from 'node:assert/strict';
import { getProgressReportRange } from '../src/reportPeriod.js';

test('weekly report covers today and the previous six calendar days', () => {
  assert.deepEqual(getProgressReportRange('week', '2026-11-10', '2026-11'), {
    startDate: '2026-11-04', endDate: '2026-11-10',
  });
});

test('monthly report covers the entire selected past month, including leap day', () => {
  assert.deepEqual(getProgressReportRange('month', '2026-11-10', '2024-02'), {
    startDate: '2024-02-01', endDate: '2024-02-29',
  });
});

test('current month report stops at today rather than including future dates', () => {
  assert.deepEqual(getProgressReportRange('month', '2026-11-10', '2026-11'), {
    startDate: '2026-11-01', endDate: '2026-11-10',
  });
});

test('invalid and future report months are rejected', () => {
  assert.throws(() => getProgressReportRange('month', '2026-11-10', '2026-13'), /valid report month/);
  assert.throws(() => getProgressReportRange('month', '2026-11-10', '2026-12'), /future/);
});
