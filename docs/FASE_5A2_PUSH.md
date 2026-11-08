# Fase 5A.2 — Web Push seguro

**Estado: PUBLICADA Y VALIDADA FUNCIONALMENTE (2026-11-08).** PR [#13](https://github.com/d4vdxh1/personal-ia/pull/13), `main@d402a7b`, Vercel Ready. El usuario confirmó recepción en celular y Chrome/Windows; Brave quedó funcionando tras ajustes según su reporte. No repetir las migraciones `20261108043426` y `20261108043654`.

## Componentes

1. `/reminders` permite registrar el navegador, consultar el estado de suscripción y revocar el consentimiento por dispositivo. La API verifica sesión, origen, formato y longitudes. Máximo cinco dispositivos activos. El usuario no puede modificar suscripciones de otra cuenta (RLS por `auth.uid()`).
2. `public/sw.js` solo muestra notificaciones con URL de destino dentro de `/reminders`; no almacena mensajes ni realiza caching offline. Permite entrar desde el aviso. iOS requiere una web agregada a Inicio; Web Push se solicita únicamente tras un clic del usuario y sobre HTTPS.
3. Migración `20261108043426_push_notifications.sql`: tabla de suscripciones, cola privada, índice único por recordatorio/dispositivo/fecha, RPC `SECURITY DEFINER` solo ejecutable por service_role; lectura/actualización por usuario limitada a su tabla de suscripciones. Revisión adicional de SQL y pruebas exigidas.
4. Edge Function `push-dispatch`: verificación constante de `x-cron-secret` contra un secreto almacenado en Supabase Vault, después de recuperar la configuración mediante una RPC de ejecución exclusiva para `service_role`; ninguna clave privada se entrega al navegador. Envía VAPID con librería Web Crypto nativa para Deno y mantiene retry 3 intentos con backoff. Los endpoints se limitan a servicios Web Push públicos de Google/Mozilla/Apple. Pueden existir entregas repetidas ante caídas y vencimiento de la concesión; es **al menos una vez**, no exactamente una vez.
5. El archivo `supabase/operations/enable_push_dispatch.sql` contiene un **runbook manual**, no se aplica con la migración. Cron cada minuto con `pg_cron`, `pg_net`, Vault y token de servicio; no crear el trabajo hasta tener Edge Function probada.
6. Configuración: la clave privada VAPID y `CRON_SECRET` **nunca** se almacenan en Git, tablas públicas, clientes o logs. Configurar `WEB_PUSH_VAPID_PUBLIC_KEY` en Vercel; el worker consulta Vault mediante `get_push_dispatch_config()` (ejecutable solo por `service_role`), donde residen `push_vapid_public`, `push_vapid_private`, `push_vapid_subject`, `push_cron_secret` y `push_project_url`. Generar una única pareja VAPID estable y un secreto aleatorio fuerte; no regenerarlos en cada despliegue.

## Secuencia de despliegue realizada (registro histórico)

- Revisar CI, lint, tipos y pruebas SQL en PostgreSQL aislado; pruebas reales de permisos con dos usuarios.
- Validar migración incremental con `supabase db diff`, políticas RLS, grants, y que RPC no están disponibles para anon/authenticated.
- Aplicar solo la migración versionada en la BD con autorización; confirmar índices, políticas, acceso y transacciones.
- Instalar `pg_cron`/`pg_net` y configurar Vault. Desplegar Edge Function con `verify_jwt=false` **solo** con autenticación obligatoria por header secreto. No compartir `service_role` en un navegador.
- Configurar VAPID, activar el registro de un dispositivo y verificar push de prueba hacia un usuario autenticado.
- Ejecutar una invocación aislada del worker y examinar tabla de cola por lote, fallos y no duplicación en ejecuciones concurrentes.
- **Solo entonces** programar cron para cada minuto mediante el runbook, medir latencias, reintentos y errores, verificar recepción con aplicación cerrada.
- Publicar la UI tras confirmar compatibilidad de env, Chrome Android/Samsung Internet e iOS Home Screen (cuando aplique).

## Limitaciones deliberadas

No integra todavía Gemini ni Google Calendar, no introduce notificaciones por correo ni recurrencias. No garantiza el minuto exacto: hay latencia de scheduler y del servicio push. No envía recordatorios vencidos más de 24 horas. Si cambia la hora de un recordatorio, la nueva fecha crea una clave de entrega nueva; la antigua se invalida mientras la fila anterior siga en estado pending antes de enviarla. Las notificaciones push son un canal de mejor esfuerzo.

## Estado en producción

En producción `PUSH_DELIVERY_ENABLED=true` y la clave pública VAPID están en Vercel. El servicio consulta secretos privados de Supabase Vault, y Cron lo ejecuta cada minuto. La clave VAPID pública por sí sola no demuestra una entrega.

## Publicación autorizada — 2026-11-08

- Migración Supabase `20261108043426_push_notifications` aplicada y verificada (RLS y RPC exclusivas service_role).
- Migración Supabase `20261108043654_push_scheduler_extensions` aplicada: pg_cron y pg_net instalados.
- Cinco secretos protegidos en Vault; VAPID pública configurada en Vercel; claves privadas nunca en GitHub.
- Edge Function `push-dispatch` versión 1 ACTIVE, invocación autorizada de prueba HTTP 200 (0 destinatarios).
- Cron `dia-a-dia-push-dispatch` creado y activo cada minuto, referencia secretos mediante Vault.
- `PUSH_DELIVERY_ENABLED=true` configurado en producción Vercel; requiere deploy de `main` actualizado.
- **Validado posteriormente:** despliegue final Vercel Ready; recepción reportada por el usuario en celular y Chrome/Windows; Brave también funcional según su mensaje. No confundir aceptación funcional con garantía universal de entrega ni con E2E independiente usando dos sesiones.

## Diagnóstico de navegadores (2026-11-08)

La suscripción es independiente en cada navegador/dispositivo. La excepción `Registration failed - push service error` en Brave se produjo durante `PushManager.subscribe()`, antes de que la app registrara el endpoint en Supabase. Se resolvió mediante configuración de su servicio push, según el usuario. No alterar credenciales ni migraciones si Chrome recibe correctamente y Brave falla antes de guardar la suscripción; revisar primero opciones de privacidad, permisos y conectividad locales.
