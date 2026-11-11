import test from 'node:test';
import assert from 'node:assert/strict';
import { answerLocalQuestion, classifyLocalQuestion } from '../src/quickAnswers.js';

const today = '2026-11-11';

test('calorie answer uses only today entries and distinguishes no logged food', () => {
  assert.match(answerLocalQuestion('calories', { today, meals: [] }), /no food entries saved/);
  assert.match(answerLocalQuestion('calories', { today, meals: [{ date: today, kcal: 440 }, { date: '2026-11-10', kcal: 300 }] }), /440 kcal across 1 entry/);
});

test('calorie remainder compares todays log with an available estimated target', () => {
  assert.match(answerLocalQuestion('caloriesRemaining', { today, meals: [], calorieTarget: 1800 }), /no food entries saved.*unknown.*1,800 kcal\/day/);
  assert.match(answerLocalQuestion('caloriesRemaining', { today, calorieTarget: null, meals: [{ date: today, kcal: 440 }] }), /target isn’t available/);
  assert.match(answerLocalQuestion('caloriesRemaining', { today, calorieTarget: 1800, meals: [{ date: today, kcal: 440 }, { date: '2026-11-10', kcal: 300 }] }), /440 kcal.*leaving about 1,360 kcal.*1,800 kcal target.*not a prescription/);
  assert.match(answerLocalQuestion('caloriesRemaining', { today, calorieTarget: 1800, meals: [{ date: today, kcal: 1900 }] }), /1,900 kcal.*100 kcal above.*1,800 kcal target/);
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

test('today workout answer uses the saved schedule and preserves readiness context', () => {
  assert.match(answerLocalQuestion('workout', { routine: null }), /no workout scheduled/);
  const routine = { name: 'Pull A', focus: 'Back · biceps', exercises: ['Lat pulldown', 'Seated row'] };
  assert.equal(answerLocalQuestion('workout', { routine }), 'Today’s scheduled workout is Pull A (Back · biceps): Lat pulldown, Seated row.');
  assert.match(answerLocalQuestion('workout', { routine, workoutReadiness: 'rest' }), /do not feel ready today.*easy recovery day.*plan is unchanged/);
  assert.match(answerLocalQuestion('workout', { routine, workoutReadiness: 'unsure' }), /readiness as unsure.*skip anything that hurts.*plan is unchanged/);
});

test('weight answer compares profile values and calls out missing inputs', () => {
  assert.match(answerLocalQuestion('weight', { startingWeight: 100, currentWeight: 90, weightUnit: 'kg' }), /10.0 kg lower.*profile values/);
  assert.match(answerLocalQuestion('weight', { startingWeight: 100, currentWeight: null }), /both starting and current weight/);
});


test('steps answer keeps absent manual logs unknown and reports personal-goal progress', () => {
  assert.match(answerLocalQuestion('steps', { steps: null, stepTarget: 8000 }), /no manual step entry.*unknown/);
  assert.match(answerLocalQuestion('steps', { steps: 0, stepTarget: 8000 }), /0 manual steps.*8,000/);
  assert.match(answerLocalQuestion('steps', { steps: 6200, stepTarget: 8000 }), /6,200 manual steps.*1,800.*8,000/);
  assert.match(answerLocalQuestion('steps', { steps: 9000, stepTarget: 8000 }), /9,000 manual steps.*goal of 8,000 is reached/);
  assert.match(answerLocalQuestion('steps', { steps: 6200 }), /no personal step goal is set/);
});


test('local question routing accepts supported single-topic log questions', () => {
  assert.equal(classifyLocalQuestion('How much protein is left today?'), 'protein');
  assert.equal(classifyLocalQuestion('How many calories have I logged today?'), 'calories');
  assert.equal(classifyLocalQuestion('How many calories remain today?'), 'caloriesRemaining');
  assert.equal(classifyLocalQuestion('How many calories are left in my budget today?'), 'caloriesRemaining');
  assert.equal(classifyLocalQuestion('Fibre remaining today'), 'fiber');
  assert.equal(classifyLocalQuestion('Water logged today'), 'water');
  assert.equal(classifyLocalQuestion('How many steps did I save today?'), 'steps');
  assert.equal(classifyLocalQuestion('Compare my current and starting weight change'), 'weight');
  assert.equal(classifyLocalQuestion('Analyze my last seven days'), 'weekly');
  assert.equal(classifyLocalQuestion('What is today’s workout?'), 'workout');
  assert.equal(classifyLocalQuestion('Show my scheduled training session today'), 'workout');
  assert.equal(classifyLocalQuestion('Summarize the past week'), 'weekly');
});

test('local question routing rejects ambiguous, unsupported, and mismatched requests', () => {
  assert.equal(classifyLocalQuestion('How much protein and fibre is left?'), null);
  assert.equal(classifyLocalQuestion('How many calories should I eat?'), null);
  assert.equal(classifyLocalQuestion('How many calories remain in my weekly target?'), null);
  assert.equal(classifyLocalQuestion('How much water is left today?'), null);
  assert.equal(classifyLocalQuestion('What workout should I do today?'), null);
  assert.equal(classifyLocalQuestion('Tell me about my workout'), null);
  assert.equal(classifyLocalQuestion('Why is my weight changing?'), null);
  assert.equal(classifyLocalQuestion('Analyze my protein over the last seven days'), null);
  assert.equal(classifyLocalQuestion('Tell me a recipe with protein'), null);
  assert.equal(classifyLocalQuestion(''), null);
});
