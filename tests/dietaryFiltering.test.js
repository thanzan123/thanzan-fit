import test from 'node:test';
import assert from 'node:assert/strict';
import { filterDinnerIdeasForDiet } from '../src/dietaryFiltering.js';

const ideas = foods => foods.map(food => ({ food }));

test('filters common meat, seafood and egg options for vegetarian preferences', () => {
  const foods = ideas([
    { name: 'Chicken breast, cooked', category: 'Protein' },
    { name: 'Ayala curry', category: 'Kerala' },
    { name: 'Whole egg, raw', category: 'Protein' },
    { name: 'Whole milk', category: 'Dairy' },
    { name: 'Rice, cooked', category: 'Carbohydrate' },
  ]);
  const result = filterDinnerIdeasForDiet(foods, 'Vegetarian');
  assert.equal(result.preference, 'vegetarian');
  assert.deepEqual(result.ideas.map(item => item.food.name), ['Whole milk', 'Rice, cooked']);
  assert.equal(result.excludedCount, 3);
});

test('vegan filtering includes known plant recipes but not dairy or ambiguous foods', () => {
  const foods = ideas([
    { name: 'Whole milk', category: 'Dairy' },
    { name: 'Puttu', category: 'Recipe', ingredients: [{ name: 'Rice flour', category: 'grain' }, { name: 'Coconut' }] },
    { name: 'Custom protein meal', category: 'Custom estimate' },
  ]);
  const result = filterDinnerIdeasForDiet(foods, 'vegan');
  assert.deepEqual(result.ideas.map(item => item.food.name), ['Puttu']);
  assert.equal(result.excludedCount, 2);
});

test('recipes are restricted by every known ingredient, and unknown ingredients are omitted', () => {
  const result = filterDinnerIdeasForDiet(ideas([
    { name: 'Coconut rice', ingredients: [{ name: 'Rice flour' }, { name: 'Coconut' }] },
    { name: 'Egg curry', ingredients: [{ name: 'Egg' }, { name: 'Tomato' }] },
    { name: 'Puttu with milk', ingredients: [{ name: 'Rice flour' }, { name: 'Milk' }] },
    { name: 'Unknown mix', ingredients: [{ name: 'Rice flour' }, { name: 'House sauce' }] },
  ]), 'vegan');
  assert.deepEqual(result.ideas.map(item => item.food.name), ['Coconut rice']);
});

test('pescatarian preference allows fish but excludes meat and unknown foods', () => {
  const result = filterDinnerIdeasForDiet(ideas([
    { name: 'Sardine', category: 'Protein' },
    { name: 'Chicken curry', category: 'Recipe' },
    { name: 'Tofu', category: 'Custom estimate' },
  ]), 'pescatarian');
  assert.deepEqual(result.ideas.map(item => item.food.name), ['Sardine']);
});

test('unrecognized or blank preferences leave suggestions unchanged', () => {
  const source = ideas([{ name: 'Custom protein meal', category: 'Custom estimate' }]);
  assert.deepEqual(filterDinnerIdeasForDiet(source, '').ideas, source);
  const other = filterDinnerIdeasForDiet(source, 'mostly home-cooked');
  assert.equal(other.filtered, false);
  assert.deepEqual(other.ideas, source);
  assert.equal(filterDinnerIdeasForDiet(source, 'non-vegetarian').filtered, false);
});
