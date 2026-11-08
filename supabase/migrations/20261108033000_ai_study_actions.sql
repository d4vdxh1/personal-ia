-- Phase 4B.3: proposals and audited study-session writes.
-- REVIEW ONLY: never apply this migration to production without explicit approval.
-- Depends on study tables and the assistant_private schema from 4B.1.
begin;

create table assistant_private.study_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  action_type text not null default 'log_study_session' check (action_type = 'log_study_session'),
  subject_id uuid not null,
  study_date date not null,
  proposed_subject_name text,
  proposed_topic text,
  proposed_duration integer,
  target_id uuid,
  created_at timestamptz not null default clock_timestamp(),
  decision text check (decision in ('confirm','cancel')),
  result text not null default 'pending'
    check (result in ('pending','confirmed','cancelled','expired','stale','failed')),
  decided_at timestamptz,
  check (
    (result = 'pending' and decision is null and decided_at is null
      and proposed_subject_name is not null and char_length(btrim(proposed_subject_name)) between 1 and 120
      and proposed_topic is not null and char_length(btrim(proposed_topic)) between 1 and 200
      and proposed_duration between 1 and 720 and target_id is null)
    or (result <> 'pending' and decision is not null and decided_at is not null
      and proposed_subject_name is null and proposed_topic is null and proposed_duration is null)
  )
);
create index study_actions_user_day_idx on assistant_private.study_actions(user_id, study_date);
alter table assistant_private.study_actions enable row level security;
revoke all on assistant_private.study_actions from public, anon, authenticated;
grant select, insert(subject_id,study_date,proposed_subject_name,proposed_topic,proposed_duration),
  update(decision) on assistant_private.study_actions to authenticated;
create policy own_read on assistant_private.study_actions for select to authenticated
  using (user_id = (select auth.uid()));
create policy own_proposal on assistant_private.study_actions for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and study_date = (clock_timestamp() at time zone 'America/Argentina/Buenos_Aires')::date
    and exists (
      select 1 from public.study_subjects s where s.id = subject_id
        and s.user_id = (select auth.uid()) and s.active
        and lower(btrim(s.name)) = lower(btrim(proposed_subject_name))
    )
  );
create policy own_decision on assistant_private.study_actions for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create function public.propose_study_session(
  p_subject_name text, p_topic text, p_duration_minutes integer
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  today date := (clock_timestamp() at time zone 'America/Argentina/Buenos_Aires')::date;
  subject public.study_subjects%rowtype;
  proposal_id uuid;
begin
  if owner_id is null then raise insufficient_privilege; end if;
  if p_subject_name is null or char_length(btrim(p_subject_name)) not between 1 and 120
      or p_topic is null or char_length(btrim(p_topic)) not between 1 and 200
      or p_duration_minutes is null or p_duration_minutes not between 1 and 720 then
    return jsonb_build_object('status','invalid');
  end if;
  -- This RPC is callable with the user's JWT; limit ledger growth independently
  -- from the chat's daily quota, using a per-user transaction lock.
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text,4303));
  if (select count(*) from assistant_private.study_actions
      where user_id=owner_id and study_date=today) >= 20 then
    return jsonb_build_object('status','limited');
  end if;
  begin
    select s.* into strict subject from public.study_subjects s
      where s.user_id=owner_id and s.active
        and lower(btrim(s.name))=lower(btrim(p_subject_name))
      limit 2 for share;
  exception
    when no_data_found then return jsonb_build_object('status','not_found');
    when too_many_rows then return jsonb_build_object('status','ambiguous');
  end;
  insert into assistant_private.study_actions
    (subject_id,study_date,proposed_subject_name,proposed_topic,proposed_duration)
    values(subject.id,today,subject.name,btrim(p_topic),p_duration_minutes) returning id into proposal_id;
  return jsonb_build_object('status','pending','kind','study','id',proposal_id,
    'date',today,'subject',subject.name,'topic',btrim(p_topic),
    'duration_minutes',p_duration_minutes);
end;
$$;

-- The trigger and domain INSERT execute as the authenticated user (RLS), in
-- the same transaction. A failed domain write is rolled back but audited.
create function assistant_private.apply_study_decision() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare
  subject public.study_subjects%rowtype;
  saved_id uuid;
begin
  if old.user_id is distinct from auth.uid() or old.result <> 'pending'
      or new.decision is null or new.decision not in ('confirm','cancel') then
    raise exception 'Invalid transition' using errcode = '22023';
  end if;
  begin
    if new.decision = 'confirm' then
      select s.* into subject from public.study_subjects s
        where s.id=old.subject_id and s.user_id=auth.uid() for share;
    end if;
    new.decided_at := clock_timestamp();
    if new.decided_at >= old.created_at + interval '10 minutes'
        or old.study_date <> (new.decided_at at time zone 'America/Argentina/Buenos_Aires')::date then
      new.result := 'expired';
    elsif new.decision='cancel' then new.result := 'cancelled';
    elsif subject.id is null or not subject.active
        or lower(btrim(subject.name)) <> lower(btrim(old.proposed_subject_name)) then
      new.result := 'stale';
    else
      insert into public.study_sessions(user_id,subject_id,study_date,topic,duration_minutes)
        values(old.user_id,old.subject_id,old.study_date,old.proposed_topic,old.proposed_duration)
        returning id into saved_id;
      new.target_id := saved_id;
      new.result := 'confirmed';
    end if;
  exception when others then
    new.decided_at := clock_timestamp();
    new.result := 'failed';
  end;
  -- No academic topic, subject name, prompt or notes remain in processed audit.
  new.proposed_subject_name := null;
  new.proposed_topic := null;
  new.proposed_duration := null;
  return new;
end;
$$;
revoke all on function assistant_private.apply_study_decision() from public, anon, authenticated;
create trigger apply_study_decision before update of decision on assistant_private.study_actions
  for each row execute function assistant_private.apply_study_decision();

create function public.decide_study_proposal(p_id uuid,p_decision text) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare action assistant_private.study_actions%rowtype;
begin
  if auth.uid() is null then raise insufficient_privilege; end if;
  if p_decision is null or p_decision not in ('confirm','cancel') then
    return jsonb_build_object('status','invalid');
  end if;
  select * into action from assistant_private.study_actions
    where id=p_id and user_id=auth.uid() for update;
  if not found then return jsonb_build_object('status','not_found'); end if;
  if action.result<>'pending' then
    return jsonb_build_object('status','consumed','outcome',action.result);
  end if;
  update assistant_private.study_actions set decision=p_decision
    where id=p_id and user_id=auth.uid() returning * into action;
  return jsonb_build_object('status',action.result);
end;
$$;
revoke all on function public.propose_study_session(text,text,integer),
  public.decide_study_proposal(uuid,text) from public,anon,authenticated;
grant execute on function public.propose_study_session(text,text,integer),
  public.decide_study_proposal(uuid,text) to authenticated;
commit;
