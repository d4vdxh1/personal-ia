# DEVLOG — Asistente Personal IA

Registro cronológico del desarrollo. **No borrar entradas anteriores.** Agregar las nuevas arriba o abajo de forma consistente; se recomienda más reciente primero.

---

## 2026-11-06 — Aceptación funcional y actualización del roadmap

- El usuario confirmó «está todo ok» después de la integración de PR #4, la migración de Estudio y el despliegue exitoso de Vercel. Se registra **cierre funcional de Fase 3 por confirmación**, no un nuevo test automatizado ni una auditoría con dos JWT reales.
- Fases 0–3 publicadas. Se revisaron y sincronizaron `PROJECT_STATUS.md`, `README.md`, `docs/PLAN_MAESTRO.md`, `AGENTS.md` y las guías de Entrenamiento y Estudio.
- Se distingue el MVP académico ya implementado (tareas por materia) del gestor general de tareas y los recordatorios programados, todavía inexistentes.
- Se propone Fase 4A de IA Gemini de solo lectura, seguida de 4B con herramientas de escritura validadas y auditadas; los recordatorios reales se reservan para Fase 5.
- Pendientes no bloqueantes: medir latencia real, prueba independiente entre dos cuentas, revisar alertas Supabase sobre `public.rls_auto_enable()` y protección de contraseñas filtradas, activar Web Analytics y observabilidad en Fase 9.
- No se modificó código funcional, esquema, RLS ni claves durante esta actualización documental.

---

## 2026-11-06 — Integración y comprobación de producción

- CI completo en GitHub aprobado (42156866761), incluido navegador Linux y todos los controles estáticos/SQL. PR #2 integrado en main como c6d6a7a; PR #1 cerrado como sustituido. Copia local sincronizada por fast-forward.
- GitHub registra Vercel success para c6d6a7a (despliegue FkyLRkCpwNmPyCw2o1ZcaVmUiUoL). HTTP de producción: login 200; inicio, entrenamiento, sesión y evolución 307 al login con private, no-store. No se atribuye login real ni aceptación del usuario a esta comprobación.
- Historial de migraciones alineado: archivo training renombrado a la versión asignada por MCP (20261106031833); baseline initial_schema 202610090001 registrado como previamente aplicado, sin ejecutar nuevamente su SQL. Esto evita que una futura sincronización intente recrear tablas existentes. Suite SQL repetida correctamente tras ajustar las rutas de prueba.
- Confirmado que los usuarios temporales de la prueba remota no permanecen. Sin cambios a los datos personales existentes. Auditoría de producción: cero vulnerabilidades; advertencias de desarrollo/Supabase preservadas en el estado.
- Fase 2 implementada y publicada técnicamente. Pendiente aceptación de uso con cuenta real; fase 3 no iniciada.

---

## 2026-11-06 — Verificación completa y publicación de la rama

- Migración training aplicada al proyecto existente. Catálogo remoto: ocho tablas nuevas con RLS, cuatro políticas por dueño y sin CRUD anon. Test remoto con dos identidades temporales aprobado, terminado en rollback; sin bootstrap ni fixtures persistentes.
- Lint, build Webpack 16.4.5, typecheck, cinco suites y PostgreSQL embebido aprobados. Auditoría de producción: cero vulnerabilidades. Ocho moderadas transitivas de desarrollo siguen documentadas.
- Chromium sobre build de producción y SQL real embebido: crear ejercicio/rutina/programación, iniciar sesión, guardar borrador/recargar/completar, historial/evolución, medidas/molestias, errores con formulario conservado y sesión vencida aprobados. Trece vistas a seis anchos (360/390/768/800/930/1280), sin overflow ni botones tapados; capturas 360/1280 inspeccionadas. Auth simulado; no se atribuyen dos JWT reales a esta evidencia.
- Rama codex/training-phase2 subida; commit de implementación eb7a5ab y cierre previo 360df0e incluidos en PR #2. Pipeline CI creado y en seguimiento. La entrega reemplaza el PR documental #1 desactualizado.

---

## 2026-11-06 — Modelo y recorrido de Entrenamiento implementados

- Ocho tablas incrementales generadas con Supabase CLI; RLS en cuatro operaciones, FK compuestas por dueño y RPC SECURITY INVOKER. Rutinas/sesiones atómicas, snapshots históricos e inicio idempotente; programación iniciada protegida contra cambios.
- Catálogo, rutinas ordenadas, semana manual, sesiones con borrador y series realizadas/omitidas, historial/evolución, medidas y molestias; integración en Mi Día y TrackingShell. Sin prescripción automática de cargas ni horarios inventados.
- Recuperadas dependencias. Cuatro suites previas, validaciones nuevas y esquema inicial/Entrenamiento con PostgreSQL embebido aprobados. Webpack compiló; Turbopack falló en su proceso CSS de Windows. Navegador y publicación aún en curso; no se acredita todavía QA responsive actual.
- Auditoría actual encontró vulnerabilidades críticas de Next 16.4.0: actualizado Next, @next/env y eslint-config-next a 16.4.5. npm audit fix compatible elimina críticas/altas; permanecen ocho moderadas transitivas de desarrollo en ESLint/minimatch. Sin downgrade forzado.
- Agregadas dependencias de pruebas fijadas y pipeline CI sin credenciales reales. Excluidos caché de npm y copia de pruebas de Git, TypeScript y ESLint.

