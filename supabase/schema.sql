-- Run this once in Supabase: SQL Editor > New query > paste > Run.
create table if not exists public.officers (email text primary key);

create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  xp int not null default 0,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.is_officer() returns boolean
language sql security definer set search_path = public as $$
  select exists (select 1 from public.officers o where lower(o.email) = lower(auth.jwt() ->> 'email'));
$$;

alter table public.progress enable row level security;
alter table public.officers enable row level security;

create policy "own progress: read"   on public.progress for select using (auth.uid() = user_id);
create policy "own progress: insert" on public.progress for insert with check (auth.uid() = user_id);
create policy "own progress: update" on public.progress for update using (auth.uid() = user_id);
create policy "officers read all"    on public.progress for select using (public.is_officer());
-- officers table has no policies, so nobody can read or edit it from the website.

-- Add officers (run separately, one per officer):
-- insert into public.officers (email) values ('blake.westin.2029@ndhs.org');

-- Dungeon leaderboard (run this part after the rest). Only a display name, best floor and level are stored here.
create table if not exists public.leaderboard (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  best_floor int not null default 0,
  game_level int not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.leaderboard enable row level security;
create policy "leaderboard: signed-in members read" on public.leaderboard for select to authenticated using (true);
create policy "leaderboard: insert own" on public.leaderboard for insert to authenticated with check (auth.uid() = user_id);
create policy "leaderboard: update own" on public.leaderboard for update to authenticated using (auth.uid() = user_id);


-- Officers' knights (run this part once). Only an officer's display name and equipped gear are stored here,
-- so the Members page can show each officer's real knight to everyone. Only officers can write to it.
create table if not exists public.looks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  equipped jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.looks enable row level security;
create policy "looks: anyone can read" on public.looks for select to anon, authenticated using (true);
create policy "looks: officers insert own" on public.looks for insert to authenticated with check (auth.uid() = user_id and public.is_officer());
create policy "looks: officers update own" on public.looks for update to authenticated using (auth.uid() = user_id and public.is_officer());
