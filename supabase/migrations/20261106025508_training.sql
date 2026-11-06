-- Incremental. No repetir la migración inicial. Probada con PostgreSQL embebido.
create table public.training_exercises (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(trim(name)) between 1 and 120),
 muscle_group text not null default '' check (char_length(muscle_group)<=100),
 equipment text not null default '' check (char_length(equipment)<=100),
 notes text not null default '' check (char_length(notes)<=2000), active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create table public.training_plans (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(trim(name)) between 1 and 120),
 notes text not null default '' check (char_length(notes)<=2000), active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create table public.training_plan_items (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 plan_id uuid not null, exercise_id uuid not null, position integer not null check(position between 1 and 20),
 sets integer not null check(sets between 1 and 10), reps integer not null check(reps between 1 and 200),
 weight_kg numeric(7,2) not null check(weight_kg between 0 and 1000), rest_seconds integer not null check(rest_seconds between 0 and 900),
 foreign key(plan_id,user_id) references public.training_plans(id,user_id) on delete cascade,
 foreign key(exercise_id,user_id) references public.training_exercises(id,user_id), unique(plan_id,position)
);
create table public.training_schedule (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 plan_id uuid not null, scheduled_date date not null check(scheduled_date between '0001-01-01' and '9999-12-31'),
 created_at timestamptz not null default now(), unique(id,user_id), unique(user_id,scheduled_date),
 foreign key(plan_id,user_id) references public.training_plans(id,user_id)
);
create table public.training_sessions (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 plan_id uuid not null, schedule_id uuid, plan_name text not null check(char_length(plan_name) between 1 and 120),
 entry_date date not null default (now() at time zone 'America/Argentina/Buenos_Aires')::date,
 started_at timestamptz not null default now(), completed_at timestamptz,
 duration_minutes integer check(duration_minutes between 1 and 600), rpe integer check(rpe between 1 and 10),
 notes text not null default '' check(char_length(notes)<=2000), status text not null default 'in_progress' check(status in ('in_progress','completed')),
 check(entry_date between '0001-01-01' and (now() at time zone 'America/Argentina/Buenos_Aires')::date),
 check((status='in_progress' and completed_at is null) or (status='completed' and completed_at is not null and duration_minutes is not null and rpe is not null)),
 foreign key(plan_id,user_id) references public.training_plans(id,user_id),
 foreign key(schedule_id,user_id) references public.training_schedule(id,user_id),
 unique(id,user_id), unique(schedule_id)
);
create table public.training_sets (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 session_id uuid not null, exercise_id uuid not null, exercise_name text not null check(char_length(exercise_name) between 1 and 120),
 position integer not null check(position between 1 and 20), set_number integer not null check(set_number between 1 and 10),
 reps integer not null check(reps between 0 and 200), weight_kg numeric(7,2) not null check(weight_kg between 0 and 1000),
 rpe integer check(rpe between 1 and 10), done boolean not null default false,
 foreign key(session_id,user_id) references public.training_sessions(id,user_id) on delete cascade,
 foreign key(exercise_id,user_id) references public.training_exercises(id,user_id), unique(session_id,position,set_number)
);
create table public.training_metrics (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 entry_date date not null check(entry_date between '0001-01-01' and (now() at time zone 'America/Argentina/Buenos_Aires')::date),
 weight_kg numeric(5,2) check(weight_kg between 20 and 500), waist_cm numeric(5,2) check(waist_cm between 20 and 300),
 arm_cm numeric(5,2) check(arm_cm between 5 and 100), notes text not null default '' check(char_length(notes)<=2000),
 check(weight_kg is not null or waist_cm is not null or arm_cm is not null), unique(user_id,entry_date)
);
create table public.training_symptoms (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 entry_date date not null check(entry_date between '0001-01-01' and (now() at time zone 'America/Argentina/Buenos_Aires')::date),
 session_id uuid, area text not null check(char_length(trim(area)) between 1 and 120),
 intensity integer not null check(intensity between 0 and 10), locking boolean not null default false,
 notes text not null default '' check(char_length(notes)<=2000), created_at timestamptz not null default now(),
 foreign key(session_id,user_id) references public.training_sessions(id,user_id)
);
create index training_exercises_owner on public.training_exercises(user_id,created_at,id);
create index training_plans_owner on public.training_plans(user_id,created_at,id);
create index training_plan_items_owner on public.training_plan_items(user_id,plan_id,position);
create index training_plan_items_exercise on public.training_plan_items(exercise_id,user_id);
create index training_schedule_plan on public.training_schedule(plan_id,user_id);
create index training_sessions_owner on public.training_sessions(user_id,entry_date desc,id);
create index training_sessions_plan on public.training_sessions(plan_id,user_id);
create index training_sessions_schedule on public.training_sessions(schedule_id,user_id);
create index training_sets_owner on public.training_sets(user_id,session_id,position,set_number);
create index training_sets_exercise on public.training_sets(exercise_id,user_id);
create index training_symptoms_owner on public.training_symptoms(user_id,entry_date desc,id);
create index training_symptoms_session on public.training_symptoms(session_id,user_id);
do $$ declare t text; begin
 foreach t in array array['training_exercises','training_plans','training_plan_items','training_schedule','training_sessions','training_sets','training_metrics','training_symptoms'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from public,anon,authenticated',t);
  execute format('grant select,insert,update,delete on public.%I to authenticated',t);
  execute format('create policy owner_select on public.%I for select to authenticated using ((select auth.uid())=user_id)',t);
  execute format('create policy owner_insert on public.%I for insert to authenticated with check ((select auth.uid())=user_id)',t);
  execute format('create policy owner_update on public.%I for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id)',t);
  execute format('create policy owner_delete on public.%I for delete to authenticated using ((select auth.uid())=user_id)',t);
 end loop;
end $$;
create trigger training_exercises_updated before update on public.training_exercises for each row execute function public.set_updated_at();
create trigger training_plans_updated before update on public.training_plans for each row execute function public.set_updated_at();

create function public.save_training_plan(p_id uuid,p_name text,p_notes text,p_items jsonb) returns uuid
language plpgsql security invoker set search_path='' as $$
declare owner_id uuid := auth.uid(); plan uuid; item jsonb; pos integer := 0;
begin
 if owner_id is null or jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) not between 1 and 20 then raise exception 'Invalid plan'; end if;
 if p_id is null then
  insert into public.training_plans(user_id,name,notes) values(owner_id,p_name,p_notes) returning id into plan;
 else
  update public.training_plans set name=p_name,notes=p_notes where id=p_id and user_id=owner_id and active returning id into plan;
  if plan is null then raise exception 'Plan unavailable'; end if;
  delete from public.training_plan_items where plan_id=plan and user_id=owner_id;
 end if;
 for item in select value from jsonb_array_elements(p_items) loop
  if not exists(select 1 from public.training_exercises where id=(item->>'exercise_id')::uuid and user_id=owner_id and active) then raise exception 'Exercise unavailable'; end if;
  pos:=pos+1;
  insert into public.training_plan_items(user_id,plan_id,exercise_id,position,sets,reps,weight_kg,rest_seconds)
  values(owner_id,plan,(item->>'exercise_id')::uuid,pos,(item->>'sets')::int,(item->>'reps')::int,(item->>'weight_kg')::numeric,(item->>'rest_seconds')::int);
 end loop;
 return plan;
