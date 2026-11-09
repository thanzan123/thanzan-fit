const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Local IDs are UUIDs in modern browsers. Keep a stable UUID mapping for older backups
// that may contain legacy timestamp-based IDs, so foreign keys remain consistent.
export function cloudId(value) {
  const input = String(value ?? '');
  if (UUID_RE.test(input)) return input.toLowerCase();
  const hashes = [2166136261, 2246822519, 3266489917, 668265263];
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    for (let j = 0; j < hashes.length; j += 1) hashes[j] = Math.imul(hashes[j] ^ (code + j * 97), 16777619) >>> 0;
  }
  const hex = hashes.map(x => x.toString(16).padStart(8, '0')).join('').split('');
  hex[12] = '5';
  hex[16] = ((parseInt(hex[16], 16) & 3) | 8).toString(16);
  const s = hex.join('');
  return `${s.slice(0,8)}-${s.slice(8,12)}-${s.slice(12,16)}-${s.slice(16,20)}-${s.slice(20)}`;
}

const dateTime = (date, createdAt) => /^\d{4}-\d{2}-\d{2}$/.test(String(date)) ? `${date}T12:00:00.000Z` : createdTime(createdAt, date);
const createdTime = (createdAt, date) => { const numeric=Number(createdAt); return Number.isFinite(numeric)&&numeric>0?new Date(numeric).toISOString():/^\d{4}-\d{2}-\d{2}$/.test(String(date))?`${date}T12:00:00.000Z`:new Date().toISOString(); };
const asNumber = value => value === '' || value === null || value === undefined || !Number.isFinite(Number(value)) ? null : Number(value);
const dateOfWeek = day => ({Sunday:0,Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5,Saturday:6})[day] ?? null;
const localId = (item, index, prefix) => item?.id || `${prefix}-${index}`;