---

## 2026-11-05 — Inicio de recuperación y fase 2

- Usuario autoriza los cuatro puntos: unificar continuidad/GitHub, recuperar y automatizar verificaciones, recorrido completo de Entrenamiento y ampliación con calendario semanal, métricas y progresión.
- Se conserva el cierre funcional previo confirmado por el usuario. PR #1 documental desactualizado identificado; rama de entrega codex/training-phase2 desde el cierre local 360df0e.
- Revisión HTTP sin sesión: login 200; seis rutas privadas y diagnóstico retirado 307 con private, no-store. Supabase: seis tablas con RLS directamente confirmado; migración inicial no se repite.
- Dependencias locales incompletas; recuperación en curso. Sin cambios de interfaz en esta etapa ni nuevas comprobaciones responsive.

---

## 2026-10-18 — Commit documental del cierre de fase 1

- Revisado el cierre de fase 1 por confirmación del usuario y la planificación de fase 2; commit local solicitado por el usuario.
- Revisados los cinco archivos documentales y git diff --check correcto. Sin cambios de código o interfaz: no se repiten pruebas de aplicación ni responsive. Sin push.

---

## 2026-10-11 — Cierre de fase 1 y planificación de fase 2

- El usuario confirmó «funciona todo» y solicitó cerrar fase 1 y su paso 8. Se registra el cierre funcional sobre esa confirmación y las evidencias previas de pruebas locales, push y estado Vercel success; sin atribuir nuevas pruebas autenticadas al agente.
- Fase 2 — Entrenamiento en planificación: cuadro de diez pasos en PLAN_MAESTRO, desde esquema/RLS hasta validación y publicación; implementación pendiente. Se mantienen navegación compartida, controles accesibles y comprobaciones responsive a seis anchos.
- Actualizados PROJECT_STATUS, DEVLOG, PLAN_MAESTRO, README y CIERRE_FASE_1. Solo documentación; sin cambios de interfaz, migraciones, nuevas pruebas de aplicación, commit ni push. Verificación: git diff --check.

---

## 2026-10-11 — Revisión del push y cierre de fase 1

- Retomado el commit del 10 de octubre `ae65292`; árbol de trabajo limpio al comenzar. `git ls-remote` confirmó que GitHub `main` apunta a `ae652929df37c921998aa4c560276d302166754c`, coincidente con `HEAD` y `origin/main`. El push ya estaba realizado.
- Consultado el estado de ese commit en GitHub: `Vercel: success`, con enlace al despliegue existente `EDYUU9M4bdgz9drcPFx4QUuuGayP`. Sin inspección del panel privado ni de la asignación del alias.
- HTTP en producción sin sesión: login 200 con título Día a Día; las seis rutas internas redirigen 307 al login con `private, no-store`. El diagnóstico temporal también redirige al login y no devuelve datos públicos; 404 con sesión real pendiente.
- Corregidos los pendientes obsoletos de push en PROJECT_STATUS y CIERRE_FASE_1. La fase 1 sigue abierta: confirmar Mi Día, sesiones/cierre, persistencia, navegación responsive en producción y aislamiento de seis tablas con dos cuentas reales.
- Solo documentación; sin modificaciones de interfaz, migraciones, escrituras en Supabase, nuevo commit ni push. No se repitieron build ni pruebas visuales locales; se conserva la evidencia del 10 de octubre a 360/390/768/800/930/1280 px. Verificación documental con `git diff --check`.

---

## 2026-10-10 — Fase 1, paso 7 y verificación del paso 8

- El usuario confirmó el paso 6 y autorizó Mi Día, la verificación final y un commit detallado para hacer push después.
- Mi Día reutiliza `TrackingShell`, con Hoy activo y navegación permanente. Integra hábitos, check-in, tres notas de hoy y tres vencimientos de objetivos activos con conteos y progreso reales. Vacíos y fallos de lectura se distinguen por módulo; fecha consistente y consultas por dueño.
- Retiradas maquetas, horarios inventados, componente/datos demo y pruebas obsoletas. Vencimientos reales sustituyen agenda ficticia; calendario de eventos independiente, entrenamiento y estudio quedan para alcance/esquema posterior. Sin migraciones ni cambios de RLS.
- Retirados `/api/health/supabase` y su excepción del proxy. Evidencia de fase 0 conservada como historial. Agregados `test-today.mjs`, prueba de navegador reproducible y `docs/CIERRE_FASE_1.md`.
- Pruebas de check-in/diario/objetivos/Mi Día, lint, build, typecheck independiente y `git diff --check` correctos. Edge con servicios simulados: inicio vacío/real/error, conteos/límites, hábito persistido tras recarga, sesión vencida, no-store y diagnóstico 404 correctos; sin errores JavaScript. Seis pantallas a 360/390/768/800/930/1280 px, sin overflow y con menú fijo/botones accesibles. Capturas móvil/escritorio de Mi Día inspeccionadas en `%TEMP%/personal-ia-phase1/`. Estas pruebas no demuestran RLS remoto.
- Actualizados los cuatro documentos solicitados. Commit autorizado al finalizar; sin push ni despliegue. Cierre remoto del paso 8 pendiente: confirmación real de Mi Día, Vercel y aislamiento con dos cuentas.

