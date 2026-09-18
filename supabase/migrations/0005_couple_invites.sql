-- Pocket Dates — partner pairing.
-- Lets a user invite their real-life partner (a second, separate account)
-- to share the same memories/calendar/photos. Finishes the "future-ready"
-- scaffolding already present since 0001 (public.couples,
-- profiles.couple_id, memories.couple_id existed but were never wired up
-- to any RLS policy, query, or UI).

-- ---------------------------------------------------------------------------
-- helper: current caller's couple_id. security definer so it reads
-- profiles bypassing RLS internally — reused by every couple-aware policy
-- below instead of repeating the same correlated subquery six times, and
-- avoids any risk of the new couple-partner profiles policy recursing
-- into itself.
-- ---------------------------------------------------------------------------
create or replace function public.current_couple_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select couple_id from public.profiles where id = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- couples: add creator column + the INSERT policy that's been missing
-- since 0001. No INSERT policy ever existed, so no *app* code could ever
-- have created a row here — but RLS doesn't restrict the table owner, so
-- a stray row from manual testing via the SQL/table editor is possible.
-- Clear any such orphans before enforcing NOT NULL, so this step can't
-- fail on a database that isn't perfectly pristine.
-- ---------------------------------------------------------------------------
alter table public.couples
  add column if not exists created_by uuid references auth.users (id) on delete cascade;

delete from public.couples where created_by is null;

alter table public.couples
  alter column created_by set not null;

drop policy if exists "couples are insertable by their creator" on public.couples;
create policy "couples are insertable by their creator"
  on public.couples for insert
  with check (created_by = auth.uid());

