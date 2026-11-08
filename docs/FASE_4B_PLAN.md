# Fase 4B — Acciones confirmadas del asistente

**Estado al 7/11/2026:** 4B.1 de hábitos publicada por PR #8 y aceptada funcionalmente por el usuario. 4B.2 de check-in está implementada en una nueva rama y tiene la migración aplicada y está lista para probarse con Gemini desde localhost.

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
- En una base **de pruebas**, cotejar las cuatro migraciones existentes y aplicar la incremental `20261108023553_ai_habit_actions.sql`. Conectar el preview exclusivamente a esa base y configurar Gemini en el servidor.
- Con dos cuentas de prueba, crear un hábito para hoy con el mismo nombre en ambas. En la primera, pedir «Completé lectura hoy», cancelar y comprobar en Mi Día que sigue pendiente. Repetir y confirmar. Comprobar el cumplimiento en Mi Día, que el hábito de la segunda cuenta continúa pendiente y un único resultado confirmado en la auditoría. Revisar CI y el recorrido autenticado antes de promover la migración y el código.

### Migración remota aplicada

El 7/11/2026 el usuario autorizó aplicar la migración en el Supabase actual compartido con producción. Quedó registrada como `20261108023553_ai_habit_actions` y se comprobó con SQL transaccional bajo dos identidades. El código del PR #8 ya puede probarse desde localhost conectado a esa base. Evitar repetir la migración. Falta la aceptación del recorrido completo del usuario con Gemini.

## 2026-11-07 — Aceptación funcional de 4B.1

El usuario confirmó «funciona» tras aplicar la migración y repetir el pedido desde localhost con Gemini. Se registra 4B.1 como aceptada funcionalmente por el usuario. La verificación SQL con dos identidades se conserva con su alcance, y queda pendiente la comprobación independiente del nuevo flujo con dos sesiones reales.

La migración `20261108023553_ai_habit_actions` está aplicada. El código está en el PR #8. El próximo paso de entrega es integrar ese PR y verificar el despliegue y el recorrido publicado. Después sigue 4B.2, registro de check-in diario con validación de campos y rangos, vista previa, confirmación explícita de sobrescrituras y auditoría mínima. SMTP permanece en su pendiente independiente.

## Implementación y prueba de 4B.2

`propose_daily_checkin` acepta energía, estado emocional y satisfacción con el día (enteros 1–5). Sueño admite 0–24 horas con dos decimales y estrés admite un entero 1–5. El modelo debe pedir los tres valores obligatorios en un único mensaje cuando falten datos. El servidor reutiliza `parseCheckin` y rechaza notas, fechas, IDs y campos ajenos al contrato.

Ejemplo para probar después de aplicar la migración y arrancar la rama:

> Registrá mi check-in de hoy. Energía 4 de 5, estado emocional 3 de 5, satisfacción con el día 5 de 5. Dormí 7,25 horas.

La tarjeta muestra fecha y valores. Si ya existe un check-in, Confirmar requiere marcar «Confirmo que quiero actualizar estos valores del check-in de hoy». Los campos opcionales omitidos y las notas privadas mantienen sus valores. El servidor verifica otra vez propietario, fecha, caducidad y versión. Si hubo cambios desde la propuesta, se pide una nueva. Cancelar cierra la propuesta.

La migración `20261108025732_ai_checkin_actions.sql` agrega `assistant_private.checkin_actions`, validación SQL y RPC invocadoras. La auditoría conserva propietario, tipo, objetivo, versión, decisión, resultado y tiempos. Las propuestas pendientes almacenan los valores estructurados necesarios hasta procesarse. Al confirmar, cancelar, vencer o fallar durante la decisión, se borran esos valores de la auditoría. La caducidad se comprueba cuando se intenta decidir. La tabla queda fuera de la Data API y con RLS. Hay un máximo de veinte propuestas por cuenta y día.

La revisión automática rechazó aplicar esta migración en el Supabase compartido porque la autorización anterior correspondía a hábitos. Pendiente autorización explícita para 4B.2. Tras aplicarla, cotejar su versión real y alinear el archivo, probar con dos identidades bajo rollback y verificar el recorrido con Gemini antes de integrar el nuevo PR.

QA local aprobado con `npm run lint`, `npm test`, `npm run test:db`, `npm run build`, `npm run typecheck` y `npm run test:browser`. Chromium usa Gemini/Auth simulados y SQL de prueba. Dos conexiones PostgreSQL independientes comprobaron idempotencia, exclusión de propuestas antiguas y actualización manual concurrente. SMTP y 4B.3 continúan pendientes.

