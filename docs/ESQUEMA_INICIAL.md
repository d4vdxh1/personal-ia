# Esquema inicial — fase 0, paso 4

Estado: diseñado e implementado como migración SQL; probado en PostgreSQL 17 local. **Paso 4 completado: el usuario ejecutó el SQL y compartió ambos resultados de verificación. Confirmados seis tablas existentes, RLS habilitado, cuatro políticas por tabla y ningún permiso CRUD para anon. Las pruebas con sesiones Auth reales se harán al implementar login. No repetir la migración.**

## Tablas

Todas las tablas incluyen `created_at` y `updated_at` de tipo `timestamptz`. Un trigger actualiza `updated_at`. Los IDs de registros son UUID generados por PostgreSQL.

| Tabla | Campos de negocio y decisiones |
|---|---|
| `profiles` | `user_id` es PK y FK a `auth.users.id`, sin ID redundante. Nombre (hasta 100 caracteres), zona horaria y horas de sueño preferidas (0–24, valor inicial 7). |
| `habits` | Dueño, nombre obligatorio (hasta 120), días ISO de la semana (1 lunes a 7 domingo), activo/inactivo. Todos los días equivale a frecuencia diaria. |
| `habit_entries` | Dueño, hábito, fecha local y completado. Un registro por hábito y fecha. FK compuesta `(habit_id, user_id)` impide asociar registros al hábito de otra persona. |
| `daily_checkins` | Un registro por usuario y fecha. Energía, estado emocional y satisfacción obligatorios (1–5). Sueño opcional (0–24), estrés opcional (1–5), notas opcionales (hasta 10000). |
| `journal_entries` | Fecha, hecho relevante (hasta 2000) y notas (hasta 10000); al menos uno debe contener texto. Admite varias entradas por día. |
| `goals` | Título obligatorio (hasta 200), tipo `weekly`/`monthly`, fecha objetivo, progreso 0–100 y estado `active`/`completed`/`cancelled`. Completar requiere progreso 100. |

`weekdays` representa un conjunto de días: la interfaz deberá enviar los días seleccionados sin repetir. Las fechas de objetivos son explícitas; no se obliga a que caigan en domingo o fin de mes. Los objetivos tienen progreso manual inicialmente.

## Fechas y zona horaria

- Zona acordada: `America/Argentina/Buenos_Aires`. En esta versión el perfil solo acepta esta zona; admitir otras requiere una migración y acordar cómo se calculan las fechas.
- `entry_date` es `date`: representa el día local del registro. Su valor por defecto se calcula explícitamente con esa zona, independientemente de la zona de la sesión PostgreSQL.
- `created_at`/`updated_at` representan instantes, no días del calendario. Los timestamps no sustituyen a `entry_date` para agrupar hábitos o check-ins.
- El usuario puede indicar otra fecha para carga histórica. No hay bloqueo de fechas futuras en esta etapa.

## Relaciones y acceso

Cada tabla tiene `user_id` referenciado a `auth.users`. Borrar un usuario elimina sus datos en cascada. Borrar un hábito elimina sus registros; para conservar historial se debe desactivar el hábito con `active = false`.

Se activa RLS en las seis tablas y se crean 24 políticas: lectura, inserción, actualización y borrado por dueño. Se revocan los privilegios de `PUBLIC` y `anon`; `authenticated` recibe únicamente CRUD. Cambiar `user_id` por otro usuario también queda prohibido.

Se crea un perfil vacío al registrar un usuario y se crean perfiles para usuarios preexistentes al aplicar la migración. El trigger de alta usa `SECURITY DEFINER`, `search_path` vacío y referencias calificadas; no es una función invocable por clientes. Las tablas de negocio no dependen de que exista un perfil: eliminar un perfil no borra los hábitos.

Estas reglas aíslan usuarios; no restringen quién puede registrarse. La política de registro de la app personal se definirá con el login. Las claves administrativas y el dueño de la base pueden omitir RLS; nunca deben usarse desde el navegador.

## Aplicar en Supabase

1. Abrir el proyecto correcto en Supabase y entrar en **SQL Editor → New query**.
2. Copiar íntegramente [la migración](../supabase/migrations/202610090001_initial_schema.sql) y ejecutar una sola vez. Está envuelta en una transacción: ante un error no se aplica parcialmente. Si ya existen tablas con estos nombres, detenerse y revisar el esquema; no borrarlas para forzar esta migración.
3. Ejecutar [la verificación de catálogo](../supabase/verify_schema.sql). Debe mostrar seis tablas con RLS habilitado, cuatro políticas por tabla y ausencia de permisos para `anon`.
4. Compartir el resultado sin claves ni datos personales para actualizar el estado remoto. La prueba final con sesiones reales se hará al implementar login.

La aplicación de esta migración crea tablas, índices, políticas, funciones y un trigger en `auth.users`; no agrega datos de hábitos o salud. Si el trigger de perfil fallara, podría impedir nuevas altas: por eso se prueba también la creación de usuarios en la base local.

El SQL Editor no registra automáticamente esta ejecución en el historial de Supabase CLI. Si luego se adopta el CLI, reconciliar el historial antes de intentar aplicar nuevamente el archivo.

## Pruebas reproducibles

Los archivos en `supabase/tests/` son **solo para una base PostgreSQL desechable**. `bootstrap.sql` simula `auth.users`, `auth.uid()` y los roles para probar RLS. No ejecutar este bootstrap en Supabase ni en una base con datos.

En una base PostgreSQL 17 vacía, ejecutar con `psql -v ON_ERROR_STOP=1`, en orden:

1. `supabase/tests/bootstrap.sql`
2. `supabase/migrations/202610090001_initial_schema.sql`
3. `supabase/tests/initial_schema.sql`

Las pruebas usan dos usuarios ficticios, verifican aislamiento en seis tablas, CRUD propio, rechazo de transferencia de dueño, permisos anónimos, FK entre propietarios, unicidad diaria, rangos y cruce de medianoche UTC. El archivo de pruebas revierte sus datos con `ROLLBACK` y finaliza con `PASS`.

Esto valida SQL y RLS en PostgreSQL real, pero no sustituye pruebas de Auth, JWT y Data API en el proyecto Supabase remoto.

Referencias: [RLS de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security) y [perfiles de usuario](https://supabase.com/docs/guides/auth/managing-user-data).
