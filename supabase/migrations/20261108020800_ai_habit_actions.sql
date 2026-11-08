begin;

-- Internal ledger. The public Data API exposes only the two invoker RPCs.
create schema assistant_private;
revoke all on schema assistant_private from public, anon, authenticated;
grant usage on schema assistant_private to authenticated;

create table assistant_private.habit_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  action_type text not null default 'mark_habit' check (action_type = 'mark_habit'),
  habit_id uuid not null,
  habit_version timestamptz not null,
  entry_date date not null,
  created_at timestamptz not null default clock_timestamp(),
  decision text check (decision in ('confirm', 'cancel')),
  result text not null default 'pending' check (result in
    ('pending', 'confirmed', 'cancelled', 'expired', 'stale', 'already_done', 'failed')),
  decided_at timestamptz,
  check ((result = 'pending' and decision is null and decided_at is null) or
         (result <> 'pending' and decision is not null and decided_at is not null))
);
create index habit_actions_user_day_idx on assistant_private.habit_actions(user_id, entry_date);
alter table assistant_private.habit_actions enable row level security;
revoke all on assistant_private.habit_actions from public, anon, authenticated;
-- A caller can request a decision, but cannot assign a result, timestamp or owner.
grant select, insert (habit_id, habit_version, entry_date), update (decision)
  on assistant_private.habit_actions to authenticated;
create policy own_read on assistant_private.habit_actions for select to authenticated
  using (user_id = (select auth.uid()));
create policy own_proposal on assistant_private.habit_actions for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.habits h where h.id = habit_id and h.user_id = (select auth.uid())
      and h.active and h.updated_at = habit_version and extract(isodow from entry_date) = any(h.weekdays)
  ) and entry_date = (clock_timestamp() at time zone 'America/Argentina/Buenos_Aires')::date);
create policy own_decision on assistant_private.habit_actions for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create function public.propose_mark_habit(p_name text) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  today date := (clock_timestamp() at time zone 'America/Argentina/Buenos_Aires')::date;
  habit public.habits%rowtype;
  proposal_id uuid;
begin
  if owner_id is null then raise insufficient_privilege; end if;
  if p_name is null or char_length(btrim(p_name)) not between 1 and 120 then
    return jsonb_build_object('status','invalid');
  end if;
  -- This RPC is also reachable through PostgREST with the caller's JWT.
  -- Bound ledger growth even if an authenticated client skips the chat route.
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text, 4101));
  if (select count(*) from assistant_private.habit_actions
      where user_id = owner_id and entry_date = today) >= 20 then
    return jsonb_build_object('status','limited');
  end if;
  begin
    select h.* into strict habit from public.habits h
      where h.user_id = owner_id and h.active and extract(isodow from today) = any(h.weekdays)
        and lower(btrim(h.name)) = lower(btrim(p_name))
      limit 2 for share;
  exception
    when no_data_found then return jsonb_build_object('status','not_found');
    when too_many_rows then return jsonb_build_object('status','ambiguous');
  end;
  if exists (select 1 from public.habit_entries
      where user_id = owner_id and habit_id = habit.id and entry_date = today and completed) then
    return jsonb_build_object('status','already_done');
  end if;
  insert into assistant_private.habit_actions(habit_id, habit_version, entry_date)
    values (habit.id, habit.updated_at, today) returning id into proposal_id;
  return jsonb_build_object('status','pending','id',proposal_id,'name',habit.name,'date',today,'completed',true);
end;
$$;

-- Trigger and domain write run as the authenticated caller under the existing habit
-- policies. The ledger transition and the entry commit or roll back together.
create function assistant_private.apply_habit_decision() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare
  habit public.habits%rowtype;
begin
  if old.user_id is distinct from auth.uid() or old.result <> 'pending' or
     new.decision is null or new.decision not in ('confirm','cancel') then
    raise exception 'Invalid transition' using errcode = '22023';
  end if;

  begin
    if new.decision = 'confirm' then
      select h.* into habit from public.habits h
        where h.id = old.habit_id and h.user_id = auth.uid() for update;
    end if;
    new.decided_at := clock_timestamp();
    if new.decided_at >= old.created_at + interval '10 minutes' or
       old.entry_date <> (new.decided_at at time zone 'America/Argentina/Buenos_Aires')::date then
      new.result := 'expired';
    elsif new.decision = 'cancel' then
      new.result := 'cancelled';
    elsif habit.id is null or not habit.active or habit.updated_at <> old.habit_version
        or not (extract(isodow from old.entry_date) = any(habit.weekdays)) then
      new.result := 'stale';
    else
      insert into public.habit_entries(user_id, habit_id, entry_date, completed)
        values (old.user_id, old.habit_id, old.entry_date, true)
        on conflict (habit_id, entry_date) do update set completed = true
          where habit_entries.user_id = auth.uid() and not habit_entries.completed;
      new.result := case when found then 'confirmed' else 'already_done' end;
    end if;
  exception when others then
    -- The subtransaction rolls back the entry; persist only a minimal error code.
    new.decided_at := clock_timestamp();
    new.result := 'failed';
  end;
  return new;
end;
$$;
revoke all on function assistant_private.apply_habit_decision() from public, anon, authenticated;
create trigger apply_habit_decision before update of decision on assistant_private.habit_actions
  for each row execute function assistant_private.apply_habit_decision();

create function public.decide_habit_proposal(p_id uuid, p_decision text) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  outcome text;
begin
  if auth.uid() is null then raise insufficient_privilege; end if;
  if p_decision is null or p_decision not in ('confirm','cancel') then
    return jsonb_build_object('status','invalid');
  end if;
  select result into outcome from assistant_private.habit_actions
    where id = p_id and user_id = auth.uid() for update;
  if not found then return jsonb_build_object('status','not_found'); end if;
  if outcome <> 'pending' then return jsonb_build_object('status','consumed','outcome',outcome); end if;
  update assistant_private.habit_actions set decision = p_decision
    where id = p_id and user_id = auth.uid() returning result into outcome;
  return jsonb_build_object('status',outcome);
end;
$$;
revoke all on function public.propose_mark_habit(text), public.decide_habit_proposal(uuid,text)
  from public, anon, authenticated;
grant execute on function public.propose_mark_habit(text), public.decide_habit_proposal(uuid,text)
  to authenticated;
commit;
