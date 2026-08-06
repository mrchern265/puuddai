-- =============================================================================
-- 0008_username_auth.sql — let people register + sign in with a USERNAME
-- -----------------------------------------------------------------------------
-- Supabase Auth signs in with an email, not a username. So we:
--   1. store a unique `username` on each profile, and
--   2. expose a tiny lookup that turns a username into its account email,
--      so the login screen can resolve username -> email before signing in.
--
-- The real email is still kept on auth.users (used for password recovery), and
-- is also collected at signup. Run this once in the Supabase SQL Editor.
-- Safe to re-run.
-- =============================================================================

-- 1. username column on profiles (case-insensitive unique, NULL allowed for
--    any pre-existing rows that don't have one yet).
alter table public.profiles add column if not exists username text;

create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username))
  where username is not null;

-- 2. username -> email lookup. Runs BEFORE the user is authenticated (on the
--    login screen), so it must be callable by anon. SECURITY DEFINER lets it
--    read auth.users; it only ever returns the single matching email.
create or replace function public.email_for_username(uname text)
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(p.username) = lower(trim(uname))
  limit 1;
$$;

revoke all on function public.email_for_username(text) from public;
grant execute on function public.email_for_username(text) to anon, authenticated;
