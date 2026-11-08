-- THANZAN FIT normalized Supabase foundation (additive; not yet used by the PWA).
-- Apply in a new Supabase project's SQL Editor. This intentionally leaves the
-- existing public.fitness_records JSONB table in place for the current manual-copy UI.
-- All user-owned rows are protected by per-row RLS; do not expose service-role keys.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  age_years smallint check (age_years is null or age_years between 13 and 120),
  gender text,
  height_cm numeric(6,2) check (height_cm is null or height_cm between 50 and 260),
  starting_weight_kg numeric(7,2) check (starting_weight_kg is null or starting_weight_kg between 20 and 500),
  current_weight_kg numeric(7,2) check (current_weight_kg is null or current_weight_kg between 20 and 500),
  target_weight_kg numeric(7,2) check (target_weight_kg is null or target_weight_kg between 20 and 500),
  gym_start_date date,
  activity_level text,
  primary_goal text,
  experience_level text,
  workout_days_per_week smallint check (workout_days_per_week is null or workout_days_per_week between 0 and 14),
  workout_duration_minutes smallint check (workout_duration_minutes is null or workout_duration_minutes between 0 and 480),
  sleep_target_hours numeric(4,2) check (sleep_target_hours is null or sleep_target_hours between 0 and 24),
  daily_step_target integer check (daily_step_target is null or daily_step_target >= 0),
  dietary_preferences text[] not null default '{}',
  food_allergies text[] not null default '{}',
  medical_conditions text[] not null default '{}',
  exercise_restrictions text[] not null default '{}',
  previous_injuries text[] not null default '{}',
  available_equipment text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  weight_kg numeric(7,2) not null check (weight_kg between 20 and 500),
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, id)
);
create index if not exists weight_logs_user_time_idx on public.weight_logs (user_id, logged_at desc);

create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at timestamptz not null default now(),
  weight_kg numeric(7,2) check (weight_kg is null or weight_kg between 20 and 500),
  waist_cm numeric(7,2) check (waist_cm is null or waist_cm > 0),
  chest_cm numeric(7,2) check (chest_cm is null or chest_cm > 0),
  arms_cm numeric(7,2) check (arms_cm is null or arms_cm > 0),
  hips_cm numeric(7,2) check (hips_cm is null or hips_cm > 0),
  thighs_cm numeric(7,2) check (thighs_cm is null or thighs_cm > 0),
  neck_cm numeric(7,2) check (neck_cm is null or neck_cm > 0),
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, id)
);
create index if not exists body_measurements_user_time_idx on public.body_measurements (user_id, measured_at desc);

-- Global built-in guide entries use user_id IS NULL; user-created entries have an owner.
create table if not exists public.exercise_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  category text,
  target_muscles text[] not null default '{}',
  secondary_muscles text[] not null default '{}',
  equipment text[] not null default '{}',
  difficulty text,
  instructions jsonb not null default '{}'::jsonb check (jsonb_typeof(instructions) = 'object'),
  media_url text,
  created_at timestamptz not null default now(),
  unique (user_id, id)
);
create index if not exists exercise_library_owner_name_idx on public.exercise_library (user_id, lower(name));

create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id)
);

create table if not exists public.workout_plan_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null,
  day_of_week smallint check (day_of_week between 0 and 6),
  position integer not null check (position >= 0),
  exercise_name text not null,
  prescribed_sets smallint check (prescribed_sets is null or prescribed_sets > 0),
  rep_min smallint check (rep_min is null or rep_min > 0),
  rep_max smallint check (rep_max is null or rep_max >= rep_min),
  rest_seconds integer check (rest_seconds is null or rest_seconds >= 0),
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, id),
  foreign key (user_id, plan_id) references public.workout_plans(user_id, id) on delete cascade
);
create index if not exists workout_plan_exercises_plan_idx on public.workout_plan_exercises (user_id, plan_id, day_of_week, position);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid,
  title text not null,
  status text not null default 'completed' check (status in ('active','paused','completed','abandoned')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, id),
  foreign key (user_id, plan_id) references public.workout_plans(user_id, id) on delete set null (plan_id)
);
create index if not exists workout_sessions_user_time_idx on public.workout_sessions (user_id, started_at desc);

