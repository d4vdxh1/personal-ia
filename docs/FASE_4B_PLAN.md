# Fase 4B — Acciones confirmadas del asistente

**Estado al 7/11/2026:** siguiente fase, todavía sin herramientas de escritura activas. Fase 4A (Gemini de lectura) permanece publicada.

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