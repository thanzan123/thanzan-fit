-- THANZAN FIT: one private JSONB record per authenticated Supabase user.
-- Run this in the Supabase SQL Editor for the project configured in the app.
create table if not exists public.fitness_records (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.fitness_records enable row level security;

-- Re-runnable policy definitions; the authenticated account can access only its own row.
drop policy if exists "Users can read their own fitness record" on public.fitness_records;
create policy "Users can read their own fitness record"
  on public.fitness_records for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own fitness record" on public.fitness_records;
create policy "Users can create their own fitness record"
  on public.fitness_records for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own fitness record" on public.fitness_records;
create policy "Users can update their own fitness record"
  on public.fitness_records for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.fitness_records to authenticated;
