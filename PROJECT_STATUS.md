# PROJECT_STATUS — Día a Día

**Identidad vigente:** Día a Día · Un paso más. `personal-ia` sigue siendo el identificador técnico; repositorio, carpeta, URL de Vercel y proyecto Supabase se conservan. Bienvenida del login: “Cada día se vuelve más fácil. Lo difícil es hacerlo cada día.” Cambios enviados a `origin/main`; el estado del despliegue automático de Vercel no se verificó.

**Verificación del cambio de identidad:** lint, typecheck y build correctos; login y encabezados revisados en móvil/escritorio, sin overflow a 360/390/768/1280 px, con Auth simulado en copia temporal. Capturas: `%TEMP%/dia-a-dia-visual/`. Login de fase 1 conservado; próximo paso funcional sigue siendo el 2.

> Este archivo representa el **estado actual** del proyecto. Mantenerlo corto y actualizado. Reemplazar información obsoleta en lugar de acumular historia; la historia va en `DEVLOG.md`.

**Última actualización:** 2026-10-09  
**Estado general:** Fase 0 cerrada; login confirmado por el usuario. Perfil y hábitos conectados a Supabase mediante la sesión autenticada y RLS. Validación funcional en Supabase con la cuenta real y aislamiento entre dos usuarios pendiente.
**Fase del roadmap:** Fase 1, pasos 2 y 3 implementados localmente; pendientes comprobaciones funcionales en Supabase real.
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
| Perfil | Implementado localmente | Lee `profiles` bajo la sesión autenticada y permite cambiar el nombre visible con filtro por `user_id`; acceso a la fila real y prueba remota de aislamiento pendientes. |
| Mi Día | 🟡 Parcial | Hábitos reales del usuario y registro diario persistente. Agenda y otros módulos siguen siendo de ejemplo |
| Hábitos | ✅ Implementado localmente | Crear, editar nombre/días, archivar conservando historial y registrar/desmarcar por fecha de Buenos Aires. Falta validar los flujos en Supabase real |
| Check-in diario | ⬜ Pendiente | sueño, energía, notas |
| Entrenamientos | ⬜ Pendiente | |
| Estudio | ⬜ Pendiente | |
| Objetivos | ⬜ Pendiente | |
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

Fase 1: paso 1 (login y sesión) verificado por el usuario con cuenta real. Paso 2 (perfil) y paso 3 (hábitos) implementados localmente bajo RLS. Falta probar lectura/escritura del perfil, CRUD de hábitos y registros diarios con la cuenta real, y aislamiento entre dos usuarios. Próximos pasos, con indicación del usuario para cada uno:

2. Verificar lectura/guardado de perfil y aislamiento RLS con dos sesiones reales.
3. Verificar creación, edición, archivo y registro diario de hábitos en Supabase real.
4. Check-in diario: sueño, energía y notas.
5. Diario personal.
6. Objetivos y progreso.
7. Integrar Mi Día con datos reales.
8. Validación completa, Vercel y retirada del diagnóstico temporal documentado.

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

Pruebas locales del esquema: CRUD propio y aislamiento entre dos usuarios en las seis tablas, acceso anónimo, FK, duplicados, rangos y cruce de fecha UTC. Simulación local de `auth.uid()`. Catálogo RLS remoto confirmado por resultados del usuario; pruebas funcionales remotas de perfil y hábitos con JWT reales pendientes.

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
- Diagnóstico temporal público y mínimo; retirada y límites documentados en `docs/CIERRE_FASE_0.md`. RLS y migración no modificados; ninguna escritura en Supabase.

## 12. Próxima tarea concreta

> **Pasos 1, 2 y 3 implementados localmente; login real confirmado por el usuario. Pendiente probar perfil y hábitos en Supabase con una sesión real y aislamiento con dos usuarios. Próximo módulo tras esa comprobación: paso 4, check-in diario.**

Verificaciones del paso 3: `npm run lint`, `npm run typecheck`, `npm run build` y `git diff --check` correctos. Build requirió permiso fuera del sandbox por `spawn EPERM` en el worker de TypeScript.

Limitaciones: flujos compilados y validados estáticamente, pero todavía no probados con sesión autenticada en Supabase. Se conservan esquema, RLS, usuarios y dependencias existentes. Cambios locales; sin commit, push o despliegue en este paso.
