begin;

create function assistant_private.valid_checkin_values(v jsonb) returns boolean
language plpgsql immutable security invoker set search_path = '' as $$
declare k text; n numeric;
begin
  if v is null or jsonb_typeof(v)<>'object' then return false; end if;
  if not (v ?& array['energy','emotional_state','life_rating']) then return false; end if;
  for k in select jsonb_object_keys(v) loop
    if k not in ('energy','emotional_state','life_rating','stress','sleep_hours')
        or jsonb_typeof(v->k)<>'number' then return false; end if;
    n := (v->>k)::numeric;
    if k='sleep_hours' then
      if n<0 or n>24 or n<>round(n,2) then return false; end if;
    elsif n<1 or n>5 or n<>trunc(n) then return false;
    end if;
  end loop;
  return true;
exception when others then return false;
end;
$$;
revoke all on function assistant_private.valid_checkin_values(jsonb) from public, anon, authenticated;
grant execute on function assistant_private.valid_checkin_values(jsonb) to authenticated;

create table assistant_private.checkin_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  action_type text not null default 'log_daily_checkin' check(action_type='log_daily_checkin'),
  entry_date date not null,
  checkin_id uuid,
  target_id uuid,
  checkin_version timestamptz,
  proposed_values jsonb,
  created_at timestamptz not null default clock_timestamp(),
  decision text check(decision in ('confirm','cancel')),
  overwrite_confirmed boolean not null default false,
  result text not null default 'pending' check(result in ('pending','confirmed','cancelled','expired','stale','failed')),
  decided_at timestamptz,
  check ((checkin_id is null)=(checkin_version is null)),
  check ((result='pending' and decision is null and decided_at is null and proposed_values is not null
      and assistant_private.valid_checkin_values(proposed_values))
    or (result<>'pending' and decision is not null and decided_at is not null and proposed_values is null))
);
create index checkin_actions_user_day_idx on assistant_private.checkin_actions(user_id,entry_date);
alter table assistant_private.checkin_actions enable row level security;
revoke all on assistant_private.checkin_actions from public, anon, authenticated;
grant select, insert(entry_date,checkin_id,checkin_version,proposed_values),
  update(decision,overwrite_confirmed) on assistant_private.checkin_actions to authenticated;
create policy own_read on assistant_private.checkin_actions for select to authenticated
  using(user_id=(select auth.uid()));
create policy own_proposal on assistant_private.checkin_actions for insert to authenticated
  with check(user_id=(select auth.uid()) and
    entry_date=(clock_timestamp() at time zone 'America/Argentina/Buenos_Aires')::date);
create policy own_decision on assistant_private.checkin_actions for update to authenticated
  using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

create function public.propose_daily_checkin(p_values jsonb) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  today date := (clock_timestamp() at time zone 'America/Argentina/Buenos_Aires')::date;
  current_checkin public.daily_checkins%rowtype;
  proposal_id uuid;
begin
  if owner_id is null then raise insufficient_privilege; end if;
  if not assistant_private.valid_checkin_values(p_values) then return jsonb_build_object('status','invalid'); end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text,4202));
  if (select count(*) from assistant_private.checkin_actions where user_id=owner_id and entry_date=today)>=20 then
    return jsonb_build_object('status','limited');
  end if;
  select * into current_checkin from public.daily_checkins where user_id=owner_id and entry_date=today;
  insert into assistant_private.checkin_actions(entry_date,checkin_id,checkin_version,proposed_values)
    values(today,current_checkin.id,current_checkin.updated_at,p_values) returning id into proposal_id;
  return jsonb_build_object('status','pending','kind','checkin','id',proposal_id,'date',today,
    'overwrite',current_checkin.id is not null,'values',p_values);
end;
$$;

create function assistant_private.apply_checkin_decision() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare
  current_checkin public.daily_checkins%rowtype;
  target uuid;
  v jsonb := old.proposed_values;
begin
  if old.user_id is distinct from auth.uid() or old.result<>'pending'
      or new.decision is null or new.decision not in ('confirm','cancel') then
    raise exception 'Invalid transition' using errcode='22023';
  end if;
  if new.decision='confirm' and old.checkin_id is not null and not new.overwrite_confirmed then
    raise exception 'Overwrite confirmation required' using errcode='22023';
  end if;
  begin
    perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,4202));
    select * into current_checkin from public.daily_checkins
      where user_id=auth.uid() and entry_date=old.entry_date for update;
    new.decided_at := clock_timestamp();
    if new.decided_at>=old.created_at+interval '10 minutes'
        or old.entry_date<>(new.decided_at at time zone 'America/Argentina/Buenos_Aires')::date then
      new.result := 'expired';
    elsif new.decision='cancel' then new.result := 'cancelled';
    elsif current_checkin.id is distinct from old.checkin_id
        or current_checkin.updated_at is distinct from old.checkin_version then new.result := 'stale';
    else
      -- Omitted optional fields and private notes retain their current values.
      insert into public.daily_checkins(user_id,entry_date,energy,emotional_state,life_rating,sleep_hours,stress)
        values(old.user_id,old.entry_date,(v->>'energy')::smallint,(v->>'emotional_state')::smallint,
          (v->>'life_rating')::smallint,(v->>'sleep_hours')::numeric,(v->>'stress')::smallint)
        on conflict(user_id,entry_date) do update set
          energy=excluded.energy, emotional_state=excluded.emotional_state, life_rating=excluded.life_rating,
          sleep_hours=case when v ? 'sleep_hours' then excluded.sleep_hours else daily_checkins.sleep_hours end,
          stress=case when v ? 'stress' then excluded.stress else daily_checkins.stress end
        where daily_checkins.id=old.checkin_id and daily_checkins.updated_at=old.checkin_version
        returning id into target;
      new.target_id := target;
      new.result := case when target is null then 'stale' else 'confirmed' end;
    end if;
  exception when others then
    new.decided_at := clock_timestamp();
    new.result := 'failed';
  end;
  -- The ledger retains only identifiers, decision and outcome after processing.
  new.proposed_values := null;
  return new;
end;
$$;
revoke all on function assistant_private.apply_checkin_decision() from public, anon, authenticated;
create trigger apply_checkin_decision before update of decision on assistant_private.checkin_actions
  for each row execute function assistant_private.apply_checkin_decision();

create function public.decide_checkin_proposal(p_id uuid,p_decision text,p_overwrite boolean) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare action assistant_private.checkin_actions%rowtype;
begin
  if auth.uid() is null then raise insufficient_privilege; end if;
  if p_decision is null or p_decision not in ('confirm','cancel') or p_overwrite is null then
    return jsonb_build_object('status','invalid');
  end if;
  select * into action from assistant_private.checkin_actions where id=p_id and user_id=auth.uid() for update;
  if not found then return jsonb_build_object('status','not_found'); end if;
  if action.result<>'pending' then return jsonb_build_object('status','consumed','outcome',action.result); end if;
  if p_decision='confirm' and action.checkin_id is not null and not p_overwrite then
    return jsonb_build_object('status','needs_confirmation');
  end if;
  update assistant_private.checkin_actions set decision=p_decision,overwrite_confirmed=p_overwrite
    where id=p_id and user_id=auth.uid() returning * into action;
  return jsonb_build_object('status',action.result);
end;
$$;
revoke all on function public.propose_daily_checkin(jsonb),public.decide_checkin_proposal(uuid,text,boolean)
  from public,anon,authenticated;
grant execute on function public.propose_daily_checkin(jsonb),public.decide_checkin_proposal(uuid,text,boolean)
  to authenticated;
commit;
