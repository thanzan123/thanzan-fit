import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRecipe } from '../src/recipe.js';

const oats = {name:'Oats',amount:50,kcal:389,p:16.9,c:66.3,f:6.9,fiber:10.6};
const milk = {name:'Milk',amount:200,kcal:61,p:3.2,c:4.8,f:3.3,fiber:0};

test('calculates totals and per-serving nutrition from mixed ingredient amounts', () => {
  const result = calculateRecipe([oats,milk], 2);
  assert.deepEqual(result.total, {kcal:317,p:14.8,c:42.8,f:10.1,fiber:5.3,sugar:null});
  assert.deepEqual(result.perServing, {kcal:158,p:7.4,c:21.4,f:5,fiber:2.6,sugar:null});
  assert.equal(result.servings, 2);
});

test('supports fractional servings and rounds calories to whole kcal', () => {
  const result = calculateRecipe([oats], 1.5);
  assert.equal(result.perServing.kcal, 130);
  assert.equal(result.perServing.p, 5.6);
});

test('rejects missing ingredients, invalid servings, and invalid amounts', () => {
  assert.throws(() => calculateRecipe([], 1), /at least one ingredient/);
  assert.throws(() => calculateRecipe([oats], 0), /Servings must/);
  assert.throws(() => calculateRecipe([{...oats,amount:0}], 1), /Ingredient amounts/);
});

test('rejects missing or negative nutrient values rather than silently inventing zero', () => {
  assert.throws(() => calculateRecipe([{...oats,p:undefined}], 1), /Invalid p value/);
  assert.throws(() => calculateRecipe([{...oats,f:-1}], 1), /Invalid f value/);
});


test('totals known sugar when every ingredient supplies it', () => {
  const result = calculateRecipe([{...oats,sugar:1.2},{...milk,sugar:5}], 2);
  assert.equal(result.total.sugar, 10.6);
  assert.equal(result.perServing.sugar, 5.3);
});

test('leaves recipe sugar unknown when any ingredient lacks a value', () => {
  const result = calculateRecipe([{...oats,sugar:1.2},milk], 2);
  assert.equal(result.total.sugar, null);
  assert.equal(result.perServing.sugar, null);
});

test('rejects invalid known sugar values', () => {
  assert.throws(() => calculateRecipe([{...oats,sugar:-1}], 1), /Invalid sugar value/);
});
