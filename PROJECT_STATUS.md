# PROJECT_STATUS — Asistente Personal IA

> Este archivo representa el **estado actual** del proyecto. Mantenerlo corto y actualizado. Reemplazar información obsoleta en lugar de acumular historia; la historia va en `DEVLOG.md`.

**Última actualización:** 2026-10-09  
**Estado general:** Inicio / preparación del proyecto  
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
| Repositorio GitHub | ⬜ Pendiente | Crear/conectar repo |
| Next.js + TypeScript | ⬜ Pendiente | |
| Tailwind | ⬜ Pendiente | |
| Supabase | ⬜ Pendiente | |
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

1. Crear el repositorio GitHub.
2. Inicializar Next.js con TypeScript y Tailwind.
3. Crear `.gitignore` y `.env.example`.
4. Crear proyecto Supabase.
5. Configurar autenticación.
6. Crear tablas iniciales: `profiles`, `habits`, `habit_entries`, `daily_checkins`, `journal_entries`, `goals`.
7. Implementar pantalla `Mi Día` sin IA.
8. Desplegar primera versión en Vercel.
9. Usarla varios días y corregir el modelo de datos.
10. Recién después integrar Gemini.

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

Crear `.env.example` con nombres, **sin valores reales**:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

No versionar `.env.local`.

## 9. Restricciones conocidas del producto

- Priorizar aproximadamente 7 h de sueño en la planificación personal.
- La ventana 17:30–18:00 de lunes a viernes no debe asumirse como sesión normal de entrenamiento.
- Existe antecedente de lesión meniscal con bloqueo ocasional; evitar automatizar recomendaciones de saltos altos, vallas, pivotes/cambios bruscos y sprints intensos mientras persista.
- La app no debe diagnosticar condiciones médicas.
- El módulo financiero futuro no debe ejecutar transferencias/pagos.
- Gemini free tier: minimizar datos sensibles y llamadas innecesarias.

## 10. Bugs / bloqueos actuales

- Ninguno todavía.

## 11. Despliegue

- Producción: pendiente.
- URL: pendiente.
- Último deploy: ninguno.

## 12. Próxima tarea concreta

> **Inicializar el repositorio y dejar funcionando la página inicial de Next.js localmente.**
