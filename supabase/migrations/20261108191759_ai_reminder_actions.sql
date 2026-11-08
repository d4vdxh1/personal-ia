-- Fase 5C: Gemini may PROPOSE reminders. Only an explicit user decision writes data.
-- Requires 5A.3 reminder series. Incremental, no deletes or changes to existing records.
begin;
create function assistant_private.valid_reminder_values(v jsonb)
returns boolean language plpgsql immutable security invoker set search_path='' as $$
declare
  k text; d date; until_d date; f text; w jsonb; day text;
begin
  if v is null or jsonb_typeof(v)<>'object' then return false; end if;
  if not (v ?& array['title','time','frequency']) then return false; end if;
  for k in select jsonb_object_keys(v) loop
    if k not in ('title','date','time','frequency','weekdays','until_on') then return false; end if;
  end loop;
  if jsonb_typeof(v->'title')<>'string' or char_length(btrim(v->>'title')) not between 1 and 200
    or jsonb_typeof(v->'time')<>'string'
    or (v->>'time') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    or jsonb_typeof(v->'frequency')<>'string' then return false; end if;
  f:=v->>'frequency';
  if f not in ('once','daily','weekly','monthly') then return false; end if;
  if v ? 'date' then
    if jsonb_typeof(v->'date')<>'string' or (v->>'date') !~ '^\d{4}-\d{2}-\d{2}$' then return false; end if;
    d:=(v->>'date')::date;
    if to_char(d,'YYYY-MM-DD')<>v->>'date' then return false; end if;
  elsif f='once' then return false; end if;
  if v ? 'until_on' then
    if jsonb_typeof(v->'until_on')<>'string'
      or (v->>'until_on') !~ '^\d{4}-\d{2}-\d{2}$' then return false; end if;
    until_d:=(v->>'until_on')::date;
    if to_char(until_d,'YYYY-MM-DD')<>v->>'until_on' or f='once' then return false; end if;
  end if;
  if v ? 'weekdays' then
    w:=v->'weekdays';
    if jsonb_typeof(w)<>'array' or jsonb_array_length(w)>7 then return false; end if;
    for day in select value from jsonb_array_elements_text(w) loop
      if day !~ '^[0-6]$' then return false; end if;
    end loop;
    if (select count(distinct value) from jsonb_array_elements_text(w))<>jsonb_array_length(w) then return false; end if;
  else w:='[]'::jsonb; end if;
  if f='weekly' then
    if jsonb_array_length(w)=0 then return false; end if;
  elsif jsonb_array_length(w)<>0 then return false; end if;
  return true;
exception when others then return false;
end;
$$;
revoke all on function assistant_private.valid_reminder_values(jsonb) from public,anon,authenticated;
grant execute on function assistant_private.valid_reminder_values(jsonb) to authenticated;

create table assistant_private.reminder_actions(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  entry_date date not null,
  proposed_values jsonb,
  target_id uuid,
  target_kind text check(target_kind in ('once','series')),
  created_at timestamptz not null default clock_timestamp(),
  decision text check(decision in ('confirm','cancel')),
  result text not null default 'pending'
    check(result in ('pending','confirmed','cancelled','expired','stale','failed')),
  decided_at timestamptz,
  constraint valid_pending_reminder check(
    (result='pending' and decision is null and decided_at is null and proposed_values is not null
      and assistant_private.valid_reminder_values(proposed_values))
    or (result<>'pending' and decision is not null and decided_at is not null and proposed_values is null)
  )
);
create index reminder_actions_owner_day_idx on assistant_private.reminder_actions(user_id,entry_date);
alter table assistant_private.reminder_actions enable row level security;
revoke all on assistant_private.reminder_actions from public,anon,authenticated;
grant select,insert(entry_date,proposed_values),update(decision) on assistant_private.reminder_actions to authenticated;
create policy owner_read on assistant_private.reminder_actions for select to authenticated
  using(user_id=(select auth.uid()));
create policy owner_propose on assistant_private.reminder_actions for insert to authenticated
  with check(user_id=(select auth.uid())
    and entry_date=(clock_timestamp() at time zone 'America/Asuncion')::date);
create policy owner_decide on assistant_private.reminder_actions for update to authenticated
  using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

