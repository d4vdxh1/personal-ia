-- Fase 5A.2 — ACTIVACIÓN MANUAL, NO es una migración automática.
-- Ejecutar sólo tras desplegar y verificar la Edge Function, configurar Vault y aprobar producción.
-- 1. Habilitar pg_cron y pg_net en Supabase tras la migración principal.
-- 1a. Verificar que `select extname from pg_extension where extname in ('pg_cron','pg_net');` devuelva dos filas.
-- 2. Guardar estos cinco valores en Supabase Vault, preferentemente desde el Dashboard:
--    push_project_url = https://<project-ref>.supabase.co
--    push_cron_secret = token aleatorio de 32 bytes o más
--    push_vapid_public = clave pública VAPID, también configurada en Vercel
--    push_vapid_private = clave privada VAPID (NO PUBLICAR)
--    push_vapid_subject = https://personal-ia-two.vercel.app
-- No cargar claves en código ni variables NEXT_PUBLIC_ ni logs.
-- La Edge Function recibe una configuración Vault por una RPC service_role-only.
-- 3. Verificar que ambos existan antes de programar:
-- select name from vault.decrypted_secrets where name in ('push_project_url','push_cron_secret','push_vapid_public','push_vapid_private','push_vapid_subject');
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

-- Estado 2026-11-08: el job `dia-a-dia-push-dispatch` YA se creó y habilitó en producción.
-- Este archivo queda como runbook para mantenimiento; no volver a ejecutarlo sin comprobar cron.job.
