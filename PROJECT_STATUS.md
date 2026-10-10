# PROJECT_STATUS — Día a Día

**Identidad vigente:** Día a Día · Un paso más. `personal-ia` sigue siendo el identificador técnico; repositorio, carpeta, URL de Vercel y proyecto Supabase se conservan. Bienvenida del login: “Cada día se vuelve más fácil. Lo difícil es hacerlo cada día.” Cambios enviados a `origin/main`; el estado del despliegue automático de Vercel no se verificó.

**Verificación del cambio de identidad:** lint, typecheck y build correctos; login y encabezados revisados en móvil/escritorio, sin overflow a 360/390/768/1280 px, con Auth simulado en copia temporal. Capturas: `%TEMP%/dia-a-dia-visual/`.

> Este archivo representa el **estado actual** del proyecto. Mantenerlo corto y actualizado. Reemplazar información obsoleta en lugar de acumular historia; la historia va en `DEVLOG.md`.

**Última actualización:** 2026-10-10
**Corrección visual local:** perfil, hábitos, check-in, diario y objetivos comparten menú, encabezado y barra de sesión alineada; menú lateral fijo en escritorio e inferior fijo en celular. Perfil accesible desde «Más» y objetivos desde «Progreso». Avatar de Mi Día con inicial centrada.
**Verificación del perfil con menú:** lint y build correctos; Edge a 360/390/768/800/930/1280 px con servicios simulados, sin overflow ni controles tapados. Navegación, edición y recarga del nombre correctas; capturas móvil/escritorio revisadas. No se hicieron escrituras en Supabase real.
**Estado general:** Fase 0 cerrada; pasos 1 a 6 de fase 1 confirmados por el usuario. Mi Día integrado (paso 7); paso 8 en verificación local, pendiente cierre remoto. Ver `docs/CIERRE_FASE_1.md`.
**Fase del roadmap:** Paso 7 implementado; verificación local del paso 8 correcta. Pendiente confirmar Mi Día con cuenta real, push, Vercel y aislamiento con dos cuentas.
**Verificación final local:** cuatro suites de acciones/datos, lint, build, typecheck y diff correctos. Edge con servicios simulados: inicio vacío/real/error, persistencia de hábito, sesión vencida, no-store y diagnóstico 404 correctos. Seis pantallas a 360/390/768/800/930/1280 px sin overflow ni botones tapados; capturas inspeccionadas. Evidencia completa en `docs/CIERRE_FASE_1.md`.
**Uso previsto:** Personal  

---

## 1. Objetivo actual

Construir el MVP base de una PWA personal para registrar y consultar rutina diaria, hábitos, entrenamiento, estudio, sueño, objetivos y progreso. La integración de IA se agregará **después de que los módulos básicos funcionen sin IA**.

## 2. Stack decidido

- Next.js + React + TypeScript
- Tailwind CSS
- Supabase: PostgreSQL + Auth + RLS
- Vercel
- Gemini API como IA principal
- Google Calendar API en una fase posterior
- Recharts o Chart.js para estadísticas

## 3. Arquitectura IA

- Un único `PersonalOrchestrator` para el MVP.
- Gemini usa function calling para solicitar skills.
- Las skills ejecutan código real y validado en backend.
- Gemini **no escribe directamente en la base de datos**.
- Recordatorios futuros: DB + scheduler/Calendar; nunca depender del modelo esperando en segundo plano.
- `AIProvider` desacopla la app de Gemini para permitir otro proveedor en el futuro.

## 4. Estado de funcionalidades