create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null,
  position integer not null default 0 check (position >= 0),
  exercise_name text not null,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, id),
  foreign key (user_id, session_id) references public.workout_sessions(user_id, id) on delete cascade
);

create table if not exists public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_exercise_id uuid not null,
  set_number smallint not null check (set_number > 0),
  reps smallint check (reps is null or reps >= 0),
  weight_kg numeric(7,2) check (weight_kg is null or weight_kg >= 0),
  completed boolean not null default true,
  logged_at timestamptz not null default now(),
  unique (user_id, id),
  foreign key (user_id, workout_exercise_id) references public.workout_exercises(user_id, id) on delete cascade
);
create index if not exists exercise_sets_exercise_time_idx on public.exercise_sets (user_id, workout_exercise_id, logged_at);

-- Built-in food data is public/read-only; personal food entries are separate.
create table if not exists public.food_database (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source text,
  source_reference text,
  food_form text,
  serving_basis text not null default '100 g',
  calories_kcal numeric(8,2) check (calories_kcal is null or calories_kcal >= 0),
  protein_g numeric(8,2) check (protein_g is null or protein_g >= 0),
  carbohydrates_g numeric(8,2) check (carbohydrates_g is null or carbohydrates_g >= 0),
  fat_g numeric(8,2) check (fat_g is null or fat_g >= 0),
  fibre_g numeric(8,2) check (fibre_g is null or fibre_g >= 0),
  sugar_g numeric(8,2) check (sugar_g is null or sugar_g >= 0),
  created_at timestamptz not null default now()
);
create index if not exists food_database_name_idx on public.food_database (lower(name));

create table if not exists public.custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  serving_basis text not null default '100 g',
  nutrients jsonb not null default '{}'::jsonb check (jsonb_typeof(nutrients) = 'object'),
  created_at timestamptz not null default now(),
  unique (user_id, id)
);
create index if not exists custom_foods_user_name_idx on public.custom_foods (user_id, lower(name));

create table if not exists public.custom_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id)
);

create table if not exists public.custom_meal_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_id uuid not null,
  position integer not null default 0 check (position >= 0),
  food_name text not null,
  quantity numeric(9,2) not null check (quantity > 0),
  quantity_unit text not null,
  nutrients_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(nutrients_snapshot) = 'object'),
  created_at timestamptz not null default now(),
  foreign key (user_id, meal_id) references public.custom_meals(user_id, id) on delete cascade
);
create index if not exists custom_meal_items_order_idx on public.custom_meal_items (user_id, meal_id, position);

create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  meal_category text not null,
  food_name text not null,
  quantity numeric(9,2) not null check (quantity > 0),
  quantity_unit text not null,
  nutrients jsonb not null default '{}'::jsonb check (jsonb_typeof(nutrients) = 'object'),
  is_estimate boolean not null default true,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists food_logs_user_time_idx on public.food_logs (user_id, logged_at desc);

create table if not exists public.nutrition_targets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  calorie_target_kcal integer check (calorie_target_kcal is null or calorie_target_kcal >= 0),
  protein_target_g numeric(8,2) check (protein_target_g is null or protein_target_g >= 0),
  carbohydrate_target_g numeric(8,2) check (carbohydrate_target_g is null or carbohydrate_target_g >= 0),
  fat_target_g numeric(8,2) check (fat_target_g is null or fat_target_g >= 0),
  fibre_target_g numeric(8,2) check (fibre_target_g is null or fibre_target_g >= 0),
  water_target_ml integer check (water_target_ml is null or water_target_ml >= 0),
  source_inputs jsonb not null default '{}'::jsonb check (jsonb_typeof(source_inputs) = 'object'),
  updated_at timestamptz not null default now()
);

create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  amount_ml integer not null check (amount_ml > 0),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists water_logs_user_time_idx on public.water_logs (user_id, logged_at desc);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  steps integer check (steps is null or steps >= 0),
  distance_km numeric(8,3) check (distance_km is null or distance_km >= 0),
  active_minutes integer check (active_minutes is null or active_minutes >= 0),
  workout_duration_minutes integer check (workout_duration_minutes is null or workout_duration_minutes >= 0),
  estimated_calories_kcal integer check (estimated_calories_kcal is null or estimated_calories_kcal >= 0),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists activity_logs_user_time_idx on public.activity_logs (user_id, logged_at desc);

