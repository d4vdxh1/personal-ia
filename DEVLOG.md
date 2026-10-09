# DEVLOG — Asistente Personal IA

Registro cronológico del desarrollo. **No borrar entradas anteriores.** Agregar las nuevas arriba o abajo de forma consistente; se recomienda más reciente primero.

---

## 2026-10-09 — Fase 1, paso 3: Hábitos y registros diarios implementados

### Objetivo de la sesión
- Implementar de forma robusta la gestión y persistencia de hábitos (`habits` y `habit_entries`) bajo RLS y zona horaria de Buenos Aires, con vista de administración en `/habits` e integración interactiva en Mi Día (`/`).

### Cambios realizados
- Creado `src/lib/habits/constants.ts`: definición de días de la semana ISO (`WEEKDAYS`).
- Creado `src/lib/habits/data.ts`: cálculo de fecha y día ISO local para `America/Argentina/Buenos_Aires`, carga de hábitos del usuario autenticado y su estado completado (`habit_entries`) para hoy.
- Creado `src/app/habits/actions.ts`: Server Actions seguras bajo RLS (`createHabit`, `updateHabit`, `archiveHabit`, `toggleHabit`) con validación de nombres (1-120 caracteres), días de la semana (1-7), upsert en `habit_entries` (`unique (habit_id, entry_date)`) y revalidación de rutas (`/` y `/habits`).
- Creada página `/habits/page.tsx` y componentes `HabitManager` (`src/components/habits/manager.tsx`) y `TodayList` (`src/components/habits/today-list.tsx`).
- Integrada la navegación lateral y acción rápida hacia `/habits`.
- Integrada en Mi Día (`src/app/page.tsx`) la lista real de hábitos programados para el día actual con checkboxes interactivos, cálculo real de porcentaje de progreso y enlace hacia la administración de hábitos.
- Estilos responsivos añadidos en `src/app/globals.css`.

### Pruebas realizadas
- `npm run lint`: correcto, sin errores.
- `npm run typecheck`: correcto.
- `npm run build`: compilación limpia en Next.js Turbopack con rutas dinámicas `/`, `/habits`, `/profile` y `/login`.

### Siguiente paso
- Validación funcional por el usuario en el navegador (crear hábitos, asignar días, marcar/desmarcar en `/` y `/habits`).
- Paso 4: Check-in diario (`daily_checkins`).

---

## 2026-10-09 — Corrección visual del perfil y Mi Día

- Corregido el avatar: al convertirse en enlace, la inicial había perdido el centrado. Se centra con grid y la etiqueta accesible ahora indica «Abrir tu perfil».
- La barra de sesión reserva espacio lateral solo en Mi Día y coincide con el ancho del menú a cada breakpoint. En el perfil ocupa todo el ancho y deja de indicar que es una vista de ejemplo.
- Ajustados ancho y espaciado de la tarjeta de perfil; su altura disponible ahora descuenta la barra superior. Reemplazada la explicación técnica por texto orientado al usuario.
- Lint, typecheck, build y diff correctos. El primer typecheck encontró referencias generadas a `/habits` después de la reversión; el build regeneró los tipos y la repetición pasó.
- Revisión en Edge de los componentes renderizados con datos ficticios, sin conexión a Supabase: 360/390/768/930/1280 px, sin overflow horizontal, barra alineada, perfil centrado y avatar centrado. Capturas inspeccionadas de perfil en escritorio y Mi Día en móvil. Esta revisión visual no prueba autenticación ni guardado real.
- Cambios locales, sin commit ni push; no se retoma el paso 3.

## 2026-10-09 — Fase 1, paso 3: implementación registrada y revertida

