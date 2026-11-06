-- PostgreSQL/Supabase: fixtures temporales, sin bootstrap ni cambios persistentes.
-- Ejecutar completo: TODO termina en ROLLBACK, incluidos usuarios y datos de prueba.
begin;
create function pg_temp.assert_training(ok boolean,message text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %',message; end if; end $$;
create function pg_temp.reject_training(statement text) returns void language plpgsql as $$
begin
 begin execute statement; exception when others then if sqlstate in ('42501','23503','23514','P0001') then return; end if; raise; end;
 raise exception 'FAIL: se permitió %',statement;
end $$;
insert into auth.users(id) values('f1111111-1111-4111-8111-111111111111'),('f2222222-2222-4222-8222-222222222222');
insert into public.training_exercises(id,user_id,name) values('f3333333-3333-4333-8333-333333333333','f1111111-1111-4111-8111-111111111111','Prueba temporal');
insert into public.training_plans(id,user_id,name) values('f4444444-4444-4444-8444-444444444444','f1111111-1111-4111-8111-111111111111','Rutina temporal');
insert into public.training_plan_items(user_id,plan_id,exercise_id,position,sets,reps,weight_kg,rest_seconds) values('f1111111-1111-4111-8111-111111111111','f4444444-4444-4444-8444-444444444444','f3333333-3333-4333-8333-333333333333',1,1,10,5,60);
set local role authenticated;
select set_config('request.jwt.claim.sub','f1111111-1111-4111-8111-111111111111',true);
select public.start_training_session('f5555555-5555-4555-8555-555555555555','f4444444-4444-4444-8444-444444444444',null);
select public.start_training_session('f5555555-5555-4555-8555-555555555555','f4444444-4444-4444-8444-444444444444',null);
select pg_temp.assert_training((select count(*)=1 from public.training_sessions),'inicio duplicado');
select public.save_training_session('f5555555-5555-4555-8555-555555555555',(select jsonb_agg(jsonb_build_object('id',id,'reps',10,'weight_kg',5,'rpe',5,'done',true)) from public.training_sets),30,5,'Prueba temporal',true);
insert into public.training_schedule(user_id,plan_id,scheduled_date) values('f1111111-1111-4111-8111-111111111111','f4444444-4444-4444-8444-444444444444',(now() at time zone 'America/Argentina/Buenos_Aires')::date);
insert into public.training_metrics(user_id,entry_date,weight_kg) values('f1111111-1111-4111-8111-111111111111',(now() at time zone 'America/Argentina/Buenos_Aires')::date,70);
insert into public.training_symptoms(user_id,entry_date,area,intensity,session_id) values('f1111111-1111-4111-8111-111111111111',(now() at time zone 'America/Argentina/Buenos_Aires')::date,'Registro temporal',0,'f5555555-5555-4555-8555-555555555555');
select pg_temp.assert_training((select max_weight=5 and total_volume=50 from public.training_progress()),'progresión propia');
select pg_temp.assert_training((select count(*)=1 from public.training_exercise_history('f3333333-3333-4333-8333-333333333333',1)),'historial propio');
select set_config('request.jwt.claim.sub','f2222222-2222-4222-8222-222222222222',true);
do $$ declare t text; n bigint; begin
 foreach t in array array['training_exercises','training_plans','training_plan_items','training_schedule','training_sessions','training_sets','training_metrics','training_symptoms'] loop
  execute format('select count(*) from public.%I',t) into n;
  perform pg_temp.assert_training(n=0,t||': lectura ajena rechazada');
  execute format('update public.%I set user_id=''f2222222-2222-4222-8222-222222222222'' where user_id=''f1111111-1111-4111-8111-111111111111''',t); get diagnostics n=row_count;
  perform pg_temp.assert_training(n=0,t||': edición ajena rechazada');
  execute format('delete from public.%I where user_id=''f1111111-1111-4111-8111-111111111111''',t); get diagnostics n=row_count;
  perform pg_temp.assert_training(n=0,t||': borrado ajeno rechazado');
 end loop;
end $$;
select pg_temp.assert_training((select count(*)=0 from public.training_progress()),'progresión ajena rechazada');
select pg_temp.reject_training($q$insert into public.training_exercises(user_id,name) values('f1111111-1111-4111-8111-111111111111','Ajeno')$q$);
select pg_temp.reject_training($q$select public.save_training_session('f5555555-5555-4555-8555-555555555555','[]'::jsonb,30,5,'Ajeno',true)$q$);
reset role;
select pg_temp.assert_training((select count(*)=8 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relname like 'training_%' and c.relrowsecurity),'ocho tablas con RLS');
rollback;
