# PROJECT_STATUS — Día a Día

**Última actualización:** 2026-11-06
**Identidad:** Día a Día · Un paso más. Identificador técnico: personal-ia. Se conservan repositorio, carpeta, proyecto Supabase y URL de Vercel.
**Estado general:** Fases 0 y 1 cerradas. Paso 8 de fase 1 cerrado por confirmación del usuario el 2026-10-11: «funciona todo».
**Fase actual:** Fase 2 — Entrenamiento implementada, verificada técnicamente y publicada el 2026-11-06. Pendiente aceptación de uso con la cuenta real del usuario.

## Entrega y continuidad del 2026-11-06

- PR #2 integrado en main: c6d6a7a. Incluye el cierre funcional local 360df0e y la implementación eb7a5ab. PR #1 cerrado como sustituido, conservando su historial.
- CI completo aprobado en GitHub, incluido Chromium en Linux: https://github.com/d4vdxh1/personal-ia/actions/runs/42156866761. Vercel success confirmado para c6d6a7a. Producción: https://personal-ia-two.vercel.app/training.
- HTTP actual sin sesión: login 200; inicio y rutas nuevas de Entrenamiento/sesión/evolución redirigen 307 al login con private, no-store. No equivale a una nueva prueba autenticada de producción.
- Dependencias recuperadas, Next actualizado a 16.4.5. Lint, build, tipos, suites, SQL y navegador aprobados; auditoría de producción sin vulnerabilidades.
- Supabase: catorce tablas con RLS (seis iniciales y ocho nuevas). Historial de migraciones alineado con los archivos: baseline initial_schema registrado como ya aplicado, sin volver a ejecutar SQL; training usa la versión remota 20261106031833. No repetir migraciones.

## Objetivo y stack

PWA personal para registrar rutina, hábitos, entrenamiento, estudio, sueño, objetivos y progreso. Primero funcionamiento manual; IA después del núcleo.

Next.js 16.4.5 + React + TypeScript + Tailwind; Supabase (PostgreSQL/Auth/RLS); Vercel. Gemini será el proveedor principal mediante tools validadas en backend e interfaz AIProvider. Google Calendar, recordatorios y voz corresponden a fases posteriores.

## Funcionalidades actuales

| Módulo | Estado |
|---|---|
| Login y perfil | Completados y confirmados por el usuario |
| Hábitos y registros diarios | Completados y confirmados por el usuario |
| Check-in diario | Completado y confirmado por el usuario |
| Diario personal | Completado y confirmado por el usuario |
| Objetivos y progreso | Completados y confirmados por el usuario |
| Mi Día con datos reales | Completado y confirmado por el usuario |
| Entrenamiento | Implementado, probado e integrado por PR #2; CI y Vercel aprobados. Ejercicios, rutinas, programación, sesiones, historial, evolución, medidas y molestias. |
| Estudio | Fase 3 pendiente |
| IA, recordatorios, estadísticas y voz | Fases posteriores |

Mi Día integra hábitos, check-in, notas de hoy, vencimientos de objetivos y entrenamiento de hoy. El calendario general independiente y las relaciones de objetivos con actividades requieren ampliaciones posteriores.

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

PR #2 integrado: https://github.com/d4vdxh1/personal-ia/pull/2. CI y despliegue aprobados. Se mantiene la distinción entre verificación SQL por roles y dos logins/JWT reales; no se dispone de credenciales de las cuentas del usuario. Próximo control funcional: usar Entrenamiento con la cuenta real. Estudio corresponde a fase 3 y requiere una nueva indicación.

## Reglas y pendientes conocidos

