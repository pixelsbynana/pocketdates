-- Adds a per-activity emoji, used in place of stock photography on the
-- curated seed date ideas (real Google Places results keep their real
-- photos and simply leave this null).

alter table public.activities
  add column if not exists emoji text;
