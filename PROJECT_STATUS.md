# PROJECT_STATUS — Asistente Personal IA

> Este archivo representa el **estado actual** del proyecto. Mantenerlo corto y actualizado. Reemplazar información obsoleta en lugar de acumular historia; la historia va en `DEVLOG.md`.

**Última actualización:** 2026-10-09  
**Estado general:** Fase 0 — pasos 1 a 3 completados; pendiente paso 4
**Fase del roadmap:** Fase 0 — Fundación  
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
| Supabase | ✅ Conectado | Variables locales, clientes SSR/navegador, proxy y prueba Data API/Auth; tablas y login pendientes |
| Login | ⬜ Pendiente | |
| Mi Día | ⬜ Pendiente | Primera pantalla principal |
| Hábitos | ⬜ Pendiente | |
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
4. Concretar esquema inicial, relaciones y reglas de acceso.
5. Definir diseño básico mobile-first.
6. Conectar Vercel y publicar la aplicación inicial.
7. Verificar conexión entre aplicación online y base de datos.

Luego, fase 1: login, Mi Día, hábitos, check-in, diario y objetivos. IA en una fase posterior.

## 6. Modelo de datos existente

**Todavía no implementado.**

Tablas iniciales planificadas:

- `profiles`
- `habits`
- `habit_entries`
- `daily_checkins`
- `journal_entries`
- `goals`

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

Integración: `src/lib/supabase/{config,client,server,proxy}.ts` y `src/proxy.ts`. `npm run check:supabase` comprueba acceso a Data API (respuesta esperada PGRST205 para tabla de diagnóstico inexistente) y Auth (HTTP 200), sin escrituras ni registros devueltos. Las políticas RLS y la sesión de un usuario autenticado se verificarán al implementar esquema/login.

## 9. Restricciones conocidas del producto

- Priorizar aproximadamente 7 h de sueño en la planificación personal.
- La ventana 17:30–18:00 de lunes a viernes no debe asumirse como sesión normal de entrenamiento.
- Existe antecedente de lesión meniscal con bloqueo ocasional; evitar automatizar recomendaciones de saltos altos, vallas, pivotes/cambios bruscos y sprints intensos mientras persista.
- La app no debe diagnosticar condiciones médicas.
- El módulo financiero futuro no debe ejecutar transferencias/pagos.
- Gemini free tier: minimizar datos sensibles y llamadas innecesarias.

## 10. Bugs / bloqueos actuales

- Sin bloqueos para ejecutar la aplicación localmente.
- `npm audit`: 5 alertas altas en la cadena de dependencias de desarrollo de ESLint (`braces` → `micromatch` → `fast-glob`). La corrección automática propuesta baja la configuración de Next a otra versión mayor; no se aplicó. Auditoría de producción: 0 vulnerabilidades.
- ESLint 9 se conserva por compatibilidad con los plugins de Next; npm lo marca fuera de soporte. Revisar actualización conjunta de plugins/ESLint cuando sea compatible.
- `.gitignore` verificado: dependencias, compilaciones, cachés, logs y variables locales excluidos. No hay archivos ya versionados que coincidan con esas exclusiones. Pasos 1 a 3 validados para su publicación en Git.

## 11. Despliegue

- Producción: pendiente.
- URL: pendiente.
- Deploy anterior: falló porque el commit `e791c56` tenía `package.json` vacío (0 bytes, confirmado en Git).
- Nuevo deploy: pendiente de verificar tras subir el nuevo commit de los pasos 1 a 3. Lint, typecheck y build locales correctos; esto no confirma el resultado del despliegue remoto.

## 12. Próxima tarea concreta

> **Paso 4: definir esquema inicial, relaciones y reglas de acceso, cuando el usuario lo indique.**
