import test from 'node:test';
import assert from 'node:assert/strict';
import { findAllergyNameMatches } from '../src/allergyWarning.js';

test('matches listed allergy phrases against food names and recipe ingredients', () => {
  assert.deepEqual(findAllergyNameMatches({ name: 'Breakfast bowl', ingredients: [{ name: 'Groundnuts, raw' }] }, 'peanuts'), ['peanuts']);
  assert.deepEqual(findAllergyNameMatches({ name: 'Oats and milk' }, 'dairy allergy; shellfish'), ['dairy']);
});

test('normalizes case and punctuation, but does not match partial words', () => {
  assert.deepEqual(findAllergyNameMatches({ name: 'Whole milk' }, 'MILK'), ['milk']);
  assert.deepEqual(findAllergyNameMatches({ name: 'Milled rice' }, 'egg'), []);
});

test('no allergy note or no matching name produces no warning, not a safety claim', () => {
  assert.deepEqual(findAllergyNameMatches({ name: 'Cashew nuts, raw' }, ''), []);
  assert.deepEqual(findAllergyNameMatches({ name: 'Rice flour' }, 'cashew'), []);
});

test('recognizes common Indian and label names for ingredients', () => {
  assert.deepEqual(findAllergyNameMatches({ name: 'Omelette', ingredients: [{ name: 'Egg white' }] }, 'egg protein'), ['egg protein']);
  assert.deepEqual(findAllergyNameMatches({ name: 'Puttu', ingredients: [{ name: 'Rice flour' }, { name: 'Til seeds' }] }, 'sesame'), ['sesame']);
  assert.deepEqual(findAllergyNameMatches({ name: 'Chapati', ingredients: [{ name: 'Maida' }] }, 'gluten'), ['gluten']);
  assert.deepEqual(findAllergyNameMatches({ name: 'Soya chunks curry' }, 'soybean allergy'), ['soybean']);
  assert.deepEqual(findAllergyNameMatches({ name: 'Avial', ingredients: [{ name: 'Mustard seeds' }] }, 'rai'), ['rai']);
});

test('recognizes dairy proteins, tree-nut wording and shellfish varieties', () => {
  assert.deepEqual(findAllergyNameMatches({ name: 'Whey protein powder' }, 'milk protein'), ['milk protein']);
  assert.deepEqual(findAllergyNameMatches({ name: 'Almond flour' }, 'tree nut allergy'), ['tree nut']);
  assert.deepEqual(findAllergyNameMatches({ name: 'Prawn roast' }, 'shellfish'), ['shellfish']);
});
