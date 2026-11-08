-- Fase 5A.3: recurrent reminders. Safe incremental migration; no destructive data changes.
begin;
create table public.reminder_series (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 title text not null check(char_length(btrim(title)) between 1 and 200),
 notes text not null default '' check(char_length(notes)<=1000),
 frequency text not null check(frequency in ('daily','weekly','monthly')),
 weekdays integer[] not null default '{}'::integer[],
 month_day smallint,
 local_time time(0) not null,
 timezone text not null default 'America/Asuncion'
   check(timezone in ('America/Asuncion','America/Argentina/Buenos_Aires','UTC')),
 starts_on date not null,
 until_on date,
 active boolean not null default true,
 created_at timestamptz not null default clock_timestamp(),
 updated_at timestamptz not null default clock_timestamp(),
 unique(id,user_id),
 constraint series_rule check(
   (frequency='weekly' and cardinality(weekdays) between 1 and 7 and
    weekdays <@ array[0,1,2,3,4,5,6]::integer[] and month_day is null)
   or (frequency='daily' and cardinality(weekdays)=0 and month_day is null)
   or (frequency='monthly' and cardinality(weekdays)=0 and month_day between 1 and 31)
 ),
 constraint series_period check(until_on is null or until_on>=starts_on)
);
create index reminder_series_active_idx on public.reminder_series(user_id,active);
alter table public.reminder_series enable row level security;
revoke all on public.reminder_series from public,anon,authenticated;
grant select,insert,update,delete on public.reminder_series to authenticated;
create policy series_select on public.reminder_series for select to authenticated
 using ((select auth.uid())=user_id);
create policy series_insert on public.reminder_series for insert to authenticated
 with check ((select auth.uid())=user_id);
create policy series_update on public.reminder_series for update to authenticated
 using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy series_delete on public.reminder_series for delete to authenticated
 using ((select auth.uid())=user_id);
create trigger series_updated_at before update on public.reminder_series
 for each row execute function public.set_updated_at();

create function public.limit_active_reminder_series() returns trigger
language plpgsql set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(new.user_id::text,5503));
 if new.active and (select count(*) from public.reminder_series
   where user_id=new.user_id and active and id<>new.id)>=30 then
   raise exception 'maximum 30 active series' using errcode='23514';
 end if;
 return new;
end;
$$;
revoke all on function public.limit_active_reminder_series() from public,anon,authenticated;
create trigger limit_reminder_series before insert or update of active,user_id
 on public.reminder_series for each row execute function public.limit_active_reminder_series();

alter table public.reminders
 add column series_id uuid,
 add column occurrence_date date,
 add column rebuild_needed boolean not null default false,
 add constraint reminders_series_pair check (
    (series_id is null and occurrence_date is null)
     or (series_id is not null and occurrence_date is not null)),
 add constraint reminders_series_owner_fk foreign key(series_id,user_id)
   references public.reminder_series(id,user_id) on delete restrict,
 add constraint reminders_series_occurrence_unique unique(series_id,occurrence_date);
create index reminders_series_idx on public.reminders(series_id,scheduled_at);
-- Pausing or editing a series cancels only FUTURE generated occurrences.
-- User-cancelled individual occurrences remain cancelled on subsequent materialization.
create function public.invalidate_future_reminder_occurrences()
returns trigger language plpgsql set search_path='' as $$
begin
 if row(new.title,new.notes,new.frequency,new.weekdays,new.month_day,new.local_time,new.timezone,new.starts_on,new.until_on,new.active)
    is distinct from
    row(old.title,old.notes,old.frequency,old.weekdays,old.month_day,old.local_time,old.timezone,old.starts_on,old.until_on,old.active) then
   update public.reminders set status='cancelled',rebuild_needed=true
   where series_id=new.id and user_id=new.user_id and status='pending'
     and scheduled_at>clock_timestamp();
 end if;
 return new;
end;
$$;
revoke all on function public.invalidate_future_reminder_occurrences() from public,anon,authenticated;
create trigger invalidate_series_occurrences after update on public.reminder_series
 for each row execute function public.invalidate_future_reminder_occurrences();

