import test from 'node:test';
import assert from 'node:assert/strict';
import { getDinnerSuggestions } from '../src/mealSuggestions.js';

const foods = [
  { id: 'chicken', name: 'Chicken breast, cooked', basis: '100 g', kcal: 165, p: 31 },
  { id: 'paneer', name: 'Paneer', basis: '100 g', kcal: 265, p: 18.86 },
  { id: 'nuts', name: 'Groundnuts', basis: '100 g', kcal: 560, p: 24 },
  { id: 'rice', name: 'White rice', basis: '100 g', kcal: 130, p: 2.69 },
  { id: 'recipe', name: 'Protein recipe', basis: '1 serving', isRecipe: true, kcal: 240, p: 20 },
];

test('suggestions cap protein portions at 25 g and rank options within known calorie headroom', () => {
  const suggestions = getDinnerSuggestions({ foods, meals: [{ date: '2026-11-11', kcal: 1400, p: 65 }], today: '2026-11-11', calorieTarget: 1800, proteinTarget: 100 });
  assert.equal(suggestions.length, 3);
  assert.equal(suggestions[0].food.id, 'chicken');
  assert.equal(suggestions[0].amount, 80);
  assert.equal(suggestions[0].kcal, 132);
  assert.equal(suggestions[0].fitsCalorieEstimate, true);
  assert.equal(suggestions.some(item => item.food.id === 'nuts' || item.food.id === 'rice'), false);
});

test('empty logs do not imply zero intake or a known remaining calorie budget', () => {
  const [suggestion] = getDinnerSuggestions({ foods, meals: [], today: '2026-11-11', calorieTarget: 1800, proteinTarget: 100 });
  assert.equal(suggestion.caloriesLeft, null);
  assert.equal(suggestion.fitsCalorieEstimate, null);
  assert.equal(suggestion.amount, 60);
});

test('recipe suggestions use servings and a missing calorie target remains unknown', () => {
  const [suggestion] = getDinnerSuggestions({ foods: [foods[4]], meals: [{ date: '2026-11-11', kcal: 100, p: 2 }], today: '2026-11-11' });
  assert.equal(suggestion.recipe, true);
  assert.equal(suggestion.amount, 1);
  assert.equal(suggestion.caloriesLeft, null);
  assert.equal(suggestion.kcal, 240);
});

test('limits, malformed foods and other-day logs are handled safely', () => {
  assert.deepEqual(getDinnerSuggestions({ foods: [null, { name: 'bad', kcal: -1, p: 10 }], today: '2026-11-11' }), []);
  assert.equal(getDinnerSuggestions({ foods, meals: [{ date: '2026-11-10', kcal: 100, p: 100 }], today: '2026-11-11' })[0].caloriesLeft, null);
  assert.equal(getDinnerSuggestions({ foods, today: '2026-11-11', limit: 1 }).length, 1);
});
