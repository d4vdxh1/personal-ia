# Personal IA — Diseño y cierre de Fase 0

Fecha: 2026-10-09. Instrucciones para Codex en el repositorio `d4vdxh1/personal-ia`.

## Objetivo autorizado

Implementar el paso 5 (diseño básico mobile-first) con el estilo A, claro y tranquilo. Luego verificar el paso 7 (conexión a Supabase desde producción). La publicación inicial del paso 6 ya existe. No iniciar la fase 1.

Antes de editar, leer `AGENTS.md`, `PROJECT_STATUS.md`, `DEVLOG.md`, `README.md`, `docs/PLAN_MAESTRO.md` y `docs/ESQUEMA_INICIAL.md`. Inspeccionar el código y respetar instrucciones locales. Resolver las diferencias entre este punto de partida y el estado real del repositorio antes de trabajar. Conservar los cambios locales del usuario.

## Punto de partida

- Next.js, React, TypeScript, Tailwind y clientes Supabase ya configurados.
- Pasos 1 a 4 completos. Migración inicial ya aplicada: NO repetirla.
- Tablas: profiles, habits, habit_entries, daily_checkins, journal_entries y goals.
- RLS habilitado, 24 políticas y ausencia de permisos CRUD para anon confirmados por resultados del usuario.
- Sitio inicial: https://personal-ia-two.vercel.app/.
- La página publicada no demuestra acceso a datos desde producción.
- Login y pruebas funcionales con Auth/JWT reales siguen pendientes.
- Gemini, voz, Calendar, finanzas y PWA instalable quedan para etapas posteriores.

## Paso 5 — Dirección visual

Crear una interfaz clara, tranquila, moderna y práctica, en español. Priorizar lectura y registro rápido. Sin modo oscuro por ahora.

### Paleta y componentes

| Uso | Color sugerido |
|---|---|
| Fondo | #F5F7FA |
| Tarjetas | #FFFFFF |
| Texto principal | #172033 |
| Texto secundario | #526174 |
| Acción principal | #16734A |
| Detalle azul | #2563EB |
| Bordes | #E2E8F0 |

Comprobar contraste de los usos reales; ajustar colores si hace falta. Usar tipografía del proyecto, títulos claros, bordes suaves, radios de aproximadamente 16 px y sombras discretas. Evitar dependencias nuevas salvo necesidad concreta. Iconos coherentes con etiquetas accesibles.

### Pantalla «Mi Día»

Diseñar en `/` la vista inicial de demostración. Componentes reutilizables para conectar datos en fase 1.

1. Encabezado: «Buen día, David», fecha y acceso al perfil.
2. Próximo compromiso: actividad, hora y prioridad.
3. Registro rápido: Check-in, Hábito y Nota.
4. Hábitos de hoy: lista con casillas y progreso «3 de 5».
5. Agenda: actividades ordenadas por hora.
6. Entrenamiento y estudio: dos tarjetas, apiladas en celular.
7. Cierre del día: hecho relevante o nota breve.

Objetivo: entender qué hacer hoy en menos de 10 segundos. El contenido esencial debe aparecer primero y no depender de gráficos grandes.

### Navegación

Celular: barra inferior con cuatro opciones: Hoy, Seguimiento, Progreso y Más. Escritorio: barra lateral equivalente. Hoy es la vista inicial; Seguimiento agrupa hábitos/entrenamiento/estudio; Progreso agrupa objetivos/historial/estadísticas; Más agrupa diario/ajustes y futuras secciones.

En este paso no implementar los módulos: las opciones deben navegar a secciones de demostración o mostrar un estado «Disponible en una próxima fase». No dejar botones que aparenten guardar datos y no hagan nada.

### Datos e interacción de demostración

