# Fase 5 — Recordatorios, Web Push y Google Calendar

**Estado al 2026-11-08:** 5A.1 y 5A.2 publicadas; **siguiente incremento 5A.3**. Las evidencias cronológicas están en [DEVLOG](../DEVLOG.md).

## Fase 5A.1 — Recordatorios manuales (publicada)

Pantalla `/reminders` para crear, editar, completar y cancelar recordatorios, con RLS por `auth.uid()`, fecha en `timestamptz` y validación de sesión/propiedad. Migración **ya aplicada** `20261108035009_reminders`. No repetir.

## Fase 5A.2 — Notificaciones Web Push (publicada)

PR [#13](https://github.com/d4vdxh1/personal-ia/pull/13), `main@d402a7b`, CI aprobado, Vercel Ready. Service worker, permisos independientes por navegador, RLS, suscripciones, cola privada, RPC restringidas, VAPID Vault y Edge Function `push-dispatch`. Cron `dia-a-dia-push-dispatch` activo cada minuto.

Migraciones **aplicadas**, no repetir: `20261108043426_push_notifications` y `20261108043654_push_scheduler_extensions`.

**Prueba funcional:** el usuario confirmó recepción en celular y en Google Chrome/Windows. Brave también quedó funcionando según el usuario tras corregir su configuración de mensajes push. Estos reportes no sustituyen un E2E de seguridad con dos cuentas ni garantizan entregas puntuales en todo navegador.

## Fase 5A.3 — Recurrencias (próxima)

- Elegir frecuencia diaria, semanal o mensual, días elegidos y opciones de pausa/cancelación.
- Definir serie y ocurrencias para que un aviso ya procesado no se envíe otra vez.
- Interpretar zona horaria en el perfil; manejar cambio de mes, fechas sin día equivalente y cambios de horario.
- Validar propietario con RLS y evitar duplicados en Cron bajo concurrencia.
- Pruebas SQL, unitarias, Playwright y un recordatorio recurrente real; migraciones en PR antes de publicar.

**Pendientes de decisión de producto:** cómo representar el fin de una serie, qué hacer con ocurrencias omitidas y si una edición modifica solo una aparición o toda la serie.

## Fase 5B — Google Calendar

La conexión Calendar requiere OAuth y scopes **adicionales al login con Google**. MVP propuesto: conectar/desconectar, leer próximos eventos de un calendario elegido y visualizarlos sin duplicar recordatorios. Después, proponer creación y sincronización bidireccional solo con consentimiento explícito. Tokens cifrados, refresh, revocación, manejo 401/429 e IDs externos estables.

## Fase 5C — Crear recordatorios con Gemini

Permitir que Gemini **proponga** título, fecha, hora y recurrencia. Confirmación obligatoria; la API valida usuario, hora, permisos, duplicados y auditoría. El envío lo ejecuta Cron; Gemini no es el scheduler.

## Limitaciones y pendientes transversales

La entrega Web Push depende del permiso y del servicio de cada navegador, de la red y del sistema operativo. Puede retrasarse y sigue un modelo de mejor esfuerzo. Zona horaria actual del código: `America/Argentina/Buenos_Aires`; pasar a preferencia de usuario antes de consolidar recurrencias. Completar pruebas independientes de aislamiento con dos sesiones reales y observabilidad de fallos.

## Implementación técnica de Fase 5A.3 (rama)

Véase [FASE_5A3_RECURRENCIAS.md](FASE_5A3_RECURRENCIAS.md): series, materialización por el Cron existente y pruebas. La migración nueva se aplica solo tras completar CI y revisión. No modifica funciones 5B/5C.

## Fase 5B.1 — Primera entrega en revisión

Se preparó OAuth server-to-server independiente de Supabase login, Google Calendar **solo lectura**, tokens refresh cifrados, revocación y pruebas. La pantalla muestra configuración pendiente si faltan las credenciales del cliente OAuth. No confundir la existencia del código con una conexión real habilitada. Ver `docs/FASE_5B_CALENDAR.md`.

## Actualización 2026-11-08 — 5A.3, 5B y 5C

- 5A.3: PR #15 integrado, migración `20261108184507_reminder_recurrences` aplicada y Vercel Ready; seguridad RLS de series probada en Supabase con dos identidades y rollback. Reglas diaria, semanal, mensual; cancelación y pausa sin duplicaciones del cron. Pendiente aceptación funcional con una serie real del usuario.
- 5B.1: PR #16 integrado, OAuth Google Calendar de solo lectura y cifrado de refresh tokens; migración `20261108185959_google_calendar_connections` aplicada, pero **credenciales Google Cloud aún no configuradas**.
- 5B.2: PR #18 prepara exportación manual de recordatorios individuales. Migración `20261108194807_calendar_event_export` aplicada y verificada; `GOOGLE_CALENDAR_WRITE_ENABLED` desactivado por defecto. Sin prueba OAuth real ni sincronización bidireccional.
- 5C: PR #17 integrado, migración `20261108191759_ai_reminder_actions` aplicada, RLS, auditoría y confirmación probadas con SQL rollback. El flujo con Gemini en la cuenta real del usuario debe validarse tras publicación.
