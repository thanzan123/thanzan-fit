import test from 'node:test';
import assert from 'node:assert/strict';
import { cloneMealEntries, groupPreviousMeals } from '../src/mealHistory.js';

const entries = [
  { id: 'a', date: '2026-11-06', mealType: 'Breakfast', name: 'Oats', quantity: '50 g', kcal: 190, p: 6, createdAt: 2 },
  { id: 'b', date: '2026-11-06', mealType: 'Breakfast', name: 'Milk', quantity: '200 ml', kcal: 122, p: 6.3, createdAt: 3 },
  { id: 'c', date: '2026-11-07', mealType: 'Dinner', name: 'Rice', quantity: '150 g', kcal: 195, p: 4, createdAt: 1 },
  { id: 'd', date: '2026-11-08', mealType: 'Lunch', name: 'Today', quantity: '1 serving', kcal: 10, p: 1, createdAt: 4 },
];

test('groups prior entries by date and meal type with totals, newest first', () => {
  const groups = groupPreviousMeals(entries, '2026-11-08');
  assert.equal(groups.length, 2);
  assert.equal(groups[0].date, '2026-11-07');
  assert.equal(groups[0].mealType, 'Dinner');
  assert.equal(groups[1].items.length, 2);
  assert.equal(groups[1].kcal, 312);
  assert.equal(groups[1].protein, 12.3);
});

test('excludes current/future dates and honors the visible result limit', () => {
  assert.deepEqual(groupPreviousMeals(entries, '2026-11-07').map(x => x.date), ['2026-11-06']);
  assert.equal(groupPreviousMeals(entries, '2026-11-08', 1).length, 1);
  assert.deepEqual(groupPreviousMeals(entries, 'bad'), []);
});

test('clones all nutrition and portions onto the target date with fresh IDs', () => {
  const source = entries.slice(0, 2);
  let serial = 0;
  const copy = cloneMealEntries(source, '2026-11-08', () => `copy-${++serial}`, 1000);
  assert.deepEqual(copy.map(x => x.id), ['copy-1', 'copy-2']);
  assert.deepEqual(copy.map(x => x.date), ['2026-11-08', '2026-11-08']);
  assert.deepEqual(copy.map(x => x.createdAt), [1000, 1001]);
  assert.deepEqual(copy.map(({ name, quantity, kcal, p }) => ({ name, quantity, kcal, p })), source.map(({ name, quantity, kcal, p }) => ({ name, quantity, kcal, p })));
  assert.deepEqual(source.map(x => x.id), ['a', 'b']);
});

test('rejects empty source and invalid destination dates', () => {
  assert.throws(() => cloneMealEntries([], '2026-11-08', () => 'new'), /Choose a logged meal/);
  assert.throws(() => cloneMealEntries(entries.slice(0, 1), '', () => 'new'), /valid date/);
});