create table if not exists public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sleep_date date not null,
  duration_hours numeric(4,2) check (duration_hours is null or duration_hours between 0 and 24),
  quality_rating smallint check (quality_rating is null or quality_rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique (user_id, sleep_date)
);
create index if not exists sleep_logs_user_date_idx on public.sleep_logs (user_id, sleep_date desc);

create table if not exists public.recovery_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  energy_rating smallint check (energy_rating is null or energy_rating between 1 and 5),
  soreness_rating smallint check (soreness_rating is null or soreness_rating between 1 and 5),
  readiness_rating smallint check (readiness_rating is null or readiness_rating between 1 and 5),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);
create index if not exists recovery_logs_user_date_idx on public.recovery_logs (user_id, log_date desc);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  context_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(context_snapshot) = 'object'),
  model text,
  unique (user_id, id)
);
create index if not exists ai_conversations_user_time_idx on public.ai_conversations (user_id, created_at desc);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null,
  role text not null check (role in ('system','user','assistant')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  foreign key (user_id, conversation_id) references public.ai_conversations(user_id, id) on delete cascade
);
create index if not exists ai_messages_conversation_time_idx on public.ai_messages (user_id, conversation_id, created_at);

create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null check (period_end >= period_start),
  report_data jsonb not null default '{}'::jsonb check (jsonb_typeof(report_data) = 'object'),
  created_at timestamptz not null default now(),
  unique (user_id, period_start, period_end)
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  units text not null default 'metric' check (units in ('metric','imperial')),
  theme text not null default 'dark' check (theme in ('dark','light')),
  reminders jsonb not null default '{}'::jsonb check (jsonb_typeof(reminders) = 'object'),
  preferences jsonb not null default '{}'::jsonb check (jsonb_typeof(preferences) = 'object'),
  updated_at timestamptz not null default now()
);

-- Enable RLS and recreate owner-only policies for every user-owned table.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','weight_logs','body_measurements','workout_plans','workout_plan_exercises',
    'workout_sessions','workout_exercises','exercise_sets','custom_foods','custom_meals',
    'custom_meal_items','food_logs','nutrition_targets','water_logs','activity_logs','sleep_logs','recovery_logs',
    'ai_conversations','ai_messages','weekly_reports','user_preferences'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists owner_select on public.%I', t);
    execute format('create policy owner_select on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('drop policy if exists owner_insert on public.%I', t);
    execute format('create policy owner_insert on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format('drop policy if exists owner_update on public.%I', t);
    execute format('create policy owner_update on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('drop policy if exists owner_delete on public.%I', t);
    execute format('create policy owner_delete on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

alter table public.exercise_library enable row level security;
drop policy if exists exercise_library_read on public.exercise_library;
create policy exercise_library_read on public.exercise_library for select to authenticated
  using (user_id is null or (select auth.uid()) = user_id);
drop policy if exists exercise_library_insert on public.exercise_library;
create policy exercise_library_insert on public.exercise_library for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists exercise_library_update on public.exercise_library;
create policy exercise_library_update on public.exercise_library for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists exercise_library_delete on public.exercise_library;
create policy exercise_library_delete on public.exercise_library for delete to authenticated
  using ((select auth.uid()) = user_id);
grant select on public.exercise_library to authenticated;
grant insert, update, delete on public.exercise_library to authenticated;

alter table public.food_database enable row level security;
drop policy if exists food_database_read on public.food_database;
create policy food_database_read on public.food_database for select to authenticated using (true);
grant select on public.food_database to authenticated;

-- Private body-photo bucket. Objects must be stored under <auth.uid()>/<filename>.
insert into storage.buckets (id, name, public)
values ('thanzan-body-photos', 'thanzan-body-photos', false)
on conflict (id) do update set public = false;
drop policy if exists body_photos_select_own on storage.objects;
create policy body_photos_select_own on storage.objects for select to authenticated
  using (bucket_id = 'thanzan-body-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists body_photos_insert_own on storage.objects;
create policy body_photos_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'thanzan-body-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists body_photos_update_own on storage.objects;
create policy body_photos_update_own on storage.objects for update to authenticated
  using (bucket_id = 'thanzan-body-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'thanzan-body-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists body_photos_delete_own on storage.objects;
create policy body_photos_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'thanzan-body-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