export function buildNormalizedRows({ userId, data, theme = 'dark' }) {
  const user = userId;
  const profile = data.profile || {};
  const arrays = (key) => Array.isArray(data[key]) ? data[key] : [];
  const timestamp = () => new Date().toISOString();
  const state = { ...data, theme };
  const rows = {
    profiles: [{
      user_id:user, full_name:profile.name||null, age_years:asNumber(profile.age), gender:profile.gender||null,
      height_cm:asNumber(profile.heightCm), starting_weight_kg:asNumber(profile.startingWeightKg), current_weight_kg:asNumber(profile.currentWeightKg), target_weight_kg:asNumber(profile.targetWeightKg),
      activity_level:profile.activityLevel||null, primary_goal:profile.goal||null, experience_level:profile.experience||null,
      workout_days_per_week:asNumber(profile.workoutsPerWeek), workout_duration_minutes:asNumber(profile.workoutMinutes), sleep_target_hours:asNumber(profile.sleepHours), daily_step_target:asNumber(profile.dailySteps),
      dietary_preferences:String(profile.dietaryPreferences||'').split(/[,;\n]/).map(x=>x.trim()).filter(Boolean), food_allergies:String(profile.allergies||'').split(/[,;\n]/).map(x=>x.trim()).filter(Boolean),
      medical_conditions:String(profile.medicalConditions||'').split(/[,;\n]/).map(x=>x.trim()).filter(Boolean), exercise_restrictions:String(profile.exerciseRestrictions||'').split(/[,;\n]/).map(x=>x.trim()).filter(Boolean),
      previous_injuries:String(profile.previousInjuries||'').split(/[,;\n]/).map(x=>x.trim()).filter(Boolean), available_equipment:String(profile.equipment||'').split(/[,;\n]/).map(x=>x.trim()).filter(Boolean), updated_at:timestamp(),
    }],
    user_preferences: [{ user_id:user, units:data.units==='imperial'?'imperial':'metric', theme:theme==='light'?'light':'dark', reminders:{items:arrays('reminders')}, preferences:{app_snapshot:state, schema_version:1}, updated_at:timestamp() }],
    weight_logs: arrays('weights').map((x,i)=>({id:cloudId(localId(x,i,'weight')),user_id:user,logged_at:dateTime(x.date,x.createdAt),weight_kg:asNumber(x.kg),note:x.note||null,created_at:createdTime(x.createdAt,x.date)})),
    body_measurements: arrays('measurements').map((x,i)=>({id:cloudId(localId(x,i,'measurement')),user_id:user,measured_at:dateTime(x.date,x.createdAt),waist_cm:asNumber(x.waist),chest_cm:asNumber(x.chest),arms_cm:asNumber(x.arms),hips_cm:asNumber(x.hips),thighs_cm:asNumber(x.thighs),neck_cm:asNumber(x.neck),created_at:createdTime(x.createdAt,x.date)})),
    custom_foods: arrays('customFoods').map((x,i)=>({id:cloudId(localId(x,i,'food')),user_id:user,name:String(x.name||'Custom food'),serving_basis:String(x.basis||'100 g'),nutrients:{kcal:asNumber(x.kcal),protein_g:asNumber(x.p),carbohydrates_g:asNumber(x.c),fat_g:asNumber(x.f),fibre_g:asNumber(x.fiber),sugars_g:asNumber(x.sugar),category:x.category||null,is_recipe:!!x.isRecipe,servings:x.isRecipe?asNumber(x.servings):null,ingredients:x.isRecipe&&Array.isArray(x.ingredients)?x.ingredients:[],local_id:x.id||null},created_at:timestamp()})),
    food_logs: arrays('meals').map((x,i)=>{const match=String(x.quantity||'').match(/([0-9]+(?:\.[0-9]+)?)/);const unit=/ml/i.test(x.quantity||'')?'ml':/g/i.test(x.quantity||'')?'g':'serving';return {id:cloudId(localId(x,i,'meal')),user_id:user,logged_at:dateTime(x.date,x.createdAt),meal_category:String(x.mealType||'Other'),food_name:String(x.name||'Food entry'),quantity:Math.max(.01,Number(match?.[1])||1),quantity_unit:unit,nutrients:{kcal:asNumber(x.kcal),protein_g:asNumber(x.p),carbohydrates_g:asNumber(x.c),fat_g:asNumber(x.f),fibre_g:asNumber(x.fiber),sugars_g:asNumber(x.sugar),quantity_original:x.quantity||null,local_id:x.id||null},is_estimate:true,created_at:createdTime(x.createdAt,x.date)};}),
    water_logs: arrays('waters').map((x,i)=>({id:cloudId(localId(x,i,'water')),user_id:user,logged_at:dateTime(x.date,x.createdAt),amount_ml:Math.max(1,Math.round(asNumber(x.ml)||1)),created_at:createdTime(x.createdAt,x.date)})),
    activity_logs: arrays('activityLogs').map((x,i)=>({id:cloudId(localId(x,i,'activity')),user_id:user,logged_at:dateTime(x.date,x.createdAt),steps:asNumber(x.steps),distance_km:asNumber(x.distanceKm),active_minutes:asNumber(x.activeMinutes),estimated_calories_kcal:asNumber(x.estimatedWalkCalories),note:JSON.stringify({estimateWeightKg:x.estimateWeightKg??null,local_id:x.id||null}),created_at:createdTime(x.createdAt,x.date)})),
    sleep_logs: arrays('recovery').filter(x=>x.date&&x.sleepHours!==undefined&&x.sleepHours!==null).map(x=>({id:cloudId(`${user}:sleep:${x.date}`),user_id:user,sleep_date:x.date,duration_hours:asNumber(x.sleepHours),quality_rating:asNumber(x.sleepQuality),created_at:createdTime(x.createdAt,x.date)})),
    recovery_logs: arrays('recovery').map(x=>({id:cloudId(`${user}:recovery:${x.date}`),user_id:user,log_date:x.date,energy_rating:asNumber(x.energy),soreness_rating:asNumber(x.soreness),readiness_rating:asNumber(x.readiness),note:null,updated_at:dateTime(x.date,x.createdAt),created_at:createdTime(x.createdAt,x.date)})),
  };
  const planId = cloudId(`${user}:thanzan-fit-user-routines`);
  const planExercises = [];
  const customRoutines = arrays('customRoutines');
  const routineEdits = data.routineEdits && typeof data.routineEdits==='object' ? data.routineEdits : {};
  const routines = [...Object.entries(routineEdits).map(([day,r])=>({...r,day})), ...customRoutines];
  rows.workout_plans = routines.length ? [{id:planId,user_id:user,name:'My THANZAN FIT routines',description:'User-edited and custom routines',is_active:true,updated_at:timestamp()}] : [];
  routines.forEach((routine, ri)=>{
    const day = dateOfWeek(routine.day);
    (Array.isArray(routine.exercises)?routine.exercises:[]).forEach((name, position)=>planExercises.push({id:cloudId(`${user}:plan:${routine.id||routine.day}:${position}:${name}`),user_id:user,plan_id:planId,day_of_week:day,position,exercise_name:String(name),notes:routine.focus||null}));
  });
  rows.workout_plan_exercises = planExercises;
  const workouts = arrays('workouts');
  rows.workout_sessions = workouts.map((x,i)=>({id:cloudId(localId(x,i,'workout')),user_id:user,plan_id:routines.length?planId:null,title:String(x.name||'Workout'),status:x.active?(x.pausedAt?'paused':'active'):'completed',started_at:createdTime(x.startedAt,x.date),finished_at:x.finishedAt?new Date(Number(x.finishedAt)).toISOString():null,duration_seconds:Math.max(0,Math.round((Number(x.minutes)||0)*60)),note:JSON.stringify({date:x.date,routineId:x.routineId||null,routineExercises:x.routineExercises||[],sets:x.sets||0,completed:x.completed||[],pausedDurationMs:x.pausedDurationMs||0,local_id:x.id||null}),created_at:createdTime(x.startedAt,x.date)}));
  const workoutExerciseRows=[];
  const exerciseIds=new Map();
  workouts.forEach((session, si)=>{
    const names=[...new Set([...(Array.isArray(session.routineExercises)?session.routineExercises:[]),...arrays('sets').filter(s=>s.sessionId===session.id).map(s=>s.exercise)].filter(Boolean))];
    names.forEach((name,position)=>{const groupKey=`${session.id}:${name}`;const exerciseId=cloudId(`${user}:session-exercise:${groupKey}`);exerciseIds.set(groupKey,exerciseId);workoutExerciseRows.push({id:exerciseId,user_id:user,session_id:cloudId(localId(session,si,'workout')),position,exercise_name:String(name),created_at:createdTime(session.startedAt,session.date)});});
  });
  rows.workout_exercises=workoutExerciseRows;
  const perExerciseSetCount=new Map();
  rows.exercise_sets=arrays('sets').map((x,i)=>{const key=`${x.sessionId}:${x.exercise}`;const setNumber=(perExerciseSetCount.get(key)||0)+1;perExerciseSetCount.set(key,setNumber);return {id:cloudId(localId(x,i,'set')),user_id:user,workout_exercise_id:exerciseIds.get(key)||cloudId(`${user}:session-exercise:${key}`),set_number:setNumber,reps:asNumber(x.reps),weight_kg:asNumber(x.kg),completed:true,logged_at:dateTime(x.date,x.createdAt)};});
  const templates=arrays('mealTemplates');
  rows.custom_meals=templates.map((x,i)=>({id:cloudId(localId(x,i,'template')),user_id:user,name:String(x.name||'Meal template'),created_at:timestamp(),updated_at:timestamp()}));
  rows.custom_meal_items=templates.flatMap((x,ti)=>(Array.isArray(x.items)?x.items:[]).map((item,ii)=>({id:cloudId(`${x.id||ti}:item:${ii}:${item.name}`),user_id:user,meal_id:cloudId(localId(x,ti,'template')),position:ii,food_name:String(item.name||'Food'),quantity:Math.max(.01,Number(String(item.quantity||'').match(/[0-9]+(?:\.[0-9]+)?/)?.[0])||1),quantity_unit:/ml/i.test(item.quantity||'')?'ml':/g/i.test(item.quantity||'')?'g':'serving',nutrients_snapshot:{kcal:asNumber(item.kcal),protein_g:asNumber(item.p),carbohydrates_g:asNumber(item.c),fat_g:asNumber(item.f),fibre_g:asNumber(item.fiber),sugars_g:asNumber(item.sugar)}})));
  const nutrition=profile;
  rows.nutrition_targets=[{user_id:user,water_target_ml:asNumber(data.waterGoalMl),source_inputs:{profile:{age:asNumber(nutrition.age),heightCm:asNumber(nutrition.heightCm),weightKg:asNumber(nutrition.currentWeightKg),activityLevel:nutrition.activityLevel||null,goal:nutrition.goal||null}},updated_at:timestamp()}];
  return rows;
}

