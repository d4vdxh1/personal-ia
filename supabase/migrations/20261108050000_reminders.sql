-- Phase 5A.1: manual reminder planning only.
-- This schema does NOT send messages or notifications. Do not run remotely before approval.
begin;
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check(char_length(btrim(title)) between 1 and 200),
  notes text not null default '' check(char_length(notes) <= 1000),
  scheduled_at timestamptz not null,
  status text not null default 'pending' check(status in ('pending','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reminders_user_status_date on public.reminders(user_id,status,scheduled_at,id);
alter table public.reminders enable row level security;
revoke all on public.reminders from public, anon, authenticated;
grant select, insert, update, delete on public.reminders to authenticated;
create policy owner_select on public.reminders for select to authenticated
  using((select auth.uid())=user_id);
create policy owner_insert on public.reminders for insert to authenticated
  with check((select auth.uid())=user_id);
create policy owner_update on public.reminders for update to authenticated
  using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy owner_delete on public.reminders for delete to authenticated
  using((select auth.uid())=user_id);
create trigger set_updated_at before update on public.reminders
  for each row execute function public.set_updated_at();
commit;
