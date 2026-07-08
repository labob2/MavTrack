-- MavTrack database schema
-- Run this entire file in Supabase: Dashboard -> SQL Editor -> New Query -> paste -> Run

create extension if not exists pgcrypto;

-- ============ tables ============

create table if not exists requirement_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  label text not null,
  type text not null default 'major',
  credits_required integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists semesters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  semester_id uuid not null references semesters(id) on delete cascade,
  group_id uuid references requirement_groups(id) on delete set null,
  name text not null default '',
  credits integer not null default 0,
  grade text,
  created_at timestamptz not null default now()
);

create table if not exists scholarships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  min_gpa numeric not null default 0,
  min_credits integer not null default 0,
  notes text default '',
  created_at timestamptz not null default now()
);

-- what-if is a single scratchpad row per user, not a real table of records
create table if not exists whatif_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Next semester',
  courses jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ============ row level security ============
-- Each policy means: a logged-in user can only ever see or touch their own rows.
-- Without this, anyone with your anon key could read every student's data.

alter table requirement_groups enable row level security;
alter table semesters enable row level security;
alter table courses enable row level security;
alter table scholarships enable row level security;
alter table whatif_state enable row level security;

create policy "own rows only" on requirement_groups
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows only" on semesters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows only" on courses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows only" on scholarships
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows only" on whatif_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