end $$;

create function public.start_training_session(p_id uuid,p_plan_id uuid,p_schedule_id uuid default null) returns uuid
language plpgsql security invoker set search_path='' as $$
declare owner_id uuid := auth.uid(); plan public.training_plans; session_uuid uuid; item record;
begin
 if owner_id is null then raise exception 'Sign in required'; end if;
 select id into session_uuid from public.training_sessions where user_id=owner_id and (id=p_id or (p_schedule_id is not null and schedule_id=p_schedule_id));
 if session_uuid is not null then return session_uuid; end if;
 select * into plan from public.training_plans where id=p_plan_id and user_id=owner_id and active for update;
 if plan.id is null then raise exception 'Plan unavailable'; end if;
 -- Recheck after acquiring the lock, to make retries idempotent.
 select id into session_uuid from public.training_sessions where user_id=owner_id and (id=p_id or (p_schedule_id is not null and schedule_id=p_schedule_id));
 if session_uuid is not null then return session_uuid; end if;
 if p_schedule_id is not null and not exists(select 1 from public.training_schedule where id=p_schedule_id and plan_id=p_plan_id and user_id=owner_id and scheduled_date=(now() at time zone 'America/Argentina/Buenos_Aires')::date) then raise exception 'Schedule unavailable today'; end if;
 if not exists(select 1 from public.training_plan_items where plan_id=p_plan_id and user_id=owner_id) then raise exception 'Empty plan'; end if;
 if exists(select 1 from public.training_plan_items i join public.training_exercises e on e.id=i.exercise_id where i.plan_id=p_plan_id and not e.active) then raise exception 'Archived exercise'; end if;
 insert into public.training_sessions(id,user_id,plan_id,schedule_id,plan_name) values(p_id,owner_id,plan.id,p_schedule_id,plan.name);
 for item in select i.*,e.name from public.training_plan_items i join public.training_exercises e on e.id=i.exercise_id and e.user_id=i.user_id where i.plan_id=plan.id order by i.position loop
  insert into public.training_sets(user_id,session_id,exercise_id,exercise_name,position,set_number,reps,weight_kg)
  select owner_id,p_id,item.exercise_id,item.name,item.position,n,item.reps,item.weight_kg from generate_series(1,item.sets) n;
 end loop;
 return p_id;
