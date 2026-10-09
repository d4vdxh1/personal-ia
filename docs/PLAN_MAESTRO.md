# Plan Maestro de Desarrollo — Asistente Personal IA

**Estado:** Documento base del proyecto — v1.1   
**Objetivo:** construir una aplicación web/PWA personal, inteligente y progresiva para organizar rutina, entrenamiento, estudio, hábitos, sueño, objetivos, recordatorios y, más adelante, finanzas personales.

---

## 1. Mission

Crear un **asistente personal digital inteligente** que centralice la planificación y el seguimiento de mi vida diaria, entienda instrucciones en lenguaje natural y convierta conversaciones en acciones concretas y verificables.

La aplicación debe ayudarme a responder preguntas como:

- ¿Qué debo hacer hoy?
- ¿Qué entrenamiento me toca?
- ¿Qué materia debería estudiar hoy?
- ¿Dormí lo suficiente como para entrenar fuerte?
- ¿Qué hábitos vengo cumpliendo peor?
- ¿Cuánto progresé este mes?
- Recuérdame estudiar Matemática mañana a las 17:00.
- Cambia mi entrenamiento del viernes al sábado.
- Registra que hoy hice 3 series de press con 10 kg.
- ¿Cuánto gasté este mes en comida? *(módulo futuro)*

El objetivo no es construir solamente un “chat con IA”, sino una aplicación donde la IA pueda **consultar información real, interpretar contexto y ejecutar acciones mediante herramientas controladas**.

---

## 2. Visión del producto

La aplicación funcionará como un **Personal Operating System (Personal OS)**.

Tendrá tres capas principales:

1. **Datos personales estructurados**: rutinas, entrenamientos, estudios, hábitos, objetivos, registros y métricas.
2. **Automatización fiable**: recordatorios, calendario, notificaciones, tareas programadas y reglas.
3. **Asistente IA**: interpreta lenguaje natural, consulta los datos correctos y utiliza herramientas para registrar, reprogramar, resumir o recomendar.

La IA nunca debe ser la única responsable de que ocurra una acción futura. Por ejemplo, si digo “recuérdame mañana a las 17:00 estudiar Matemática”, el modelo interpreta la orden, pero el recordatorio queda guardado en la base de datos y es ejecutado por un scheduler o Google Calendar.

---

## 3. Principios del proyecto

1. **Primero útil, después sofisticado.**
2. La aplicación debe funcionar aunque la IA esté temporalmente indisponible.
3. Los datos son la fuente de verdad; la conversación no reemplaza la base de datos.
4. Las acciones importantes deben ejecutarse mediante tools/skills explícitas.
5. La IA debe explicar qué registró o modificó.
6. No implementar multiagentes complejos en el MVP.
7. Mobile-first: debe ser cómoda desde el celular.
8. Debe poder instalarse como PWA.
9. API keys y credenciales nunca deben exponerse en el navegador.
10. Salud y finanzas requieren reglas de seguridad adicionales.

---

# 4. Contexto inicial que debe conocer la aplicación

## 4.1 Horario base

### Lunes a viernes

- Trabajo hasta aproximadamente las **17:00**.
- Llegada a casa alrededor de **17:30**.
- Debo salir de casa a las **18:00** para tomar el colectivo.
- Universidad: llegada máxima aproximada **18:30**.
- Salida de universidad aproximadamente **22:00**.
- Llegada a casa aproximadamente **22:20**.
- Se debe priorizar dormir aproximadamente **7 horas**.
- La aplicación no debe asumir que 17:30–18:00 es una ventana normal para entrenar.
- La aplicación tampoco debe planificar automáticamente despertarme a las 04:00 si el horario de sueño no lo permite.

### Sábado

- Trabajo de **07:00 a 12:00**.
- Un sábado libre al mes, con fecha elegible.
- La tarde del sábado es una ventana apropiada para entrenamientos más largos, estudio o recuperación.

## 4.2 Universidad

Materias actuales:

- Matemática 6
- Ingeniería del Software 2
- Informática 6
- Organización 2
- Ética Social

La aplicación deberá registrar:

- sesiones de estudio;
- tiempo dedicado;
- temas pendientes;
- trabajos prácticos;
- exámenes;
- prioridad de cada materia;
- progreso semanal.

## 4.3 Entrenamiento

Objetivo principal:

- recuperar masa muscular progresivamente después de más de seis meses sin entrenar;
- dar un poco más de énfasis a pecho, espalda y brazos;
- no descuidar tren inferior;
- agregar bicicleta progresivamente.

Equipamiento disponible:

### Fuerza