- Se registró la implementación de hábitos persistentes, gestión en `/habits` y su integración visual con Mi Día en el commit `94999c1` (`feat: implement phase one habit tracking`).
- A pedido del usuario, se revirtió esa implementación para restaurar el proyecto al estado anterior al paso 3. El commit de reversión conserva la trazabilidad; el código del paso queda fuera de la versión activa para replantearlo más adelante.
- Los cambios de hábitos y la integración visual se revisaron con lint, TypeScript y build; la comparación visual de `/` y `/habits` se realizó en una copia temporal con Auth simulado. No se hicieron escrituras contra Supabase.
- Próximo paso: esperar la nueva definición del usuario para el paso 3. Los pasos anteriores y sus validaciones siguen vigentes.

---

## 2026-10-09 — Identidad del producto: Día a Día

- Ejecutado `docs/promt-cambio-nombre.md`, tras leer AGENTS, PROJECT_STATUS y últimas entradas de este registro y revisar Git. Conservado el trabajo local del login de fase 1.
- Nombre visible actualizado a **Día a Día** en login, marca lateral, encabezado, pie y etiqueta accesible de inicio. Lema secundario **Un paso más**; bienvenida completa solo en login: “Cada día se vuelve más fácil. Lo difícil es hacerlo cada día.”
- Actualizados título, applicationName y descripción del navegador. Ajustados tamaño y espacios de marca/lema para conservar el diseño claro y evitar cortes.
- README, PROJECT_STATUS y PLAN_MAESTRO reflejan la identidad vigente: producto **Día a Día**, identificador técnico `personal-ia`. Repositorio, carpeta, URL de Vercel y proyecto Supabase conservados.
- Registrado pendiente antes del cierre de fase 9: activar Vercel Web Analytics en Hobby e integrar `@vercel/analytics`. No implementado; sin nuevas dependencias.
- Verificaciones: lint, typecheck y build correctos. Build requirió ejecución fuera del sandbox por `spawn EPERM`.
- Revisión de login y pantalla principal a 360/390/768/1280 px con Edge/Playwright y Auth simulado local: sin overflow. Inspeccionadas capturas móvil/escritorio: nombre completo, lema y bienvenida legibles. Capturas en `%TEMP%/dia-a-dia-visual/`.
- La revisión visual se ejecutó en una copia temporal para conservar el servidor activo del usuario. Turbopack rechazó el enlace de dependencias; se usó Webpack solo en esa copia. Un aviso inicial de hidratación provenía de las capturas al ocultar el cursor antes de hidratar; se repitió la revisión sin modificar el cursor.
- Repetición final: título del navegador `Día a Día` verificado; ingreso válido/inválido, recarga, cierre, redirecciones y sesión revocada correctos, sin errores de consola ni de JavaScript con Auth simulado. Indicador de desarrollo desactivado solo en la copia temporal para las capturas.
- Sin cambios en autenticación, sesiones, rutas, esquema ni RLS. Paso 2 de fase 1 no iniciado; validación con cuenta real pendiente. Cambios locales, sin commit, push ni despliegue.

## 2026-10-09 — Fase 1, paso 2: perfil y acceso autenticado

- El usuario confirmó el login con cuenta real; se cierra el paso 1.
- Agregada `/profile`, protegida por la sesión existente. Lee `display_name`, `timezone` y `preferred_sleep_hours` de `profiles` usando el cliente SSR y la sesión del usuario; muestra también su correo autenticado.
- El formulario actualiza solo `display_name`, con validación de longitud y filtro explícito por `user_id` del usuario validado. Confirma éxito únicamente cuando PostgREST devuelve la fila actualizada y revalida perfil y Mi Día.
- Mi Día ahora saluda con el nombre del perfil; si está vacío usa el segmento del correo. El avatar abre `/profile`. Se conserva la zona horaria de Buenos Aires para la fecha mostrada.
- No se modificó el esquema ni las políticas; se usa el RLS y el perfil automático existentes. Documentación del estado actualizada.
- `npm run lint`, `npm run typecheck`, `npm run build` y `git diff --check` correctos. Build ejecutado fuera del sandbox porque el worker de Next fallaba con `spawn EPERM` dentro.
- Pendiente validación funcional de lectura/guardado con la sesión real y aislamiento remoto con dos usuarios autenticados. El entorno de trabajo no tiene una sesión real de usuario ni una segunda cuenta. Las pruebas SQL locales del aislamiento del esquema ya estaban documentadas; no sustituyen la prueba remota.
- Próximo: completar esas comprobaciones cuando haya dos sesiones reales disponibles; luego paso 3, hábitos. No se cambió Supabase remoto.
- Commit `5fbcbb3` creado y enviado a `origin/main` (incluye el login, la identidad Día a Día y el perfil). No se inspeccionó el resultado de Vercel tras el push.