- Mantener menú lateral fijo en escritorio y barra inferior fija en celular; reutilizar src/components/tracking-shell.tsx. Reservar área segura y controles de al menos 44 px con foco visible. Ver AGENTS.md.
- Verificar celular/escritorio a 360/390/768/800/930/1280 px y acceso al botón final. Actualizar DEVLOG y PROJECT_STATUS al cerrar cada paso.
- Priorizar aproximadamente 7 h de sueño; no asumir 17:30–18:00 entre semana como sesión normal de entrenamiento.
- Antecedente de lesión meniscal con bloqueo ocasional: conservar las restricciones documentadas, sin diagnósticos ni recomendaciones automáticas de saltos altos, vallas, pivotes o sprints intensos mientras persista.
- Auditoría actual: Next actualizado a 16.4.5 y correcciones compatibles aplicadas; sin críticas/altas, ocho moderadas de desarrollo relacionadas con minimatch/ESLint. No se aplicó downgrade forzado. Asesores Supabase conservan advertencias previas sobre EXECUTE de rls_auto_enable (event trigger) y protección de contraseñas filtradas desactivada; Entrenamiento no introduce funciones SECURITY DEFINER.
- Antes de cerrar fase 9: activar Vercel Web Analytics e integrar @vercel/analytics.
- Nunca versionar secretos; finanzas futuras sin transferencias/pagos; minimizar datos sensibles enviados a IA.


## Propuesta de interfaz clara (PR #3, sin fusionar)

- Rama de diseño: `design/premium-ui-v2`. Propuesta basada en composición del demo CEX y criterios de Emil Kowalski.
- Paleta: fondo claro, menú blanco, verde original `#16734a` y colores sólidos; sin degradados ni violetas.
- Panel de Mi Día con datos reales; sin cambios en Supabase, RLS, autenticación ni migraciones.
- Estado: borrador. Pendientes CI y capturas autenticadas responsive antes de aprobar.


## Navegación reorganizada — PR #3

- Se eliminaron las pestañas transversales redundantes de Seguimiento y se incorporaron accesos independientes para Mi día, Hábitos, Check-in, Mi diario, Objetivos, Entrenamiento y Perfil.
- Entrenamiento tiene cinco subapartados en el lateral de escritorio; en móvil conserva pestañas de sus vistas y acceso desde la pantalla "Más" (`/menu`).
- Diseño coherente extendido a formularios, registros, objetivos, historial, perfil y tarjetas de Entrenamiento mediante `navigation-v2.css`.
- Pruebas de navegación incorporadas a `scripts/test-browser.mjs` y adaptación del test antiguo de etiquetas de navegación.
- Pendiente: comprobar CI y revisión visual autenticada antes de fusionar. Sin modificación de la persistencia ni de la producción.


## Mejora de latencia de navegación (2026-11-06, PR #3)

- Diagnóstico por código: páginas dinámicas verifican usuario y perfil en cada visita; módulos esperan respuesta de Supabase. Entrenamiento cargaba siete tablas independientemente de la pestaña visible.
- `loadTraining` ahora recibe la vista actual: semana (planes, programación, sesiones), ejercicios (catálogo), rutinas (catálogo, planes, ítems), historial (sesiones y series), salud (medidas y molestias). Se mantiene `user_id` y la autorización existentes.
- `src/app/loading.tsx` introduce feedback visual inmediato de carga de rutas y `navigation-v2.css` define skeleton claro y responsive.
- La latencia percibida y la reducción de llamadas no implican valores medidos de producción; pendiente CI, comprobación autenticada y medición de tiempos de red.


## Fase 3 — Universidad y Estudio (rama de desarrollo)

- Integrado previamente en `main`: PR #3 de rediseño y rendimiento (squash `30b293b`).
- Rama `feat/university-phase3`, PR #4 en borrador; **sin fusionar hasta concluir pruebas y despliegue de migración**.
- Cuatro entidades: `study_subjects`, `study_assignments`, `study_exams`, `study_sessions`; cada tabla con RLS por dueño, FK compuestas e índices.
- Nuevas pantallas de Estudio: resumen, materias, tareas, exámenes y sesiones; enlaces laterales y desde el menú móvil; vencimientos de estudio en Mi Día.
- Migración versionada `20261106094500_study.sql`: todavía no aplicar sobre la base existente sin cotejar historial y pruebas.
- QA: suite de aislamiento SQL con dos identidades, CI y navegador con recorrido de formularios nuevos. No se presume aceptación del usuario ni despliegue de producción.
