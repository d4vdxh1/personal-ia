-- Phase 5B: encrypted OAuth refresh tokens, owned by the authenticated account.
-- Do not apply in production until tests pass and merge is approved.
begin;
create table public.google_calendar_connections(
 user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
 refresh_token_encrypted text not null check(char_length(refresh_token_encrypted) between 32 and 4096),
 calendar_id text not null default 'primary' check(char_length(calendar_id) between 1 and 255),
 connected_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.google_calendar_connections enable row level security;
revoke all on public.google_calendar_connections from public,anon,authenticated;
grant select,insert,update,delete on public.google_calendar_connections to authenticated;
create policy calendar_owner_select on public.google_calendar_connections for select to authenticated
 using ((select auth.uid())=user_id);
create policy calendar_owner_insert on public.google_calendar_connections for insert to authenticated
 with check ((select auth.uid())=user_id);
create policy calendar_owner_update on public.google_calendar_connections for update to authenticated
 using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy calendar_owner_delete on public.google_calendar_connections for delete to authenticated
 using ((select auth.uid())=user_id);
create trigger calendar_updated_at before update on public.google_calendar_connections
 for each row execute function public.set_updated_at();
commit;