## 2026-10-09 — Fase 1, paso 1: login y sesión

- Implementado `/login` con correo/contraseña para una cuenta existente, validación en servidor, errores y estados de envío. Server Actions de ingreso y cierre local; redirecciones fijas e invalidación de interfaz.
- `/` requiere usuario verificado con `getUser()` en servidor. Proxy renueva cookies con `getClaims()`, redirige sin sesión, conserva cookies al redirigir y evita caché de respuestas de sesión.
- Agregado cierre de sesión en la pantalla principal; contenido demo conservado hasta integrar los módulos reales. Sin alta ni recuperación de contraseña en este paso.
- Leídos AGENTS.md y guías locales de Next.js sobre autenticación, proxy y formularios; consultada documentación oficial SSR de Supabase.
- Lint, TypeScript y build correctos. Build requirió ejecución fuera del sandbox tras `spawn EPERM`.
- Prueba reproducible `scripts/test-auth.mjs`: Edge/Playwright con Auth simulado local, login válido/inválido, ruta privada/no-store, persistencia al recargar, redirección desde login con sesión, cierre y sesión revocada: PASS. Login sin overflow a 360/390/768/1280 px, sin errores de JavaScript. Sin nuevas dependencias.
- Primer intento de prueba contra build no completó ingreso: NEXT_PUBLIC queda fijado al compilar. La prueba final usa `next dev` con variables del Auth simulado. Edge requirió permiso fuera del sandbox.
- Actualizados PROJECT_STATUS y README. Sin cambios en esquema, migraciones, RLS o usuarios; sin commit, push ni despliegue. Producción conserva fase 0.
- Pendiente login exitoso con Supabase real: no se dispone de credenciales de usuario. Próximo: paso 2, perfil, fecha local y aislamiento RLS con dos JWT reales, cuando el usuario lo indique.

## Plantilla de entrada

```md
## YYYY-MM-DD — Título corto

### Objetivo de la sesión
- ...

### Cambios realizados
- ...

### Archivos principales modificados
- `ruta/archivo`

### Base de datos / migraciones
- Ninguna / detalle...

### Pruebas realizadas
- `npm run lint`
- `npm run build`
- prueba manual...

### Problemas encontrados
- ...

### Decisiones tomadas
- ...

### Pendiente / siguiente paso
- ...

### Commit(s)
- `hash` — mensaje
```

---

## 2026-10-09 — Fase 0 cerrada: diseño y comunicación verificados online

- Commit `aeeaa88` (`feat: add phase zero day demo and production connectivity check`), push correcto a `origin/main`: `53e3bc6..aeeaa88`.
- La nueva demo está publicada en `https://personal-ia-two.vercel.app/`: HTTP 200 y contenido esperado después del push.
- Diagnóstico en Vercel `/api/health/supabase`: HTTP 200, `status: ok`, `auth: reachable`, `dataApi: restricted`, `Cache-Control: no-store, max-age=0`. Confirma comunicación desde producción usando variables configuradas, sin revelar valores ni devolver registros.
- Playwright/Edge online: PASS a 360, 390, 768 y 1280 px; sin overflow ni errores de consola, hábitos/progreso, navegación, diálogo/Escape/foco, teclado y reset al recargar correctos.
- Actualizados PROJECT_STATUS, README e informe de cierre. Pasos 1 a 7 completos dentro del alcance de fase 0. Estas actualizaciones documentales se publicarán en un segundo commit.
- No se probó acceso autenticado ni aislamiento con JWT reales; corresponde al login de fase 1. No se repitió la migración ni se realizaron escrituras en Supabase, cambios de RLS, usuarios de prueba o creación de otro proyecto Vercel.
- Esperar autorización del usuario para fase 1. Diagnóstico temporal mínimo y retirada documentados en `docs/CIERRE_FASE_0.md`.

