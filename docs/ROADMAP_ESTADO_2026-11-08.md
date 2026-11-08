# Día a Día — Estado verificado del roadmap (8/11/2026)

**Referencia de código (actualizada 2026-11-08):** Fases 5A–5C, 6A/6B/6C integradas en `main@0578f63`; PR #19 y #20 fusionadas con CI verde. Google Calendar 5B permanece sin activar por faltar OAuth. La publicación no equivale a prueba manual de Gemini con una cuenta real.

| Fase | Estado técnico | Validación / bloqueo |
|---|---|---|
| 0–1 Núcleo, acceso, hábitos, diario, check-in, objetivos | Publicada | Pruebas funcionales del usuario realizadas |
| 2 Entrenamiento | Publicada | Falta E2E independiente con dos JWT reales |
| 3 Universidad y estudio | Publicada | CI y aceptación del usuario; control transversal dos JWT pendiente |
| 4A Gemini lecturas | Publicada | Quota/consentimiento; controles de costos globales pendientes |
| 4B.1 Hábitos / 4B.2 check-in / 4B.3 estudio | Publicadas | Confirma antes de escribir, validación/RLS/auditoría |
| 5A.1 Recordatorios manuales | Publicada | RLS y CI |
| 5A.2 Web Push | Publicada | Recepción confirmada en celular/Chrome, Brave configurado |
| 5A.3 Recurrencias | Publicada PR #15 y #19 | Usuario confirmó flujo real; agrupación UX opción A ya en producción |
| 5B.1 Calendar solo lectura | Código publicado PR #16 | **No activo**: faltan OAuth Google Cloud y prueba real |
| 5B.2 Exportación manual | Código publicado PR #18, desactivado | SQL aplicado y CI; flag de escritura desactivado hasta OAuth y prueba Google real |
| 5C Recordatorios propuestos por Gemini | Publicada PR #17 | Usuario confirmó pruebas de propuesta, cancelación y confirmación |
| 6 Analytics inteligente | 6A/6B/6C fusionadas PR #19 y #20 | Gráfico de líneas, comparaciones 7/30 días y revisión consentida; CI aprobado; 6C pendiente prueba real con Gemini |
| 7 Voz | No iniciado | Transcripción primero, conversación en tiempo real después |
| 8 Finanzas | No iniciado | Ingresos, gastos, categorías, presupuestos; sin operaciones bancarias |
| 9 Producción estable | Parcial/transversal | Observabilidad, errores, backups, E2E, seguridad, analítica, límites de costo |

## Pendientes de integración y aceptación posteriores a Fase 6

1. Configurar OAuth del proyecto propio en Google Cloud: Calendar API, pantalla de consentimiento, usuario de prueba y redirect exacto `https://personal-ia-two.vercel.app/api/calendar/callback`. Guardar `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`, `GOOGLE_CALENDAR_REDIRECT_URI` y `GOOGLE_CALENDAR_TOKEN_KEY` únicamente en Vercel, sin compartir secretos en el chat ni en GitHub. Después probar conexión, lectura, creación selectiva, reintento y revocación; entonces evaluar `GOOGLE_CALENDAR_WRITE_ENABLED=true`.
2. Probar un recordatorio recurrente real (día/hora local Paraguay), verificar cron y que no se duplique, pausar/reactivar.
3. Desde Gemini pedir «Recordame estudiar mañana a las 19:00», revisar tarjeta, cancelar una vez y confirmar otra, comprobar `/reminders` y notificación. El servidor no debe registrar antes de confirmar.
4. Ejecutar pruebas independientes con dos sesiones autenticadas reales y revisar permisos OAuth, costes, auditorías y zona horaria global.

## Próximas fases

- **6:** analytics inteligente, tendencias y reportes semanales con datos agregados reales.
- **7:** voz: entrada por transcripción con permisos y fallback texto; después modo conversacional.
- **8:** finanzas personales manuales y presupuestos (sin integraciones bancarias ni transferencias).
- **9:** endurecimiento de producción: Vercel Web Analytics, captura de errores, monitoreo de Cron, copias de seguridad, pruebas E2E, antiabuso de Auth, limites globales de Gemini y SMTP transaccional si se habilita registro por email.

**No repetir migraciones ya aplicadas.** Los avisos Web Push son de mejor esfuerzo y requieren permiso del navegador.

## Fase 6A y decisión de interfaz — 2026-11-08

- Fase 5 aceptada funcionalmente por usuario, salvo Google Calendar 5B, deliberadamente pospuesto.
- Recurrentes: una sola próxima ocurrencia visible por serie, demás ocurrencias consultables dentro del bloque de series. Sin cambios en persistencia ni entregas Push.
- Fase 6A: `/analytics` con datos reales: cumplimiento de hábitos activos, estudio por día, sesiones de entrenamiento completadas y programadas, check-in/sueño y objetivos.
- Rama: `feat/fase-6a-analytics-recurrencias-mvp`; no fusionada ni publicada. Ver [Fase 6A](FASE_6A_ANALYTICS.md).
- UX/UI será rediseñada posteriormente; no hacer cambios visuales grandes ahora.

## Continuidad histórica de Fase 6 — 2026-11-08
- PR #19 **fusionada**, commit `2c9e664`, GitHub Actions completo exitoso, Vercel producción READY. Incluye vista compacta de recurrencias y gráfico de líneas de estudio.
- 6B (rama `feat/fase-6b-6c-main`): 7 días vs 7 anteriores y 30 días vs 30 anteriores. Son ventanas móviles, no meses calendario.
- 6C en la misma rama: Gemini analiza solo agregados numéricos y exclusivamente por clic con consentimiento, respetando `reserve_ai_request`.
- **No publicar automáticamente 6B/6C**: revisar CI, PR y aceptación real. Documentación ampliada: [6B/6C](FASE_6B_6C_ANALYTICS.md).
- **5B Google Calendar**: integración OAuth todavía pendiente, sin habilitar scopes adicionales ni exportaciones.
- **Diseño actual**: provisional para MVP; rediseño integral UX/UI pospuesto y solicitado expresamente.

## Actualización final de Fase 6 (2026-11-08)

- **6A:** publicado PR #19, commit `2c9e664`, gráfico SVG de líneas y UX compacta de recurrencias.
- **6B y 6C:** PR #20 fusionada, commit `0578f63`; CI #42523136400 completa `success`. 6B compara 7/30 días y ofrece tendencias; 6C obtiene una revisión Gemini manual con consentimiento, agregados y la cuota existente, sin escrituras.
- **Validación adicional necesaria:** corroborar totales con registros reales y probar Gemini desde una cuenta en producción. La suite simulada no demuestra la cuota real de Gemini.
- **Google Calendar 5B:** OAuth externo y pruebas de exportación pendientes; código ya preparado pero integración no activa.
- **Fase 7:** voz, primero dictado/transcripción con permisos y fallback, después modo conversacional opcional.
- **Fase 8:** finanzas manuales (ingresos/gastos, presupuestos, metas de ahorro), sin conexiones bancarias.
- **Fase 9:** seguridad y observabilidad, backups, E2E de dos cuentas, RLS/Auth, control de consumo Gemini, Web Analytics, rendimiento y monitoreo Push/Cron.
- **Diseño:** UX/UI del MVP provisional; rediseño transversal profesional planificado para después del MVP.
- Las entradas anteriores de este archivo son hitos históricos; este apartado es la referencia más reciente.
