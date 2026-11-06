# Fase 4 — Asistente IA de texto V1 (Gemini)

**Estado:** **Fase 4A integrada y aceptada funcionalmente el 2026-11-06**. CI, migración y despliegue de código aprobados; el usuario configuró su clave privada en Vercel y confirmó que el chat Gemini funciona. La prueba real fue realizada y reportada por el usuario, no reproducida independientemente por el agente. **Fase 4B pendiente**.

## Objetivo

Permitir preguntar desde Día a Día «¿Qué debo hacer hoy?» y obtener una respuesta basada en registros autorizados de hábitos, objetivos, Entrenamiento y Estudio, sin inventar eventos ni realizar cambios silenciosos.

## Entrega 4A — Lectura segura (primera implementación)

1. Integrar en el backend una abstracción `AIProvider` y un `GeminiProvider`, con clave de API exclusivamente del lado servidor, nunca en `NEXT_PUBLIC_*`.
2. Crear una sección de conversación de texto accesible desde el menú, con estado vacío/error/carga, historial mínimo y diseño actual blanco/verde.
3. Crear adaptadores de solo lectura y autorización por usuario para el plan de hoy, hábitos, entrenamiento programado y compromisos académicos. Los datos de cada herramienta provienen de Supabase/RLS.
4. Normalizar fechas, recortar contexto y responder explícitamente cuando falten datos. No confundir ausencia de registros con errores de base de datos.
5. Validar entrada/salida, imponer rate limit, límite diario de llamadas/tokens, control de costes y manejo de cuotas/fallos del proveedor. Evitar almacenar contenido personal innecesario.
6. Preparar pruebas de selección de tools, aislamiento entre identidades, inyección de instrucciones desde datos recuperados, errores del proveedor y navegación móvil.

**Criterio de cierre 4A:** respuestas fundamentadas, sin modificaciones de datos, con control de costes y pruebas aprobadas. No hace falta implementar multiagentes ni voz.

## Entrega 4B — Escrituras auditadas (posterior a 4A)

Incorporar gradualmente tools para acciones existentes: marcar hábito, guardar check-in y registrar sesiones de estudio; cada una valida argumentos, autentica al propietario, respeta RLS y muestra al usuario qué se va a guardar. Acciones delicadas o reprogramaciones requieren confirmación explícita. Guardar una bitácora mínima de uso y resultado de tools, sin secretos ni contenido sensible superfluo.

El registro de sesiones de Entrenamiento puede necesitar una herramienta adicional que reutilice las operaciones transaccionales ya existentes. No permitir que la IA escriba directamente a tablas sin acciones de dominio.

## Dependencias aún no disponibles

- `create_task` de **tareas generales**: no existe todavía ese módulo; solo existen tareas académicas por materia.
- `create_reminder` y `list_reminders`: no hay tabla de recordatorios ni servicio programado. Deben desarrollarse antes de ofertar estos comandos; la entrega fiable corresponde a Fase 5.
- Google Calendar OAuth, sincronización y notificaciones reales: Fase 5.
- Estadísticas inteligentes, voz, finanzas y multiagentes: fases posteriores.

## Seguridad y despliegue

- Antes de conectar capacidades de escritura revisar las advertencias de Supabase sobre permisos `EXECUTE` en `public.rls_auto_enable()` y protección frente a contraseñas filtradas. Cambiarlas solo tras verificar su función y riesgos.
- Mantener secretos fuera del repositorio, prompts versionados, registro de fallos y pruebas que comprueben que ninguna tool utiliza la clave de servicio para saltarse RLS.
- El objetivo es controlar el gasto (idealmente dentro de cuotas gratuitas disponibles), sin asumir que un modelo o una cuota concreta serán gratuitos indefinidamente.

## Siguiente trabajo técnico

**Fase 4B:** crear una rama nueva para tools de escritura, empezando por acciones existentes (marcar un hábito, registrar check-in y sesión de estudio). Diseñar validación de argumentos, comprobación de propiedad, confirmación del usuario previa a cada acción pertinente, auditoría mínima y pruebas con Auth real cuando sea posible. Conservar el límite de consumo, los permisos RLS y los secretos solo en servidor. No habilitar creación de tareas generales o recordatorios hasta que existan los módulos y la ejecución programada.