## 2026-10-09 — Diseño de fase 0 y preparación de verificación en producción

- Leída y ejecutada la guía `docs/FASE_0_DISENO_Y_CIERRE_CODEX.md`. Conservados los cambios previos del paso 4; no se repitió ninguna migración.
- Implementada vista de ejemplo Mi Día: navegación responsive, agenda ficticia, registro rápido explicativo, hábitos en memoria y progreso calculado, estados vacíos y tarjetas de cierre/estudio/entrenamiento. Sin acceso a datos personales ni persistencia.
- Componentes reutilizables, iconos SVG, paleta clara, diálogos nativos, foco, etiquetas y fecha de Buenos Aires generada en servidor.
- Diagnóstico GET mínimo sin caché ni datos sensibles: verifica Auth y rechazo anónimo esperado de PostgREST usando solo clave pública. Timeout de seis segundos, sin cookies ni paso por proxy; retirada documentada.
- Lint, typecheck y build correctos. Pruebas del diagnóstico cubren variables ausentes, red, clave inválida, tabla ausente, permisos y salida sin detalles internos.
- Playwright/Edge contra producción local: 360, 390, 768 y 1280 px; sin overflow, hábitos/progreso, navegación, teclado, diálogos/foco y consola correctos. Revisadas capturas móvil/escritorio y contrastes principales (>4.5:1). Playwright y Prettier se instalaron fuera del proyecto, sin nuevas dependencias de la app.
- Corregidos un Link interno detectado por lint y un icono ausente que causaba 404. Las capturas finales usan `next start` para evitar la superposición del indicador de desarrollo.
- Diagnóstico local: HTTP 200, Auth reachable, Data API restricted. No equivale a una prueba con usuario autenticado.
- Pendiente: commit/push autorizado y verificación de producción. Fase 0 aún no declarada completa en esta entrada.

## 2026-10-09 — Cierre del paso 4: catálogo remoto confirmado

- El usuario compartió el resultado restante de `supabase/verify_schema.sql`: las seis tablas existen, tienen RLS habilitado, cuatro políticas cada una y ningún permiso CRUD para `anon`.
- Junto con las 24 políticas compartidas previamente y las pruebas locales del esquema, esta evidencia permite cerrar el paso 4. No se ejecutó una nueva consulta remota desde el agente ni se repitió la migración.
- Actualizados PROJECT_STATUS, README y ESQUEMA_INICIAL para reflejar el cierre. Las pruebas funcionales con sesiones Auth/JWT reales quedan para la implementación del login.
- Verificación documental con `git diff --check`. Sin cambios de código, nuevos tests, commit, push o despliegue.
- Siguiente paso: 5, diseño básico mobile-first, únicamente cuando el usuario lo indique. El paso 6 permanece verificado y el paso 7 pendiente.

## 2026-10-09 — Verificación parcial del esquema remoto por resultado del usuario

- El usuario compartió el segundo resultado de `supabase/verify_schema.sql`: 24 políticas en las seis tablas, cuatro operaciones por tabla, rol `authenticated` y comparación de `auth.uid()` con `user_id` en las cláusulas esperadas.
- El resultado confirma la existencia de tablas y políticas en el proyecto consultado; no muestra `relrowsecurity` ni los privilegios de `anon`. Pendiente el primer resultado de seis filas para cerrar la verificación del paso 4.
- Actualizados PROJECT_STATUS, README y guía del esquema para reflejar esta evidencia. No se repitió ni se modificó la migración y no se avanzó al paso 5.
- Revisión documental y `git diff --check`; no se ejecutaron nuevas pruebas de base ni de aplicación.

## 2026-10-09 — Paso 4: esquema SQL y verificación de publicación en Vercel

