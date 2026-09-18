-- Pocket Dates — remove the "where do you like spending time" onboarding
-- question and its stored preference; no longer collected or used.

alter table public.user_preferences drop column if exists location_preference;
