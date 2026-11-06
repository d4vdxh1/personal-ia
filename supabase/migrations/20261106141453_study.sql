-- Phase 3: University / Study. Apply once after review and tests.
-- Owner-isolated tables and composite foreign keys, no public anonymous CRUD.
create table public.study_subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  professor text not null default '' check (char_length(professor) <= 120),
  schedule_notes text not null default '' check (char_length(schedule_notes) <= 500),
  semester text not null default '' check (char_length(semester) <= 60),
  priority smallint not null default 3 check(priority between 1 and 5),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);
create table public.study_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  details text not null default '' check (char_length(details) <= 2000),
  due_date date not null,
  priority smallint not null default 2 check (priority between 1 and 3),
  status text not null default 'pending' check (status in ('pending','in_progress','completed')),
  created_at timestamptz not null default now(),
  foreign key (subject_id,user_id) references public.study_subjects(id,user_id),
  unique (id,user_id)
);
create table public.study_exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null,
  title text not null check(char_length(btrim(title)) between 1 and 200),
  exam_date date not null,
  exam_type text not null default 'exam' check(exam_type in ('exam','quiz','presentation','other')),
  notes text not null default '' check(char_length(notes) <= 2000),
  status text not null default 'scheduled' check(status in ('scheduled','completed','cancelled')),
  created_at timestamptz not null default now(),
  foreign key (subject_id,user_id) references public.study_subjects(id,user_id),
  unique (id,user_id)
);
create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null,
  study_date date not null,
  duration_minutes integer not null check(duration_minutes between 1 and 720),
  topic text not null check(char_length(btrim(topic)) between 1 and 200),
  notes text not null default '' check(char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  foreign key (subject_id,user_id) references public.study_subjects(id,user_id),
  unique (id,user_id)
);
create index study_subjects_user on public.study_subjects(user_id,active,name);
create index study_assignments_user on public.study_assignments(user_id,status,due_date,id);
create index study_assignments_subject on public.study_assignments(subject_id,user_id);
create index study_exams_user on public.study_exams(user_id,status,exam_date,id);
create index study_exams_subject on public.study_exams(subject_id,user_id);
create index study_sessions_user on public.study_sessions(user_id,study_date desc,id);
create index study_sessions_subject on public.study_sessions(subject_id,user_id);

do $rls$ declare t text; begin
  foreach t in array array['study_subjects','study_assignments','study_exams','study_sessions'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public,anon,authenticated',t);
    execute format('grant select,insert,update,delete on public.%I to authenticated',t);
    execute format('create policy owner_select on public.%I for select to authenticated using ((select auth.uid()) = user_id)',t);
    execute format('create policy owner_insert on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',t);
    execute format('create policy owner_update on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',t);
    execute format('create policy owner_delete on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',t);
  end loop;
end $rls$;
