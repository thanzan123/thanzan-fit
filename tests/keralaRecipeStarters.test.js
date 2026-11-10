import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStarterRecipe, isStarterRecipeSaved, keralaRecipeStarters } from '../src/keralaRecipeStarters.js';

const foods = [
  { id: 'usda-rice-flour-white', name: 'Rice flour, white, unenriched', basis: '100 g', kcal: 359, p: 6.94, c: 79.8, f: 1.3, fiber: 0.5, sugar: null },
  { id: 'ifct-H007', name: 'Coconut kernel, fresh', basis: '100 g', kcal: 409, p: 3.84, c: 6.30, f: 41.38, fiber: 10.42, sugar: null },
];

test('Kerala idiyappam starter estimates its cited ingredients and keeps unknown sugar unknown', () => {
  const starter = keralaRecipeStarters[0];
  const recipe = buildStarterRecipe(starter, foods, 'test-id');
  assert.equal(recipe.id, 'test-id');
  assert.equal(recipe.servings, 4);
  assert.equal(recipe.ingredients.length, 2);
  assert.equal(recipe.kcal, 370);
  assert.equal(recipe.sugar, null);
  assert.equal(recipe.recipeUrl, 'https://www.pachakam.com/recipes/kerala-style-idiappam');
  assert.match(recipe.note, /oil without an amount/);
  assert.equal(recipe.nutritionSources.length, 4);
});

test('starter save detection does not treat arbitrary saved recipes as this starter', () => {
  assert.equal(isStarterRecipeSaved([{ starterId: 'kerala-idiyappam' }], 'kerala-idiyappam'), true);
  assert.equal(isStarterRecipeSaved([{ id: 'custom', isRecipe: true }], 'kerala-idiyappam'), false);
  assert.equal(isStarterRecipeSaved(null, 'kerala-idiyappam'), false);
});

test('starter recipe fails clearly when a referenced food is unavailable', () => {
  assert.throws(() => buildStarterRecipe(keralaRecipeStarters[0], foods.slice(0, 1), 'test-id'), /Missing food reference: ifct-H007/);
});
