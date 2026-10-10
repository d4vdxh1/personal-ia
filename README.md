# Día a Día

**Un paso más**. Nombre del producto: **Día a Día**. Identificador técnico: `personal-ia`; repositorio, carpeta, URL de Vercel y proyecto Supabase conservan sus nombres actuales.

Aplicación personal para organizar rutina, hábitos, estudio, entrenamiento y objetivos. El núcleo funcionará manualmente antes de integrar IA.

Estado actual (2026-10-10): fase 0 completada; pasos 1 a 6 de fase 1 confirmados por el usuario. Paso 7 implementado con datos reales. Paso 8 en verificación local; pendiente push, Vercel y aislamiento con dos cuentas. No se hace push en esta sesión.

## Módulos disponibles

### Mi Día y cierre local

Mi Día muestra únicamente registros propios. Diario: últimas tres entradas de la fecha local, con conteo total. Objetivos: hasta tres activos por fecha límite, incluidos vencidos, con avance real. Los cambios de los módulos revalidan el inicio. Se retiran horarios inventados y maquetas: vencimientos reemplazan la agenda de ejemplo; calendario de eventos independiente, entrenamiento y estudio requieren alcance/esquema posterior. No se agregan migraciones.

Se retiraron `/api/health/supabase`, su excepción del proxy, la demo y sus pruebas obsoletas. `npm run check:supabase` sigue disponible como diagnóstico local. Ver [cierre de fase 1](docs/CIERRE_FASE_1.md).

Pruebas locales: `node scripts/test-checkin.mjs`, `node scripts/test-journal.mjs`, `node scripts/test-goals.mjs`, `node scripts/test-today.mjs`, `npm.cmd run lint`, `npm.cmd run build` y `npm.cmd run typecheck`.

Navegador reproducible con Playwright externo y Edge: `node scripts/test-phase1-browser.mjs "RUTA/AL/PLAYWRIGHT/index.mjs" "RUTA/A/COPIA/TEMPORAL"`. Usar puerto 3108 libre y una copia sin `.env.local`, con `src`, `package.json`, configuración de Next/TypeScript/PostCSS y acceso a `node_modules`. Comprueba estados del inicio y las seis pantallas a 360/390/768/800/930/1280 px. Servicios simulados: no demuestra RLS remoto ni escribe datos reales.

| Ruta | Función |
|---|---|
| `/` | Mi Día: hábitos, check-in, tres notas de hoy y tres vencimientos de objetivos activos; conteos reales y estados vacíos/error. |
| `/profile` | Consultar la cuenta y editar el nombre visible. |
| `/habits` | Crear, editar y archivar hábitos; registrar cumplimiento diario. |
| `/check-in` | Guardar y actualizar el check-in del día. |
| `/journal` | Crear, consultar y editar entradas del diario; historial de 10 entradas por página. |
| `/goals` | Crear y editar objetivos semanales/mensuales, registrar avance y filtrar por estado; 10 objetivos por página. |

Todas las pantallas internas, incluido Mi Día, comparten el menú lateral fijo en escritorio y la barra inferior fija en celular. Las reglas de interfaz están en `AGENTS.md`.

### Diario personal

Abrir **Escribir una nota** desde Mi Día, o la pestaña **Diario** de Seguimiento. Elegir hoy o una fecha anterior y completar un hecho relevante (hasta 2.000 caracteres), una nota (hasta 10.000), o ambos. Aprendizajes, momentos positivos y cosas a mejorar se pueden escribir en las notas.

Se permiten varias entradas por día. Después de guardar, **Escribir otra entrada** abre un formulario nuevo. En **Tus entradas**, desplegar una entrada para leerla y usar **Editar entrada** para corregirla. El historial muestra las más recientes primero, con navegación entre páginas. Las fechas usan `America/Argentina/Buenos_Aires`; no se admiten fechas futuras. No hace falta repetir la migración existente.

El usuario confirmó el funcionamiento del diario. La comprobación remota de aislamiento entre dos cuentas sigue pendiente para el cierre de fase.