### Cambios realizados
- Creada `supabase/migrations/202610090001_initial_schema.sql`: seis tablas, PK/FK, índices, restricciones, timestamps y triggers de actualización/perfil automático; migración transaccional.
- Confirmada la zona `America/Argentina/Buenos_Aires` por el usuario y aplicada a fechas diarias y perfil.
- Definidos 24 permisos por fila mediante RLS (CRUD propio en cada tabla), sin acceso anónimo ni transferencia de dueño.
- Garantizada la relación entre propietario de hábito y registro con FK compuesta. Un check-in por usuario/día y una entrada por hábito/día.
- Documentado el diseño, decisiones, aplicación manual y límites en `docs/ESQUEMA_INICIAL.md`; agregado `supabase/verify_schema.sql` de solo lectura.
- Agregadas pruebas SQL reproducibles con bootstrap de Auth simulado, exclusivamente para PostgreSQL local desechable.
- Actualizados README y PROJECT_STATUS con el estado real del esquema y Vercel.

### Verificaciones realizadas
- Migración ejecutada correctamente en PostgreSQL 17 dentro del contenedor local `personal-ia-step4-test`, sin publicar puertos.
- Pruebas de dos usuarios: CRUD propio, aislamiento de lectura/actualización/borrado, rechazo de inserción ajena y cambio de dueño en seis tablas; rechazo de acceso anónimo en las cuatro operaciones.
- Verificadas FK entre propietarios, unicidad diaria, validaciones de escalas/progreso/sueño/días, timestamps y cambio de día UTC frente a Buenos Aires.
- Un caso inicial de prueba de inserción usaba un SELECT filtrado por RLS y no intentaba insertar filas; corregido el caso. Suite final: PASS.
- Catálogo: seis tablas con RLS, cuatro políticas por tabla, sin privilegios CRUD para `anon`.
- Contenedor de pruebas detenido al terminar; conservado para reproducibilidad. No se modificó la base remota.
- Vercel: `https://personal-ia-two.vercel.app/` devolvió HTTP 200, título esperado, cabecera Server Vercel y CSS HTTP 200 por HTTPS.
- `git diff --check`: correcto. Sin cambios en el código Next.js o dependencias; no se repitió build.

### Estado y pendientes
- Paso 4: diseño/migración completados y probados localmente; falta aplicar el SQL y verificarlo en Supabase. La clave pública disponible no autoriza DDL; no hay una conexión administrativa SQL disponible.
- Paso 6: publicación inicial verificada. No se inspeccionó el panel, la conexión GitHub, el commit desplegado ni variables de Vercel.
- Paso 7 sigue pendiente: la página pública no prueba acceso a la base desde producción.
- Siguiente acción: ejecutar la migración y luego `supabase/verify_schema.sql` en SQL Editor, usando la guía. No ejecutar el bootstrap de tests en Supabase.
- Sin commit, push ni nuevo despliegue en esta sesión.

## 2026-10-09 — Validación y preparación del commit de los pasos 1 a 3

### Cambios y verificaciones
- Revisados los cambios pendientes de Next.js y Supabase; `package.json` es JSON válido y sus dependencias coinciden con el lockfile.
- `npm run lint` y `npm run typecheck`: correctos. `npm run build`: correcto al repetirlo fuera del sandbox tras un error `spawn EPERM` de permisos.
- Verificadas las exclusiones de `.env.local` y `promt_supabe_connect.md`; sin archivos versionados afectados por las exclusiones. Plantilla `.env.example` con seis variables y valores vacíos.
- Revisados los archivos versionables en busca de credenciales y coincidencias con los valores locales, sin hallazgos.
- El deploy anterior falló porque el commit `e791c56` tenía `package.json` vacío; confirmado con Git (0 bytes). El nuevo deploy queda pendiente de verificar después del push.

### Publicación y alcance
- Preparado un nuevo commit con el mensaje `feat: initialize Next.js app and Supabase connection` para subir a `origin main`.
- Sin reescribir commits, sin force push ni cambios en la configuración global de Git.
- No se avanza al paso 4 ni se agregan funcionalidades. El resultado del commit y push se informa al finalizar la operación.

