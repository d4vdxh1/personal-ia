-- 5B.2: selective, per-reminder Google Calendar export; no automatic write/sync.
begin;
alter table public.google_calendar_connections
  add column can_write boolean not null default false;

create table public.google_calendar_event_links (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 reminder_id uuid not null references public.reminders(id) on delete cascade,
 google_event_id text not null check (char_length(google_event_id) between 5 and 120),
 created_at timestamptz not null default now(),
 primary key(user_id,reminder_id),
 unique(user_id,google_event_id)
);
create index google_event_links_reminder_idx on public.google_calendar_event_links(reminder_id);
alter table public.google_calendar_event_links enable row level security;
revoke all on public.google_calendar_event_links from public,anon,authenticated;
grant select,insert on public.google_calendar_event_links to authenticated;
create policy calendar_link_select on public.google_calendar_event_links
 for select to authenticated using ((select auth.uid())=user_id);
create policy calendar_link_insert on public.google_calendar_event_links
 for insert to authenticated with check (
  user_id=(select auth.uid()) and exists (
   select 1 from public.reminders r where r.id=reminder_id and r.user_id=(select auth.uid())
  )
 );
commit;
