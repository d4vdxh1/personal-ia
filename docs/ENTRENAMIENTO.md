# Entrenamiento — alcance y verificación

## Recorrido

Crear ejercicios propios (nombre, grupo, equipo y notas), armar una rutina ordenada y programarla en una fecha. Iniciar una sesión desde la rutina o desde Mi Día, guardar las series realizadas y completarla. Consultar historial y evolución por ejercicio. Registrar medidas corporales y molestias opcionales.

La programación es manual por fecha: permite organizar la semana y reprogramar, sin inventar ventanas horarias ni recomendar cargas. No hay prescripción automática, diagnóstico ni aumento automático de peso. Las restricciones personales y de sueño del plan maestro siguen vigentes.

## Datos

Ocho tablas nuevas: training_exercises, training_plans, training_plan_items, training_schedule, training_sessions, training_sets, training_metrics y training_symptoms. Todas tienen dueño explícito y RLS para las cuatro operaciones. Relaciones compuestas impiden enlazar filas de usuarios distintos.

Las rutinas y ejercicios se archivan. Las sesiones conservan el nombre de la rutina y de los ejercicios al iniciarse, además de sus series. Editar o archivar una rutina no reescribe sesiones existentes. Carga cero representa peso corporal o ausencia de carga externa.

Guardar una rutina y reemplazar sus ejercicios, iniciar una sesión con sus series, y guardar/completar una sesión son operaciones transaccionales mediante funciones SECURITY INVOKER. El usuario se obtiene de auth.uid(); las acciones del servidor también verifican la sesión. No se requieren claves administrativas en la aplicación.

## Criterios de aceptación

- Validación en servidor y base: fechas válidas, rangos, textos, identidad, series y relaciones. No registrar sesiones, síntomas ni medidas en fechas futuras.
- Guardados atómicos, borrador de sesión recuperable y protección ante envío duplicado al iniciar.
- Errores de lectura distinguibles de listas vacías; conservar formulario ante errores de guardado.
- Aislamiento SQL con dos identidades y comprobación de privilegios anon; esto no equivale por sí solo a dos logins/JWT reales en producción.
- Interfaz con TrackingShell, navegación entre módulos, controles de 44 px, foco visible y espacio sobre menú inferior.
- Revisar 360, 390, 768, 800, 930 y 1280 px: sin overflow y acceso al botón final.
- Lint, compilación, TypeScript, pruebas de acciones/datos y navegador; CI sin credenciales reales.

## Publicación

Aplicar únicamente la migración incremental, después de probarla en una base desechable. No repetir el esquema inicial ni ejecutar el bootstrap de pruebas en producción. Verificar catálogo, políticas y asesores después de aplicar. Mantener el estado real de publicación y pruebas en PROJECT_STATUS y DEVLOG.

Entrega del 2026-11-06: PR #2 integrado, CI completo y Vercel aprobados. Migración aplicada: `20261106031833_training.sql` (versión asignada por Supabase MCP, alineada con el archivo local generado originalmente por CLI). El esquema inicial aplicado manualmente se registró como baseline en el historial; su SQL no se repitió.

Catálogo remoto confirmado: ocho tablas nuevas, 32 políticas y ningún permiso CRUD anon. Prueba remota con dos identidades PostgreSQL temporales y rollback aprobada. Navegador local y CI Linux: recorrido completo y trece vistas a seis anchos aprobados. Esto no representa dos logins/JWT reales de producción; el usuario confirmó el funcionamiento general de la aplicación el 2026-11-06, pero sigue pendiente una comprobación independiente con dos identidades reales.

Límites visibles de esta versión: 200 ejercicios, 100 rutinas y 60 próximas programaciones por carga; historial de sesiones/medidas/molestias paginado de diez en diez. Programación manual de una rutina por fecha; sin recurrencia automática ni horarios prescritos.
