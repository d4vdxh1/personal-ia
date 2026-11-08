-- Fase 5A.2 — ACTIVACIÓN MANUAL, NO es una migración automática.
-- Ejecutar sólo tras desplegar y verificar la Edge Function, configurar Vault y aprobar producción.
-- 1. Habilitar desde Supabase Extensions: pg_cron y pg_net.
-- 2. En Supabase Vault guardar secretos con nombres:
--    push_project_url = https://<project-ref>.supabase.co
--    push_cron_secret = token aleatorio >= 32 bytes, mismo valor que CRON_SECRET en Secrets de Edge Function.
--    Crear esos secretos por Dashboard, no insertar claves en SQL ni commits.
-- 3. Verificar que ambos existan antes de programar:
-- select name from vault.decrypted_secrets where name in ('push_project_url','push_cron_secret');
-- 4. Programar UNA invocación por minuto. El token sólo se resuelve en el SQL de pg_cron:
select cron.schedule(
  'dia-a-dia-push-dispatch',
  '* * * * *',
  $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets
            where name='push_project_url' limit 1) || '/functions/v1/push-dispatch',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'x-cron-secret',(select decrypted_secret from vault.decrypted_secrets
                       where name='push_cron_secret' limit 1)
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 15000
  );
  $job$
);
-- Revertir programación sin afectar recordatorios:
-- select cron.unschedule('dia-a-dia-push-dispatch');
-- Verificar ejecuciones:
-- select * from cron.job_run_details order by start_time desc limit 20;