## Implementación de Fase 4A (2026-11-06)

- `/assistant`: chat accesible con mensajes limitados a 500 caracteres, historial solo en memoria de la página (no guardado en BD) y mensajes que indican configuración faltante.
- `/api/assistant`: solicitud POST autenticada por Supabase Auth, validada y con origen protegido. No permite acciones de escritura.
- `src/lib/assistant/provider.ts`: `AIProvider` y `GeminiProvider` vía REST, modelo `gemini-3.5-flash-lite` (estable), clave exclusivamente del lado servidor; URLs fijas, tiempo máximo de espera, resultados de herramientas con IDs y limitación de tokens de salida.
- `src/lib/assistant/tools.ts`: lista de cinco herramientas autorizadas de lectura, con consultas al usuario autenticado y límites en filas/campos; se evitan datos de diario, molestias y notas personales.
- `supabase/migrations/20261106152923_ai_usage.sql`: contadores por usuario y fecha, hasta 20 solicitudes diarias y intervalo mínimo de cinco segundos, con función de reserva atómica autorizada, sin guardar contenidos de chat.
- `scripts/test-ai-db.mjs`: verificación de contadores, privilegios y aislamiento en PostgreSQL desechable. Prueba de navegación con clave ausente para verificar que no se simulan respuestas.

### Activación

1. Obtener una API key personal en [Google AI Studio](https://aistudio.google.com/apikey).
2. Agregar `GEMINI_API_KEY` como variable de entorno **solo del servidor** en Vercel, para el ambiente Production; no enviarla por chat, no incluirla en GitHub, no usar prefijo `NEXT_PUBLIC_`.
3. Ejecutar un nuevo despliegue de Vercel para que se aplique la variable y verificar `/assistant` con la cuenta real.
4. Comprobar respuestas sobre Mi Día, Hábitos, Estudio y Entrenamiento, errores del proveedor y límites de cuota.
5. Si el proyecto está en un plan de pago en Google Cloud, establecer presupuesto/alertas desde el proveedor; el límite local de solicitudes **no representa un límite monetario**.

### Privacidad y limitaciones

Los datos enviados a Gemini se limitan a la pregunta y a respuestas estructuradas de herramientas; no se envían automáticamente las notas del diario, síntomas o detalles de salud. Los datos transmitidos a una API externa están sujetos a sus términos y políticas, diferentes según el plan gratuito o pago. No se guarda un historial de chat en nuestro servidor.

Una nueva consulta no hereda el contexto de preguntas anteriores (el transcript visible vive únicamente en la sesión del navegador). La fase no crea tareas generales, recordatorios, sesiones nuevas ni modificaciones; Fase 4B sigue pendiente.

**Estado actualizado (2026-11-06):** CI y migración aprobados; PR #5 fusionado como `79a27ac`; Gemini activado de forma privada en Vercel y **funcionando según confirmación directa del usuario**. No se compartió ni se registró ninguna clave en GitHub o en esta documentación. Fase 4A cerrada funcionalmente; Fase 4B pendiente.

## Validación funcional comunicada por el usuario — 2026-11-06

- Tras configurar `GEMINI_API_KEY` directamente en Vercel, el usuario confirmó: «ya puse todo, ya probé está ok y funciona».
- Se da por cumplido el criterio de aceptación funcional de Fase 4A, **por reporte del usuario**. No se afirma que el agente haya visto respuestas privadas ni realizado llamadas directas a Gemini con la cuenta del usuario.
- La integración conserva el consentimiento antes de transmitir datos, cuotas por usuario, cinco herramientas de solo lectura y ausencia de historial persistente.
- Próximo alcance: Fase 4B de acciones auditadas. Siguen pendientes comprobaciones de aislamiento con dos sesiones reales, observabilidad, costes y alertas de seguridad generales de Supabase.
