# Fase 5 — Recordatorios y Google Calendar

**Inicio:** 2026-11-08 · **Rama inicial:** `feat/fase-5a-recordatorios`. Este documento distingue agenda persistente de avisos realmente entregados.

## Alcance 5A.1: recordatorios manuales (en revisión)

- Tabla `public.reminders`: propietario, título, notas, instante programado, estado y auditoría temporal básica.
- RLS CRUD por `auth.uid()`, sin acceso anónimo; listado acotado y validación del servidor.
- Vista `/reminders`: agregar, editar, completar y cancelar recordatorios; integrada al menú de escritorio/móvil.
- Fechas interpretadas en `America/Argentina/Buenos_Aires`, zona horaria vigente del proyecto, y almacenadas como `timestamptz`.
- No se promete envío automático: sin scheduler, la lista es informativa.
- Migración `20261108050000_reminders.sql` **NO aplicada a Supabase producción**. No habilitar preview en el Supabase principal antes de revisar la migración y la política de previews.

## Próximas entregas

**5A.2 — Ejecución programada y alertas:** diseñar worker cron/Edge Function, claim atómico por vencimiento, idempotencia y reintentos con límite, registro de entregas y estado observable; configurar proveedor de notificaciones con consentimiento y prueba de recepción real. Nunca delegar el reloj a Gemini.

**5A.3 — Recurrencias:** reglas explícitas, manejo de cambios de horario/zona, suspensión y excepciones.

**5B — Google Calendar:** OAuth con scopes mínimos, almacenamiento cifrado de credenciales, alta/actualización/desvinculación, sincronización selectiva y deduplicación por IDs; no usar credenciales del login Google como si fueran credenciales de Calendar. Probar revocación, errores 401/429 y eventos duplicados.

**5C — Gemini:** proponer recordatorios estructurados con confirmación humana y auditoría, solo tras existir backend/scheduler verificables.

## Criterios de cierre de 5A.1

1. Pruebas de validación de fecha/título/notas y no permitir programar instantes pasados.
2. Tests SQL de RLS, usuario ajeno y acceso anónimo; navegación móvil/escritorio.
3. CI verde, migración aislada probada, revisión y autorización antes de tocar Supabase de producción.
4. No afirmar que un recordatorio será notificado sin un canal habilitado y verificado.
