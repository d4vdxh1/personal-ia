# PROJECT_STATUS — Día a Día

**Última actualización:** 2026-11-06
**Identidad:** Día a Día · Un paso más. Identificador técnico: personal-ia. Se conservan repositorio, carpeta, proyecto Supabase y URL de Vercel.
**Estado general:** Fases 0 y 1 cerradas. Paso 8 de fase 1 cerrado por confirmación del usuario el 2026-10-11: «funciona todo».
**Fase actual:** Fase 2 — Entrenamiento en desarrollo, autorizada junto con recuperación de pruebas y sincronización de GitHub el 2026-11-05.

## Continuidad y revisión del 2026-11-05

- GitHub main está en ae65292. El cierre funcional y la planificación del commit local 360df0e siguen vigentes; el PR #1 contiene pendientes anteriores a esa confirmación y será reemplazado por la entrega actual.
- Vercel success confirmado en GitHub. HTTP actual sin sesión: login 200; seis rutas internas y diagnóstico retirado redirigen 307 al login con private, no-store. No equivale a una nueva prueba autenticada.
- Instalación local incompleta detectada: faltan Next.js, TypeScript y ESLint. Recuperación desde package-lock en curso; todavía no se declaran aprobadas las pruebas actuales.
- Supabase conectado: proyecto personal-ia identificado y seis tablas actuales con RLS confirmado directamente. No repetir migración inicial. Auditoría funcional con dos JWT reales sigue separada del cierre aceptado por el usuario.

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
| Entrenamiento | Implementado localmente: ejercicios, rutinas, programación, sesiones, historial, evolución, medidas y molestias. QA de navegador y publicación en curso. |
| Estudio | Fase 3 pendiente |
| IA, recordatorios, estadísticas y voz | Fases posteriores |

Mi Día integra hábitos, check-in, notas de hoy y vencimientos de objetivos. El calendario independiente y las relaciones de objetivos con actividades requieren ampliaciones posteriores.

## Cierre de fase 1 y verificación

Push de ae652929df37c921998aa4c560276d302166754c confirmado directamente en GitHub el 2026-10-11; Vercel registra success para ese commit. Producción: https://personal-ia-two.vercel.app/.

HTTP sin sesión: login 200; seis rutas internas y diagnóstico retirado redirigen 307 al login con private, no-store. Evidencias locales previas: suites de acciones/datos, lint, build y typecheck correctos; Edge con servicios simulados en seis pantallas a 360/390/768/800/930/1280 px, sin overflow ni botones tapados. Ver docs/CIERRE_FASE_1.md.

Cierre funcional aceptado el 2026-10-11 por confirmación del usuario: «funciona todo». Se conservan las evidencias previas con su alcance original; el agente no realizó nuevas pruebas autenticadas ni una auditoría remota independiente en esta sesión.

## Datos y entorno

Migración inicial aplicada: supabase/migrations/202610090001_initial_schema.sql. Seis tablas: profiles, habits, habit_entries, daily_checkins, journal_entries y goals. RLS habilitado, 24 políticas por dueño y sin permisos CRUD para anon, confirmados por resultados compartidos por el usuario. No repetir la migración. Pruebas SQL locales de aislamiento, FK, duplicados y rangos documentadas en docs/ESQUEMA_INICIAL.md.

Zona horaria diaria vigente: America/Argentina/Buenos_Aires. Fechas locales explícitas y timestamps timestamptz.

.env.local contiene URL y clave pública de Supabase; está excluido de Git. .env.example versiona solo nombres vacíos. Sin claves administrativas, Gemini ni Google configurados. Clientes en src/lib/supabase y proxy en src/proxy.ts. npm run check:supabase es diagnóstico local; no prueba RLS ni login.

## Próxima tarea: fase 2 — Entrenamiento

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

Modelo y recorrido implementados en la rama codex/training-phase2. Migración incremental generada por Supabase CLI: 20261106025508_training.sql, aplicada al proyecto existente. Catálogo remoto: ocho tablas con RLS, cuatro políticas cada una, sin CRUD anon. Pruebas SQL locales y remotas con rollback aprobadas, incluidas transacciones, snapshots, inicio duplicado y aislamiento por roles. No se utilizaron dos JWT reales ni se dejaron fixtures remotos.

Lint, build Webpack con Next 16.4.5 y typecheck aprobados. Suites previas y validaciones nuevas aprobadas. Pendientes antes de declarar publicación: finalizar navegador responsive, push/CI y comprobar Vercel. Se mantiene la distinción entre verificación SQL por roles y login real.

## Reglas y pendientes conocidos

- Mantener menú lateral fijo en escritorio y barra inferior fija en celular; reutilizar src/components/tracking-shell.tsx. Reservar área segura y controles de al menos 44 px con foco visible. Ver AGENTS.md.
- Verificar celular/escritorio a 360/390/768/800/930/1280 px y acceso al botón final. Actualizar DEVLOG y PROJECT_STATUS al cerrar cada paso.
- Priorizar aproximadamente 7 h de sueño; no asumir 17:30–18:00 entre semana como sesión normal de entrenamiento.
- Antecedente de lesión meniscal con bloqueo ocasional: conservar las restricciones documentadas, sin diagnósticos ni recomendaciones automáticas de saltos altos, vallas, pivotes o sprints intensos mientras persista.
- Auditoría actual: Next actualizado a 16.4.5 y correcciones compatibles aplicadas; sin críticas/altas, ocho moderadas de desarrollo relacionadas con minimatch/ESLint. No se aplicó downgrade forzado. Asesores Supabase conservan advertencias previas sobre EXECUTE de rls_auto_enable (event trigger) y protección de contraseñas filtradas desactivada; Entrenamiento no introduce funciones SECURITY DEFINER.
- Antes de cerrar fase 9: activar Vercel Web Analytics e integrar @vercel/analytics.
- Nunca versionar secretos; finanzas futuras sin transferencias/pagos; minimizar datos sensibles enviados a IA.