## 2026-10-09 — Fase 0, paso 3: conexión a Supabase

### Cambios realizados
- Utilizado el proyecto existente indicado en `promt_supabe_connect.md`; creada `.env.local` con URL y clave pública, sin claves administrativas.
- Instalados `@supabase/supabase-js`, `@supabase/ssr` y `@next/env` como dependencias directas con versiones fijadas en package.json y lockfile.
- Agregados clientes de navegador y servidor en `src/lib/supabase`, validación de presencia de variables y gestión de cookies.
- Adaptado el ejemplo a Next.js 16 mediante `src/proxy.ts`, con llamada a `getClaims()` para verificar/renovar sesiones y respuesta no cacheable cuando se escriben cookies.
- Reemplazado `NEXT_PUBLIC_SUPABASE_ANON_KEY` por `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en plantilla y documentación.
- Agregado `npm run check:supabase`: consulta de diagnóstico con límite cero y verificación de disponibilidad de Auth, sin escrituras.
- Excluido el prompt local de conexión de Git. Actualizados README y PROJECT_STATUS.

### Verificaciones realizadas
- `npm run lint`, `npm run typecheck` y `npm run build`: correctos; build reconoce el proxy.
- `npm run check:supabase`: correcto con acceso de red autorizado. Data API devolvió PGRST205 esperado para la tabla de diagnóstico inexistente; Auth devolvió HTTP 200.
- Página local existente en `http://127.0.0.1:3000`: HTTP 200 y título esperado.
- `git check-ignore`: `.env.local` y prompt excluidos; plantilla y lockfile versionables.
- `git diff --check`: sin errores de espacios.

### Problemas y decisiones
- La consulta general de metadatos `/rest/v1/` requiere clave secreta en este proyecto (HTTP 401). Se usó una consulta de diagnóstico mediante SDK con clave pública, sin pedir privilegios administrativos.
- La red del sandbox no permitió la prueba remota; se repitió con autorización.
- Un intento de iniciar otro servidor detectó el servidor existente; se utilizó el que ya estaba activo.
- La instalación sigue reportando las 5 alertas altas conocidas de dependencias. No se aplicaron cambios ajenos a este paso.
- No se creó la tabla `todos` del ejemplo ni se modificó el esquema. Las tablas, RLS y una sesión autenticada real requieren verificaciones posteriores.
- No se implementó login, no se desplegó y no se realizó commit/push.

### Siguiente paso
- Paso 3 completado. Esperar indicación para el paso 4: esquema inicial, relaciones y reglas de acceso.

## 2026-10-09 — Fase 0, paso 2: preparación del repositorio

### Cambios realizados
- Completado `.gitignore`, conservando la exclusión de `node_modules` que ya estaba presente. Agregadas exclusiones de Next.js, TypeScript, compilaciones, cobertura, logs, archivos del sistema, configuración local de Vercel y archivos de entorno.
- Creada la excepción para mantener `.env.example` versionable.
- Completada `.env.example` con seis variables vacías del plan, distinguiendo configuración pública, secretos de servidor e integraciones futuras.
- Escrito README con entorno utilizado, instalación con `npm ci`, ejecución local, comandos de validación, manejo de variables, estructura, seguimiento y pendientes conocidos.
- Actualizado `PROJECT_STATUS.md` y registrada la instrucción de mantener ambos documentos al cerrar cada paso.

### Verificaciones realizadas
- `git check-ignore --no-index`: 16 rutas representativas excluidas correctamente y 6 rutas de código/documentación/plantilla/lockfile permitidas.
- Verificado que las seis variables de `.env.example` no contienen valores.
- `git ls-files --cached --ignored --exclude-standard`: sin archivos previamente versionados afectados por las reglas.
- `git diff --check`: sin errores de espacios.
- Revisados comandos del README contra `package.json` y documentación local de Next.js para instalación y variables.
- No se repitió build ni se reinstalaron dependencias: el paso modifica documentación y reglas de Git, sin cambiar código ejecutable.

