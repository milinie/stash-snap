-- ============================================================
-- Stash Snap — RLS/isolation hardening (run AFTER schema.sql)
-- Safe to re-run. Does not touch existing data.
-- ============================================================

-- Supabase's SQL Editor runs as a superuser, which can bypass the grants
-- the Table Editor UI normally sets up automatically. These make explicit
-- what "authenticated" is allowed to do — RLS policies still apply on top
-- of this, so a user can only ever touch their own rows.

grant select, insert, update, delete on public.fabrics to authenticated;
grant select, insert, update, delete on public.bundles to authenticated;
grant select on public.subscriptions to authenticated;

-- The identity column needs sequence usage granted too, or inserts as
-- "authenticated" can fail even with correct RLS.
grant usage, select on all sequences in schema public to authenticated;

-- Re-affirm RLS is on (no-op if already enabled).
alter table public.fabrics enable row level security;
alter table public.bundles enable row level security;
alter table public.subscriptions enable row level security;

-- Re-create policies idempotently, confirming isolation by user_id.
drop policy if exists "fabrics_select_own" on public.fabrics;
create policy "fabrics_select_own" on public.fabrics
  for select using (auth.uid() = user_id);

drop policy if exists "fabrics_insert_own" on public.fabrics;
create policy "fabrics_insert_own" on public.fabrics
  for insert with check (auth.uid() = user_id);

drop policy if exists "fabrics_update_own" on public.fabrics;
create policy "fabrics_update_own" on public.fabrics
  for update using (auth.uid() = user_id);

drop policy if exists "fabrics_delete_own" on public.fabrics;
create policy "fabrics_delete_own" on public.fabrics
  for delete using (auth.uid() = user_id);

drop policy if exists "bundles_select_own" on public.bundles;
create policy "bundles_select_own" on public.bundles
  for select using (auth.uid() = user_id);

drop policy if exists "bundles_insert_own" on public.bundles;
create policy "bundles_insert_own" on public.bundles
  for insert with check (auth.uid() = user_id);

drop policy if exists "bundles_update_own" on public.bundles;
create policy "bundles_update_own" on public.bundles
  for update using (auth.uid() = user_id);

drop policy if exists "bundles_delete_own" on public.bundles;
create policy "bundles_delete_own" on public.bundles
  for delete using (auth.uid() = user_id);

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ---------- Quick isolation self-check ----------
-- Run this as yourself (any authenticated session) after signing in from the
-- app at least once. It should return ONLY your own rows, never another
-- user's, and the count should match what the app shows you.
-- select id, user_id, name from public.fabrics order by created_at desc;
