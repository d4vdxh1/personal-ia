-- Solo lectura: ejecutar en SQL Editor después de aplicar la migración.
with expected(name) as (
  values ('profiles'), ('habits'), ('habit_entries'),
         ('daily_checkins'), ('journal_entries'), ('goals')
)
select e.name as tabla,
       c.oid is not null as existe,
       coalesce(c.relrowsecurity, false) as rls_habilitado,
       (select count(*) from pg_policies p
         where p.schemaname = 'public' and p.tablename = e.name) as politicas,
       case when c.oid is not null then
         has_table_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,DELETE')
         else null end as anon_tiene_algun_permiso
from expected e
left join pg_class c on c.relname = e.name and c.relnamespace = 'public'::regnamespace
order by e.name;

select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles','habits','habit_entries','daily_checkins','journal_entries','goals')
order by tablename, cmd;