### Migración 4B.2 aplicada con autorización

El usuario autorizó aplicar la migración el 7/11/2026. Supabase registró `20261108025732_ai_checkin_actions`. Pasaron las comprobaciones remotas con dos identidades desechables bajo rollback para permisos, cancelación, creación y actualización confirmada, aislamiento, notas, auditoría y reintentos. El bloqueo de autorización anterior queda resuelto.

Para probar, actualizar y ejecutar la rama `feat/fase-4b2-checkin-confirmado` conectada al Supabase actual. Usar el ejemplo completo de escalas de esta guía. La migración ya está aplicada. El PR #9 sigue pendiente de aceptación del recorrido real con Gemini.

## 2026-11-08 — Aceptación y publicación autorizada de 4B.2

El usuario confirmó «está super» después de las instrucciones para probar desde localhost y pidió actualizar GitHub y desplegar en Vercel. Se registra como aceptación funcional por reporte del usuario y autorización para integrar PR #9. La migración `20261108025732_ai_checkin_actions` está aplicada y verificada. El alcance de las pruebas remotas con dos identidades se conserva, y continúa pendiente una comprobación independiente del agente con dos sesiones reales.

Los controles del código funcional aprobaron en GitHub Actions #93, incluidos SQL y Playwright. La entrega siguiente es 4B.3, registrar sesiones de estudio con resolución de materia del propietario, duración válida, vista previa, confirmación y auditoría. SMTP sigue pendiente de forma independiente.

## 2026-11-08 — Fase 4B.3: propuesta en rama de revisión (no publicada)

La rama `feat/fase-4b3-estudio-confirmado` parte de `main@a4ae184`. Implementa `propose_study_session` y `decide_study_proposal`: Gemini solo propone una sesión **realizada hoy**, indicando nombre de materia, tema y minutos (1–720). Si falta cualquiera de esos datos se solicita que el usuario lo indique; no se admiten notas, IDs ni fechas elegidas por el modelo.

Ejemplo: «Hoy estudié Ingeniería del Software durante 45 minutos, tema Arquitectura de software». La tarjeta previa contiene materia, fecha, tema y duración, y ofrece Confirmar o Cancelar. Ninguna propuesta graba sesiones antes de confirmar.

La migración incremental `20261108033000_ai_study_actions.sql` queda **solo en GitHub** hasta que el usuario autorice por separado su aplicación a Supabase. Contiene un registro interno con RLS y acceso limitado por columnas; RPC `SECURITY INVOKER`, resolución del nombre contra materias activas del usuario, rechazo de nombres duplicados, límite de 20 propuestas por día, plazo de diez minutos, bloqueo de la propuesta, ejecución transaccional y auditoría mínima. Al decidir, se eliminan del registro interno los campos académicos propuestos, conservando IDs, resultado y tiempos; no se guardan prompts ni notas privadas.

Para dar por completada la fase: revisar resultados de CI (lint, unitarias, SQL/PGlite, build, tipos y Playwright en seis anchos), probar cancelación/confirmación, doble envío, expiración, sesión vencida, materia ajena, cambios concurrentes y error de escritura en entorno aislado. Después, **solo con autorización**, aplicar la migración al Supabase correspondiente, verificarla con usuarios de prueba y autorizar por separado la fusión a main y despliegue en Vercel. No asumir que el preview equivale a producción.

### Protección de despliegue de 4B.3

El PR #10 integra el código con una bandera de servidor `AI_STUDY_WRITES_ENABLED=false` por defecto. Mientras esté desactivada, `propose_study_session` no se anuncia a Gemini; la API de decisión rechaza su ejecución. Esto permite fusionar el código **sin** migrar la base. Tras autorización explícita para producción, cotejar historial, aplicar/validar migración `20261108033000_ai_study_actions`, probar con dos cuentas y recién entonces configurar `AI_STUDY_WRITES_ENABLED=true` en Vercel. No confundir merge de código con activación funcional.

## Activación autorizada de 4B.3 (8/11/2026)

La versión de migración `20261108033000_ai_study_actions` ya estaba registrada en el Supabase de producción al comprobar el estado. **No se ejecutó otra vez.** Se comprobaron controles de dueño y RPC invocadoras. Con permiso del usuario, la rama `codex/activate-fase-4b3` modifica la activación por defecto para poder publicar el flujo por el despliegue automático de Vercel. El valor de entorno `AI_STUDY_WRITES_ENABLED=false` continúa permitiendo desactivarlo; no se imprimen secretos. Queda pendiente prueba E2E real con cuenta autenticada después del despliegue.
