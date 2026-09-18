-- Storage bucket for memory photos.
-- Files are stored at: {user_id}/{memory_id}/{filename}
-- so policies can check ownership from the path alone.

insert into storage.buckets (id, name, public)
values ('memory-photos', 'memory-photos', true)
on conflict (id) do nothing;

create policy "memory photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'memory-photos');

create policy "users can upload their own memory photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can update their own memory photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can delete their own memory photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