- barras de 18, 35 y 55 kg;
- chorizo de 15 kg;
- mancuernas de 5 y 10 kg;
- máquina para cuádriceps, pecho, espalda, remo y glúteos;
- barra de dominadas;
- steps.

### Velocidad, reacción y agilidad

- cinta con goma para cintura;
- conos;
- escalerita;
- espacio amplio;
- balones.

### Potencia

- caja de 60 cm;
- caja de 80 cm;
- cuatro vallas de 55 cm;
- pelota medicinal de 3 kg;
- steps.

### Prevención y estabilidad

- gomas preventivas;
- bosu;
- colchonetas;
- steps.

### Recuperación

- bicicleta;
- rodillo;
- colchonetas.

### Técnica

- balones;
- conos;
- escalerita;
- espacio amplio.

## 4.4 Restricción de seguridad física

Existe antecedente de **rotura parcial de menisco en asa de balde**. Actualmente no hay dolor, pero existe bloqueo ocasional de la rodilla.

Reglas iniciales del asistente:

- no diagnosticar;
- permitir trabajo de fuerza controlado cuando corresponda;
- evitar recomendar automáticamente saltos altos, vallas, pivotes, cambios bruscos de dirección o sprints intensos mientras persista el bloqueo;
- permitir registrar síntomas, molestias y bloqueos;
- si aumenta el bloqueo, dolor o pérdida de movilidad, recomendar evaluación profesional en vez de aumentar carga.

---

# 5. Módulos del producto

## 5.1 Mi Día

Será la pantalla principal.

Debe mostrar:

- fecha;
- agenda del día;
- entrenamiento programado;
- materia a estudiar;
- hábitos;
- recordatorios;
- horas de sueño;
- tareas pendientes;
- progreso diario;
- botón para hablar con el asistente.

Objetivo UX: abrir la aplicación y saber en menos de 10 segundos **qué debo hacer hoy**.

## 5.2 Entrenamiento

Funciones:

- rutina semanal;
- ejercicios;
- series;
- repeticiones;
- peso utilizado;
- RPE o dificultad percibida;
- duración;
- notas;
- métricas corporales;
- historial por ejercicio;
- progresión semanal;
- días de bicicleta;
- registro de molestias.

## 5.3 Universidad / Estudio

Funciones:

- materias;
- sesiones de estudio;
- duración;
- tema estudiado;
- tareas;
- fechas límite;
- exámenes;
- prioridad;
- progreso semanal;
- tiempo total por materia.

## 5.4 Hábitos

Debe reemplazar digitalmente la tabla del cuaderno.

Ejemplos:

- agradecer;
- hacer ejercicio;
- estudiar;
- dormir suficiente;
- beber agua;
- lectura;
- rutina personal.

Cada hábito tendrá frecuencia y registro diario.

## 5.5 Diario / Hechos relevantes

Cada día se podrá registrar:

- hecho relevante;
- nota libre;
- aprendizaje;
- algo positivo;
- algo que mejorar.

## 5.6 Check-in diario

Registrar escalas de 1 a 5:

- energía;
- estado emocional;
- satisfacción personal / “vida vivida”.

Opcionalmente:

- horas de sueño;
- nivel de estrés;
- dolor/malestar;
- motivación.

## 5.7 Objetivos

- objetivos mensuales;
- objetivos semanales;
- progreso;
- fecha límite;
- estado;
- relación con hábitos y actividades.

## 5.8 Estadísticas

Gráficos y resúmenes de:

- cumplimiento de hábitos;
- entrenamientos;
- progresión de cargas;
- peso corporal;
- horas de estudio;
- sueño;
- energía;
- objetivos;
- consistencia mensual.

## 5.9 Recordatorios

Debe permitir crear recordatorios manualmente o mediante conversación.

Ejemplos:

- “Recuérdame entregar Organización 2 el viernes.”
- “Todos los martes recuérdame ir en bicicleta.”
- “Avísame a las 22:40 que prepare la ropa de mañana.”

Los recordatorios deben vivir en una tabla propia y ejecutarse mediante un sistema programado.

## 5.10 Chat / Asistente IA

Interfaz de conversación para:

- consultar información;
- registrar datos;
- crear tareas;
- crear recordatorios;
- adaptar planes;
- resumir la semana;
- consultar estadísticas;
- reorganizar actividades.

La conversación debe soportar texto primero y voz en una fase posterior.

---

# 6. Módulo futuro: Finanzas personales

No implementar en el MVP.

## Funciones futuras

- registrar ingreso;
- registrar gasto;
- categorías;
- cuentas personales;
- presupuestos mensuales;
- gastos recurrentes;
- metas de ahorro;
- comparación mensual;
- análisis de gastos;
- alertas de presupuesto.

Ejemplos conversacionales:

- “Gasté 45.000 Gs en almuerzo.”
- “¿Cuánto gasté en combustible este mes?”
- “¿Cuánto me queda del presupuesto de ocio?”

### Regla importante

Inicialmente la IA podrá **registrar y analizar**, pero no realizar transferencias, pagos o movimientos bancarios.

Las tablas financieras deberán quedar lógicamente separadas de entrenamiento, hábitos y estudios.

---

# 7. Tech Stack recomendado

## Aplicación

- **Next.js + React + TypeScript**
- **Tailwind CSS** para diseño rápido y responsive
- PWA para instalación en celular

Motivo: permite frontend y endpoints backend en el mismo proyecto, reduce la cantidad de servicios que hay que mantener y es adecuado para desplegar en Vercel.

## Backend y datos

- **Supabase**
  - PostgreSQL
  - Authentication
  - Row Level Security
  - Storage si posteriormente se guardan imágenes/documentos

## Hosting

- **Vercel** para aplicación web
- **Supabase** para base de datos

## Gráficos

- **Recharts** o Chart.js

## IA principal

- **Google Gemini API** como proveedor principal del proyecto.
- **Function calling** para convertir lenguaje natural en llamadas estructuradas a skills/tools de la aplicación.
- Prompts versionados para el comportamiento del asistente.
- Modelos de voz/live de Gemini en una etapa posterior, solo cuando el núcleo de texto y herramientas sea estable.

### Motivo de la decisión

El proyecto es inicialmente de uso personal y se quiere mantener con costo **$0 siempre que sea posible**. Google ofrece un nivel gratuito de Gemini API para desarrolladores y proyectos pequeños, con límites y disponibilidad que pueden variar por modelo. Por tanto, el diseño debe controlar consumo, límites y errores de cuota, y no asumir que toda capacidad futura será gratuita.

**Privacidad:** el nivel gratuito puede utilizar contenido enviado para mejorar productos de Google según sus condiciones vigentes. No enviar información sensible innecesaria. En especial, cuando exista el módulo de finanzas, el backend debe calcular agregados y enviar al modelo solo el mínimo contexto requerido.

## Proveedor alternativo futuro

- **OpenAI API** queda como proveedor opcional/futuro, no requerido para el MVP.
- La suscripción de ChatGPT Pro no cubre el consumo de OpenAI API.

### Recomendación arquitectónica

Mantener una interfaz `AIProvider` para evitar acoplar el dominio de la aplicación a Gemini:

```text
AIProvider
 ├── GeminiProvider      # activo en MVP
 └── OpenAIProvider      # opcional futuro
```

La lógica de negocio, las skills, validaciones y persistencia **no deben depender del proveedor de IA**. Cambiar el modelo debe requerir cambiar principalmente la capa de integración, no reescribir la aplicación.

## Calendario

- Google Calendar API mediante OAuth 2.0.

Uso previsto:

- crear eventos;
- sincronizar actividades importantes;
- asociar recordatorios;
- consultar compromisos antes de reorganizar la agenda.

---

# 8. Arquitectura propuesta

```text
┌──────────────────────────────┐
│      PWA / Web App           │
│ Next.js + React + TypeScript │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│     Backend / API Layer      │
│       Next.js server         │
└───────┬────────┬─────────────┘
        │        │
        │        └────────────────────┐
        ▼                             ▼
┌───────────────┐            ┌─────────────────┐
│   Supabase    │            │   AI Provider   │
│ PostgreSQL    │            │ Gemini API      │
│ Auth + RLS    │            └────────┬────────┘
└───────┬───────┘                     │
        │                             │ Tool calls
        │                             ▼
        │                   ┌────────────────────┐
        └──────────────────►│   Skills / Tools   │
                            └─────────┬──────────┘
                                      │
                           ┌──────────┴──────────┐
                           ▼                     ▼
                    Google Calendar       Reminder Worker
```

## Regla central

El modelo **no accede directamente a PostgreSQL**.

El flujo correcto será:

```text
Usuario
  ↓
IA interpreta intención
  ↓
IA solicita una skill
  ↓
Backend valida permisos y argumentos
  ↓
Skill modifica/consulta base de datos
  ↓
Resultado vuelve a la IA
  ↓
IA responde al usuario
```

---

# 9. Modelo de datos inicial

No intentar crear toda la base de datos el primer día.

## Tablas base

### `profiles`

- id
- user_id
- display_name
- timezone
- preferred_sleep_hours
- created_at

### `weekly_schedule`

- id
- user_id
- weekday
- activity_type
- start_time
- end_time
- fixed
- notes

### `tasks`

- id
- user_id
- title
- description
- category
- priority
- due_at
- status

