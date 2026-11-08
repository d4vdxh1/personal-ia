# Día a Día — Estado verificado del roadmap (8/11/2026)

**Referencia de código:** Fases 5A.3 y 5B.1 en `main` (PR #15 y #16); 5C en `main` (PR #17); 5B.2 desarrollado en PR #18. La publicación técnica no implica automáticamente aceptación de la experiencia con una cuenta real.

| Fase | Estado técnico | Validación / bloqueo |
|---|---|---|
| 0–1 Núcleo, acceso, hábitos, diario, check-in, objetivos | Publicada | Pruebas funcionales del usuario realizadas |
| 2 Entrenamiento | Publicada | Falta E2E independiente con dos JWT reales |
| 3 Universidad y estudio | Publicada | CI y aceptación del usuario; control transversal dos JWT pendiente |
| 4A Gemini lecturas | Publicada | Quota/consentimiento; controles de costos globales pendientes |
| 4B.1 Hábitos / 4B.2 check-in / 4B.3 estudio | Publicadas | Confirma antes de escribir, validación/RLS/auditoría |
| 5A.1 Recordatorios manuales | Publicada | RLS y CI |
| 5A.2 Web Push | Publicada | Recepción confirmada en celular/Chrome, Brave configurado |
| 5A.3 Recurrencias | Publicada PR #15 | CI y SQL remoto con dos identidades; aceptación real de recurrencia pendiente |
| 5B.1 Calendar solo lectura | Código publicado PR #16 | **No activo**: faltan OAuth Google Cloud y prueba real |
| 5B.2 Exportación manual | PR #18 | SQL aplicado y CI; flag de escritura desactivado hasta OAuth y prueba Google real |
| 5C Recordatorios propuestos por Gemini | Publicada PR #17 | SQL + CI aprobados; recorrido Gemini real pendiente |
| 6 Analytics inteligente | No iniciado | Dashboard, gráficas, revisión semanal, agregados |
| 7 Voz | No iniciado | Transcripción primero, conversación en tiempo real después |
| 8 Finanzas | No iniciado | Ingresos, gastos, categorías, presupuestos; sin operaciones bancarias |
| 9 Producción estable | Parcial/transversal | Observabilidad, errores, backups, E2E, seguridad, analítica, límites de costo |

## Prioridades antes de iniciar la Fase 6

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
