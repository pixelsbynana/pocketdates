-- Pocket Dates — initial schema
-- Run via `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- couples (future-ready: lets two profiles later share one memory collection)
-- ---------------------------------------------------------------------------
create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.couples enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  partner_name text,
  avatar_url text,
  couple_since date,
  couple_id uuid references public.couples (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- user_preferences
-- ---------------------------------------------------------------------------
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  interests text[] not null default '{}',
  date_styles text[] not null default '{}',
  location_preference text check (location_preference in ('mostly_home', 'mostly_out', 'both')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "preferences are viewable by owner"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "preferences are insertable by owner"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "preferences are updatable by owner"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- activities — shared catalog of date ideas & places (not user-owned data)
-- ---------------------------------------------------------------------------
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  duration_category text not null check (duration_category in ('under_30', '1_2_hours', '3_plus_hours')),
  estimated_minutes integer not null,
  activity_type text not null,
  indoor_outdoor text not null check (indoor_outdoor in ('indoor', 'outdoor', 'either')),
  is_at_home boolean not null default false,
  is_seed boolean not null default false,
  interests text[] not null default '{}',
  date_styles text[] not null default '{}',
  latitude double precision,
  longitude double precision,
  place_name text,
  place_address text,
  external_place_id text unique,
  image_url text,
  created_at timestamptz not null default now()
);

-- Curated seed activities are deduplicated by title; real places (is_seed =
-- false) are deduplicated by external_place_id instead, so two different
-- real-world venues sharing a common name never collide.
create unique index if not exists activities_seed_title_idx
  on public.activities (title)
  where is_seed;

alter table public.activities enable row level security;

create policy "activities are viewable by everyone"
  on public.activities for select
  using (true);

create policy "authenticated users can add real places"
  on public.activities for insert
  to authenticated
  with check (true);

create policy "authenticated users can refresh real places"
  on public.activities for update
  to authenticated
  using (external_place_id is not null)
  with check (external_place_id is not null);

-- ---------------------------------------------------------------------------
-- memories
-- ---------------------------------------------------------------------------
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  couple_id uuid references public.couples (id) on delete set null,
  activity_id uuid references public.activities (id) on delete set null,
  title text not null,
  notes text not null default '',
  completed_at timestamptz not null default now(),
  latitude double precision,
  longitude double precision,
  place_name text,
  place_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memories_user_id_completed_at_idx
  on public.memories (user_id, completed_at desc);

alter table public.memories enable row level security;

create policy "memories are viewable by owner"
  on public.memories for select
  using (auth.uid() = user_id);

create policy "memories are insertable by owner"
  on public.memories for insert
  with check (auth.uid() = user_id);

create policy "memories are updatable by owner"
  on public.memories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "memories are deletable by owner"
  on public.memories for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- memory_photos
-- ---------------------------------------------------------------------------
create table if not exists public.memory_photos (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories (id) on delete cascade,
  storage_path text not null,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create index if not exists memory_photos_memory_id_idx
  on public.memory_photos (memory_id);

alter table public.memory_photos enable row level security;

create policy "memory photos are viewable by memory owner"
  on public.memory_photos for select
  using (
    exists (
      select 1 from public.memories m
      where m.id = memory_photos.memory_id and m.user_id = auth.uid()
    )
  );

create policy "memory photos are insertable by memory owner"
  on public.memory_photos for insert
  with check (
    exists (
      select 1 from public.memories m
      where m.id = memory_photos.memory_id and m.user_id = auth.uid()
    )
  );

create policy "memory photos are deletable by memory owner"
  on public.memory_photos for delete
  using (
    exists (
      select 1 from public.memories m
      where m.id = memory_photos.memory_id and m.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- favorites
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_id uuid not null references public.activities (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, activity_id)
);

alter table public.favorites enable row level security;

create policy "favorites are viewable by owner"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites are insertable by owner"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites are deletable by owner"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- couples RLS (members can view their own couple row once linked)
-- ---------------------------------------------------------------------------
create policy "couple is viewable by its members"
  on public.couples for select
  using (
    exists (
      select 1 from public.profiles p
      where p.couple_id = couples.id and p.id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

create trigger set_memories_updated_at
  before update on public.memories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- auto-create a profile row when a new auth user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name)
  values (new.id, new.raw_user_meta_data ->> 'first_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
