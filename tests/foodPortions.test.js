import test from 'node:test';
import assert from 'node:assert/strict';
import { getStandardFoodPortion } from '../src/foodPortions.js';

test('serving shortcuts use the matching USDA food reference portions', () => {
  assert.deepEqual(getStandardFoodPortion({id:'egg',basis:'100 g'}), {
    label:'1 large egg',amount:50,unit:'g',source:'FDC 171287'
  });
  assert.deepEqual(getStandardFoodPortion({id:'usda-broccoli-raw',basis:'100 g'}), {
    label:'1 cup chopped broccoli',amount:91,unit:'g',source:'FDC 170379'
  });
  assert.deepEqual(getStandardFoodPortion({id:'usda-olive-oil',basis:'100 g'}), {
    label:'1 tablespoon olive oil',amount:13.5,unit:'g',source:'FDC 171413'
  });
  assert.equal(getStandardFoodPortion({id:'usda-whole-wheat-bread',basis:'100 g'}).amount,32);
});

test('unknown/custom foods and recipe servings do not receive invented shortcuts', () => {
  assert.equal(getStandardFoodPortion({id:'custom-food',basis:'100 g'}),null);
  assert.equal(getStandardFoodPortion({id:'egg',basis:'100 ml'}),null);
  assert.equal(getStandardFoodPortion({id:'egg',basis:'100 g',isRecipe:true}),null);
  assert.equal(getStandardFoodPortion(null),null);
});
