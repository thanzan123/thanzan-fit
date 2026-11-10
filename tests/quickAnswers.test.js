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

test('water answer distinguishes no entries and presents goal units accurately', () => {
  assert.match(answerLocalQuestion('water', { today, waters: [], waterTarget: 2200 }), /no water entries.*2.2 L/);
  assert.match(answerLocalQuestion('water', { today, waters: [{ date: today, ml: 750 }, { date: today, ml: 250 }], waterTarget: 2000 }), /1.00 L.*2.0 L/);
});

test('weight answer compares profile values and calls out missing inputs', () => {
  assert.match(answerLocalQuestion('weight', { startingWeight: 100, currentWeight: 90, weightUnit: 'kg' }), /10.0 kg lower.*profile values/);
  assert.match(answerLocalQuestion('weight', { startingWeight: 100, currentWeight: null }), /both starting and current weight/);
});
