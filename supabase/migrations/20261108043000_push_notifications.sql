-- Fase 5A.2: esquema Web Push; desplegar sólo después de aprobar el PR.
-- Sin extensiones cron/net ni trabajos activos: la activación está en supabase/operations.
begin;

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  endpoint text not null unique check (char_length(endpoint) between 20 and 2048 and endpoint ~ '^https://(fcm\\.googleapis\\.com|updates\\.push\\.services\\.mozilla\\.com|web\\.push\\.apple\\.com|webpush\\.push\\.apple\\.com)/.+'),
  p256dh text not null check (char_length(p256dh) between 60 and 200),
  auth_key text not null check (char_length(auth_key) between 16 and 100),
  device_label text not null default 'Dispositivo' check (char_length(btrim(device_label)) between 1 and 80),
  active boolean not null default true,
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  unique(id, user_id)
);
-- Enforcement in the database, not only the HTTP API, against excessive subscriptions.
create function public.limit_push_subscriptions() returns trigger
language plpgsql set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 5002));
  if new.active and (select count(*) from public.push_subscriptions
      where user_id=new.user_id and active and id<>new.id) >= 5 then
    raise exception 'maximum 5 active subscriptions' using errcode='23514';
  end if;
  return new;
end;
$$;
revoke all on function public.limit_push_subscriptions() from public, anon, authenticated;
create trigger limit_push_subscriptions before insert or update of active,user_id on public.push_subscriptions
  for each row execute function public.limit_push_subscriptions();
create index push_subscriptions_user_active_idx on public.push_subscriptions(user_id, active);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from public, anon, authenticated;
grant select, insert, update, delete on public.push_subscriptions to authenticated;
create policy push_owner_select on public.push_subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);
create policy push_owner_insert on public.push_subscriptions for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy push_owner_update on public.push_subscriptions for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy push_owner_delete on public.push_subscriptions for delete to authenticated
  using ((select auth.uid()) = user_id);
create trigger set_updated_at before update on public.push_subscriptions
  for each row execute function public.set_updated_at();

create schema if not exists push_private;
revoke all on schema push_private from public, anon, authenticated;
grant usage on schema push_private to service_role;

create table push_private.deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_id uuid not null references public.reminders(id) on delete cascade,
  subscription_id uuid not null references public.push_subscriptions(id) on delete cascade,
  scheduled_at timestamptz not null,
  state text not null default 'queued' check(state in ('queued','sending','sent','failed','gone')),
  attempts smallint not null default 0 check(attempts between 0 and 3),
  next_attempt_at timestamptz not null default clock_timestamp(),
  lease_token uuid,
  lease_until timestamptz,
  sent_at timestamptz,
  updated_at timestamptz not null default clock_timestamp(),
  created_at timestamptz not null default clock_timestamp(),
  unique(reminder_id, subscription_id, scheduled_at)
);
create index push_deliveries_dispatch_idx on push_private.deliveries(state,next_attempt_at,scheduled_at)
  where state in ('queued','sending');
alter table push_private.deliveries enable row level security;
revoke all on push_private.deliveries from public, anon, authenticated;
grant select, insert, update, delete on push_private.deliveries to service_role;

-- API privada del worker: SECURITY DEFINER sólo porque el esquema de cola no es público.
-- NUNCA otorgar EXECUTE a anon / authenticated / PUBLIC.
create function public.claim_push_deliveries(p_limit integer default 25)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare claimed jsonb;
begin
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
revoke all on function public.claim_push_deliveries(integer) from public, anon, authenticated;
grant execute on function public.claim_push_deliveries(integer) to service_role;

create function public.finish_push_delivery(p_id uuid,p_token uuid,p_outcome text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare rec push_private.deliveries%rowtype;
begin
  if p_outcome not in ('sent','gone','retry') or p_outcome is null then
    raise exception 'invalid outcome' using errcode='22023';
  end if;
  update push_private.deliveries
     set state=case
       when p_outcome='sent' then 'sent'
       when p_outcome='gone' then 'gone'
       when attempts>=3 then 'failed'
       else 'queued' end,
         sent_at=case when p_outcome='sent' then clock_timestamp() else null end,
         next_attempt_at=case when p_outcome='retry' then
           clock_timestamp()+make_interval(mins=>least(15,attempts*2))
           else next_attempt_at end,
         lease_token=null,lease_until=null,updated_at=clock_timestamp()
   where id=p_id and lease_token=p_token and state='sending'
   returning * into rec;
  if not found then return false; end if;
  if p_outcome='gone' then
    update public.push_subscriptions set active=false
     where id=rec.subscription_id and user_id=rec.user_id;
  end if;
  return true;
end;
$$;
revoke all on function public.finish_push_delivery(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.finish_push_delivery(uuid,uuid,text) to service_role;
commit;