### `habits`

- id
- user_id
- name
- frequency
- active

### `habit_entries`

- id
- habit_id
- entry_date
- completed

### `daily_checkins`

- id
- user_id
- entry_date
- energy
- emotional_state
- life_rating
- sleep_hours
- stress
- notes

### `journal_entries`

- id
- user_id
- entry_date
- relevant_event
- notes

### `goals`

- id
- user_id
- title
- type
- target_date
- progress
- status

## Entrenamiento

### `workout_plans`
### `workout_plan_exercises`
### `workout_sessions`
### `workout_sets`
### `body_metrics`
### `physical_symptoms`

Los síntomas permiten registrar, por ejemplo, bloqueo de rodilla, dolor y observaciones.

## Estudios

### `subjects`
### `study_sessions`
### `assignments`
### `exams`

## Recordatorios

### `reminders`

- id
- user_id
- title
- scheduled_at
- recurrence_rule
- channel
- status
- source
- google_event_id

## IA

### `ai_conversations`
### `ai_messages` *(opcional)*
### `tool_audit_log`

El `tool_audit_log` debe registrar las acciones ejecutadas por IA.

---

# 10. Memoria del asistente

No depender exclusivamente del historial del chat.

Usar tres niveles:

## Nivel 1 — Perfil estable

Datos relativamente permanentes:

- horarios;
- objetivos;
- equipamiento;
- materias;
- preferencias;
- restricciones.

Se guardan en PostgreSQL.

## Nivel 2 — Estado actual

Ejemplos:

- entrenamiento de hoy completado;
- dormí 6,5 horas;
- examen el viernes;
- tarea pendiente;
- molestia de rodilla hoy.

También se obtiene desde PostgreSQL.

## Nivel 3 — Conversación

Información temporal necesaria para mantener coherencia durante la conversación.

Puede resumirse periódicamente para evitar enviar conversaciones enormes a la API.

---

# 11. Skills / Tools de IA

Una **skill** es una operación concreta que el modelo puede solicitar al backend.

El modelo interpreta lenguaje natural; la skill ejecuta la acción real.

## Grupo A — Planificación

### `get_today_plan`
Devuelve actividades, tareas, entrenamiento, estudio y recordatorios del día.

### `get_week_plan`
Devuelve agenda resumida de la semana.

### `create_task`
Crea una tarea.

### `update_task`
Actualiza estado, fecha o prioridad.

### `reschedule_activity`
Mueve una actividad respetando horarios fijos.

### `find_available_time`
Busca ventanas libres reales.

---

## Grupo B — Entrenamiento

### `get_today_workout`
Obtiene entrenamiento planificado.

### `log_workout_session`
Registra sesión realizada.

### `log_workout_set`
Registra ejercicio, peso, repeticiones y dificultad.

### `get_exercise_progress`
Consulta evolución de un ejercicio.

### `log_body_metric`
Registra peso u otra métrica corporal.

### `log_physical_symptom`
Registra dolor, bloqueo, fatiga u observación.

### `adapt_workout`
Genera una propuesta de adaptación basada en descanso, historial y restricciones. La adaptación debe respetar reglas de seguridad del backend.

---

## Grupo C — Estudios

### `get_study_plan`
Obtiene materia y objetivos del día.

### `log_study_session`
Registra duración y tema estudiado.

### `create_assignment`
Registra trabajo práctico.

### `create_exam`
Registra examen.

### `get_subject_progress`
Resume estudio realizado por materia.

---

## Grupo D — Hábitos y diario

### `mark_habit`
Marca hábito cumplido/no cumplido.

### `log_daily_checkin`
Registra energía, estado emocional, sueño, etc.

### `create_journal_entry`
Registra hecho relevante o nota.

### `get_habit_streaks`
Consulta consistencia.

---

## Grupo E — Recordatorios

### `create_reminder`
Crea recordatorio real en base de datos.

### `update_reminder`
Modifica hora o recurrencia.

### `delete_reminder`
Elimina recordatorio.

### `list_reminders`
Consulta próximos recordatorios.

### `sync_google_calendar`
Sincroniza eventos autorizados.

---

## Grupo F — Analytics

### `get_daily_summary`
### `get_weekly_summary`
### `get_monthly_summary`
### `compare_periods`
### `get_goal_progress`

Estas skills entregan datos calculados al modelo para que la explicación sea clara.

---

## Grupo G — Finanzas futuras

### `log_expense`
### `log_income`
### `get_monthly_spending`
### `get_spending_by_category`
### `set_budget`
### `get_budget_status`
### `get_savings_progress`

No incluir herramientas para transferir dinero en las primeras versiones.

---

# 12. Subagentes

## Regla para el MVP