---

## 2026-10-10 — Fase 1, paso 6: Objetivos y progreso

- El usuario confirmó el funcionamiento del paso 5 (diario) y autorizó el paso 6.
- Implementado `/goals`: creación y edición de objetivos semanales/mensuales, título (1–200 caracteres), fecha límite válida, avance entero (0–100) y estado activo/completado/cancelado. Completado fija 100% en el formulario y el servidor rechaza incoherencias; bajar el avance de un completado vuelve a activo. Cancelar conserva el registro.
- Lista con aviso de vencimiento en objetivos activos, filtros por estado y 10 objetivos por página, ordenados por fecha límite e ID. La paginación conserva el filtro.
- `TrackingShell` conserva menú fijo y marca Progreso; acceso desde Mi Día y pestaña Objetivos en pantallas compartidas. Formulario adaptable y mensajes accesibles; borradores conservados ante fallos.
- Acción con autenticación propia, identidad desde Auth, filtro explícito por dueño en lectura/edición y confirmación de fila devuelta; revalidación de `/goals` y `/`. Se reutiliza `goals` y RLS; relación con hábitos/actividades pendiente de ampliación del esquema.
- `node scripts/test-goals.mjs`, lint y build con TypeScript correctos. Pruebas con servicios simulados de fechas, textos, avance, estados, creación, edición propia/ajena/inexistente, sesión, identidad, errores, filtros y paginación; no prueban RLS remoto.
- Edge con Auth/Supabase simulados en copia temporal: estado vacío, creación, recarga, avance, completar, reapertura del formulario al bajar avance, cancelación sin pérdida, vencimientos, filtros, paginación conservando filtro, errores de lectura/guardado y sesión vencida correctos. Borrador conservado ante error y sin errores JavaScript. Verificado a 360/390/768/800/930/1280 px, sin overflow horizontal y con botón accesible al desplazarse sobre el menú móvil; capturas móvil/escritorio inspeccionadas en `%TEMP%/personal-ia-browser/goals-*.png`.
- Actualizados `DEVLOG.md`, `PROJECT_STATUS.md`, `docs/PLAN_MAESTRO.md` y `README.md`. Sin migraciones, cambios de RLS, commit, push ni despliegue. Pendiente validación real; siguiente paso tras confirmación: Mi Día completo (paso 7).

---

## 2026-10-10 — Fase 1, paso 5: Diario personal

- El usuario confirmó el funcionamiento del paso 4 (check-in), que queda validado funcionalmente, y autorizó el paso 5.
- Implementado `/journal` con `TrackingShell`: menú lateral fijo en escritorio e inferior fijo en celular, pestaña Diario, formulario e historial. Accesos desde Nota, cierre del día y sección Más de Mi Día.
- Creación y edición en `journal_entries` con fecha de hoy o anterior, hecho relevante (hasta 2.000 caracteres) y notas (hasta 10.000); al menos uno debe contener texto. Se permiten varias entradas por día. Historial descendente de 10 entradas por página, lectura desplegable y edición de cada entrada.
- Validación en servidor, sesión comprobada dentro de la acción y filtro explícito por usuario en lectura/edición, usando RLS existente. Se confirma guardado solo si vuelve la fila afectada. Se conservan borradores cuando falla el guardado; después de crear, se ofrece escribir otra entrada.
- Pruebas `node scripts/test-journal.mjs` correctas: fechas inválidas/futuras/bisiestas, textos, archivos rechazados, sesión, identidad, creación múltiple, edición propia/ajena/inexistente, errores y paginación. Servicios simulados; no demuestran aislamiento remoto.
- Build y TypeScript correctos. Se retiró la rama de botones demo de registro rápido porque los tres accesos ya tienen rutas reales.
- Revisión completa en Edge con servicios simulados: diario vacío, validación, creación y recarga, edición, error de guardado con borrador conservado, texto HTML escapado, paginación, filtros por usuario, errores de carga y sesión vencida. Sin errores JavaScript. A 360/390/768/800/930/1280 px, sin overflow, menú fijo y botón de guardar accesible al desplazarse. Capturas de 360 y 1280 px inspeccionadas en `%TEMP%/personal-ia-browser/journal-*.png`. Se agregó reserva de desplazamiento inferior para el menú móvil. Lint y typecheck finales correctos.
- Leídos y actualizados `DEVLOG.md`, `PROJECT_STATUS.md`, `docs/PLAN_MAESTRO.md` y `README.md`: avance vigente, uso del diario, reglas de interfaz y siguientes pasos.
- Sin migraciones, cambios de RLS, commit, push ni despliegue. Pendiente prueba con cuenta real y comprobación de aislamiento remoto. Próximo paso tras validación: objetivos y progreso (paso 6).

---

## 2026-10-10 — Perfil integrado con la navegación compartida

