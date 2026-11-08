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