**No comenzar con siete agentes independientes.**

Usar un único agente llamado, por ejemplo, `PersonalOrchestrator`, con las skills necesarias.

Cuando el sistema sea estable, dividir responsabilidades.

## 12.1 Personal Orchestrator

Responsabilidad:

- interpretar intención;
- decidir qué dominio corresponde;
- consultar contexto general;
- coordinar herramientas;
- entregar respuesta final.

Ejemplo:

> “Dormí 5 horas y hoy me toca piernas. ¿Qué hago?”

El Orchestrator consulta sueño + entrenamiento + restricciones y devuelve una propuesta adaptada.

## 12.2 Fitness Agent

Responsabilidades futuras:

- entrenamiento;
- progresión;
- recuperación;
- métricas;
- síntomas;
- restricciones físicas.

No debe diagnosticar ni sustituir atención médica.

## 12.3 Study Planner Agent

- priorizar materias;
- preparar sesiones;
- redistribuir estudio;
- detectar materias atrasadas;
- revisar fechas límite.

## 12.4 Habits & Journal Agent

- hábitos;
- diario;
- objetivos;
- consistencia;
- reflexión semanal.

## 12.5 Reminder / Scheduler Agent

Conceptualmente puede existir como módulo lógico, pero **la ejecución temporal debe ser código determinista**.

Responsabilidades del componente IA:

- interpretar “mañana”, “todos los martes”, etc.;
- construir la instrucción estructurada.

Responsabilidades del scheduler real:

- guardar la programación;
- detectar cuándo vence;
- enviar la notificación;
- reintentar si corresponde.

## 12.6 Analytics / Weekly Review Agent

- recopilar métricas;
- comparar semanas;
- detectar tendencias;
- preparar revisión semanal;
- proponer pequeños ajustes.

## 12.7 Finance Agent — futuro

- clasificar gastos;
- analizar presupuesto;
- responder preguntas financieras personales;
- detectar aumentos o gastos recurrentes.

Debe tener acceso únicamente a las tools financieras autorizadas.

---

# 13. Confirmaciones y permisos de las tools

No todas las herramientas deben tener el mismo nivel de libertad.

## Puede ejecutar directamente

- consultar plan;
- registrar hábito;
- registrar sesión de estudio;
- registrar entrenamiento;
- registrar check-in;
- crear un recordatorio solicitado explícitamente.

## Debe confirmar antes de ejecutar

- eliminar muchos datos;
- reemplazar una rutina semanal completa;
- eliminar objetivos;
- modificar información financiera histórica;
- operaciones destructivas.

## No permitido inicialmente

- transferencias bancarias;
- compras;
- pagos;
- decisiones médicas;
- modificar silenciosamente restricciones de seguridad.

---

# 14. Estrategia de recordatorios

## Fase inicial

Tabla `reminders` + proceso programado.

Flujo:

```text
“Recuérdame Matemática mañana a las 17”
              ↓
IA detecta intención
              ↓
create_reminder(...)
              ↓
PostgreSQL
              ↓
Scheduler
              ↓
Notificación
```

## Integración Google Calendar

Google Calendar será útil para recordatorios vinculados a eventos y compromisos reales.

Se debe usar OAuth y solicitar únicamente los permisos necesarios.

La API de Calendar permite trabajar con eventos que contienen inicio, fin y recordatorios; por tanto puede utilizarse como una segunda capa fiable de agenda.

---

# 15. Voz

No comenzar por voz.

## Fase 1

Chat de texto.

## Fase 2

Botón de micrófono:

```text
Audio → transcripción → asistente → respuesta escrita
```

## Fase 3

Conversación en tiempo real mediante API de voz/realtime:

```text
Usuario habla
   ↓
Sesión realtime
   ↓
Modelo interpreta
   ↓
Tool calling
   ↓
Respuesta hablada
```

El mismo conjunto de skills debe funcionar tanto para chat como para voz.

---

# 16. Seguridad y privacidad

Obligatorio desde el inicio:

- API keys solo en backend;
- variables de entorno;
- autenticación;
- Row Level Security en Supabase;
- HTTPS;
- validación server-side con Zod o equivalente;
- límites de uso de API;
- logs de errores;
- auditoría de tool calls;
- Google OAuth con scopes mínimos;
- nunca enviar toda la base de datos al modelo;
- enviar solo el contexto necesario para responder;
- datos financieros con separación lógica y reglas específicas.

Para producción personal, también implementar:

- exportación de datos;
- backups;
- posibilidad de borrar información;
- política de retención de conversaciones.

---

# 17. Roadmap de desarrollo

## Fase 0 — Preparación

**Objetivo:** definir estructura antes de programar demasiado.