- `/profile` reutiliza `TrackingShell`, como Hábitos y Check-in: menú lateral fijo en escritorio, barra inferior fija en celular, encabezado y avatar comunes, y barra de sesión alineada con el contenido.
- El menú indica «Más» en el perfil y permite volver a Hoy o Seguimiento. El enlace «Más» del shell compartido abre `/profile`; las pestañas de hábitos/check-in se muestran solo en esos módulos.
- Los datos de la cuenta y el formulario existente se presentan en una tarjeta adaptable, con ancho máximo de 760 px y mensajes de ayuda/error/éxito conservados. El espacio inferior deja accesible el botón de guardar en celular.
- Verificado en Edge con Auth/Supabase simulados en copia temporal: `/profile` a 360/390/768/800/930/1280 px, sin overflow horizontal y con botón de guardar por encima del menú móvil. Navegación desde el avatar, Hoy, Seguimiento y Más; edición y recarga del nombre; regresión de hábitos/check-in correctas. Sin errores JavaScript. Capturas de 360 y 1280 px inspeccionadas en `%TEMP%/personal-ia-browser/profile-*.png`. Esta prueba no realiza escrituras en Supabase real.
- Lint y build correctos, incluida la comprobación de TypeScript. No se modifican acciones de perfil, esquema ni RLS; cambios locales sin commit ni push.

---

## 2026-10-10 — Fase 1, paso 4: Check-in diario

- Registradas en `AGENTS.md` reglas permanentes para futuras pantallas: navegación siempre visible, reutilización del shell, adaptación móvil/escritorio, controles accesibles y comprobación de que el menú no tape el contenido. También se establece actualizar ambos documentos al cerrar cambios.
- Ajuste solicitado: check-in y hábitos comparten `TrackingShell`, con menú lateral fijo en escritorio y barra inferior fija en celular. Pestañas para pasar entre ambos registros, encabezado y avatar comunes, y barra de sesión alineada con el contenido.
- Formulario dentro de una tarjeta adaptable al ancho disponible, hasta 760 px; campos en dos columnas y una columna en celulares pequeños. Se conserva el espacio inferior para que el menú móvil no tape los controles.
- Revisión en Edge con Auth y Supabase simulados en copia temporal: `/habits` y `/check-in` a 360/390/768/800/930/1280 px, sin overflow horizontal, menú fijo visible y botón de guardar sin quedar tapado. Navegación entre módulos, guardado, recarga y resumen correctos; sin errores JavaScript. Capturas móvil/escritorio inspeccionadas, disponibles en `%TEMP%/personal-ia-browser/checkin-*.png`.
- El usuario confirmó que el paso 3 (hábitos) funciona correctamente; queda validado funcionalmente.
- Implementados `/check-in`, formulario de creación/edición y carga del registro de hoy desde `daily_checkins`. Energía, ánimo y satisfacción obligatorios (1–5); sueño opcional (0–24 h, hasta dos decimales), estrés opcional (1–5) y notas opcionales (hasta 10.000 caracteres), según el esquema existente.
- Server Action con autenticación propia, identidad del usuario tomada de la sesión, validación en servidor y upsert por `user_id,entry_date`. Fecha de Buenos Aires calculada en servidor; se rechazan formularios de un día anterior. Sin migraciones ni cambios en RLS.
- Formulario con valores persistidos, controles deshabilitados durante guardado y mensajes accesibles de éxito/error. Los valores ingresados se conservan al enviar el formulario.
- Acción rápida de Check-in conectada y resumen real en Mi Día; revalidación de `/` y `/check-in` tras guardar. Aclarado el aviso de ejemplos para distinguir los módulos que ya guardan datos.
- `node scripts/test-checkin.mjs`: correcto; pruebas con Supabase simulado de validaciones, campos opcionales, cambio de fecha local, identidad, sesión, actualización sin duplicados y fallo de base de datos. No prueba RLS remoto ni guardado real.
- Lint, TypeScript y build correctos; `/check-in` incluida como ruta dinámica protegida por la sesión existente.
- Pendiente validación del usuario con cuenta real: crear, recargar, editar sin duplicados y comprobar el resumen de Mi Día; verificar aislamiento entre usuarios. La revisión visual y funcional con servicios simulados no sustituye esa comprobación.
- Cambios locales, sin commit, push ni despliegue. Próximo paso tras validar: paso 5 (diario personal).

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


## 2026-11-06 — Rediseño claro, PR #3 (pendiente de validación)

- Cambios aislados en rama `design/premium-ui-v2`; sin integrar ni publicar.
- `src/app/design-v2.css`: diseño blanco/verde sin degradados; navegación, botones y formularios de mayor contraste.
- `src/app/page.tsx`: hero editorial + panel de actividad con información real y enlaces a módulos.
- `src/app/layout.tsx`: carga del CSS adicional; sin modificar reglas de negocio.
- Pendiente CI y pruebas visuales autenticadas a 360/390/768/800/930/1280 px; comprobar también 900/1100 px.


## 2026-11-06 — Reorganización integral de interfaz (PR #3)

