# Fase 6A — Estadísticas de MVP (interfaz provisional)

**Estado:** publicada en `main`, PR #19, commit `2c9e664`, CI y Vercel producción READY. La Fase 6B y 6C están en revisión mediante PR separada. La UX/UI continúa provisional para el MVP.

## Alcance funcional

- Nueva ruta privada `/analytics`, accesible desde navegación desktop y menú móvil.
- Resumen de los últimos siete días **según America/Asuncion**.
- Hábitos: ocasiones cumplidas / ocasiones programadas de hábitos **actualmente activos**. Solo se cuentan fechas desde la creación de cada hábito. Una ocasión no registrada no se da por cumplida; si no hay ocasiones, se muestra raya y no 0%/100% artificial.
- Estudio: minutos y horas registrados en `study_sessions`, con distribución diaria, gráfico de líneas SVG accesible (con título y descripción), y sin contar tareas como horas estudiadas.
- Entrenamiento: número de sesiones completadas y número de sesiones programadas; estos totales se presentan por separado, sin asumir correspondencia 1:1 ni medir adherencia de forma engañosa.
- Check-in: energía y horas de sueño medias solo entre registros válidos, con número de check-ins que informa sobre la cobertura.
- Objetivos: cantidad de objetivos activos, completados (histórico) y progreso medio de los activos.
- Estados vacíos honestos y error global ante fallos, sin estadísticas inventadas.
- Interfaz ligera con CSS nativo y `progress` accesible. **No representa el rediseño final UX/UI**.

## Arquitectura

- Consultas de solo lectura con sesión autenticada y `user_id` explícito en cada tabla, sujetas a RLS.
- Agregaciones deterministas en `src/lib/analytics/summary.ts`; carga separada en `src/lib/analytics/data.ts`.
- Sin nuevos `service_role`, secretos, tablas, RPC, migraciones, Google Calendar, modelos IA o costos por consulta al proveedor.
- Límite de filas por consulta: si se alcanza, la página indica datos incompletos y no muestra cifras parciales. Para escalabilidad habrá que mover agregaciones al servidor de datos con rangos o paginación verificables.

## Pruebas

- `npm test`: función de agrupación de recurrencias y resúmenes de analítica con fechas fijadas, datos vacíos, sesiones, hábitos inactivos y objetivos.
- `npm run test:browser`: incluir `/analytics` en QA responsive de 360, 390, 768, 800, 930 y 1280 px; usa autenticación simulada y SQL embebido, **no credenciales de producción**.
- `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:db` deben pasar antes de fusionar.

## Cierre UX de Fase 5A.3

En `/reminders` se muestra únicamente la **primera ocurrencia pendiente** de cada serie en la lista principal; fechas posteriores quedan dentro de un control desplegable en la tarjeta de la serie. No se modifican las ocurrencias materializadas ni su estado en Supabase, Cron o Web Push. Un recordatorio puntual sigue mostrándose normalmente.

La validación funcional de la Fase 5A/5C fue reportada por el usuario el 2026-11-08. No se declara auditoría independiente autenticada con dos JWT. Google Calendar 5B sigue configurado de forma diferida y **no se activa** en esta entrega.

## Próximos incrementos

- **6B:** comparación de semanas y meses y métricas más detalladas por materia/entrenamiento con muestras suficientes.
- **6C:** revisión semanal con Gemini y consentimiento explícito, sobre agregados y sin acciones silenciosas.
- **Posterior al MVP:** rediseño integral UX/UI. El usuario indicó que el estilo visual actual es provisional y no debe tomarse como diseño definitivo.
