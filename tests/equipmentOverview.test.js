import test from 'node:test';
import assert from 'node:assert/strict';
import { getRoutineEquipmentOverview } from '../src/equipmentOverview.js';

test('summarizes distinct guide equipment for each saved routine without changing its exercises', () => {
  const routines = [
    { day: 'Monday', name: 'Push A', exercises: ['Machine press', 'Machine press', 'Fly'] },
    { id: 'custom-1', name: 'Home day', exercises: ['Floor press', 'Unknown move'] },
  ];
  const guides = [
    { name: 'Machine press', equipment: 'Chest-press machine' },
    { name: 'Fly', equipment: 'Cable station · rope handle' },
    { name: 'Floor press', equipment: 'Dumbbells · mat' },
  ];

  assert.deepEqual(getRoutineEquipmentOverview(routines, guides), [
    { key: 'Monday', day: 'Monday', name: 'Push A', equipment: ['Chest-press machine', 'Cable station · rope handle'], unknownExercises: [] },
    { key: 'custom-1', day: 'Custom routine', name: 'Home day', equipment: ['Dumbbells · mat'], unknownExercises: ['Unknown move'] },
  ]);
  assert.deepEqual(routines[0].exercises, ['Machine press', 'Machine press', 'Fly']);
});

test('handles missing routines and guides without inventing equipment', () => {
  assert.deepEqual(getRoutineEquipmentOverview(null, null), []);
  assert.deepEqual(getRoutineEquipmentOverview([{ name: 'New routine', exercises: ['Not listed'] }], []), [
    { key: 'New routine', day: 'Custom routine', name: 'New routine', equipment: [], unknownExercises: ['Not listed'] },
  ]);
});