- `src/components/app-navigation.tsx`: navegación con siete módulos reales y cinco submódulos de Entrenamiento, activa por ruta y vista.
- `src/components/tracking-shell.tsx`: barra de escritorio agrupada por áreas; navegación inferior de cinco accesos en móvil. Eliminada la barra transversal redundante.
- `src/app/menu/page.tsx`: directorio móvil/alternativo de todos los módulos y las vistas de Entrenamiento.
- `src/app/navigation-v2.css`: estilos compartidos de módulos, formularios, listas, perfil, entrenamiento y breakpoints. Corrige también el tamaño del título del panel de actividad, antes sobrescrito por el selector del hero.
- `src/app/page.tsx`: se retira fila de accesos redundantes porque los módulos ahora están en navegación principal.
- `scripts/test-browser.mjs`: se agregan `/menu` y comprobaciones de navegación a 360/390/768/800/930/1280 px; prueba de fase 1 adaptada a etiquetas distintas según ancho.
- Estado: rama `design/premium-ui-v2`, PR #3 en borrador; sin fusionar ni publicar. Pendientes CI y evaluación visual de capturas.


## 2026-11-06 — Rendimiento de navegación y carga selectiva

- Se investigó la latencia al navegar por menú y submenú. Cada ruta dinámica obtiene usuario y perfil, y Entrenamiento realizaba consultas paralelas a siete tablas en todas las vistas.
- En `src/lib/training/data.ts` se filtran las consultas por vista, evitando llamadas a tablas no requeridas; no cambia el aislamiento por usuario.
- `src/app/training/page.tsx` comunica la vista activa al cargador de datos.
- `src/app/loading.tsx` y estilos nuevos: indicador de carga accesible mientras responde Next.js.
- Antes de producción: ejecutar lint, suites, build, typecheck y Playwright; contrastar tiempos de red reales con DevTools y revisar que ninguna pestaña pierda información.


## 2026-11-06 — Inicio de Fase 3 Universidad y Estudio

- PR #3 fusionado en `main` (`30b293b`), CI previo aprobado.
- PR #4 iniciado desde `main` en `feat/university-phase3`.
- Migración incremental de 4 tablas, índices, políticas RLS CRUD por dueño y FK de propietario.
- Implementados validadores, operaciones de servidor, consultas por vista, formularios, listados, calendario de entregas y resumen en Mi Día.
- Navegación de escritorio y celular enlazada; diseño claro verde coherente con rediseño anterior.
- Pruebas SQL en `scripts/test-study-db.mjs` y recorrido Playwright en `scripts/test-browser.mjs`.
- Pendientes: verificar CI final, aplicar migración después de revisar historial, registrar resultado y validar Vercel autenticado.


## 2026-11-06 — Migración de Estudio aplicada y verificada

- Supabase MCP aplicó la migración incremental como `20261106141453_study` y se alineó el nombre del archivo SQL versionado.
- Confirmadas las cuatro tablas `study_*`, todas con RLS activo, cuatro políticas por tabla, lectura denegada a `anon` y lectura permitida a `authenticated` condicionada por políticas.
- La validación de seguridad detectó avisos previos sobre `public.rls_auto_enable()` (EXECUTE para roles de API) y protección de contraseñas filtradas desactivada; requieren una revisión separada.
- La primera ronda completa de CI aprobó, incluido Playwright. Volver a pasar CI al modificar nombres y documentación antes de fusionar PR #4.


## 2026-11-06 — Migración académica en Supabase

- La migración de Estudio fue aplicada como `20261106141453_study`; el archivo se alineó con el historial remoto.
- Las tablas de materias, tareas, exámenes y sesiones tienen RLS activo y cuatro políticas por tabla.
- Se confirmó ausencia de permisos de lectura para usuarios anónimos.
- Queda por confirmar CI del último commit y posteriormente el despliegue de la Fase 3.


## 2026-11-06 — Cierre técnico de Fase 3 en producción

- PR #4 fusionado por squash en main (`655cb6aec781bf81209774f0f86da4e54984d091`).
- GitHub Actions #42233135767: instalación, lint, pruebas de lógica, test SQL, build, typecheck y Playwright aprobados.
- Supabase: migración `20261106141453_study` aplicada una vez; cuatro tablas verificadas con RLS y permisos de acceso controlados.
- Estado Vercel del commit de integración: `success`. Pendiente validación autenticada con la cuenta real; CI usa autenticación simulada.
- Quedan pendientes preexistentes de seguridad detectados por advisors Supabase, sin relación causal con el módulo de Estudio.


## 2026-11-06 — Fase 4A, implementación de chat de solo lectura

- Rama `feat/assistant-phase4a`, PR #5 en borrador.
- Chat blanco y verde (`/assistant`), accesible en escritorio y celular; aviso visible si Gemini no está configurado y aceptación explícita de transferencia a proveedor externo.
- Endpoint autenticado con claves solo servidor, límite de longitud, control de origen y no-cache; provider Gemini REST `gemini-3.5-flash-lite` con IDs de function calling.
- Cinco herramientas autorizadas de lectura desde datos existentes: hoy, hábitos, entrenamiento, estudio y objetivos. Sin modificaciones ni acceso a notas íntimas o molestias.
- Migración aplicada `20261106152923_ai_usage.sql`: cuota atómica de 20 solicitudes/día y cinco segundos de enfriamiento por usuario. Test SQL y navegador añadidos.
- Pendiente: aprobar CI, aplicar/verificar migración, fusionar PR, desplegar en Vercel, configurar clave `GEMINI_API_KEY` por el usuario y probar respuestas reales; no confundir implementación con activación del proveedor.


## 2026-11-06 — Integración Fase 4A

