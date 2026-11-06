-- Phase 4A: authenticated and durable per-user Gemini request budget.
-- This intentionally stores only counters and timestamps; never prompt content.
create table public.ai_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null,
  request_count integer not null default 0 check (request_count between 0 and 20),
  last_request_at timestamptz,
  primary key (user_id, usage_day)
);
alter table public.ai_daily_usage enable row level security;
revoke all on table public.ai_daily_usage from public, anon, authenticated;
-- Not exposed via Data API. Only the authenticated RPC below may change counters.

create function public.reserve_ai_request()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_day date := (now() at time zone 'America/Asuncion')::date;
  v_count integer;
begin
  if v_user is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  -- Serialize reservations for one account, including concurrent browser tabs.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user::text, 145217));
  insert into public.ai_daily_usage (user_id,usage_day,request_count,last_request_at)
  values (v_user,v_day,1,now())
  on conflict (user_id,usage_day) do update
    set request_count = public.ai_daily_usage.request_count + 1,
        last_request_at = now()
  where public.ai_daily_usage.request_count < 20
    and (public.ai_daily_usage.last_request_at is null
      or public.ai_daily_usage.last_request_at <= now() - interval '5 seconds')
  returning request_count into v_count;

  if v_count is null then
    return pg_catalog.jsonb_build_object('allowed',false,'remaining',0);
  end if;
  return pg_catalog.jsonb_build_object('allowed',true,'remaining',20 - v_count);
end;
$$;
revoke all on function public.reserve_ai_request() from public, anon, authenticated;
grant execute on function public.reserve_ai_request() to authenticated;
