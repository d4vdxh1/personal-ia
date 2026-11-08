# Fase 5C — Recordatorios desde Gemini con confirmación humana

## Objetivo

El usuario puede decir «Recordame estudiar mañana a las 19:00» o «Recordame leer todos los lunes a las 20:00». Gemini prepara una **propuesta** y muestra una tarjeta antes de escribir en la base. El modelo **no programa el cron ni envía el aviso**.

## Contrato

Tool `propose_reminder` permite exclusivamente:
- `title` — texto explícito de hasta 200 caracteres.
- `date` — fecha YYYY-MM-DD, obligatoria para una sola vez; opcional al empezar una recurrencia.
- `time` — hora local HH:MM.
- `frequency` — `once`, `daily`, `weekly`, `monthly`.
- `weekdays` — días 0 (domingo) a 6 (sábado), únicamente para recurrencia semanal.
- `until_on` — fecha final opcional, solo recurrente.

El servidor da a Gemini la fecha/hora actual de `America/Asuncion` para interpretar expresiones relativas. No debe inventar horas ni datos ausentes. La RPC `propose_ai_reminder` vuelve a validar rangos, propietario, fecha máxima, zona fija, límites diarios y datos. La propuesta dura diez minutos, tiene audit trail mínimo y nunca ejecuta una acción antes de Confirmar.

La decisión en `decide_ai_reminder` exige sesión y origen, bloquea la propuesta para evitar doble confirmación, comprueba vencimiento/propietario y crea un recordatorio individual o una serie. Cancelar no escribe recordatorios. Los textos propuestos se borran del libro de auditoría al procesar la solicitud. RLS mantiene las propuestas fuera de otras cuentas.

## Verificación

- Argumentos estrictos y mensajes ambiguos sin ejecución.
- Dos cuentas: una no ve ni decide la propuesta de otra.
- Confirmación/cancelación, expiración, reintentos, doble clic y límite de 20 propuestas/día.
- RLS y SELECT/INSERT/UPDATE de columna; tabla `assistant_private.reminder_actions` no expuesta directamente en Data API.
- CI: lógica y SQL PGlite, compilación, tipos y Playwright con Gemini simulado.
- Prueba real con Gemini y cuenta autenticada después del despliegue.

**No** se integran eventos externos de Google Calendar ni se conceden permisos OAuth a Gemini.