- PR #5 fusionado a main, commit `79a27ac`; GitHub Actions #42243871582 aprobado con SQL, TypeScript, compilación y pruebas Playwright.
- Supabase: migración `20261106152923_ai_usage` aplicada y verificada (RLS activo, tabla sin SELECT público ni autenticado, RPC solo autenticados). No volver a aplicarla.
- Integración Gemini implementada exclusivamente en servidor, pero **sin API key configurada ni prueba real al proveedor**. La interfaz queda informativa hasta activación privada en Vercel.
- Pendiente de la persona usuaria: agregar `GEMINI_API_KEY` directamente a Vercel y redesplegar, sin compartir la clave. Revisar cuotas y condiciones del proyecto Google.
- Fase 4B no iniciada; no se han agregado herramientas con escrituras.


## 2026-11-06 — Fase 4A activada y aceptada funcionalmente

- Después de integrar PR #5 y desplegar el chat de solo lectura, el usuario configuró por su cuenta `GEMINI_API_KEY` en Vercel y comunicó: «ya puse todo, ya probé está ok y funciona».
- Se registra **aceptación funcional de Fase 4A por reporte del usuario**. No se consultó ni guardó la clave, ni se realizó desde el agente una prueba independiente con el proveedor o dos cuentas reales.
- Se mantienen como evidencia técnica CI #42243871582 aprobado, PR #5 fusionado en `main` (`79a27ac`), migración `20261106152923_ai_usage` y despliegue exitoso del código.
- **Siguiente trabajo:** Fase 4B, acciones de escritura confirmadas, validadas y auditadas. No se habilitaron recordatorios, Calendar, voz ni tareas generales.
- Actualizados `PROJECT_STATUS.md`, `README.md`, `docs/PLAN_MAESTRO.md`, `docs/FASE_4_IA_V1.md` y `AGENTS.md` para cerrar estados de «API key pendiente».


## 2026-11-06 — Inicio del registro público y Google OAuth

- PR #6 en borrador desde `feat/public-signup-google-auth`; no fusionado ni publicado.
- Nuevas pantallas de cuenta y recuperación, registro email con confirmación y acceso Google con intercambio de código PKCE en el servidor.
- Proxy ajustado para permitir solo las rutas de acceso público; resto de la app mantiene autenticación y RLS.
- Se conserva el diseño blanco/verde y el login antiguo con correo/contraseña. Pruebas de navegación sin sesión añadidas.
- Manual de configuración y seguridad: `docs/REGISTRO_PUBLICO.md`. Pendientes activar Google en Cloud/Supabase, SMTP/correo, protección antiabuso, completar CI y comprobar con dos cuentas reales.


## 2026-11-07 — Prueba OAuth y publicación gradual

- Google OAuth verificado por el usuario en localhost; dos cuentas separadas sin registros compartidos.
- PR #6 preparado para integrar Google OAuth y páginas públicas, con formularios/Server Actions de registro y recuperación email desactivados por defecto hasta SMTP.
- Mantener login email/contraseña existente. Pendientes: callback real en Vercel, SMTP/plantillas, CAPTCHA y alertas de gasto del proveedor Gemini.


## 2026-11-07 — Registro por email aplazado y planificación 4B

- Nuevo login con Google publicado en Vercel tras PR #6 (`4636ba9`) y confirmado visualmente por el usuario. Prueba con dos cuentas diferentes realizada en localhost por el usuario.
- Analizado correo de Supabase Auth recibido en AgendaV: no es evidencia de SMTP abierto al público para este proyecto; no tenemos acceso al panel ni a su configuración.
- Se posponen SMTP, alta por correo, recuperación y plantillas SSR, preservando Google OAuth y cuentas preexistentes. También quedan controles de CAPTCHA/rate limit y alertas de consumo.
- Se documenta Fase 4B.1 en `docs/FASE_4B_PLAN.md`; ninguna escritura mediante IA está activada.

## 2026-11-07 — Fase 4B.1 · hábitos con confirmación

- Rama `feat/fase-4b1-habitos-confirmados` desde `35df567`. Gemini propone por nombre; la persona confirma o cancela desde una tarjeta en el chat existente. Se ajustó el texto informativo de bienvenida, privacidad y términos.
- Migración incremental con RLS, permisos por columna, dos RPC invocadoras y un trigger transaccional. El identificador generado vincula dueño, objetivo, fecha y versión. Los reintentos conservan el resultado de la primera decisión.
- Pruebas automatizadas de ambigüedad, propiedad, vencimiento, cambio de día o de hábito, cancelación, errores, sesión y reenvío. Prueba adicional local con dos conexiones PostgreSQL simultáneas: doble confirmación, dos propuestas para el mismo hábito y cancelación seguida de confirmación concurrente.
- En local pasaron lint, compilación, tipos, pruebas de lógica y SQL. Chromium verificó la tarjeta con Gemini y Auth simulados, controles de al menos 44 px en seis anchos (360, 390, 768, 800, 930 y 1280 px), cancelación, sesión vencida, error de acceso a la BD y reintento. Se inspeccionaron capturas de celular y escritorio.
- Supabase estable consultado en modo lectura para cotejar el historial. La migración nueva está reservada para un entorno aislado antes de publicar. Continúan pendientes el recorrido con Gemini y dos cuentas reales y las fases 4B.2/4B.3. SMTP sigue en su propio pendiente.