end $$;

create function public.save_training_session(p_id uuid,p_sets jsonb,p_duration integer,p_rpe integer,p_notes text,p_complete boolean) returns uuid
language plpgsql security invoker set search_path='' as $$
declare owner_id uuid:=auth.uid(); item jsonb; session_uuid uuid; affected integer; ids uuid[] := array[]::uuid[];
begin
 select id into session_uuid from public.training_sessions where id=p_id and user_id=owner_id and status='in_progress' for update;
 if session_uuid is null or p_complete is null or jsonb_typeof(p_sets) is distinct from 'array' then raise exception 'Session unavailable'; end if;
 if jsonb_array_length(p_sets)<>(select count(*) from public.training_sets where session_id=p_id and user_id=owner_id) then raise exception 'Missing sets'; end if;
 for item in select value from jsonb_array_elements(p_sets) loop
  if (item->>'id')::uuid=any(ids) then raise exception 'Duplicate set'; end if;
  ids:=array_append(ids,(item->>'id')::uuid);
  update public.training_sets set reps=(item->>'reps')::int,weight_kg=(item->>'weight_kg')::numeric,rpe=(item->>'rpe')::int,done=(item->>'done')::boolean
   where id=(item->>'id')::uuid and session_id=p_id and user_id=owner_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'Set unavailable'; end if;
 end loop;
 if p_complete and (p_duration is null or p_rpe is null or not exists(select 1 from public.training_sets where session_id=p_id and user_id=owner_id and done and reps>0)) then raise exception 'Record at least one performed set and session effort/duration'; end if;
 if exists(select 1 from public.training_sets where session_id=p_id and user_id=owner_id and done and reps=0) then raise exception 'Performed set requires repetitions'; end if;
 update public.training_sessions set duration_minutes=p_duration,rpe=p_rpe,notes=p_notes,status=case when p_complete then 'completed' else 'in_progress' end,completed_at=case when p_complete then now() else null end where id=p_id and user_id=owner_id;
 return p_id;
end $$;
revoke all on function public.save_training_plan(uuid,text,text,jsonb),public.start_training_session(uuid,uuid,uuid),public.save_training_session(uuid,jsonb,integer,integer,text,boolean) from public,anon;
grant execute on function public.save_training_plan(uuid,text,text,jsonb),public.start_training_session(uuid,uuid,uuid),public.save_training_session(uuid,jsonb,integer,integer,text,boolean) to authenticated;

create function public.training_progress() returns table(exercise_id uuid,exercise_name text,sessions bigint,max_weight numeric,total_volume numeric,last_date date)
language sql stable security invoker set search_path='' as $$
 select e.id,e.name,count(distinct s.id),max(t.weight_kg),sum(t.weight_kg*t.reps),max(s.entry_date)
 from public.training_sets t join public.training_sessions s on s.id=t.session_id and s.user_id=t.user_id join public.training_exercises e on e.id=t.exercise_id and e.user_id=t.user_id
 where t.user_id=(select auth.uid()) and s.status='completed' and t.done
 group by e.id,e.name order by max(s.entry_date) desc,e.id limit 200;
$$;
create function public.training_exercise_history(p_exercise uuid,p_page integer default 1) returns table(session_id uuid,entry_date date,exercise_name text,max_weight numeric,volume numeric,performed_sets bigint,total_count bigint)
language sql stable security invoker set search_path='' as $$
 select s.id,s.entry_date,min(t.exercise_name),max(t.weight_kg),sum(t.weight_kg*t.reps),count(*),count(*) over()
 from public.training_sets t join public.training_sessions s on s.id=t.session_id and s.user_id=t.user_id
 where t.user_id=(select auth.uid()) and t.exercise_id=p_exercise and s.status='completed' and t.done
 group by s.id,s.entry_date,s.started_at order by s.entry_date desc,s.started_at desc,s.id
 limit 10 offset (greatest(1,least(p_page,999999))-1)*10;
$$;
revoke all on function public.training_progress(),public.training_exercise_history(uuid,integer) from public,anon;
grant execute on function public.training_progress(),public.training_exercise_history(uuid,integer) to authenticated;

create function public.protect_started_training_schedule() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if exists(select 1 from public.training_sessions where schedule_id=old.id and user_id=old.user_id) then raise exception 'Schedule already started'; end if;
 return new;
end $$;
revoke all on function public.protect_started_training_schedule() from public,anon,authenticated;
create trigger protect_started_training_schedule before update on public.training_schedule for each row execute function public.protect_started_training_schedule();
