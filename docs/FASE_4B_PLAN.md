# Fase 4B — Acciones confirmadas del asistente

**Estado al 7/11/2026:** 4B.1 implementada en la rama `feat/fase-4b1-habitos-confirmados`, en revisión. Fase 4A (Gemini de lectura) permanece publicada.

## Entrega 4B.1 — Marcar un hábito desde la IA

Ejemplo: «Completé lectura hoy». Gemini puede proponer la acción, pero **no ejecutarla**. Primero el servidor resuelve un hábito propio, activo y programado para el día, sin aceptar identificadores de otra cuenta. Si el nombre es ambiguo, no propone una operación.

El usuario debe ver una tarjeta con nombre, fecha y valor a guardar y elegir **Confirmar** o **Cancelar**. Solo Confirmar inicia una acción de servidor, que vuelve a validar sesión, identidad, horario y permisos RLS. La operación debe ser idempotente y rechazar confirmaciones vencidas o duplicadas.

El servidor registra una auditoría mínima: identificador de usuario, tipo de acción, objetivo, resultado y momento, sin prompts ni notas privadas. La estructura de auditoría y sus permisos se diseñarán y probarán antes de migrar Supabase.

## Entregas siguientes

**4B.2 Check-in diario:** validar campos y rangos; mostrar antes de guardar; confirmar, especialmente si se sobrescribe un registro. No enviar notas íntimas a Gemini sin necesidad.

**4B.3 Sesiones de estudio:** resolver materia del propietario y duración válida; mostrar datos propuestos y confirmar antes de guardar.

## Criterios de salida

- No hay mutaciones automáticas realizadas por Gemini; la confirmación humana es obligatoria.
- Validación de sesión y origen, dueño, fecha y argumentos en servidor; respetar RLS y no usar service_role.
- Pruebas de usuario correcto, usuario ajeno, cancelación, vencimiento, doble clic, reintentos, error de BD y sesión expirada.
- Registro mínimo de acciones y errores sin almacenar contenido sensible.
- CI, pruebas de navegador en móvil y escritorio y prueba autenticada antes de pasar a producción.

## Dependencias y límites

No depende de SMTP. No incorpora recordatorios, tareas generales, Google Calendar, finanzas, voz ni diagnósticos. La activación de 4B requiere una rama aislada y revisión técnica previa.
## Implementación y prueba de 4B.1

1. Con el consentimiento del chat y una reserva de cuota, Gemini puede llamar a `propose_mark_habit` con un único campo de texto, `habit_name`. El servidor descarta llamadas mezcladas o argumentos adicionales. PostgreSQL busca coincidencia exacta por nombre ignorando mayúsculas y espacios exteriores, entre los hábitos propios y activos del día según el calendario de Hábitos (`America/Argentina/Buenos_Aires`). Un nombre duplicado o un hábito ya completado devuelve un mensaje sin tarjeta.
2. El servidor arma la tarjeta con la respuesta de la BD. El navegador envía únicamente el identificador de propuesta y la decisión a `POST /api/assistant/decision`. Ambas rutas comprueban origen, sesión y JSON acotado. La decisión funciona sin contactar de nuevo a Gemini.
3. La RPC bloquea la propuesta. La confirmación comprueba de nuevo la fecha local, el plazo de diez minutos, el dueño, la versión, la actividad y la programación del hábito. El cambio diario y el resultado de auditoría se confirman en una transacción. Repetir una decisión devuelve el resultado previo (HTTP 409). Una propuesta distinta para el mismo hábito completado tampoco duplica el registro.
4. El esquema interno `assistant_private` debe quedar fuera de los esquemas expuestos por la Data API. La tabla `habit_actions` tiene RLS y permisos por columna. Guarda dueño, tipo, IDs, fecha, versión del hábito, decisión, resultado y tiempos. El trigger calcula el resultado. Las funciones operan con `SECURITY INVOKER`. Un fallo al escribir el hábito revierte esa escritura y deja `failed` en la auditoría. Si la BD resulta inaccesible, el servidor registra un evento técnico mínimo y permite consultar el resultado reintentando la misma decisión. Una propuesta abandonada queda pendiente en la tabla y al intentar usarla se comprueba su vencimiento.
5. Se conserva la cuota existente del chat. La RPC admite como máximo 20 propuestas por usuario y día, incluso si se invoca desde la Data API. No se guardan prompts, nombres de hábitos ni notas en la auditoría.

### Verificación antes de publicar

- Ejecutar `npm run lint`, `npm test`, `npm run test:db`, `npm run build`, `npm run typecheck` y `npm run test:browser`. La suite de navegador necesita Chromium de Playwright. Usa Auth y Gemini simulados, con Next y PostgreSQL de prueba.
- En una base **de pruebas**, cotejar las cuatro migraciones existentes y aplicar la incremental `20261108020800_ai_habit_actions.sql`. Conectar el preview exclusivamente a esa base y configurar Gemini en el servidor.
- Con dos cuentas de prueba, crear un hábito para hoy con el mismo nombre en ambas. En la primera, pedir «Completé lectura hoy», cancelar y comprobar en Mi Día que sigue pendiente. Repetir y confirmar. Comprobar el cumplimiento en Mi Día, que el hábito de la segunda cuenta continúa pendiente y un único resultado confirmado en la auditoría. Revisar CI y el recorrido autenticado antes de promover la migración y el código.
