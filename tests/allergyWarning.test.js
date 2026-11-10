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
