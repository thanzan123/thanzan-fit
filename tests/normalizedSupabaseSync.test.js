import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNormalizedRows, cloudId, writeNormalizedSnapshot } from '../src/normalizedSupabaseSync.js';

const uuid = '11111111-1111-4111-8111-111111111111';
const base = { profile:{}, units:'metric', weights:[], meals:[], mealTemplates:[], waters:[], workouts:[], sets:[], measurements:[], recovery:[], activityLogs:[], customFoods:[], customRoutines:[], routineEdits:{} };

test('stable cloud ids preserve UUIDs and map legacy identifiers to UUIDs', () => {
  assert.equal(cloudId(uuid), uuid);
  assert.equal(cloudId('legacy-1'), cloudId('legacy-1'));
  assert.match(cloudId('legacy-1'), /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('maps profile, weigh-ins, measurements, meals, water and activity into owner-scoped rows', () => {
  const data={...base,profile:{name:'Thanzan',age:'29',heightCm:'180',currentWeightKg:'80',dietaryPreferences:'eggs, oats'},weights:[{id:uuid,date:'2026-11-08',kg:80,note:'morning'}],measurements:[{id:'legacy-m',date:'2026-11-08',waist:82}],meals:[{id:'legacy-f',date:'2026-11-08',name:'Oats',mealType:'Breakfast',quantity:'80 g',kcal:300,p:12,c:40,f:8,fiber:6}],waters:[{id:'legacy-w',date:'2026-11-08',ml:350}],activityLogs:[{id:'legacy-a',date:'2026-11-08',steps:3000,distanceKm:2,activeMinutes:30,estimatedWalkCalories:80}]};
  const rows=buildNormalizedRows({userId:uuid,data,theme:'light'});
  assert.equal(rows.profiles[0].user_id,uuid);
  assert.equal(rows.profiles[0].height_cm,180);
  assert.deepEqual(rows.profiles[0].dietary_preferences,['eggs','oats']);
  assert.equal(rows.user_preferences[0].preferences.app_snapshot.profile.name,'Thanzan');
  assert.equal(rows.weight_logs[0].weight_kg,80);
  assert.equal(rows.body_measurements[0].waist_cm,82);
  assert.equal(rows.food_logs[0].quantity,80);
  assert.equal(rows.food_logs[0].nutrients.kcal,300);
  assert.equal(rows.water_logs[0].amount_ml,350);
  assert.equal(rows.activity_logs[0].steps,3000);
});

test('preserves recipe ingredients and serving nutrition in normalized custom-food rows', () => {
  const recipe={id:'recipe-1',name:'Oats bowl',basis:'1 serving',category:'Custom recipe',isRecipe:true,servings:2,kcal:250,p:18,c:30,f:7,fiber:5,ingredients:[{id:'i1',foodId:'oats',name:'Oats',amount:50,unit:'g',basis:'100 g',kcal:389,p:16.9,c:66.3,f:6.9,fiber:10.6}]};
  const rows=buildNormalizedRows({userId:uuid,data:{...base,customFoods:[recipe]}});
  assert.equal(rows.custom_foods[0].serving_basis,'1 serving');
  assert.equal(rows.custom_foods[0].nutrients.is_recipe,true);
  assert.equal(rows.custom_foods[0].nutrients.servings,2);
  assert.deepEqual(rows.custom_foods[0].nutrients.ingredients,recipe.ingredients);
});

test('keeps workout foreign keys coherent and syncs templates and daily recovery inputs', () => {
  const data={...base,customRoutines:[{id:'routine-1',day:'Monday',name:'Push',focus:'Upper body',exercises:['Bench press']}],routineEdits:{},workouts:[{id:'workout-1',date:'2026-11-08',name:'Push',startedAt:1762588800000,active:false,routineExercises:['Bench press'],minutes:45}],sets:[{id:'set-1',sessionId:'workout-1',exercise:'Bench press',reps:10,kg:40,createdAt:1762589900000}],mealTemplates:[{id:'template-1',name:'Breakfast',items:[{name:'Oats',quantity:'80 g',kcal:300,p:12,c:40,f:8,fiber:6}]}],recovery:[{id:'checkin-1',date:'2026-11-08',sleepHours:7.5,sleepQuality:4,energy:3,soreness:2,readiness:4}]};
  const rows=buildNormalizedRows({userId:uuid,data});
  assert.equal(rows.workout_plans.length,1);
  assert.equal(rows.workout_plan_exercises[0].plan_id,rows.workout_plans[0].id);
  assert.equal(rows.workout_exercises[0].session_id,rows.workout_sessions[0].id);
  assert.equal(rows.exercise_sets[0].workout_exercise_id,rows.workout_exercises[0].id);
  assert.equal(rows.custom_meal_items[0].meal_id,rows.custom_meals[0].id);
  assert.equal(rows.custom_meal_items[0].quantity,80);
  assert.equal(rows.sleep_logs[0].duration_hours,7.5);
  assert.equal(rows.recovery_logs[0].readiness_rating,4);
  assert.equal(rows.nutrition_targets[0].water_target_ml,null);
});


test('upserts parents before the snapshot and removes stale dependent rows before parents, owner-scoped', async () => {
  const calls=[];
  const staleByTable={
    workout_plans:'stale-plan', workout_plan_exercises:'stale-plan-exercise',
    workout_sessions:'stale-session', workout_exercises:'stale-exercise', exercise_sets:'stale-set',
    custom_meals:'stale-meal', custom_meal_items:'stale-meal-item', weight_logs:'stale-weight',
  };
  const client={from(table){return {
    upsert:async(rows,options)=>{calls.push({kind:'upsert',table,rows,options});return {error:null};},
    select:()=>({eq:(column,value)=>({range:async(start,end)=>({data:staleByTable[table]?[{id:staleByTable[table]}]:[],error:null})})}),
    delete:()=>({eq:(column,value)=>({in:async(key,ids)=>{calls.push({kind:'delete',table,ownerColumn:column,owner:value,key,ids});return {error:null};}})}),
  };}};
  await writeNormalizedSnapshot(client,uuid,base,'dark');
  const upserts=calls.filter(x=>x.kind==='upsert');
  assert.equal(upserts.at(-1).table,'user_preferences');
  assert.deepEqual(upserts.at(-1).rows[0].preferences.app_snapshot,{...base,theme:'dark'});
  assert.ok(upserts.every(x=>x.rows.every(row=>row.user_id===uuid)));
  const deletes=calls.filter(x=>x.kind==='delete');
  assert.ok(deletes.every(x=>x.ownerColumn==='user_id'&&x.owner===uuid));
  assert.deepEqual(deletes.map(x=>x.table),['weight_logs','custom_meal_items','custom_meals','exercise_sets','workout_exercises','workout_sessions','workout_plan_exercises','workout_plans']);
  assert.deepEqual(deletes.map(x=>x.ids[0]),['stale-weight','stale-meal-item','stale-meal','stale-set','stale-exercise','stale-session','stale-plan-exercise','stale-plan']);
});
