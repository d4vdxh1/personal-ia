# Fase 6B y 6C — Analítica comparativa y revisión opcional

**Estado:** PR #20 fusionada en `main@0578f63`, CI #42523136400 aprobado, Vercel preview READY. Despliegue producción iniciado. Falta prueba manual con cuenta real (incluida respuesta Gemini). La rama histórica de desarrollo fue `feat/fase-6b-6c-main`.

## 6B — Comparaciones con datos reales
- `/analytics?period=week`: últimos **7 días móviles** comparados con los 7 anteriores.
- `/analytics?period=month`: últimos **30 días móviles** comparados con los 30 anteriores (**no** meses calendario).
- Indicadores comparados: minutos estudiados, sesiones completadas, puntos porcentuales de cumplimiento de hábitos y diferencia de energía/sueño promedio cuando ambos periodos tienen registros. Sin porcentajes relativos a un período sin datos.
- El historial de progreso de objetivos no tiene snapshots: objetivos actuales se muestran pero **no** se comparan en el tiempo.
- Gráfico de líneas con datos reales, adaptado al período, marcas espaciadas para 30 días.
- Sin migraciones, nuevas tablas ni escrituras. Sesión auth + RLS + `user_id` explícito.
- Si una consulta excede límites de filas o falla, no se muestran resultados incompletos.

## 6C — Resumen Gemini con consentimiento
- Botón **Generar revisión con Gemini** requiere marcar casilla de consentimiento; **ninguna llamada automática** desde el render.
- POST `/api/analytics/review`, solo mismo origen, JSON, sesión válida, periodo allowlisted y consentimiento `true`.
- El servidor calcula de nuevo los agregados: nunca acepta cifras arbitrarias del navegador.
- Se envían **solo números agregados**, sin títulos, notas, correos, IDs o textos de usuarios. No persiste la respuesta.
- Gemini sin herramientas ni funciones de escritura. Máximo de salida y timeout en provider existente. Usa **la misma reserva atómica `reserve_ai_request`** del asistente (20/día, enfriamiento 5s) y sus cuotas de API existentes.
- La reserva de cuota ocurre **antes** de consultar agregados, para limitar abuso de lecturas: también cuenta si después se detecta que no hay actividad suficiente. La respuesta es orientativa; evita recomendaciones médicas o afirmaciones no sustentadas.
- Pruebas de validación de períodos, valores faltantes, diferencias y prompt solo numérico. CI de navegador y base.

## Límites y pendientes
- Los hábitos históricos se calculan con las rutinas **actualmente activas**, no snapshots históricos de configuración.
- `month` representa 30 días, no calendarios civil/mensual; puede ampliarse en un diseño posterior.
- La revisión Gemini requiere `GEMINI_API_KEY` configurada y cuota libre; no se prueba contra API real en CI.
- Google Calendar 5B continúa aplazado. Rediseño general UX/UI continúa **provisional para el MVP**.

## Publicación y aceptación real
- Código fusionado en PR #20; GitHub Actions: `npm test`, `npm run test:db`, lint, TypeScript, build y Playwright aprobados.
- La API de revisión se probó con un proveedor simulado. **No se efectuó llamada real a Gemini con la cuenta del usuario**: comprobar consentimiento, cuota de producción, respuesta y ausencia de escrituras.
- La variable `GEMINI_API_KEY` se mantiene asignada únicamente a producción. No compartir la clave ni habilitarla indiscriminadamente para todas las ramas preview.
- Los 30 días son móviles; el rediseño UX/UI total es una tarea posterior al MVP.
