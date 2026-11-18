import test from 'node:test';
import assert from 'node:assert/strict';
import { getCalendarWeekDays } from '../src/waterWeek.js';

test('builds a Monday-to-Sunday week around a selected date', () => {
  const week = getCalendarWeekDays('2026-11-18', '2026-11-18');
  assert.deepEqual(week.map(day => day.date), [
    '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19',
    '2026-11-20', '2026-11-21', '2026-11-22',
  ]);
  assert.equal(week[2].isToday, true);
  assert.equal(week[0].label, 'Mon');
  assert.equal(week[6].day, 'Sunday');
});

test('handles dates at week boundaries and year transitions', () => {
  assert.deepEqual(getCalendarWeekDays('2027-01-03').map(day => day.date), [
    '2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31',
    '2027-01-01', '2027-01-02', '2027-01-03',
  ]);
  assert.deepEqual(getCalendarWeekDays('2026-11-16').map(day => day.date), [
    '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19',
    '2026-11-20', '2026-11-21', '2026-11-22',
  ]);
});

test('handles leap day and rejects malformed or impossible dates', () => {
  assert.deepEqual(getCalendarWeekDays('2024-02-29').map(day => day.date), [
    '2024-02-26', '2024-02-27', '2024-02-28', '2024-02-29',
    '2024-03-01', '2024-03-02', '2024-03-03',
  ]);
  assert.deepEqual(getCalendarWeekDays('2026-02-30'), []);
  assert.deepEqual(getCalendarWeekDays('not-a-date'), []);
});
