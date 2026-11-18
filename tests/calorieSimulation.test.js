import test from 'node:test';
import assert from 'node:assert/strict';
import { getCalorieSimulation } from '../src/calorieSimulation.js';

test('simulates a bounded four-week scenario without changing profile data', () => {
  const result = getCalorieSimulation({ maintenanceKcal: 2400, deficitKcal: 300, currentWeightKg: 100, targetWeightKg: 80 });
  assert.equal(result.dailyTargetKcal, 2100);
  assert.equal(result.deficitKcal, 300);
  assert.equal(result.fourWeekChangeKg, 300 * 28 / 7700);
  assert.equal(result.weeksToTarget, 20 / (300 * 7 / 7700));
});

test('caps the selected deficit at the lower of 500 kcal or 20 percent of maintenance', () => {
  assert.equal(getCalorieSimulation({ maintenanceKcal: 1800, deficitKcal: 900 }).deficitKcal, 360);
  assert.equal(getCalorieSimulation({ maintenanceKcal: 4000, deficitKcal: 900 }).deficitKcal, 500);
});

test('supports maintenance scenarios and leaves unknown target timelines blank', () => {
  const result = getCalorieSimulation({ maintenanceKcal: 2000, deficitKcal: 0, currentWeightKg: 90, targetWeightKg: 70 });
  assert.equal(result.dailyTargetKcal, 2000);
  assert.equal(result.fourWeekChangeKg, 0);
  assert.equal(result.weeksToTarget, null);
  assert.equal(getCalorieSimulation({ maintenanceKcal: 2000, deficitKcal: 250, currentWeightKg: '', targetWeightKg: 70 }).weeksToTarget, null);
});

test('rejects missing maintenance or invalid deficit inputs', () => {
  assert.equal(getCalorieSimulation({ maintenanceKcal: 0, deficitKcal: 250 }), null);
  assert.equal(getCalorieSimulation({ maintenanceKcal: 2000, deficitKcal: 'x' }), null);
});