## 2026-11-07 — Habilitación remota para probar 4B.1 desde local

- El usuario autorizó aplicar la migración en la base compartida `personal-ia`. Supabase la registró como `20261108023553_ai_habit_actions`. Se alinearon el archivo SQL y las referencias de las pruebas.
- La prueba SQL remota con dos identidades aprobó propuesta, cancelación, aislamiento, confirmación, auditoría y repetición. Las filas de prueba se revirtieron al finalizar.
- Los asesores no agregaron hallazgos de la nueva migración. Continúan los avisos preexistentes sobre `rls_auto_enable` y contraseñas filtradas, y los controles intencionales de la cuota IA.
- Pendiente la prueba funcional del usuario desde localhost con Gemini. PR #8 permanece en borrador.

## 2026-11-07 — Aceptación funcional de 4B.1

El usuario confirmó «funciona» tras aplicar la migración y repetir el pedido desde localhost con Gemini. Se registra 4B.1 como aceptada funcionalmente por el usuario. La verificación SQL con dos identidades se conserva con su alcance, y queda pendiente la comprobación independiente del nuevo flujo con dos sesiones reales.

La migración `20261108023553_ai_habit_actions` está aplicada. El código está en el PR #8. El próximo paso de entrega es integrar ese PR y verificar el despliegue y el recorrido publicado. Después sigue 4B.2, registro de check-in diario con validación de campos y rangos, vista previa, confirmación explícita de sobrescrituras y auditoría mínima. SMTP permanece en su pendiente independiente.

## 2026-11-07 — Check-in confirmado desde IA, Fase 4B.2

- Publicado 4B.1 mediante PR #8 (`286e387`), con estado Vercel success comprobado y acceso sin sesión redirigido al login.
- Nueva rama `feat/fase-4b2-checkin-confirmado`. Herramienta `propose_daily_checkin` con tres escalas obligatorias explícitas y sueño/estrés opcionales. Gemini recibe instrucciones de pedir valores faltantes juntos en otro mensaje. El chat mantiene su funcionamiento sin historial persistente entre consultas.
- La tarjeta compartida conserva Hábitos y agrega vista previa del check-in, cancelación y casilla de aceptación de actualización. La confirmación usa solo ID, tipo y decisión. Las notas privadas del registro manual se preservan.
- Migración incremental con dos RPC SECURITY INVOKER, RLS, permisos por columna, caducidad, control de versión y auditoría. Al procesar una propuesta se eliminan los valores del registro de auditoría y se conserva el resultado mínimo.
- Pasaron lint, suites de lógica y SQL, build, typecheck y navegador con Gemini/Auth simulados. Inspeccionadas capturas a 390 y 1280 px, controles verificados en seis anchos. Prueba con dos conexiones PostgreSQL aprobada para doble envío, dos propuestas y modificación manual concurrente.
- La aplicación remota de esta nueva migración fue bloqueada por la revisión automática por requerir autorización específica para la base compartida. Se continúa con PR revisable y documentación completa. No se ha ejecutado la migración de check-in remota.

## 2026-11-07 — Migración 4B.2 autorizada y verificada

- Tras la instrucción «aplica la migración», se aplicó en el Supabase compartido como `20261108025732_ai_checkin_actions`. Archivo SQL y referencias alineados con esa versión.
- Test remoto transaccional con dos usuarios desechables aprobado para crear/cancelar propuestas, aislamiento por dueño, creación confirmada, aceptación explícita de actualización, preservación de notas/valores omitidos y auditoría mínima. Todas las filas y usuarios de prueba se revirtieron.
- No hubo hallazgos nuevos de asesores sobre esta migración. Se conserva el alcance de las comprobaciones previas. Pendiente aceptación funcional del usuario con Gemini desde localhost antes de integrar PR #9.

## 2026-11-08 — Aceptación y publicación autorizada de 4B.2

El usuario confirmó «está super» después de las instrucciones para probar desde localhost y pidió actualizar GitHub y desplegar en Vercel. Se registra como aceptación funcional por reporte del usuario y autorización para integrar PR #9. La migración `20261108025732_ai_checkin_actions` está aplicada y verificada. El alcance de las pruebas remotas con dos identidades se conserva, y continúa pendiente una comprobación independiente del agente con dos sesiones reales.

Los controles del código funcional aprobaron en GitHub Actions #93, incluidos SQL y Playwright. La entrega siguiente es 4B.3, registrar sesiones de estudio con resolución de materia del propietario, duración válida, vista previa, confirmación y auditoría. SMTP sigue pendiente de forma independiente.

## 2026-11-08 — Desarrollo 4B.3: estudio desde Gemini

