# PROJECT_STATUS — Día a Día

**Última actualización:** 2026-11-06
**Identidad:** Día a Día · Un paso más. Identificador técnico: personal-ia. Se conservan repositorio, carpeta, proyecto Supabase y URL de Vercel.
**Estado general:** Fases 0–3 implementadas y aceptadas funcionalmente; **Fase 4A activada y aceptada por el usuario el 2026-11-06** tras configurar Gemini en Vercel y probar el chat. La confirmación de uso no equivale a una auditoría independiente del proveedor o de aislamiento con dos cuentas reales.
**Fase actual:** Fase 4A — **cerrada funcionalmente por confirmación del usuario** (PR #5, CI y Supabase verificados; Gemini configurado y probado por el usuario en Vercel). **Siguiente: Fase 4B** — herramientas de escritura validadas, confirmadas y auditadas; no implementada.

## Entrega y continuidad del 2026-11-06

- PR #2 integrado en main: c6d6a7a. Incluye el cierre funcional local 360df0e y la implementación eb7a5ab. PR #1 cerrado como sustituido, conservando su historial.
- CI completo aprobado en GitHub, incluido Chromium en Linux: https://github.com/d4vdxh1/personal-ia/actions/runs/42156866761. Vercel success confirmado para c6d6a7a. Producción: https://personal-ia-two.vercel.app/training.
- HTTP actual sin sesión: login 200; inicio y rutas nuevas de Entrenamiento/sesión/evolución redirigen 307 al login con private, no-store. No equivale a una nueva prueba autenticada de producción.
- Dependencias recuperadas, Next actualizado a 16.4.5. Lint, build, tipos, suites, SQL y navegador aprobados; auditoría de producción sin vulnerabilidades.
- Supabase: 19 tablas con RLS (6 iniciales, 8 de Entrenamiento, 4 de Estudio y `ai_daily_usage`), con migraciones `202610090001_initial_schema`, `20261106031833_training`, `20261106141453_study` y `20261106152923_ai_usage`. No repetir migraciones.

## Objetivo y stack

PWA personal para registrar rutina, hábitos, entrenamiento, estudio, sueño, objetivos y progreso. Primero funcionamiento manual; IA después del núcleo.

Next.js 16.4.5 + React + TypeScript + Tailwind; Supabase (PostgreSQL/Auth/RLS); Vercel. Gemini está integrado en el backend mediante `AIProvider` y herramientas de solo lectura; el usuario confirmó que funciona tras configurar la clave en Vercel. Google Calendar, recordatorios y voz corresponden a fases posteriores.

## Funcionalidades actuales

| Módulo | Estado |
|---|---|
| Login y perfil | Completados y confirmados por el usuario |
| Hábitos y registros diarios | Completados y confirmados por el usuario |
| Check-in diario | Completado y confirmado por el usuario |
| Diario personal | Completado y confirmado por el usuario |
| Objetivos y progreso | Completados y confirmados por el usuario |
| Mi Día con datos reales | Completado y confirmado por el usuario |
| Entrenamiento | Publicado y probado (PR #2); incluye ejercicios, rutinas, programación, sesiones, historial, evolución, medidas y molestias. El usuario confirmó el funcionamiento general de la aplicación; falta la comprobación independiente con dos logins reales. |
| Estudio | **Fase 3 cerrada por confirmación del usuario (2026-11-06)**: materias, tareas, exámenes, sesiones y resumen en Mi Día. CI, RLS, migración y Vercel verificados. |
| Asistente IA | **Fase 4A cerrada funcionalmente (2026-11-06)**: chat Gemini operativo según prueba del usuario, cinco consultas de solo lectura, cuota de 20 solicitudes/día y consentimiento. **Fase 4B pendiente**: escrituras validadas y auditadas. |
| Recordatorios, Calendar, estadísticas, voz y finanzas | Fases 5–8 pendientes. Analítica de Vercel y observabilidad: Fase 9. |

Mi Día integra hábitos, check-in, notas de hoy, vencimientos de objetivos, entrenamiento y próximos compromisos académicos. El calendario general independiente y las relaciones de objetivos con actividades siguen pendientes.

## Cierre de fase 1 y verificación

Push de ae652929df37c921998aa4c560276d302166754c confirmado directamente en GitHub el 2026-10-11; Vercel registra success para ese commit. Producción: https://personal-ia-two.vercel.app/.

HTTP sin sesión: login 200; seis rutas internas y diagnóstico retirado redirigen 307 al login con private, no-store. Evidencias locales previas: suites de acciones/datos, lint, build y typecheck correctos; Edge con servicios simulados en seis pantallas a 360/390/768/800/930/1280 px, sin overflow ni botones tapados. Ver docs/CIERRE_FASE_1.md.

Cierre funcional aceptado el 2026-10-11 por confirmación del usuario: «funciona todo». Se conservan las evidencias previas con su alcance original; el agente no realizó nuevas pruebas autenticadas ni una auditoría remota independiente en esta sesión.

## Datos y entorno

Migración inicial aplicada: supabase/migrations/202610090001_initial_schema.sql. Seis tablas: profiles, habits, habit_entries, daily_checkins, journal_entries y goals. RLS habilitado, 24 políticas por dueño y sin permisos CRUD para anon, confirmados por resultados compartidos por el usuario. No repetir la migración. Pruebas SQL locales de aislamiento, FK, duplicados y rangos documentadas en docs/ESQUEMA_INICIAL.md.

Zona horaria diaria vigente: America/Argentina/Buenos_Aires. Fechas locales explícitas y timestamps timestamptz.

.env.local contiene URL y clave pública de Supabase; está excluido de Git. .env.example versiona solo nombres vacíos. Sin claves administrativas, Gemini ni Google configurados. Clientes en src/lib/supabase y proxy en src/proxy.ts. npm run check:supabase es diagnóstico local; no prueba RLS ni login.

## Entrega de fase 2 — Entrenamiento

| Paso | Trabajo | Resultado esperado |
|---|---|---|
| 1 | Modelo de datos y permisos | Migración incremental para ejercicios, planes, sesiones, series, métricas y síntomas; RLS y relaciones por usuario. |
| 2 | Catálogo de ejercicios | Crear, editar y archivar ejercicios con grupo muscular, equipo y notas. |
| 3 | Planes de entrenamiento | Rutinas con ejercicios ordenados, series, repeticiones, carga y descansos previstos. |
| 4 | Rutina semanal | Asignar planes a días y reprogramar respetando los horarios personales. |
| 5 | Registro de sesiones | Iniciar y completar entrenamientos; guardar series, repeticiones, peso, dificultad, duración y notas. |
| 6 | Historial y progresión | Consultar sesiones y evolución por ejercicio con datos reales. |
| 7 | Métricas corporales | Registrar peso y medidas opcionales con fecha e historial. |
| 8 | Síntomas y molestias | Registrar dolor, bloqueos y observaciones asociados a una fecha o sesión. |
| 9 | Integración con Mi Día | Mostrar el entrenamiento programado y su estado, con acceso al registro. |
| 10 | Verificación y cierre | Pruebas funcionales, persistencia, aislamiento entre cuentas, interfaz responsive, push y comprobación en Vercel. |

Modelo y recorrido implementados en la rama codex/training-phase2. Migración incremental generada por Supabase CLI: 20261106031833_training.sql, aplicada al proyecto existente. Catálogo remoto: ocho tablas con RLS, cuatro políticas cada una, sin CRUD anon. Pruebas SQL locales y remotas con rollback aprobadas, incluidas transacciones, snapshots, inicio duplicado y aislamiento por roles. No se utilizaron dos JWT reales ni se dejaron fixtures remotos.

Lint, build Webpack con Next 16.4.5 y typecheck aprobados. Suites previas y validaciones nuevas aprobadas. Chromium sobre compilación de producción con SQL real embebido: recorrido completo, borrador/recarga, completar/historial/evolución, medidas/molestias, fallos de lectura/escritura y sesión vencida aprobados. Trece pantallas/vistas a 360/390/768/800/930/1280 px sin overflow, navegación fija y botones accesibles; capturas móvil/escritorio inspeccionadas. Auditoría de producción: cero vulnerabilidades.

PR #2 integrado: https://github.com/d4vdxh1/personal-ia/pull/2. CI y despliegue aprobados. Se mantiene la distinción entre verificación SQL por roles y dos logins/JWT reales; no se dispone de credenciales de las cuentas del usuario. El usuario confirmó posteriormente que la aplicación publicada funciona; el control con dos JWT reales de cuentas diferentes continúa pendiente como prueba de seguridad independiente.

## Reglas y pendientes conocidos

- Mantener menú lateral fijo en escritorio y barra inferior fija en celular; reutilizar src/components/tracking-shell.tsx. Reservar área segura y controles de al menos 44 px con foco visible. Ver AGENTS.md.
- Verificar celular/escritorio a 360/390/768/800/930/1280 px y acceso al botón final. Actualizar DEVLOG y PROJECT_STATUS al cerrar cada paso.
- Priorizar aproximadamente 7 h de sueño; no asumir 17:30–18:00 entre semana como sesión normal de entrenamiento.
- Antecedente de lesión meniscal con bloqueo ocasional: conservar las restricciones documentadas, sin diagnósticos ni recomendaciones automáticas de saltos altos, vallas, pivotes o sprints intensos mientras persista.
- Auditoría actual: Next actualizado a 16.4.5 y correcciones compatibles aplicadas; sin críticas/altas, ocho moderadas de desarrollo relacionadas con minimatch/ESLint. No se aplicó downgrade forzado. Asesores Supabase conservan advertencias previas sobre EXECUTE de rls_auto_enable (event trigger) y protección de contraseñas filtradas desactivada; Entrenamiento no introduce funciones SECURITY DEFINER.
- Antes de cerrar fase 9: activar Vercel Web Analytics e integrar @vercel/analytics.
- Nunca versionar secretos; finanzas futuras sin transferencias/pagos; minimizar datos sensibles enviados a IA.


## Rediseño claro (PR #3 fusionado)

- Rama de diseño: `design/premium-ui-v2`. Propuesta basada en composición del demo CEX y criterios de Emil Kowalski.
- Paleta: fondo claro, menú blanco, verde original `#16734a` y colores sólidos; sin degradados ni violetas.
- Panel de Mi Día con datos reales; sin cambios en Supabase, RLS, autenticación ni migraciones.
- Estado: PR #3 integrado en main (`30b293b`), CI y Vercel aprobados. Aceptación visual de cuenta real reportada por el usuario; medición de rendimiento real pendiente.


## Navegación reorganizada — PR #3

- Se eliminaron las pestañas transversales redundantes de Seguimiento y se incorporaron accesos independientes para Mi día, Hábitos, Check-in, Mi diario, Objetivos, Entrenamiento y Perfil.
- Entrenamiento tiene cinco subapartados en el lateral de escritorio; en móvil conserva pestañas de sus vistas y acceso desde la pantalla "Más" (`/menu`).
- Diseño coherente extendido a formularios, registros, objetivos, historial, perfil y tarjetas de Entrenamiento mediante `navigation-v2.css`.
- Pruebas de navegación incorporadas a `scripts/test-browser.mjs` y adaptación del test antiguo de etiquetas de navegación.
- Estado de PR #3: fusionado; CI, Playwright y despliegue Vercel aprobados. La persistencia no se modificó con el rediseño.


## Mejora de latencia de navegación (2026-11-06, PR #3)

- Diagnóstico por código: páginas dinámicas verifican usuario y perfil en cada visita; módulos esperan respuesta de Supabase. Entrenamiento cargaba siete tablas independientemente de la pestaña visible.
- `loadTraining` ahora recibe la vista actual: semana (planes, programación, sesiones), ejercicios (catálogo), rutinas (catálogo, planes, ítems), historial (sesiones y series), salud (medidas y molestias). Se mantiene `user_id` y la autorización existentes.
- `src/app/loading.tsx` introduce feedback visual inmediato de carga de rutas y `navigation-v2.css` define skeleton claro y responsive.
- CI del rediseño aprobado y navegación aceptada visualmente por el usuario; la mejora de latencia aún no tiene benchmarks de producción comparables.


## Fase 3 — Universidad y Estudio (publicada)

- Integrado previamente en `main`: PR #3 de rediseño y rendimiento (squash `30b293b`).
- PR #4 fusionado en `main` como `655cb6a`; CI completo aprobado en https://github.com/d4vdxh1/personal-ia/actions/runs/42233135767 y Vercel informó despliegue exitoso. Rama de desarrollo conservada.
- Cuatro entidades: `study_subjects`, `study_assignments`, `study_exams`, `study_sessions`; cada tabla con RLS por dueño, FK compuestas e índices.
- Nuevas pantallas de Estudio: resumen, materias, tareas, exámenes y sesiones; enlaces laterales y desde el menú móvil; vencimientos de estudio en Mi Día.
- Migración aplicada en Supabase como `20261106141453_study.sql` (cotejada con el historial remoto). Cuatro tablas con RLS y cuatro políticas por tabla verificadas, sin permisos SELECT de `anon`. CI final aprobado tras alinear el historial.
- QA: suite de aislamiento SQL con dos identidades, CI y navegador con recorrido de formularios nuevos. Despliegue exitoso en Vercel y aceptación funcional del usuario confirmada el 2026-11-06. Siguen pendientes benchmarks de latencia y una auditoría independiente con dos JWT reales.


## Cierre técnico de Fase 3 — 2026-11-06

- GitHub PR #4: https://github.com/d4vdxh1/personal-ia/pull/4 (fusionado en `main`, commit `655cb6a`).
- Supabase: migración `20261106141453_study` aplicada una vez, cuatro tablas de Estudio con 16 políticas de RLS; no repetir.
- GitHub Actions #42233135767: lint, pruebas unitarias/SQL, build, TypeScript y Playwright aprobados.
- Vercel informó `success` para el commit de integración. El usuario confirmó el funcionamiento de la versión publicada; las pruebas CI usan Auth simulado y no sustituyen dos logins independientes.
- Siguientes pendientes: revisar permisos de ejecución de `rls_auto_enable()`, protección de contraseñas filtradas e iniciar fase 4 (IA de texto) con controles de coste y seguridad.


## Cierre funcional confirmado — 2026-11-06

- El usuario confirmó: «está todo ok» tras la publicación del rediseño y del módulo académico. Se considera **Fase 3 aceptada funcionalmente**; no se afirma haber realizado un nuevo login desde el agente ni pruebas independientes con dos JWT reales.
- PR #2, #3 y #4 fusionados; commit principal de Fase 3 `655cb6a` y cierre documental `88c5075`. Vercel informó despliegue exitoso.
- Próxima fase recomendada: **Fase 4A — asistente de texto de solo lectura**, con `AIProvider`, Gemini en servidor, control de límites y consultas reales de Mi Día, hábitos, Entrenamiento y Estudio; después Fase 4B con escrituras limitadas y auditadas.
- **No implementado aún:** proveedor Gemini, chat y tool calling; tareas generales y recordatorios (el MVP académico tiene tareas por materia, que no son tareas generales), Calendar, scheduler, estadísticas inteligentes, voz y finanzas.
- Riesgos pendientes: avisos de asesores Supabase sobre ejecución de `public.rls_auto_enable()` y contraseñas filtradas; verificar permisos antes de exponer nuevas capacidades de IA. Analítica/observabilidad y benchmarks de navegación pendientes.
- Detalle de Fase 3: [docs/FASE_3_ESTUDIO.md](docs/FASE_3_ESTUDIO.md). Plan de Fase 4: [docs/FASE_4_IA_V1.md](docs/FASE_4_IA_V1.md).


## Fase 4A — Asistente IA de texto (integrada y aceptada)

- PR #5 fusionado en `main` como `79a27ac`; CI completa aprobada: https://github.com/d4vdxh1/personal-ia/actions/runs/42243871582. Chat `/assistant`, menú modular, API autenticada, consulta de datos de usuario mediante cinco tools de solo lectura y adaptador REST Gemini.
- Gemini configurado para modelo estable `gemini-3.5-flash-lite`; clave `GEMINI_API_KEY` solo en servidor. Sin `GEMINI_API_KEY`, el chat informa que falta configuración y no genera respuestas falsas. El usuario configuró la clave de forma privada en Vercel y confirmó haber probado con éxito la conexión real con Gemini el 2026-11-06. El agente no vio la clave ni efectuó una prueba autenticada independiente.
- Contador 20 solicitudes/día y espera de cinco segundos por usuario con migración `20261106152923_ai_usage.sql`, aplicada a Supabase con RLS y permisos de ejecución verificados.
- Sin historial persistente, sin escrituras, con consentimiento explícito antes de enviar consultas o datos al proveedor. Fase 4B pendiente.
- Estado de entrega: CI, migración, RLS y despliegue del código aprobados; configuración de Gemini y conversación real **confirmadas por el usuario**. Próximo trabajo: Fase 4B, sin saltarse validaciones, confirmaciones ni auditoría. Pendiente prueba independiente de proveedor y aislamiento con dos cuentas.


## Aceptación funcional de Gemini — 2026-11-06

- El usuario comunicó: «ya puse todo, ya probé está ok y funciona». Se registra como confirmación de activación de `GEMINI_API_KEY` en Vercel y respuesta satisfactoria del asistente.
- **Fase 4A cerrada funcionalmente por confirmación del usuario.** No se inspeccionó el secreto ni se validó directamente una llamada al proveedor desde el agente; no incluir claves ni datos privados en documentación.
- PR #5 fusionado (`79a27ac`), CI #42243871582 aprobado, migración `20261106152923_ai_usage` aplicada una vez; el acceso a Gemini es exclusivamente de lectura en esta versión.
- **Fase 4B pendiente:** agregar acciones con verificación de dueño, validación de argumentos, confirmación previa y auditoría; priorizar marcar hábitos y registrar check-ins/sesiones de estudio. Tareas generales y recordatorios requieren fases posteriores.
- Pendientes transversales: avisos Supabase sobre `public.rls_auto_enable()` y contraseñas filtradas, pruebas de aislamiento con dos cuentas reales, benchmarks, Web Analytics, observabilidad y controles del gasto del proveedor.


## Acceso público — PR #6 (en desarrollo, no publicado)

- Rama `feat/public-signup-google-auth` y PR #6 en borrador: pantalla `/signup`, email/password con confirmación, inicio Google OAuth PKCE, callback seguro, recuperación y cambio de contraseña.
- El proxy deja públicas solo las rutas de autenticación, manteniendo privadas las rutas de seguimiento, Estudio, Entrenamiento y Asistente. El esquema ya contempla `handle_new_user` para crear un perfil con `user_id`; falta comprobar con cuentas reales nuevas.
- El PR requiere CI, configuración de Supabase Auth y Google Cloud OAuth, entrega real de correos, pruebas con dos cuentas y revisión antiabuso antes de publicarse. No se añadieron migraciones ni se alteraron datos.
- Guía detallada: [docs/REGISTRO_PUBLICO.md](docs/REGISTRO_PUBLICO.md). No confundir interfaz preparada con proveedor Google activado.


## 2026-11-07 — Google OAuth validado; publicación gradual

- El usuario confirmó Google Auth Platform en producción, inicio de sesión Google desde localhost y aislamiento entre dos cuentas reales. La comprobación es funcional, no una auditoría independiente.
- PR #6 integra nuevas pantallas de autenticación con las páginas públicas de presentación y legales.
- Para el primer lanzamiento, Google permite crear cuentas y las cuentas existentes siguen usando contraseña. Registro y recuperación por email quedan bloqueados por defecto con banderas de servidor hasta SMTP.
- El bloqueo en la app **no bloquea la API pública de registro de Supabase**. Revisar CAPTCHA, límites y consumo de Gemini antes de promocionar el acceso.