Tareas:

- crear repositorio Git;
- crear proyecto Next.js + TypeScript;
- crear proyecto Supabase;
- configurar variables de entorno;
- desplegar versión vacía en Vercel;
- documentar esquema inicial;
- definir diseño básico mobile-first.

**Resultado:** aplicación vacía accesible online y conectada a la base.

---

## Fase 1 — Tracker personal sin IA

**Objetivo:** que la aplicación ya sea útil aunque no exista IA.

Implementar:

- login;
- dashboard “Mi Día”;
- hábitos;
- check-in diario;
- diario/hecho relevante;
- objetivos mensuales;
- calendario simple;
- historial.

**Criterio de finalización:** poder reemplazar la mayor parte de las anotaciones del cuaderno.

---

## Fase 2 — Entrenamiento

Implementar:

- ejercicios;
- planes;
- sesiones;
- series/repeticiones/peso;
- progresión;
- métricas;
- síntomas;
- rutina semanal.

**Criterio:** completar una sesión desde el celular y consultar el historial.

---

## Fase 3 — Universidad

Implementar:

- materias;
- sesiones de estudio;
- tareas;
- exámenes;
- prioridades;
- tiempo por materia.

**Criterio:** saber qué estudiar y qué está pendiente desde el dashboard.

---

## Fase 4 — IA de texto V1

Implementar Google Gemini API con function calling.

Skills iniciales:

1. `get_today_plan`
2. `create_task`
3. `mark_habit`
4. `log_daily_checkin`
5. `get_today_workout`
6. `log_workout_session`
7. `log_study_session`
8. `create_reminder`
9. `list_reminders`

**No agregar más tools hasta que estas sean confiables.**

Criterios:

- el modelo elige la tool correcta;
- argumentos validados;
- cada tool tiene tests;
- toda modificación queda auditada.

---

## Fase 5 — Recordatorios y Google Calendar

Implementar:

- scheduler;
- notificaciones;
- recurrencias;
- OAuth de Google;
- Calendar API;
- sincronización selectiva.

**Criterio:** decir “recuérdame X mañana a las 18” y recibir realmente el aviso.

---

## Fase 6 — Analytics inteligente

Implementar:

- revisión semanal;
- gráficos;
- comparación entre semanas;
- cumplimiento de hábitos;
- volumen de entrenamiento;
- horas de estudio;
- sueño vs rendimiento;
- recomendaciones pequeñas y medibles.

Ejemplo:

> Esta semana completaste 4 de 5 sesiones. Matemática recibió 35% menos tiempo que la semana pasada. En los días con menos de 6 horas de sueño tu energía media fue menor.

---

## Fase 7 — Voz

Primero transcripción y luego conversación realtime.

Criterio:

> “Registra que hice press de pecho, tres series de diez con 10 kg.”

La aplicación registra correctamente los datos sin necesidad de escribir.

---

## Fase 8 — Finanzas personales

Implementar:

- cuentas;
- categorías;
- ingresos;
- gastos;
- presupuestos;
- metas;
- gráficos;
- Finance Agent;
- tools financieras.

Comenzar con carga manual/conversacional.

---

## Fase 9 — Producción estable

- monitoring;
- captura de errores;
- backups automáticos;
- tests end-to-end;
- rate limits;
- control de costos IA;
- versionado de prompts;
- evaluaciones de tool calling;
- recuperación ante fallos;
- exportación completa de datos.

---

# 18. Orden recomendado de implementación de IA

No implementar “agentes” antes de tener datos reales.

Orden:

```text
Base de datos
   ↓
Interfaz manual
   ↓
APIs internas
   ↓
Skills
   ↓
Asistente único
   ↓
Recordatorios
   ↓
Voz
   ↓
Analytics avanzado
   ↓
Subagentes especializados
```

Esto evita que la IA tenga que improvisar funciones que todavía no existen.

---

# 19. Estrategia de costos de IA

Como será inicialmente para una sola persona, el costo puede mantenerse controlado si:

- no se envía todo el historial en cada mensaje;
- se resumen conversaciones antiguas;
- se usan consultas SQL para obtener métricas en lugar de pedir al LLM calcular todo;
- se reserva el modelo más potente para planificación compleja;
- se usa un modelo más económico para clasificaciones simples;
- se limita la cantidad de tools disponibles según el contexto;
- la voz realtime se activa solo cuando el usuario la utiliza.

Crear desde el inicio:

- presupuesto mensual de API;
- límite de uso diario;
- registro de tokens/coste por conversación cuando sea posible.

---

# 20. Evaluaciones antes de producción

Crear un pequeño conjunto de pruebas con frases reales.

Ejemplos:

### Caso 1

Entrada:

> Mañana tengo examen de Matemática, cambia el entrenamiento si hace falta.

Esperado:

- consultar agenda;
- detectar prioridad académica;
- proponer reprogramación;
- no cambiar automáticamente actividades importantes sin informar.

### Caso 2

> Dormí cuatro horas. ¿Qué hago hoy?

Esperado:

- consultar entrenamiento;
- considerar recuperación;
- evitar sugerir una sesión de máxima intensidad.

### Caso 3

> Hoy se me volvió a trabar la rodilla.

Esperado:

- registrar síntoma si el usuario lo desea;
- reducir o evitar actividad de riesgo;
- no diagnosticar.

### Caso 4

> Gasté 80.000 en supermercado.

Esperado futuro:

- ejecutar `log_expense`;
- guardar monto y categoría;
- confirmar registro.

---

# 21. Estructura de carpetas sugerida

```text
src/
├── app/
│   ├── dashboard/
│   ├── workouts/
│   ├── study/
│   ├── habits/
│   ├── journal/
│   ├── goals/
│   ├── reminders/
│   ├── assistant/
│   └── finances/          # futuro
│
├── components/
├── lib/
│   ├── supabase/
│   ├── ai/
│   │   ├── provider.ts
│   │   ├── openai.ts
│   │   ├── gemini.ts      # futuro/alternativa
│   │   ├── prompts/
│   │   └── tools/
│   ├── calendar/
│   └── notifications/
│
├── services/
│   ├── workouts/
│   ├── study/
│   ├── habits/
│   ├── reminders/
│   ├── analytics/
│   └── finances/          # futuro
│
└── types/
```

---

# 22. Primera versión que realmente conviene construir

La primera versión no necesita voz, subagentes ni finanzas.

Debe tener solamente:

1. autenticación;
2. Mi Día;
3. hábitos;
4. diario/check-in;
5. rutina de entrenamiento;
6. materias y estudio;
7. recordatorios;
8. chat IA con 5–9 skills;
9. historial básico.

Cuando esto funcione todos los días durante varias semanas, recién agregar funciones avanzadas.

---

# 23. Definición de éxito

El proyecto será exitoso cuando pueda abrir la aplicación y preguntar:

> **¿Qué debo hacer hoy?**

Y el sistema pueda responder usando datos reales sobre:

- mi horario laboral;
- universidad;
- sueño;
- entrenamiento;
- estudio;
- hábitos;
- tareas;
- recordatorios;
- objetivos;
- progreso reciente.

Además, si respondo:

> “Hoy no puedo estudiar a esa hora, pásalo para mañana y recuérdame.”

La aplicación deberá interpretar la intención, reprogramar la actividad, guardar el cambio y crear un recordatorio real.

Ese es el núcleo del producto.

---

# 24. Decisiones técnicas tomadas por ahora

| Tema | Decisión inicial |
|---|---|
| Tipo de aplicación | Web responsive + PWA |
| Frontend | Next.js + React + TypeScript |
| Backend | Server routes/actions de Next.js |
| Base de datos | Supabase / PostgreSQL |
| Autenticación | Supabase Auth |
| Hosting | Vercel |
| IA principal | Google Gemini API |
| IA alternativa | OpenAI API (opcional futuro) |
| Voz | Fase posterior con Gemini Live/voz |
| Recordatorios | DB + scheduler; Google Calendar opcional |
| Arquitectura IA MVP | Un único Personal Orchestrator + tools |
| Multiagentes | Solo después de validar el MVP |
| Finanzas | Módulo futuro separado |

---

# 25. Referencias técnicas oficiales a consultar durante el desarrollo

- Google AI for Developers — Gemini API, precios/free tier y Function Calling.
- Google AI for Developers — modelos Live/voz cuando se implemente interacción por audio.
- Google for Developers — Google Calendar API, eventos y recordatorios.
- OpenAI Platform — solo como referencia si más adelante se agrega un proveedor alternativo.
- Supabase Documentation — Auth, PostgreSQL y Row Level Security.
- Vercel Documentation — despliegue y variables de entorno.

---

# 26. Próximo paso recomendado

Cuando comience el proyecto dedicado, iniciar por **Fase 0** y **Fase 1**.

Primer sprint sugerido:

1. crear repositorio;
2. iniciar Next.js + TypeScript;
3. crear Supabase;
4. implementar login;
5. crear esquema `profiles`, `habits`, `habit_entries`, `daily_checkins`, `journal_entries` y `goals`;
6. crear pantalla `Mi Día`;
7. desplegar en Vercel;
8. utilizarla manualmente durante algunos días;
9. corregir la estructura de datos;
10. recién entonces integrar la primera llamada a IA.

