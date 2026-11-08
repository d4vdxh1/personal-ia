# Fase 5A.3 — Recurrencias de recordatorios

## Contrato

- Series con frecuencia diaria, semanal (días 0–6) o mensual (día de inicio). El mes sin ese día se **omite**; no se traslada automáticamente al último día.
- Horarios locales explícitos; zonas iniciales: `America/Asuncion`, `America/Argentina/Buenos_Aires` y UTC. Las fechas en `reminders.scheduled_at` siguen almacenadas como `timestamptz`.
- El worker de Web Push llama a `claim_push_deliveries`, que materializa las ocurrencias de los próximos 14 días antes de seleccionar las vencidas. **No se crea un segundo cron** ni se modifica el intervalo del existente.
- Un registro en `reminders` representa una ocurrencia inmutable respecto de su fecha de serie. La clave `(series_id,occurrence_date)` impide duplicarla en materializaciones concurrentes.
- La pausa o modificación cancela futuras ocurrencias `pending`, sin borrar el historial. Al reactivar se recrean solo ocurrencias marcadas como regenerables, no las canceladas manualmente.
- Límites: 30 series activas por cuenta; 31 días máximo en una materialización; el servidor nunca acepta `user_id` del navegador.
- La migración es incremental y requiere pruebas de RLS, colisiones, pausa, propiedad y días inválidos. Web Push sigue siendo de mejor esfuerzo, no exactamente una vez.

## Consideraciones

1. Para evitar sorpresas al crear series con horas anteriores al momento actual, solo se programan eventos desde dos minutos antes del cálculo del cron.
2. Las horas locales inexistentes en saltos de horario de verano se omiten; los horarios ambiguos se resuelven según PostgreSQL.
3. El plazo de 14 días es suficiente para generar progresivamente eventos recurrentes sin una tabla enorme. Los recordatorios con una sola fecha no se alteran.
4. La UI actual de recurrencias no cambia la zona horaria general del resto de la app; eso se integrará como preferencia del perfil.
5. No habilitar `materialize_recurring_reminders` para usuarios finales ni incluir el schema privado en la Data API.