| Módulo | Estado | Notas |
|---|---|---|
| Repositorio GitHub | ✅ Configurado | Git local y remoto origin configurados |
| Next.js + TypeScript | ✅ Inicializado | App Router, página inicial en `/` |
| Tailwind | ✅ Configurado | Integración mediante PostCSS |
| Preparación del repositorio | ✅ Completado | `.gitignore`, `.env.example` y README; reglas de exclusión verificadas |
| Supabase | ✅ Conectado | Variables locales, clientes SSR/navegador, proxy; seis tablas, RLS y 24 políticas confirmados. Cuenta real confirmada por el usuario; prueba remota de aislamiento pendiente |
| Login | ✅ Verificado | Correo/contraseña, cierre local y protección en servidor. Usuario confirmó ingreso con cuenta real; pruebas con Auth simulado también correctas. |
| Perfil | ✅ Verificado | Lee `profiles` bajo la sesión autenticada y permite cambiar el nombre visible; RLS y aislamiento verificado con cuenta real. `/profile` usa el shell compartido y mantiene el menú visible en celular/escritorio. |
| Mi Día | ✅ Implementado localmente | Cuatro módulos reales; conteos, vacíos/errores y menú compartido, sin maquetas. |
| Hábitos | ✅ Verificado por el usuario | Gestión en `/habits` y registro diario persistente en `habit_entries` (`/` y `/habits`) con RLS. Paso 3 confirmado el 2026-10-10. |
| Check-in diario | ✅ Verificado por el usuario | Funcionamiento confirmado el 2026-10-10. `/check-in`, un registro por día y resumen en Mi Día; menú compartido. |
| Diario personal | ✅ Verificado por el usuario | Funcionamiento confirmado el 2026-10-10. `/journal`: creación, lectura, edición e historial paginado con menú compartido. |
| Entrenamientos | ⬜ Pendiente | |
| Estudio | ⬜ Pendiente | |
| Objetivos | ✅ Confirmado por el usuario | `/goals`: semanales/mensuales, avance, estados, vencimientos, filtros e historial paginado. |
| Estadísticas | ⬜ Pendiente | |
| Gemini | ⬜ Pendiente | No implementar antes del núcleo |
| Recordatorios | ⬜ Pendiente | |
| Google Calendar | ⬜ Pendiente | |
| Voz | ⬜ Futuro | |
| Finanzas | ⬜ Futuro | separado lógicamente |

## 5. Próximos pasos — prioridad

La fase 0 se ejecuta paso a paso; esperar la indicación del usuario antes de iniciar el siguiente. Actualizar siempre `PROJECT_STATUS.md` y `DEVLOG.md` al cerrar cada paso.

1. Inicializar Next.js + TypeScript + Tailwind: completado y verificado localmente (HTTP 200, CSS Tailwind, lint, TypeScript y build).
2. Completar `.gitignore`, `.env.example` y `README.md`: completado; exclusiones y plantilla sin valores verificadas.
3. Crear/conectar Supabase y configurar variables locales: completado con el proyecto existente indicado por el usuario; Data API y Auth accesibles.
4. Esquema, relaciones y reglas de acceso preparados en SQL y probados en PostgreSQL 17 local. Completado: el usuario compartió ambos resultados de Supabase, confirmando seis tablas con RLS, 24 políticas y ausencia de permisos CRUD para anon.
5. Diseño mobile-first completado; pruebas de navegador a 360/390/768/1280 px, capturas móvil/escritorio, interacciones demo y consola correctas. Ver `docs/CIERRE_FASE_0.md`.
6. Nueva interfaz publicada y verificada en Vercel tras el push `aeeaa88` a `origin/main`. Página HTTP 200 y pruebas interactivas online en cuatro tamaños correctas.
7. Completado: `/api/health/supabase` respondió desde producción HTTP 200 con `status: ok`, `auth: reachable`, `dataApi: restricted` y `Cache-Control: no-store, max-age=0`. Comunicación Auth/PostgREST y rechazo anónimo esperado confirmados; sin pruebas con JWT reales.

Fase 1: pasos 1 a 6 confirmados por el usuario. Estado de cierre:

3. Hábitos y registros diarios persistentes: completado y validado por el usuario.
4. Check-in diario (`daily_checkins`): funcionamiento confirmado por el usuario.
5. Diario personal (`journal_entries`): funcionamiento confirmado por el usuario.
6. Objetivos y progreso confirmado por el usuario; aislamiento remoto pendiente.
7. Mi Día implementado con datos reales. Agenda ficticia reemplazada por vencimientos reales; calendario de eventos independiente, entrenamiento y estudio quedan para fases posteriores.
8. Verificación local y diagnóstico temporal retirado; pendiente push, Vercel y aislamiento real.

IA en una fase posterior.

## 6. Modelo de datos existente

**Migración ejecutada por el usuario: el resultado compartido confirma las seis tablas y sus 24 políticas. El segundo resultado compartido confirma RLS habilitado y ausencia de permisos CRUD para anon en las seis tablas.** Archivo: `supabase/migrations/202610090001_initial_schema.sql`. Detalles e instrucciones: `docs/ESQUEMA_INICIAL.md`. Verificación posterior: `supabase/verify_schema.sql`.

