import test from 'node:test';
import assert from 'node:assert/strict';
import { answerLocalQuestion } from '../src/quickAnswers.js';

const today = '2026-11-11';

test('calorie answer uses only today entries and distinguishes no logged food', () => {
  assert.match(answerLocalQuestion('calories', { today, meals: [] }), /no food entries saved/);
  assert.match(answerLocalQuestion('calories', { today, meals: [{ date: today, kcal: 440 }, { date: '2026-11-10', kcal: 300 }] }), /440 kcal across 1 entry/);
});

test('protein answer requires an available target and avoids treating absent logs as intake', () => {
  assert.match(answerLocalQuestion('protein', { today, proteinTarget: null }), /target weight/);
  assert.match(answerLocalQuestion('protein', { today, proteinTarget: 100, meals: [] }), /logged intake is still unknown/);
  assert.match(answerLocalQuestion('protein', { today, proteinTarget: 100, meals: [{ date: today, p: 25.5 }] }), /25.5 g protein.*74.5 g/);
  assert.match(answerLocalQuestion('protein', { today, proteinTarget: 100, meals: [{ date: today, p: 120 }] }), /0.0 g to your profile estimate/);
});

test('fibre answer preserves unknown and partial nutrition values', () => {
  assert.match(answerLocalQuestion('fiber', { today, meals: [], fiberTarget: 28 }), /no food logged.*unknown/);
  assert.match(answerLocalQuestion('fiber', { today, meals: [{ date: today, fiber: null }] }), /values aren’t recorded.*unknown/);
  assert.match(answerLocalQuestion('fiber', { today, fiberTarget: 28, meals: [{ date: today, fiber: 6.5 }, { date: today, fiber: null }, { date: '2026-11-10', fiber: 100 }] }), /6.5 g fibre.*1 of 2 entries.*21.5 g.*estimated 28 g target/);
  assert.match(answerLocalQuestion('fiber', { today, fiberTarget: 20, meals: [{ date: today, fiber: 24 }] }), /0.0 g to your estimated 20 g target/);
});

test('water answer distinguishes no entries and presents goal units accurately', () => {
  assert.match(answerLocalQuestion('water', { today, waters: [], waterTarget: 2200 }), /no water entries.*2.2 L/);
  assert.match(answerLocalQuestion('water', { today, waters: [{ date: today, ml: 750 }, { date: today, ml: 250 }], waterTarget: 2000 }), /1.00 L.*2.0 L/);
});

test('weight answer compares profile values and calls out missing inputs', () => {
  assert.match(answerLocalQuestion('weight', { startingWeight: 100, currentWeight: 90, weightUnit: 'kg' }), /10.0 kg lower.*profile values/);
  assert.match(answerLocalQuestion('weight', { startingWeight: 100, currentWeight: null }), /both starting and current weight/);
});
