import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStarterRecipe, isStarterRecipeSaved, keralaRecipeStarters } from '../src/keralaRecipeStarters.js';

const foods = [
  { id: 'usda-rice-flour-white', name: 'Rice flour, white, unenriched', basis: '100 g', kcal: 359, p: 6.94, c: 79.8, f: 1.3, fiber: 0.5, sugar: null },
  { id: 'ifct-H007', name: 'Coconut kernel, fresh', basis: '100 g', kcal: 409, p: 3.84, c: 6.30, f: 41.38, fiber: 10.42, sugar: null },
  { id: 'usda-coconut-milk-canned', name: 'Coconut milk, canned', basis: '100 g', kcal: 197, p: 2.02, c: 2.81, f: 21.3, fiber: 0, sugar: null },
  { id: 'usda-semolina-enriched', name: 'Semolina, enriched', basis: '100 g', kcal: 360, p: 12.7, c: 72.8, f: 1.05, fiber: 3.9, sugar: null },
  { id: 'usda-granulated-sugar', name: 'Granulated sugar', basis: '100 g', kcal: 387, p: 0, c: 100, f: 0, fiber: 0, sugar: 99.8 },
];

test('Kerala idiyappam starter estimates its cited ingredients and keeps unknown sugar unknown', () => {
  const starter = keralaRecipeStarters.find(item => item.id === 'kerala-idiyappam');
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

test('Kerala puttu starter makes its cup conversion and serving assumption explicit', () => {
  const starter = keralaRecipeStarters.find(item => item.id === 'kerala-puttu');
  const recipe = buildStarterRecipe(starter, foods, 'puttu-test');
  assert.equal(recipe.servings, 2);
  assert.equal(recipe.ingredients.length, 2);
  assert.equal(recipe.kcal, 371);
  assert.equal(recipe.sugar, null);
  assert.equal(recipe.recipeUrl, 'https://www.keralatourism.org/kerala-food/puttu-kadala/43/');
  assert.match(recipe.recipeSource, /yield is not stated/);
  assert.match(recipe.note, /Coarse puttu flour is represented/);
  assert.equal(recipe.nutritionSources.length, 4);
});


test('Kerala appam starter uses sourced ingredients and clearly labels yield and missing fibre/sugar data', () => {
  const starter = keralaRecipeStarters.find(item => item.id === 'kerala-appam');
  const recipe = buildStarterRecipe(starter, foods, 'appam-test');
  assert.equal(recipe.servings, 8);
  assert.equal(recipe.ingredients.length, 4);
  assert.equal(recipe.kcal, 334);
  assert.equal(recipe.p, 6.5);
  assert.equal(recipe.c, 61.4);
  assert.equal(recipe.f, 7.3);
  assert.equal(recipe.fiber, 0.8);
  assert.equal(recipe.sugar, null);
  assert.equal(recipe.recipeUrl, 'https://www.keralatourism.org/kerala-food/appam-mutton-stew/36/');
  assert.match(recipe.recipeSource, /does not state the yield/);
  assert.match(recipe.note, /fibre total excludes any contribution/);
  assert.match(recipe.note, /sugar remains unknown/);
  assert.equal(recipe.nutritionSources.length, 5);
});

test('starter save detection does not treat arbitrary saved recipes as this starter', () => {
  assert.equal(isStarterRecipeSaved([{ starterId: 'kerala-idiyappam' }], 'kerala-idiyappam'), true);
  assert.equal(isStarterRecipeSaved([{ id: 'custom', isRecipe: true }], 'kerala-idiyappam'), false);
  assert.equal(isStarterRecipeSaved(null, 'kerala-idiyappam'), false);
});

test('starter recipe fails clearly when a referenced food is unavailable', () => {
  assert.throws(() => buildStarterRecipe(keralaRecipeStarters.find(item => item.id === 'kerala-idiyappam'), foods.slice(0, 1), 'test-id'), /Missing food reference: ifct-H007/);
});
