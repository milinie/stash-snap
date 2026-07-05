-- ============================================================
-- Stash Snap — Supabase schema (CORRECTED, idempotent/safe to re-run)
-- Run this in Supabase SQL Editor (project: "stash snap")
--
-- Fix applied: storage.objects has NO "user_id" column (only bucket_id,
-- name, owner, etc). This version never references it. It also uses
-- "add column if not exists" defensively, so if fabrics/bundles were
-- partially created by an earlier run, missing columns get added
-- instead of silently causing later statements to fail.
-- ============================================================

-- ---------- FABRICS ----------
create table if not exists public.fabrics (
  id bigint generated always as identity primary key
);

alter table public.fabrics add column if not exists user_id      uuid references auth.users(id) on delete cascade;
alter table public.fabrics add column if not exists client_id    bigint;
alter table public.fabrics add column if not exists name         text;
alter table public.fabrics add column if not exists color        text;
alter table public.fabrics add column if not exists style        text;
alter table public.fabrics add column if not exists fabric_type  text;
alter table public.fabrics add column if not exists piece_count  text;
alter table public.fabrics add column if not exists piece_size   text;
alter table public.fabrics add column if not exists yardage      numeric default 0;
alter table public.fabrics add column if not exists collection   text;
alter table public.fabrics add column if not exists notes        text;
alter table public.fabrics add column if not exists photo_url          text;
alter table public.fabrics add column if not exists photo_storage_path text;
alter table public.fabrics add column if not exists fabric_date  text;
alter table public.fabrics add column if not exists created_at   timestamptz not null default now();
alter table public.fabrics add column if not exists updated_at   timestamptz not null default now();

-- name is required going forward; safe to enforce even if some old rows exist
-- (skip this line if you already have rows with a null name and want to fix them first)
alter table public.fabrics alter column name set not null;

create index if not exists fabrics_user_id_idx on public.fabrics(user_id);

alter table public.fabrics enable row level security;

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

-- ---------- BUNDLES ----------
create table if not exists public.bundles (
  id bigint generated always as identity primary key
);

alter table public.bundles add column if not exists user_id    uuid references auth.users(id) on delete cascade;
alter table public.bundles add column if not exists client_id  bigint;
alter table public.bundles add column if not exists name       text;
alter table public.bundles add column if not exists fabric_ids bigint[] not null default '{}';
alter table public.bundles add column if not exists created_at timestamptz not null default now();
alter table public.bundles add column if not exists updated_at timestamptz not null default now();

alter table public.bundles alter column name set not null;

create index if not exists bundles_user_id_idx on public.bundles(user_id);

alter table public.bundles enable row level security;

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

-- ---------- SUBSCRIPTIONS ----------
-- One row per user. Written only by the Stripe webhook (service role), read by the client.
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.subscriptions add column if not exists stripe_customer_id     text;
alter table public.subscriptions add column if not exists stripe_subscription_id text;
alter table public.subscriptions add column if not exists price_id               text;
alter table public.subscriptions add column if not exists status                 text not null default 'none';
  -- one of: none | trialing | active | past_due | canceled | incomplete
alter table public.subscriptions add column if not exists cancel_at_period_end   boolean not null default false;
alter table public.subscriptions add column if not exists current_period_end     timestamptz;
alter table public.subscriptions add column if not exists updated_at             timestamptz not null default now();

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- No insert/update/delete policy for regular users — only the webhook
-- (using the service_role key, which bypasses RLS) writes to this table.

-- ---------- updated_at triggers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists fabrics_set_updated_at on public.fabrics;
create trigger fabrics_set_updated_at before update on public.fabrics
  for each row execute function public.set_updated_at();

drop trigger if exists bundles_set_updated_at on public.bundles;
create trigger bundles_set_updated_at before update on public.bundles
  for each row execute function public.set_updated_at();

-- ============================================================
-- STORAGE — run after creating the "fabric-photos" bucket in
-- Supabase Dashboard > Storage (Private bucket)
--
-- IMPORTANT: storage.objects does NOT have a user_id column.
-- These policies key off the file path instead: files are stored at
-- {user_id}/{fabric_id}-{timestamp}.jpg, and storage.foldername(name)
-- splits that path so [1] is the user_id segment, compared against
-- auth.uid(). No user_id column reference anywhere below.
-- ============================================================

drop policy if exists "fabric_photos_select_own" on storage.objects;
create policy "fabric_photos_select_own"
on storage.objects for select
using (
  bucket_id = 'fabric-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "fabric_photos_insert_own" on storage.objects;
create policy "fabric_photos_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'fabric-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "fabric_photos_update_own" on storage.objects;
create policy "fabric_photos_update_own"
on storage.objects for update
using (
  bucket_id = 'fabric-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "fabric_photos_delete_own" on storage.objects;
create policy "fabric_photos_delete_own"
on storage.objects for delete
using (
  bucket_id = 'fabric-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
