-- Ejecutar una sola vez, en una base sin estas tablas.
begin;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 100),
  timezone text not null default 'America/Argentina/Buenos_Aires'
    check (timezone = 'America/Argentina/Buenos_Aires'),
  preferred_sleep_hours numeric(4,2) not null default 7 check (preferred_sleep_hours between 0 and 24),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  -- ISO: lunes=1, domingo=7. Todos los días representa frecuencia diaria.
  weekdays smallint[] not null default array[1,2,3,4,5,6,7]::smallint[]
    check (cardinality(weekdays) between 1 and 7 and weekdays <@ array[1,2,3,4,5,6,7]::smallint[]
      and array_position(weekdays, null) is null),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);
create index habits_user_active_idx on public.habits(user_id, active);

create table public.habit_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  habit_id uuid not null,
  entry_date date not null default (now() at time zone 'America/Argentina/Buenos_Aires')::date,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (habit_id, user_id) references public.habits(id, user_id) on delete cascade,
  unique (habit_id, entry_date)
);
create index habit_entries_user_date_idx on public.habit_entries(user_id, entry_date desc);

create table public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  entry_date date not null default (now() at time zone 'America/Argentina/Buenos_Aires')::date,
  energy smallint not null check (energy between 1 and 5),
  emotional_state smallint not null check (emotional_state between 1 and 5),
  life_rating smallint not null check (life_rating between 1 and 5),
  sleep_hours numeric(4,2) check (sleep_hours between 0 and 24),
  stress smallint check (stress between 1 and 5),
  notes text check (char_length(notes) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  entry_date date not null default (now() at time zone 'America/Argentina/Buenos_Aires')::date,
  relevant_event text check (char_length(relevant_event) <= 2000),
  notes text check (char_length(notes) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(btrim(coalesce(relevant_event, ''))) > 0 or length(btrim(coalesce(notes, ''))) > 0)
);
create index journal_entries_user_date_idx on public.journal_entries(user_id, entry_date desc);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  type text not null check (type in ('weekly', 'monthly')),
  target_date date not null,
  progress smallint not null default 0 check (progress between 0 and 100),
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'completed' or progress = 100)
);
create index goals_user_target_idx on public.goals(user_id, target_date);

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.set_updated_at() from public, anon, authenticated;

-- Solo CRUD para usuarios autenticados. RLS restringe cada operación al dueño.
do $$
declare
  table_name text;
begin
  foreach table_name in array array['profiles','habits','habit_entries','daily_checkins','journal_entries','goals'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from public, anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
    execute format('create policy owner_select on public.%I for select to authenticated using ((select auth.uid()) = user_id)', table_name);
    execute format('create policy owner_insert on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', table_name);
    execute format('create policy owner_update on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', table_name);
    execute format('create policy owner_delete on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', table_name);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name);
  end loop;
end;
$$;

-- Perfil automático: privilegios elevados acotados a esta función de trigger.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(user_id) values (new.id);
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Incluye usuarios creados antes de aplicar esta migración.
insert into public.profiles(user_id) select id from auth.users;

commit;