create function public.propose_ai_reminder(p_values jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
  owner_id uuid:=auth.uid();today date:=(clock_timestamp() at time zone 'America/Asuncion')::date;
  local_date date; local_clock time; until_date date; f text; instant timestamptz;
  proposal_id uuid; normalized jsonb;
begin
  if owner_id is null then raise insufficient_privilege; end if;
  if not assistant_private.valid_reminder_values(p_values) then
    return jsonb_build_object('status','invalid'); end if;
  f:=p_values->>'frequency';
  local_date:=coalesce((p_values->>'date')::date,today);
  local_clock:=(p_values->>'time')::time;
  until_date:=(p_values->>'until_on')::date;
  if local_date<today or local_date>today+365
    or (until_date is not null and (until_date<local_date or until_date>today+730)) then
    return jsonb_build_object('status','invalid'); end if;
  instant:=make_timestamptz(
    extract(year from local_date)::int,extract(month from local_date)::int,
    extract(day from local_date)::int,extract(hour from local_clock)::int,
    extract(minute from local_clock)::int,0,'America/Asuncion');
  if (instant at time zone 'America/Asuncion')::date<>local_date
     or (instant at time zone 'America/Asuncion')::time(0)<>local_clock
     or (f='once' and instant<=clock_timestamp()+interval '1 minute') then
    return jsonb_build_object('status','invalid'); end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text,5606));
  if(select count(*) from assistant_private.reminder_actions where user_id=owner_id and entry_date=today)>=20 then
    return jsonb_build_object('status','limited'); end if;
  normalized:=p_values||jsonb_build_object('date',local_date);
  insert into assistant_private.reminder_actions(entry_date,proposed_values)
    values(today,normalized) returning id into proposal_id;
  return jsonb_build_object('status','pending','kind','reminder','id',proposal_id,
    'title',normalized->>'title','date',local_date,'time',normalized->>'time',
    'frequency',f,'weekdays',coalesce(normalized->'weekdays','[]'::jsonb),
    'until_on',normalized->>'until_on','timezone','America/Asuncion');
end;
$$;

create function assistant_private.apply_reminder_decision()
returns trigger language plpgsql security invoker set search_path='' as $$
declare
  v jsonb:=old.proposed_values;
  target uuid; local_date date; local_clock time;
  freq text; send_at timestamptz;
  days integer[]; until_date date;
begin
  if old.user_id is distinct from auth.uid() or old.result<>'pending'
     or new.decision is null or new.decision not in ('confirm','cancel') then
    raise exception 'Invalid reminder decision' using errcode='22023'; end if;
  new.decided_at:=clock_timestamp();
  begin
    if new.decided_at>=old.created_at+interval '10 minutes'
      or old.entry_date<>(new.decided_at at time zone 'America/Asuncion')::date then
      new.result:='expired';
    elsif new.decision='cancel' then new.result:='cancelled';
    else
      local_date:=(v->>'date')::date;local_clock:=(v->>'time')::time;
      freq:=v->>'frequency';until_date:=(v->>'until_on')::date;
      send_at:=make_timestamptz(extract(year from local_date)::int,
        extract(month from local_date)::int,extract(day from local_date)::int,
        extract(hour from local_clock)::int,extract(minute from local_clock)::int,
        0,'America/Asuncion');
      if freq='once' and send_at<=clock_timestamp() then new.result:='stale';
      elsif freq='once' then
        insert into public.reminders(user_id,title,scheduled_at)
        values(old.user_id,v->>'title',send_at) returning id into target;
        new.target_kind:='once';new.target_id:=target;new.result:='confirmed';
      else
        select coalesce(array_agg(value::integer),'{}'::integer[]) into days
          from jsonb_array_elements_text(coalesce(v->'weekdays','[]'::jsonb));
        insert into public.reminder_series(user_id,title,notes,frequency,weekdays,month_day,
          local_time,timezone,starts_on,until_on)
        values(old.user_id,v->>'title','',freq,days,
           case when freq='monthly' then extract(day from local_date)::int else null end,
           local_clock,'America/Asuncion',local_date,until_date)
        returning id into target;
        new.target_kind:='series';new.target_id:=target;new.result:='confirmed';
      end if;
    end if;
  exception when others then
    new.result:='failed';new.decided_at:=clock_timestamp();
  end;
  -- Do not retain reminder descriptions or dates after processing.
  new.proposed_values:=null;
  return new;
end;
$$;
revoke all on function assistant_private.apply_reminder_decision() from public,anon,authenticated;
create trigger apply_reminder_decision before update of decision on assistant_private.reminder_actions
  for each row execute function assistant_private.apply_reminder_decision();

create function public.decide_ai_reminder(p_id uuid,p_decision text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare action assistant_private.reminder_actions%rowtype;
begin
 if auth.uid() is null then raise insufficient_privilege; end if;
 if p_decision is null or p_decision not in ('confirm','cancel') then
   return jsonb_build_object('status','invalid');end if;
 select * into action from assistant_private.reminder_actions
   where id=p_id and user_id=auth.uid() for update;
 if not found then return jsonb_build_object('status','not_found'); end if;
 if action.result<>'pending' then
   return jsonb_build_object('status','consumed','outcome',action.result); end if;
 update assistant_private.reminder_actions set decision=p_decision
   where id=p_id and user_id=auth.uid() returning * into action;
 return jsonb_build_object('status',action.result,'target_kind',action.target_kind);
end;
$$;
revoke all on function public.propose_ai_reminder(jsonb),
 public.decide_ai_reminder(uuid,text) from public,anon,authenticated;
grant execute on function public.propose_ai_reminder(jsonb),
 public.decide_ai_reminder(uuid,text) to authenticated;
commit;