### Alcance y siguiente paso
- Sin credenciales reales, cambios en dependencias, conexión a Supabase, despliegue, commit ni push.
- Las alertas de ESLint del paso 1 continúan registradas; no se ejecutó una auditoría nueva en este paso.
- Paso 2 completado. Esperar indicación del usuario para iniciar el paso 3: Supabase y variables locales.

## 2026-10-09 — Fase 0, paso 1: aplicación local

### Cambios realizados
- Inicializados Next.js 16.4.0, React 19.3.0, TypeScript y Tailwind 4.3.3 con App Router en `src/app`.
- Agregados layout en español, página de bienvenida, estilos, configuración de Next/PostCSS/ESLint/TypeScript y lockfile de npm.
- Agregados scripts `dev`, `build`, `start`, `lint` y `typecheck`.
- Next.js generó `AGENTS.md` al iniciar el servidor.
- Actualizado el estado de Git y el orden de pasos acordado con el usuario.

### Pruebas realizadas
- `npm run lint`: correcto, sin advertencias.
- `npm run typecheck`: correcto.
- `npm run build`: correcto. El primer intento encontró `spawn EPERM` del sandbox; se repitió con permiso y finalizó correctamente.
- Servidor de desarrollo en `http://127.0.0.1:3000`: HTTP 200, título esperado y CSS HTTP 200 con utilidades Tailwind generadas.
- `npm audit --omit=dev`: 0 vulnerabilidades.

### Problemas y decisiones
- Auditoría completa: 5 alertas altas en dependencias transitivas de ESLint, originadas en `braces`. No se aplicó el downgrade mayor propuesto por `npm audit fix --force`.
- ESLint 10 produjo advertencias de incompatibilidad de peers; se mantuvo ESLint 9 compatible con los plugins actuales, aunque npm lo marca fuera de soporte.
- Sin cambios en README, `.gitignore` o `.env.example`: corresponden al paso 2.
- Sin base de datos, despliegue, commit ni push.

### Siguiente paso
- Esperar indicación del usuario para el paso 2: `.gitignore`, `.env.example` y README.

## 2026-10-09 — Inicio formal del proyecto

### Objetivo de la sesión
- Definir la dirección técnica y el método de seguimiento del desarrollo.

### Cambios realizados
- Definido el producto como una PWA de seguimiento personal con asistente IA.
- Definido Next.js + TypeScript + Supabase + Vercel como stack base.
- Decidido usar **Gemini API como proveedor principal** por disponibilidad de free tier para un proyecto personal.
- OpenAI API queda como integración futura opcional y no necesaria para el MVP.
- Definido que Gemini usará function calling sobre skills validadas del backend.
- Definido Google Calendar como integración futura para agenda/recordatorios.
- Definido que el MVP funcionará primero sin IA.
- Creados `PROJECT_STATUS.md` y `DEVLOG.md` como mecanismo de continuidad entre VS Code/Codex, GitHub y ChatGPT.

### Archivos principales modificados
- `docs/PLAN_MAESTRO.md` o equivalente.
- `PROJECT_STATUS.md`
- `DEVLOG.md`

### Base de datos / migraciones
- Ninguna todavía.

### Pruebas realizadas
- No aplica; proyecto aún no inicializado.

### Problemas encontrados
- Ninguno.

### Decisiones tomadas
- GitHub será la fuente de verdad del código.
- `PROJECT_STATUS.md` describe el presente.
- `DEVLOG.md` conserva el historial.
- Nunca versionar claves/API secrets.
- Mantener una interfaz `AIProvider` para desacoplar Gemini del dominio.

### Pendiente / siguiente paso
- Crear repositorio GitHub.
- Inicializar Next.js + TypeScript + Tailwind.
- Crear `.env.example`.
- Crear Supabase y configurar autenticación.

### Commit(s)
- Pendiente.
