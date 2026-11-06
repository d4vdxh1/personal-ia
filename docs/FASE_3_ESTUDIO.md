# Fase 3 — Universidad y Estudio

**Estado:** implementada, integrada en `main`, publicada y aceptada funcionalmente por confirmación del usuario el 2026-11-06.

## Alcance implementado

- `/study`: resumen, gestión de materias (nombre, docente, semestre, notas de horario, prioridad y archivo), tareas académicas (vencimiento, prioridad, estado), exámenes (fecha, tipo, estado y notas) y sesiones de estudio (fecha, tema, duración y notas).
- Navegación mediante barra lateral de escritorio y directorio `/menu` en móvil.
- Integración en **Mi Día**: hasta tres tareas académicas pendientes y tres exámenes programados, extraídos de registros reales. No hay recomendación IA activa ni calendario general independiente.
- Acciones de servidor con autenticación y validación; consultas separadas según la vista para evitar cargas superfluas.

## Datos y migración

- Versión remota y archivo versionado: `supabase/migrations/20261106141453_study.sql`.
- Tablas: `study_subjects`, `study_assignments`, `study_exams`, `study_sessions`.
- Aislamiento por `user_id`, restricciones y claves foráneas compuestas para impedir referencias entre propietarios diferentes.
- Cuatro políticas de RLS por tabla: select/insert/update/delete. Los roles anónimos no tienen permisos de lectura en estas tablas.
- **La migración ya se aplicó una vez. No volver a aplicarla, ni repetir las migraciones base y entrenamiento.**

## Evidencia y aceptación

- PR #4: https://github.com/d4vdxh1/personal-ia/pull/4, fusionado como `655cb6a`.
- CI: https://github.com/d4vdxh1/personal-ia/actions/runs/42233135767, incluyendo ESLint, tests, PostgreSQL embebido con dos roles, compilación, TypeScript y Playwright con Auth simulado.
- Despliegue Vercel marcado como exitoso. El usuario confirmó posteriormente que la aplicación publicada funciona.
- La confirmación de uso no sustituye una auditoría externa ni una prueba remota con dos cuentas y JWT reales.

## Límites conscientes

- Las tareas aquí implementadas están asociadas a una **materia**, no son un gestor de tareas generales.
- No hay un calendario de eventos, recordatorios ejecutables, IA, ni sincronización automática con Google Calendar.
- No se ha implementado un resumen avanzado de horas por materia ni estadísticas semanales inteligentes; esas capacidades pertenecen a una ampliación posterior/Fase 6.
- Las consultas de listados aplican límites, por lo que en historiales grandes corresponderá añadir paginación completa.

## Continuidad

La siguiente etapa recomendada es Fase 4A de IA de texto de solo lectura, según [FASE_4_IA_V1.md](FASE_4_IA_V1.md). Ver estado vivo en [PROJECT_STATUS.md](../PROJECT_STATUS.md).
