import test from 'node:test';
import assert from 'node:assert/strict';
import { usdaFoodExtensions, usdaFoodSources } from '../src/usdaFoodExtensions.js';

test('adds the requested USDA reference ingredients with unique IDs and per-100 g values', () => {
  assert.equal(usdaFoodExtensions.length, 6);
  assert.equal(new Set(usdaFoodExtensions.map(food => food.id)).size, usdaFoodExtensions.length);
  const byName = Object.fromEntries(usdaFoodExtensions.map(food => [food.name, food]));
  assert.deepEqual(
    ['Greek yogurt, plain, nonfat','Whey-based protein powder, generic','Beef, top round, lean, raw','Shrimp, cooked','Broccoli, raw','Almonds, raw'].sort(),
    Object.keys(byName).sort(),
  );
  for (const food of usdaFoodExtensions) {
    assert.equal(food.basis, '100 g');
    assert.match(food.category, /USDA FoodData Central/);
    for (const key of ['kcal','p','c','f','fiber']) assert.ok(Number.isFinite(food[key]), `${food.name} ${key}`);
  }
  assert.equal(byName['Greek yogurt, plain, nonfat'].sugar, 3.27);
  assert.equal(byName['Whey-based protein powder, generic'].p, 78.1);
  assert.equal(byName['Beef, top round, lean, raw'].kcal, 124);
  assert.equal(byName['Shrimp, cooked'].sugar, null, 'unknown sugar stays unknown');
  assert.equal(byName['Broccoli, raw'].fiber, 2.6);
  assert.equal(byName['Almonds, raw'].fiber, 12.5);
});

test('provides a matching USDA FoodData Central source link for every new food', () => {
  assert.equal(usdaFoodSources.length, usdaFoodExtensions.length);
  for (const food of usdaFoodExtensions) {
    const id = food.category.match(/FDC (\d+)/)?.[1];
    assert.ok(id, `${food.name} FDC identifier`);
    assert.ok(usdaFoodSources.some(source => source.url === `https://fdc.nal.usda.gov/food-details/${id}/nutrients`), `${food.name} source link`);
  }
});