Verificación local del diario: lint, TypeScript, build y pruebas de acciones correctos. Revisión en Edge con servicios simulados a 360/390/768/800/930/1280 px; creación, edición, recarga, paginación, fallos y sesión vencida comprobados. Menú fijo y controles accesibles al desplazarse, sin desbordamiento horizontal.

### Objetivos y progreso

Abrir **Progreso** desde el menú o **Objetivos** desde las pestañas compartidas. Completar título (hasta 200 caracteres), tipo semanal/mensual, fecha límite, avance entero de 0 a 100 y estado. Se admiten fechas anteriores para conservar y actualizar objetivos históricos; los activos con fecha anterior a hoy muestran el aviso de vencimiento.

Elegir **Completado** fija el avance en 100%; bajarlo vuelve el estado a **Activo**. **Cancelado** conserva el objetivo y su avance. Usar **Editar objetivo** para cambiar cualquier campo. Los filtros Todos, Activos, Completados y Cancelados y la paginación permiten consultar el historial; no se eliminan registros. Vincular objetivos con hábitos/actividades queda para una ampliación posterior del esquema.

Paso 6 confirmado por el usuario. Pendiente aislamiento remoto entre dos cuentas; relación con hábitos/actividades requiere ampliación del esquema. No repetir migraciones; los servicios simulados no prueban RLS remoto.

Verificación local: pruebas de acciones, lint y build con TypeScript correctos. Edge con servicios simulados a 360/390/768/800/930/1280 px: creación, edición, avance, estados, vencimientos, filtros, paginación, errores y sesión vencida correctos, sin desbordamientos horizontales ni errores JavaScript.

## Login local

Abrir `/login` con una cuenta existente de Supabase Auth, correo confirmado y contraseña. Alta y recuperación de contraseña fuera de este paso. Los formularios validan en servidor y muestran errores y estado de envío. `Cerrar sesión` termina la sesión de este dispositivo; una sesión inválida vuelve al login. No se necesitan claves administrativas.

Prueba aislada con Auth simulado, Playwright externo y Microsoft Edge instalado, sin nuevas dependencias:

```powershell
node scripts/test-auth.mjs "RUTA/AL/PLAYWRIGHT/index.mjs"
```

Ejecutar sin otro `next dev` activo y con puerto 3107 libre. No reemplaza la validación con Supabase real.

## Entorno local

El proyecto se verificó con Node.js 24 y npm 11. Las versiones de dependencias están fijadas en `package.json` y `package-lock.json`.

Desde la raíz del repositorio:

```powershell
npm ci
# Configurar .env.local como se indica debajo antes de iniciar.
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). Si ese puerto está ocupado, usar la URL que indique la terminal. Para detener el servidor, presionar `Ctrl+C`.

El proxy de Supabase requiere las dos variables públicas de conexión en `.env.local`.

## Variables de entorno

`.env.example` contiene los nombres sin valores reales. En esta máquina `.env.local` ya está configurado. En una copia nueva, crear el archivo en la raíz y completar la URL y clave pública del proyecto Supabase. En PowerShell, este comando conserva cualquier archivo local existente:

```powershell
if (-not (Test-Path .env.local)) {
    Copy-Item .env.example .env.local
}
```

| Variable | Uso previsto |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública del proyecto Supabase. Obligatoria. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública publicable del proyecto. Obligatoria; reemplaza el nombre ANON_KEY del plan inicial. |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor; opcional si una operación requiere privilegios administrativos. |
| `GEMINI_API_KEY` | Solo servidor; integración de IA en una fase posterior. |
| `GOOGLE_CLIENT_ID` | Integración futura de Google Calendar. |
| `GOOGLE_CLIENT_SECRET` | Solo servidor; integración futura de Google Calendar. |

Las variables con prefijo `NEXT_PUBLIC_` pueden incorporarse al código del navegador. No usar ese prefijo para secretos. Reiniciar el servidor después de modificar variables.

Git excluye `.env` y sus variantes locales; la excepción es `.env.example`, que debe mantenerse sin credenciales. `.gitignore` no elimina archivos que ya estén versionados.

## Comandos disponibles

| Comando | Función |
|---|---|
| `npm run dev` | Iniciar el servidor de desarrollo. |
| `npm run lint` | Revisar el código con ESLint. |
| `npm run typecheck` | Verificar los tipos de TypeScript. |
| `npm run check:supabase` | Verificar Data API y Auth con las variables locales, sin escrituras. |
| `npm run build` | Generar la compilación de producción. |
| `npm start` | Servir la compilación de producción después de ejecutar `npm run build`. |
| `node scripts/test-checkin.mjs` | Validaciones y acciones de check-in con servicios simulados. |
| `node scripts/test-journal.mjs` | Fechas, textos, sesión, edición, filtros por usuario y paginación del diario con servicios simulados. |
| `node scripts/test-goals.mjs` | Fechas, avance, estados, sesión, permisos de edición, filtros y paginación de objetivos con servicios simulados. |

En una copia nueva, ejecutar `npm run build` antes del primer `npm run typecheck` para generar los tipos de Next.js.

## Estructura y seguimiento

- `src/app/`: página inicial, layout y estilos Tailwind.
- `src/lib/supabase/`: configuración y clientes de navegador/servidor, más renovación de sesión.
- `src/proxy.ts`: renueva la sesión y redirige sin sesión; las páginas privadas también verifican al usuario en servidor mediante `src/lib/auth/account.ts`.
- `src/components/tracking-shell.tsx`: menú, encabezado y navegación compartidos de las pantallas internas.
- `src/lib/journal/`: validación y consulta paginada del diario; las acciones autenticadas viven en `src/app/journal/actions.ts`.
- `scripts/check-supabase.mjs`: verifica Auth y consulta una tabla de diagnóstico inexistente con límite cero. El error esperado `PGRST205` confirma acceso a PostgREST; no verifica tablas de negocio, políticas RLS ni login.
- [PROJECT_STATUS.md](PROJECT_STATUS.md): estado actual, pendientes y limitaciones conocidas.
- [DEVLOG.md](DEVLOG.md): historial de cambios y verificaciones.
- [docs/PLAN_MAESTRO.md](docs/PLAN_MAESTRO.md): alcance y roadmap completo.
- [docs/ESQUEMA_INICIAL.md](docs/ESQUEMA_INICIAL.md): seis tablas, reglas RLS, zona horaria y guía para aplicar/verificar la migración.
- `supabase/migrations/`: migraciones versionadas; la primera está aplicada; tablas, RLS y políticas confirmados por los resultados remotos compartidos por el usuario.
- `supabase/tests/`: pruebas SQL para una base PostgreSQL desechable, nunca el bootstrap en producción.

Actualizar `PROJECT_STATUS.md`, `DEVLOG.md`, `docs/PLAN_MAESTRO.md` y `README.md` al terminar cada paso, manteniendo alcance, estado y uso coherentes. Avanzar al siguiente paso solo cuando el usuario lo indique.

Versionar `package-lock.json` junto con los cambios de dependencias. Las dependencias instaladas, compilaciones, cachés, logs y configuración local de Vercel quedan excluidos por `.gitignore`.

## Pendientes conocidos

Antes del cierre de fase 9: activar Vercel Web Analytics en Hobby e integrar `@vercel/analytics`. Pendiente; no se implementa ni se agregan dependencias en este cambio de identidad.

En el paso 1, la auditoría registró 5 alertas altas en dependencias de desarrollo de ESLint y 0 en producción. ESLint 9 se mantuvo por compatibilidad de plugins, aunque npm lo marca fuera de soporte. El detalle está en `PROJECT_STATUS.md`; estos resultados corresponden a esa verificación y no reemplazan una auditoría futura.

El archivo local `promt_supabe_connect.md` se excluye de Git porque contiene los datos del proyecto utilizados para configurar `.env.local`. La integración utiliza solo la clave pública; no requiere una clave administrativa.

Pendiente: confirmar Mi Día con cuenta real y completar cierre remoto del paso 8 tras push: Vercel, sesiones/persistencia, aislamiento con dos cuentas y diagnóstico retirado en producción. Ver `docs/CIERRE_FASE_1.md`. Commit solicitado, sin push en esta sesión.