**Principio rector del proyecto:** primero construir un sistema personal confiable; después darle inteligencia.
---

# 27. Flujo de desarrollo con Codex, VS Code, GitHub y ChatGPT

El repositorio de GitHub será la **fuente de verdad del código**. Los documentos `PROJECT_STATUS.md` y `DEVLOG.md` vivirán en la raíz del repositorio junto al código.

## Archivos de seguimiento

### `PROJECT_STATUS.md`

Documento corto que representa el estado **actual** del proyecto. Debe actualizarse al cerrar una sesión de desarrollo o completar una funcionalidad importante. Contendrá:

- fase y sprint actuales;
- funcionalidades terminadas;
- funcionalidades en progreso;
- próximos pasos priorizados;
- decisiones técnicas vigentes;
- esquema/tablas existentes;
- rutas/pantallas disponibles;
- variables de entorno necesarias, sin secretos;
- bugs/bloqueos;
- última versión desplegada.

Este es el primer archivo que ChatGPT debería leer cuando se retome el proyecto después de varios días.

### `DEVLOG.md`

Registro cronológico de lo realizado. No reemplaza al `PROJECT_STATUS.md`: conserva la historia mientras `PROJECT_STATUS.md` solo muestra el presente. Cada sesión debe agregar una entrada con fecha, cambios, problemas, decisiones, pruebas y siguiente paso.

## Flujo recomendado por sesión

```text
1. git pull
2. Leer PROJECT_STATUS.md
3. Elegir 1 objetivo pequeño
4. Codificar con VS Code/Codex
5. Ejecutar lint/tests/build
6. Probar manualmente
7. Actualizar DEVLOG.md
8. Actualizar PROJECT_STATUS.md
9. Commit descriptivo
10. Push a GitHub
```

## Cómo trabajar con ChatGPT

Opción recomendada: **conectar GitHub a ChatGPT**. Una vez conectado, ChatGPT puede inspeccionar el repositorio cuando se le pida revisar el estado, archivos, PRs, issues o errores.

Si GitHub no está conectado, alternativas válidas:

1. adjuntar `PROJECT_STATUS.md` y `DEVLOG.md`;
2. adjuntar los archivos que se quieran revisar;
3. compartir fragmentos concretos de código.

No es necesario enviar todo el repositorio en cada conversación si `PROJECT_STATUS.md` está actualizado. Para depurar un error concreto sí conviene proporcionar los archivos implicados y el mensaje de error completo.

## Estrategia Git

Mientras el proyecto sea personal y pequeño:

- rama `main`: siempre funcional/desplegable;
- ramas cortas opcionales: `feature/...`, `fix/...`;
- commits pequeños y descriptivos;
- nunca subir `.env.local`, API keys, tokens ni secretos;
- incluir `.env.example` con solo los nombres de variables.

Ejemplos de commits:

```text
feat: add daily habits tracker
feat: add workout session logging
feat: integrate Gemini function calling
fix: prevent duplicate habit entries
docs: update project status
```

---

# 28. Estrategia Gemini sin costo

La aplicación debe diseñarse para minimizar llamadas innecesarias:

1. **No usar IA para lógica determinista.** Fechas, totales, rachas, estadísticas y validaciones deben calcularse en código/SQL.
2. **Usar Gemini solo cuando aporta comprensión.** Ej.: interpretar “mové piernas al sábado” o resumir una semana.
3. **Enviar poco contexto.** Recuperar de PostgreSQL únicamente los datos necesarios para la consulta actual.
4. **Guardar resultados útiles.** No regenerar resúmenes idénticos constantemente.
5. **Limitar tokens y frecuencia** desde backend.
6. **Manejar cuotas.** Si Gemini no está disponible, la app sigue funcionando manualmente.
7. **Finanzas:** Gemini recibe agregados o datos minimizados, no la base financiera completa salvo que sea estrictamente necesario.

Ejemplo:

```text
Usuario: "¿Cómo voy con comida este mes?"

Backend SQL:
  total_comida = 740000
  presupuesto_comida = 900000

Gemini recibe:
  { total: 740000, presupuesto: 900000, moneda: "PYG" }

Gemini genera la explicación.
```

---

# 29. Documentación mínima que debe vivir en el repositorio

```text
/
├── README.md
├── PROJECT_STATUS.md
├── DEVLOG.md
├── .env.example
├── docs/
│   └── PLAN_MAESTRO.md
└── src/ ...
```

`PLAN_MAESTRO.md` define **hacia dónde va el producto**.  
`PROJECT_STATUS.md` define **dónde está ahora**.  
`DEVLOG.md` explica **cómo llegó hasta ahí**.