- Rama aislada `feat/fase-4b3-estudio-confirmado`, basada en `main@a4ae184`.
- Gemini puede proponer `subject_name`, `topic` y `duration_minutes`; se rechazan fechas, IDs, notas y argumentos no declarados. Sin confirmación no se inserta una sesión.
- La RPC de propuesta resuelve la materia activa exclusivamente para `auth.uid()`, comprueba ambigüedad y duración y limita el número de propuestas. Decisión separada con bloqueo, verificación de propietario/RLS, caducidad, reintentos y auditoría sin texto académico después del procesamiento.
- Agregadas suites de validación de modelo, RLS/PostgreSQL embebido y recorrido de navegador con seis anchuras; **verificar resultados de CI antes de considerar estas pruebas aprobadas**.
- No se ejecutaron migraciones remotas ni se fusionó el PR. Pendiente: revisión técnica, CI, pruebas autenticadas y autorización del usuario.

## 2026-11-08 — Protección antes de integrar 4B.3

Se comprobó que el historial remoto de Supabase llega hasta `20261108025732_ai_checkin_actions`; falta `20261108033000_ai_study_actions`. Se agregó bandera segura por defecto `AI_STUDY_WRITES_ENABLED=false` y test que impide ofrecer la tool a Gemini sin habilitación. La integración del PR no debe activar la función antes de aplicar y comprobar la nueva migración con consentimiento específico.

## 2026-11-08 — 4B.3: activación con migración verificada

- Historial remoto de Supabase: versión `20261108033000` ya aplicada. No se volvió a ejecutar una migración existente.
- Comprobadas las RPC `propose_study_session` y `decide_study_proposal`, `SECURITY INVOKER`, acceso `authenticated` sin acceso `anon`, auditoría bajo RLS y trigger de decisión.
- Se activó por defecto el circuito de propuestas de estudio en el código; el interruptor `AI_STUDY_WRITES_ENABLED=false` queda como mecanismo de rollback selectivo.
- Publicación sujeta a CI y despliegue Vercel; prueba real de usuario con Gemini pendiente de registrar explícitamente.

## 2026-11-08 — Primer incremento de recordatorios (Fase 5A.1)

- Nueva rama desde main con tabla de recordatorios y permisos RLS por usuario.
- Vista de gestión manual: crear, editar, completar, cancelar, historial.
- Fechas locales convertidas a `timestamptz`; toda escritura exige sesión y propietario.
- Sin cron, entrega de notificaciones, Calendar OAuth ni tool Gemini. La interfaz explica claramente esa limitación.
- Migración preparada, no aplicada a Supabase. Pruebas y despliegue pendientes.

## 2026-11-08 — Preparación 5A.2 Web Push

- Añadidos consentimientos por dispositivo, SW, endpoint con sesión y origen y validación de servicios push.
- Cola privada y RPC service-role con reclamación por lotes, bloqueo de filas, expiración y reintentos.
- Worker Deno VAPID y runbook Cron/Vault exclusivamente manual; no se publicaron migraciones ni secretos.
- Pruebas nuevas: validación y aislamiento PostgreSQL. El resultado final de CI debe comprobarse antes de fusionar.

## 2026-11-08 — Infraestructura de envío push en Supabase

- La migración original del PR se alineó con el número de versión asignado por Supabase `20261108043426`.
- Se instalaron pg_cron y pg_net como migración `20261108043654`, versionada también en Git.
- Supabase Vault almacena URLs, autenticación cron y VAPID; Edge Function `push-dispatch` desplegada y testeada con HTTP 200, sin suscripciones.
- Cron job `dia-a-dia-push-dispatch` creado, cada minuto. Vercel recibió clave pública y bandera de disponibilidad.
- CI, merge, deploy y prueba de dispositivo quedan sujetos a verificación; un HTTP 200 vacío no significa recepción real.

## 2026-11-08 — Cierre funcional y despliegue Web Push 5A.2

- PR #13 fusionado en `main@d402a7b`; CI de GitHub Actions aprobado y Vercel Ready. La migración de recordatorios `20261108035009` y las dos de Web Push `20261108043426` y `20261108043654` están aplicadas.
- Edge Function `push-dispatch` y Supabase Cron (`dia-a-dia-push-dispatch`, cada minuto) activados. VAPID y token del cron protegidos en Vault; RLS por propietario y cola privada.
- **Pruebas reales reportadas por el usuario:** recepción de recordatorio en celular y en Chrome/Windows. Brave mostró inicialmente `Registration failed - push service error`, anterior al POST de suscripción; después de ajustar la configuración del servicio push, el usuario indicó que quedó solucionado. No se atribuye captura independiente de recepción en Brave.
- Se considera **5A.2 aceptada funcionalmente**. Persisten las limitaciones Web Push de mejor esfuerzo y pruebas E2E con dos usuarios autenticados distintos; no prometer puntualidad exacta.
- Próximos incrementos: 5A.3 recurrencias, 5B Google Calendar OAuth y sincronización selectiva, 5C Gemini con confirmación de recordatorios.

## 2026-11-08 — Inicio 5B: Google Calendar read-only

El PR #15 de 5A.3 se fusionó con CI aprobado y la migración `20261108184507_reminder_recurrences` quedó aplicada. Se inició la conexión Calendar con OAuth 2.0 Web separado del login Google, scope mínimo `calendar.readonly`, cookie state HttpOnly vinculada a la cuenta, token refresh cifrado con AES-256-GCM, datos bajo RLS, lista de eventos a 14 días y desconexión/revocación. **Pendiente:** cliente OAuth Google Cloud y prueba real end-to-end; la app debe mostrar "No configurado" mientras falte.