Tablas incluidas en la migración:

- `profiles`
- `habits`
- `habit_entries`
- `daily_checkins`
- `journal_entries`
- `goals`

Zona horaria: `America/Argentina/Buenos_Aires`. Fechas diarias locales explícitas; timestamps `timestamptz`. Un check-in por usuario/día y una entrada por hábito/día. RLS habilitado, 24 políticas por dueño, sin acceso anónimo. FK compuesta impide vincular un registro al hábito de otro usuario. Perfiles automáticos al alta; backfill de usuarios existentes.

Pruebas locales: CRUD propio y aislamiento entre dos usuarios en las seis tablas, acceso anónimo, FK, duplicados, rangos y cruce de fecha UTC. Simulación local de `auth.uid()`. Catálogo RLS remoto confirmado por resultados del usuario; prueba funcional remota con dos JWT reales pendiente.

Después:

- `workout_plans`
- `workout_sessions`
- `exercise_sets`
- `subjects`
- `study_sessions`
- `tasks`
- `reminders`
- `ai_tool_audit_log`

## 7. Skills IA planificadas para V1

- `get_today_plan`
- `create_task`
- `mark_habit`
- `log_daily_checkin`
- `get_today_workout`
- `log_workout_session`
- `log_study_session`
- `create_reminder`
- `list_reminders`

No agregar más hasta que estas sean confiables y estén testeadas.

## 8. Variables de entorno

`.env.example` creada con comentarios y nombres, **sin valores reales**:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

`.env.local` configurado con URL y clave pública del proyecto existente. Ambas variables son requeridas por el proxy. Se usa `PUBLISHABLE_KEY` en lugar del nombre anterior `ANON_KEY`. No se configuraron claves administrativas, IA ni Google. `.env.local` y el prompt local de conexión están excluidos de Git; `.env.example` permanece versionable y sin valores.

Integración: `src/lib/supabase/{config,client,server,proxy}.ts` y `src/proxy.ts`. `npm run check:supabase` comprueba acceso a Data API (respuesta esperada PGRST205 para tabla de diagnóstico inexistente) y Auth (HTTP 200), sin escrituras ni registros devueltos. El catálogo de políticas y RLS remoto está confirmado; las pruebas de acceso con sesiones autenticadas reales se realizarán al implementar login.

## 9. Restricciones conocidas del producto

- Interfaz: conservar el menú visible en pantallas internas (lateral en escritorio, inferior en celular), reutilizar el shell de seguimiento y verificar adaptación sin desbordamientos ni controles tapados. Reglas permanentes en `AGENTS.md`.
- Priorizar aproximadamente 7 h de sueño en la planificación personal.
- La ventana 17:30–18:00 de lunes a viernes no debe asumirse como sesión normal de entrenamiento.
- Existe antecedente de lesión meniscal con bloqueo ocasional; evitar automatizar recomendaciones de saltos altos, vallas, pivotes/cambios bruscos y sprints intensos mientras persista.
- La app no debe diagnosticar condiciones médicas.
- El módulo financiero futuro no debe ejecutar transferencias/pagos.
- Gemini free tier: minimizar datos sensibles y llamadas innecesarias.

## 10. Bugs / bloqueos actuales

- Antes del cierre de fase 9: activar Vercel Web Analytics en Hobby e integrar `@vercel/analytics`. Pendiente, sin implementación ni dependencias nuevas en esta tarea.

- Sin bloqueos para ejecutar la aplicación localmente. Paso 4 cerrado con ambos resultados de `supabase/verify_schema.sql` compartidos por el usuario. No repetir la migración.
- `npm audit`: 5 alertas altas en la cadena de dependencias de desarrollo de ESLint (`braces` → `micromatch` → `fast-glob`). La corrección automática propuesta baja la configuración de Next a otra versión mayor; no se aplicó. Auditoría de producción: 0 vulnerabilidades.
- ESLint 9 se conserva por compatibilidad con los plugins de Next; npm lo marca fuera de soporte. Revisar actualización conjunta de plugins/ESLint cuando sea compatible.
- `.gitignore` verificado: dependencias, compilaciones, cachés, logs y variables locales excluidos. No hay archivos ya versionados que coincidan con esas exclusiones. Pasos 1 a 3 validados para su publicación en Git.

