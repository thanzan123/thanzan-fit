import test from 'node:test';
import assert from 'node:assert/strict';
import { filterFoods, getFoodCategories, getFoodCategory } from '../src/foodLibrary.js';

const foods = [
  {name:'Whole egg, raw', category:'Protein'},
  {name:'Cow milk, whole', category:'IFCT 2017 · dairy · as listed'},
  {name:'Rice, raw, milled', category:'IFCT 2017 · grain · raw'},
  {name:'Guava, white flesh, raw', category:'IFCT 2017 · fruit · raw'},
  {name:'Broccoli, raw', category:'USDA SR Legacy'},
  {name:'Almonds, raw', category:'USDA SR Legacy'},
  {name:'Olive oil, salad or cooking', category:'USDA SR Legacy'},
  {name:'Idiyappam', category:'Kerala starter recipe', isRecipe:true},
  {name:'My curry', category:'Custom estimate'},
];

test('groups food library entries into usable browse categories', () => {
  assert.deepEqual(foods.map(getFoodCategory), ['Protein','Dairy','Grains & starches','Fruit','Vegetables','Nuts & seeds','Fats & oils','Recipes','Other']);
  assert.deepEqual(getFoodCategories(foods), ['All categories','Protein','Dairy','Grains & starches','Fruit','Vegetables','Nuts & seeds','Fats & oils','Recipes','Other']);
});

test('filters foods by category and search together without changing source entries', () => {
  const result = filterFoods(foods, {category:'Vegetables', query:'broc'});
  assert.deepEqual(result.map(food=>food.name), ['Broccoli, raw']);
  assert.equal(foods.length, 9);
  assert.equal(filterFoods(foods, {category:'All categories', query:'rice'}).length, 1);
});