-- The original 0001 select policy only let a couple's members see it once
-- profiles.couple_id already pointed to it — but createCoupleInvite()
-- does `insert(...).select("id")`, which Postgres compiles as
-- INSERT ... RETURNING id, and RETURNING a row requires it to *also*
-- satisfy the table's SELECT policy. At the moment of creating a brand
-- new couple, no profile points to it yet (that happens in the very next
-- step), so the old policy blocked the RETURNING — reported as the same
-- generic "violates row-level security policy" error regardless of what
-- the INSERT policy said. Letting the creator see their own new row fixes
-- this without weakening anything (they're the one who just made it).
drop policy if exists "couple is viewable by its members" on public.couples;
create policy "couple is viewable by its members"
  on public.couples for select
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.couple_id = couples.id and p.id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- couple_invites
-- ---------------------------------------------------------------------------
create table if not exists public.couple_invites (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_by uuid references auth.users (id) on delete set null,
  accepted_at timestamptz
);

create index if not exists couple_invites_couple_id_idx
  on public.couple_invites (couple_id);

alter table public.couple_invites enable row level security;

-- Only the creator can list/manage their own invites. The invitee is
-- deliberately NOT granted select here — the pre-auth landing page reads
-- invite state via the service-role client instead (services/couple.ts),
-- so this policy can stay tight.
drop policy if exists "couple invites are viewable by their creator" on public.couple_invites;
create policy "couple invites are viewable by their creator"
  on public.couple_invites for select
  using (created_by = auth.uid());

drop policy if exists "couple invites are insertable by the couple's own member" on public.couple_invites;
create policy "couple invites are insertable by the couple's own member"
  on public.couple_invites for insert
  with check (
    created_by = auth.uid()
    and couple_id = public.current_couple_id()
  );

drop policy if exists "couple invites are updatable by their creator" on public.couple_invites;
create policy "couple invites are updatable by their creator"
  on public.couple_invites for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

-- ---------------------------------------------------------------------------
-- profiles: let a paired partner read the other's profile row.
-- ---------------------------------------------------------------------------
drop policy if exists "profiles are viewable by couple partner" on public.profiles;
create policy "profiles are viewable by couple partner"
  on public.profiles for select
  using (
    couple_id is not null
    and couple_id = public.current_couple_id()
  );

-- ---------------------------------------------------------------------------
-- memories: owner-only -> owner-or-couple-partner.
-- ---------------------------------------------------------------------------
drop policy if exists "memories are viewable by owner" on public.memories;
drop policy if exists "memories are viewable by owner or partner" on public.memories;
create policy "memories are viewable by owner or partner"
  on public.memories for select
  using (
    auth.uid() = user_id
    or (couple_id is not null and couple_id = public.current_couple_id())
  );

drop policy if exists "memories are insertable by owner" on public.memories;
create policy "memories are insertable by owner"
  on public.memories for insert
  with check (
    auth.uid() = user_id
    and (couple_id is null or couple_id = public.current_couple_id())
  );

drop policy if exists "memories are updatable by owner" on public.memories;
drop policy if exists "memories are updatable by owner or partner" on public.memories;
create policy "memories are updatable by owner or partner"
  on public.memories for update
  using (
    auth.uid() = user_id
    or (couple_id is not null and couple_id = public.current_couple_id())
  )
  with check (
    auth.uid() = user_id
    or (couple_id is not null and couple_id = public.current_couple_id())
  );

drop policy if exists "memories are deletable by owner" on public.memories;
drop policy if exists "memories are deletable by owner or partner" on public.memories;
create policy "memories are deletable by owner or partner"
  on public.memories for delete
  using (
    auth.uid() = user_id
    or (couple_id is not null and couple_id = public.current_couple_id())
  );

create index if not exists memories_couple_id_completed_at_idx
  on public.memories (couple_id, completed_at desc)
  where couple_id is not null;

-- ---------------------------------------------------------------------------
-- memory_photos: same owner-or-partner widening, via the parent memory.
-- ---------------------------------------------------------------------------
drop policy if exists "memory photos are viewable by memory owner" on public.memory_photos;
drop policy if exists "memory photos are viewable by memory owner or partner" on public.memory_photos;
create policy "memory photos are viewable by memory owner or partner"
  on public.memory_photos for select
  using (
    exists (
      select 1 from public.memories m
      where m.id = memory_photos.memory_id
        and (
          m.user_id = auth.uid()
          or (m.couple_id is not null and m.couple_id = public.current_couple_id())
        )
    )
  );

drop policy if exists "memory photos are insertable by memory owner" on public.memory_photos;
drop policy if exists "memory photos are insertable by memory owner or partner" on public.memory_photos;
create policy "memory photos are insertable by memory owner or partner"
  on public.memory_photos for insert
  with check (
    exists (
      select 1 from public.memories m
      where m.id = memory_photos.memory_id
        and (
          m.user_id = auth.uid()
          or (m.couple_id is not null and m.couple_id = public.current_couple_id())
        )
    )
  );

drop policy if exists "memory photos are deletable by memory owner" on public.memory_photos;
drop policy if exists "memory photos are deletable by memory owner or partner" on public.memory_photos;
create policy "memory photos are deletable by memory owner or partner"
  on public.memory_photos for delete
  using (
    exists (
      select 1 from public.memories m
      where m.id = memory_photos.memory_id
        and (
          m.user_id = auth.uid()
          or (m.couple_id is not null and m.couple_id = public.current_couple_id())
        )
    )
  );

-- ---------------------------------------------------------------------------
-- storage.objects (memory-photos bucket): DELETE needs widening so a
-- partner can clean up a photo that lives in the other partner's folder
-- on a now-shared memory. INSERT/UPDATE need no change — uploads always
-- land in the uploader's OWN folder (see lib/photo-upload.ts), so the
-- existing own-folder check already permits partner uploads. This is
-- purely additive: the original owner-only delete policy from
-- 0002_storage.sql stays in place alongside this one.
-- ---------------------------------------------------------------------------
drop policy if exists "couple members can delete partner's memory photos" on storage.objects;
create policy "couple members can delete partner's memory photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'memory-photos'
    and exists (
      select 1 from public.profiles owner
      where owner.id::text = (storage.foldername(name))[1]
        and owner.couple_id is not null
        and owner.couple_id = public.current_couple_id()
    )
  );