-- Private, deterministic materializer called by the existing claim RPC, with no new cron job.
-- Skip impossible local times on DST jumps. For missing 29/30/31 in a month, skip that month.
create function public.materialize_recurring_reminders(p_days integer default 14)
returns integer language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 if p_days is null or p_days not between 1 and 31 then
   raise exception 'invalid horizon' using errcode='22023';
 end if;
 with candidates as (
   select s.id as series_id,s.user_id,s.title,s.notes,d.day::date as occurrence_date,
    t.instant as scheduled_at
   from public.reminder_series s
   cross join lateral generate_series(
     (clock_timestamp() at time zone s.timezone)::date,
     (clock_timestamp() at time zone s.timezone)::date+p_days,
     interval '1 day') as d(day)
   cross join lateral (
      select make_timestamptz(
        extract(year from d.day)::int,extract(month from d.day)::int,extract(day from d.day)::int,
        extract(hour from s.local_time)::int,extract(minute from s.local_time)::int,0,s.timezone
      ) as instant
   ) t
   where s.active and d.day::date>=s.starts_on
    and (s.until_on is null or d.day::date<=s.until_on)
    and (
      s.frequency='daily'
      or (s.frequency='weekly' and extract(dow from d.day)::int=any(s.weekdays))
      or (s.frequency='monthly' and extract(day from d.day)::int=s.month_day)
    )
    and (t.instant at time zone s.timezone)::time(0)=s.local_time
    and t.instant>=clock_timestamp()-interval '2 minutes'
 )
 insert into public.reminders(user_id,series_id,occurrence_date,title,notes,scheduled_at,status,rebuild_needed)
 select user_id,series_id,occurrence_date,title,notes,scheduled_at,'pending',false
 from candidates
 on conflict (series_id,occurrence_date) do update
   set title=excluded.title,notes=excluded.notes,scheduled_at=excluded.scheduled_at,
       status='pending',rebuild_needed=false
   where public.reminders.status='cancelled'
     and public.reminders.rebuild_needed
     and public.reminders.scheduled_at>clock_timestamp()
     and not exists(select 1 from push_private.deliveries d
        where d.reminder_id=public.reminders.id and d.state in ('sent','sending'))
 ;
 get diagnostics n=row_count;
 return n;
end;
$$;
revoke all on function public.materialize_recurring_reminders(integer)
 from public,anon,authenticated;
grant execute on function public.materialize_recurring_reminders(integer) to service_role;

-- Preserve claim/lease/dedup semantics; prepend recurrence generation.
create or replace function public.claim_push_deliveries(p_limit integer default 25)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare claimed jsonb;
begin
  perform public.materialize_recurring_reminders(14);
  if p_limit is null or p_limit not between 1 and 50 then
    raise exception 'invalid batch size' using errcode='22023';
  end if;
  -- La ventana de 24 h evita envíos sorpresivos de recordatorios antiguos.
  insert into push_private.deliveries(user_id,reminder_id,subscription_id,scheduled_at)
  select r.user_id,r.id,s.id,r.scheduled_at
    from public.reminders r
    join public.push_subscriptions s on s.user_id=r.user_id and s.active
   where r.status='pending'
     and r.scheduled_at between clock_timestamp()-interval '24 hours' and clock_timestamp()
  on conflict (reminder_id,subscription_id,scheduled_at) do nothing;

  with eligible as (
    select d.id from push_private.deliveries d
    join public.reminders r on r.id=d.reminder_id and r.user_id=d.user_id
       and r.status='pending' and r.scheduled_at=d.scheduled_at
    join public.push_subscriptions s on s.id=d.subscription_id and s.user_id=d.user_id and s.active
    where d.attempts < 3 and
      ((d.state='queued' and d.next_attempt_at <= clock_timestamp()) or
       (d.state='sending' and d.lease_until < clock_timestamp()))
    order by d.scheduled_at,d.id
    limit p_limit for update of d skip locked
  ), claimed_rows as (
    update push_private.deliveries d
       set state='sending', attempts=d.attempts+1,
           lease_token=gen_random_uuid(),
           lease_until=clock_timestamp()+interval '3 minutes',
           updated_at=clock_timestamp()
      from eligible e where d.id=e.id
    returning d.id,d.reminder_id,d.subscription_id,d.lease_token
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',d.id,'lease_token',d.lease_token,'reminder_id',r.id,
    'title',r.title,'endpoint',s.endpoint,
    'keys',jsonb_build_object('p256dh',s.p256dh,'auth',s.auth_key)
  )), '[]'::jsonb) into claimed
    from claimed_rows d
    join public.reminders r on r.id=d.reminder_id
    join public.push_subscriptions s on s.id=d.subscription_id;
  return claimed;
end;
$$;

-- Existing EXECUTE grant to service_role remains, function OID unchanged by CREATE OR REPLACE.
commit;