## 11. Despliegue

- Producción: diseño de fase 0 disponible en Vercel, verificado el 2026-10-09 después del push `aeeaa88`.
- URL: https://personal-ia-two.vercel.app/
- Verificación externa: demo HTTP 200 y diagnóstico de Supabase HTTP 200 sin caché. Edge/Playwright online: 360/390/768/1280 px, interacciones y consola correctas.
- La actualización apareció tras el push al repositorio existente; no se creó otro proyecto ni se inspeccionó el panel privado. El diagnóstico confirmó variables utilizables y comunicación desde el servidor desplegado, sin exponer valores.
- Diagnóstico temporal retirado del código y su excepción del proxy el 2026-10-10; se hará efectivo en producción tras push/despliegue. Evidencia de fase 0 histórica.

## 12. Próxima tarea concreta

Pendiente: confirmar Mi Día con cuenta real y completar cierre remoto del paso 8 tras push: Vercel, sesiones/persistencia, aislamiento con dos cuentas y diagnóstico retirado en producción. Ver `docs/CIERRE_FASE_1.md`. Commit solicitado, sin push en esta sesión.

Verificaciones: lint, TypeScript y build correctos; Edge/Playwright con Auth simulado: login inválido/válido, recarga, redirección desde login con sesión, cierre, ruta privada, sesión revocada, no-store y login responsive a 360/390/768/1280 px. Sin errores de JavaScript. Prueba reproducible: `scripts/test-auth.mjs`, con Playwright externo y Edge.

Verificación del paso 4: lint, TypeScript y build correctos. `node scripts/test-checkin.mjs` comprueba rangos, campos opcionales, fecha local al cruzar medianoche, sesión ausente, identidad tomada del usuario autenticado, upsert sin duplicados y errores de guardado con Supabase simulado. Estas pruebas no verifican RLS remoto ni persistencia real.

Revisión visual del paso 4: Edge con servicios simulados en copia temporal, a 360/390/768/800/930/1280 px. Hábitos y check-in sin overflow horizontal, menú fijo visible y botón de guardar accesible. Navegación, guardado, recarga y resumen correctos; sin errores JavaScript. Capturas móvil/escritorio inspeccionadas.

Paso 4: validación funcional real confirmada por el usuario el 2026-10-10.

Verificación del paso 5: `node scripts/test-journal.mjs` correcto; fechas reales/no futuras, límites de texto, campos vacíos, sesión, identidad desde Auth, creación múltiple, edición propia/ajena/inexistente, fallos de guardado/carga y paginación con servicios simulados. Build con TypeScript correcto; `/journal` dinámica.

Revisión del paso 5 en Edge, con Auth/Supabase simulados en copia temporal: estado vacío, creación, recarga, edición, borrador conservado ante fallos, texto HTML mostrado como texto, historial paginado, errores de lectura y sesión vencida correctos. Sin errores JavaScript. A 360/390/768/800/930/1280 px, sin overflow horizontal, menú fijo y botón de guardar accesible al desplazarse; capturas móvil/escritorio inspeccionadas. Lint y typecheck finales correctos.

Paso 5: validación funcional real confirmada por el usuario el 2026-10-10; aislamiento remoto entre dos cuentas aún pendiente.

Verificación del paso 6: `node scripts/test-goals.mjs`, lint y build con TypeScript correctos. Pruebas de fechas, título, avance, estados, identidad, sesión, permisos de edición, errores, filtros y paginación con servicios simulados. `/goals` dinámica.

Revisión del paso 6 en Edge con servicios simulados: creación, recarga, actualización de avance, completar/cancelar, vencimientos, filtros, paginación, errores con borrador conservado y sesión vencida correctos; sin errores JavaScript. A 360/390/768/800/930/1280 px, sin overflow horizontal y con controles accesibles al desplazarse. Capturas móvil/escritorio inspeccionadas.

Paso 6 confirmado por el usuario. Pendiente aislamiento remoto entre dos cuentas; relación con hábitos/actividades requiere ampliación del esquema. No repetir migraciones; los servicios simulados no prueban RLS remoto.