const TABLE_ORDER = ['profiles','workout_plans','workout_plan_exercises','workout_sessions','workout_exercises','exercise_sets','custom_foods','custom_meals','custom_meal_items','weight_logs','body_measurements','food_logs','water_logs','activity_logs','sleep_logs','recovery_logs','nutrition_targets','user_preferences'];
const SINGLETONS = new Set(['profiles','user_preferences','nutrition_targets']);

export async function writeNormalizedSnapshot(client, userId, data, theme) {
  const rows = buildNormalizedRows({userId,data,theme});
  // Upsert parents before dependents, then remove stale rows in reverse FK order.
  // Deleting parents during the upsert pass can fail while stale child rows still exist.
  for (const table of TABLE_ORDER) {
    const entries=rows[table]||[];
    for(let i=0;i<entries.length;i+=200){
      const batch=entries.slice(i,i+200);
      const {error}=await client.from(table).upsert(batch,{onConflict:SINGLETONS.has(table)?'user_id':'id'});
      if(error) throw new Error(`${table}: ${error.message}`);
    }
  }
  for (const table of [...TABLE_ORDER].reverse()) {
    if (SINGLETONS.has(table)) continue;
    const entries=rows[table]||[];
    const desired=new Set(entries.map(x=>x.id));
    const existing=[];
    for(let offset=0;;offset+=1000){
      const {data:page,error}=await client.from(table).select('id').eq('user_id',userId).range(offset,offset+999);
      if(error) throw new Error(`${table} check: ${error.message}`);
      existing.push(...(page||[]).map(x=>x.id));
      if(!page||page.length<1000) break;
    }
    const stale=existing.filter(id=>!desired.has(id));
    for(let i=0;i<stale.length;i+=200){
      const {error}=await client.from(table).delete().eq('user_id',userId).in('id',stale.slice(i,i+200));
      if(error) throw new Error(`${table} cleanup: ${error.message}`);
    }
  }
  return rows;
}
