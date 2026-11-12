import test from 'node:test';
import assert from 'node:assert/strict';
import { createCustomReminder, removeCustomReminder, validateCustomReminder } from '../src/reminderTools.js';

test('validates custom reminder labels, times, and optional weekdays', () => {
  assert.equal(validateCustomReminder({ label: '  ', time: '08:00' }).field, 'label');
  assert.equal(validateCustomReminder({ label: 'x'.repeat(61), time: '08:00' }).field, 'label');
  assert.equal(validateCustomReminder({ label: 'Water', time: '24:00' }).field, 'time');
  assert.equal(validateCustomReminder({ label: 'Water', time: '08:60' }).field, 'time');
  assert.equal(validateCustomReminder({ label: 'Water', time: '08:00', day: 'Funday' }).field, 'day');
  assert.equal(validateCustomReminder({ label: 'Water', time: '08:00', day: 'Sunday' }), null);
});

test('adds a disabled daily or weekly reminder without changing existing entries', () => {
  const existing = [{ id: 'water', label: 'Water', time: '10:00', enabled: false }];
  const daily = createCustomReminder(existing, { label: '  Stretch  ', time: '07:30' }, () => 'a');
  assert.equal(daily.error, null);
  assert.deepEqual(daily.reminders[0], existing[0]);
  assert.deepEqual(daily.reminder, { id: 'custom-a', label: 'Stretch', time: '07:30', enabled: false, custom: true });
  const weekly = createCustomReminder(existing, { label: 'Weekly review', time: '18:00', day: 'Sunday' }, () => 'b');
  assert.equal(weekly.reminder.day, 'Sunday');
});

test('avoids ID collisions and only removes explicitly custom reminders', () => {
  const entries = [{ id: 'custom-a', custom: true }, { id: 'water', custom: false }];
  let n = 0;
  const added = createCustomReminder(entries, { label: 'Walk', time: '06:00' }, () => ['a', 'b'][n++]);
  assert.equal(added.reminder.id, 'custom-b');
  assert.deepEqual(removeCustomReminder([...entries, added.reminder], 'water'), [...entries, added.reminder]);
  assert.deepEqual(removeCustomReminder([...entries, added.reminder], 'custom-b'), entries);
});