- Marcar de manera visible «Vista de ejemplo — los cambios no se guardan».
- Usar datos ficticios separados del acceso a Supabase. No sembrar datos en producción ni exponer datos personales en la página pública.
- Permitir marcar/desmarcar hábitos únicamente en memoria para probar la interacción. El progreso se calcula en código.
- Las acciones de registro pueden abrir una vista explicativa o formulario de demostración; informar que no guarda, sin afirmar que algo se registró.
- Incluir ejemplos de estados vacíos, etiquetas y feedback comprensible.
- No implementar chat ni mostrar un asistente como funcional. Su espacio se incorporará al integrar IA.
- No generar recomendaciones médicas ni entrenamientos nuevos. Ejemplos de agenda deben respetar que 17:30–18:00 no es una sesión normal de entrenamiento.

### Responsive y accesibilidad

- Verificar 360, 390, 768 y 1280 px; sin desbordamiento horizontal.
- Controles táctiles de al menos 44 px, foco visible y navegación por teclado.
- Etiquetas para formularios, HTML semántico y estado seleccionado accesible.
- La barra inferior no debe tapar contenido; considerar safe-area-inset-bottom.
- Reducir animación si prefers-reduced-motion está activo.
- Fecha según America/Argentina/Buenos_Aires; evitar diferencias de hidratación.

## Verificación del paso 5

Ejecutar lint, typecheck y build con los scripts existentes. Revisar visualmente celular y escritorio, navegación, casillas, progreso, estados vacíos y consola. Registrar qué se comprobó realmente. Si no hay herramienta de captura, informar la limitación y dejar una lista breve de prueba manual, sin afirmar una verificación visual inexistente.

Actualizar PROJECT_STATUS.md y agregar una entrada a DEVLOG.md. Mantener diferencias claras entre interfaz de ejemplo y funcionalidad real.

## Paso 7 — Comprobar Supabase desde producción

Inspeccionar primero los mecanismos existentes. Verificar desde el servidor desplegado que las variables públicas estén presentes y que pueda comunicarse con Supabase Auth/Data API, sin revelar URL, claves, tokens ni registros.

Si se necesita una ruta de diagnóstico temporal, devolver solo estado mínimo, usar timeout, no cachear y no mostrar mensajes internos. Protegerla con un mecanismo apropiado o mantenerla estrictamente mínima; documentar su retirada. No crear una herramienta administrativa ni usar SERVICE_ROLE para el diagnóstico.

RLS prohíbe CRUD anónimo: un rechazo esperado puede probar comunicación, pero NO acceso autenticado ni aislamiento real. No desactivar RLS, conceder permisos a anon, crear usuarios de prueba ni modificar tablas para conseguir una respuesta exitosa. Diferenciar comprobación de disponibilidad de pruebas funcionales con sesión real, que quedan para login en fase 1.

Las variables requeridas son NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Si faltan en Vercel, indicar exactamente qué debe configurar el usuario sin pedir que publique valores en el chat.

## Git y despliegue

El usuario autoriza un nuevo commit y push de este trabajo, después de las verificaciones, para actualizar el proyecto existente en Vercel. Revisar diff y archivos preparados; excluir .env.local, prompts con credenciales, tokens y secretos. No tocar configuración global de Git, no reescribir commits y no usar force push. No crear otro proyecto Vercel.

Después del push, verificar la URL publicada y el diagnóstico desde producción si el acceso disponible lo permite. Si no se puede comprobar el despliegue, dejarlo pendiente y pedir únicamente la evidencia necesaria. No marcar Fase 0 completa por un build local o por HTTP 200 de una página sin consulta a Supabase.

## Criterios de cierre

- Paso 5: diseño implementado y revisado, con demostración claramente identificada.
- Paso 6: nueva interfaz publicada y accesible en el proyecto existente.
- Paso 7: comunicación desde producción a Supabase comprobada y documentada con sus límites.
- Documentos actualizados, validaciones registradas y commit/push informados.
- No comenzar login ni otros módulos de fase 1.

Si algún criterio no se cumple, describir el pendiente concreto y conservar el estado parcial. Las pruebas Auth/JWT reales no deben presentarse como realizadas.

## Respuesta final de Codex

Informar brevemente: cambios implementados; archivos principales; pruebas y resultados; commit y resultado del push; URL y evidencia de producción; estado de cada paso y pendientes. No mostrar credenciales.
