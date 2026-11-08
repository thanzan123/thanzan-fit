import test from 'node:test';
import assert from 'node:assert/strict';
import { displayInput, displayValue, fromDisplay, toDisplay } from '../src/units.js';

test('metric mode preserves canonical metric values', () => {
  assert.equal(toDisplay(80, 'weight', 'metric'), 80);
  assert.equal(fromDisplay(181, 'length', 'metric'), 181);
  assert.equal(displayValue(10, 'distance', 'metric', 2), '10.00');
});

test('imperial conversion round-trips canonical values without mutating them', () => {
  assert.equal(Number(displayValue(100, 'weight', 'imperial', 1)), 220.5);
  assert.equal(Number(displayValue(181, 'length', 'imperial', 1)), 71.3);
  assert.equal(Number(displayValue(5, 'distance', 'imperial', 2)), 3.11);
  assert.ok(Math.abs(fromDisplay(toDisplay(132.4, 'weight', 'imperial'), 'weight', 'imperial') - 132.4) < 1e-10);
  assert.ok(Math.abs(fromDisplay(toDisplay(181, 'length', 'imperial'), 'length', 'imperial') - 181) < 1e-10);
});

test('empty form values remain empty and rounded display inputs are stable', () => {
  assert.equal(displayInput('', 'weight', 'imperial'), '');
  assert.equal(displayInput(null, 'length', 'imperial'), '');
  assert.equal(displayInput(70, 'weight', 'imperial'), '154.3');
});
