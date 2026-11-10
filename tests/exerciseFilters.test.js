import test from 'node:test';
import assert from 'node:assert/strict';
import { filterExerciseGuides, getExerciseEquipmentOptions } from '../src/exerciseFilters.js';

const guides = [
  { name: 'Chest press', muscle: 'Chest · triceps', secondary: 'Shoulders', equipment: 'Chest-press machine' },
  { name: 'Dumbbell press', muscle: 'Chest', secondary: 'Triceps', equipment: 'Bench · dumbbells' },
  { name: 'Seated row', muscle: 'Back', secondary: 'Biceps', equipment: 'Cable station' },
];

test('equipment options include compound equipment entries and custom equipment', () => {
  assert.deepEqual(getExerciseEquipmentOptions(guides), ['All equipment', 'Bench', 'Cable station', 'Chest-press machine', 'dumbbells']);
});

test('equipment filter matches a part of compound equipment and combines with muscle/search', () => {
  assert.deepEqual(filterExerciseGuides(guides, { equipment: 'dumbbells' }).map(x => x.name), ['Dumbbell press']);
  assert.deepEqual(filterExerciseGuides(guides, { muscle: 'Chest', equipment: 'machine', query: 'press' }).map(x => x.name), ['Chest press']);
  assert.deepEqual(filterExerciseGuides(guides, { equipment: 'kettlebell' }), []);
});
