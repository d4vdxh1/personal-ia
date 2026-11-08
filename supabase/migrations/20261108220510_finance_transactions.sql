-- Fase 8A: registro manual de finanzas, PYG, sin integraciones bancarias.
-- Migración incremental. NO ejecutar en producción hasta aprobar el PR.
begin;
create table public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  direction text not null check (direction in ('income','expense')),
  category text not null,
  amount_pyg bigint not null check (amount_pyg between 1 and 1000000000000),
  occurred_on date not null check (occurred_on between date '2000-01-01' and date '2100-12-31'),
  note text not null default '' check (char_length(note) <= 300),
  created_at timestamptz not null default now(),
  constraint finance_category_matches_direction check (
    (direction='income' and category in ('salario','trabajo_extra','regalo','otros_ingresos'))
    or (direction='expense' and category in ('alimentacion','transporte','vivienda','educacion','salud','ocio','otros_gastos'))
  )
);
create index finance_tx_owner_date_idx on public.finance_transactions(user_id,occurred_on desc,id);
alter table public.finance_transactions enable row level security;
revoke all on public.finance_transactions from public, anon, authenticated;
grant select,insert,delete on public.finance_transactions to authenticated;
create policy finance_owner_select on public.finance_transactions for select to authenticated
 using ((select auth.uid())=user_id);
create policy finance_owner_insert on public.finance_transactions for insert to authenticated
 with check ((select auth.uid())=user_id);
create policy finance_owner_delete on public.finance_transactions for delete to authenticated
 using ((select auth.uid())=user_id);
commit;
