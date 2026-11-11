import test from 'node:test';
import assert from 'node:assert/strict';
import { formatRemainingTarget } from '../src/remainingTarget.js';

test('keeps remaining intake unknown when no food is logged', () => {
  assert.equal(formatRemainingTarget({ logged: 0, target: 2000, hasLogs: false, unit: 'kcal' }), 'Log food to see what is left');
});

test('reports estimated calories and macros left from actual logged totals', () => {
  assert.equal(formatRemainingTarget({ logged: 1250, target: 2000, hasLogs: true, unit: 'kcal' }), '750 kcal left');
  assert.equal(formatRemainingTarget({ logged: 52.3, target: 128, hasLogs: true, unit: 'g' }), '75.7 g left');
});

test('reports when a logged amount meets or exceeds its estimate', () => {
  assert.equal(formatRemainingTarget({ logged: 100, target: 100, hasLogs: true, unit: 'g' }), 'At target');
  assert.equal(formatRemainingTarget({ logged: 2200, target: 2000, hasLogs: true, unit: 'kcal' }), '200 kcal over estimate');
});

test('does not invent a remaining amount when the target or log is invalid', () => {
  assert.equal(formatRemainingTarget({ logged: 10, target: null, hasLogs: true, unit: 'g' }), 'Target unavailable');
  assert.equal(formatRemainingTarget({ logged: NaN, target: 100, hasLogs: true, unit: 'g' }), 'Logged amount unavailable');
});
