<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Reglas permanentes de interfaz

- Mantener la navegación principal visible en las pantallas internas de la aplicación: menú lateral fijo en escritorio y barra inferior fija en celular, siguiendo el diseño de Hábitos y Check-in. El login queda fuera de esta regla.
- Para nuevos módulos de seguimiento, reutilizar `src/components/tracking-shell.tsx`. Para otras pantallas internas, conservar el mismo patrón de navegación y reutilizar los componentes existentes; evitar páginas aisladas que obliguen a volver al inicio para acceder al menú.
- Mantener coherentes el encabezado, avatar, barra de sesión, espaciados y estado activo de navegación. Los módulos relacionados deben permitir navegar entre sí.
- Diseñar para celular y ventanas de navegador de distintos tamaños. Evitar desbordamiento horizontal; adaptar columnas, campos y tarjetas al ancho disponible.
- Reservar espacio para la barra inferior y el área segura del dispositivo: ningún campo, mensaje o botón debe quedar tapado por el menú. Mantener controles táctiles de al menos 44 px y foco de teclado visible.
- Al modificar la interfaz, comprobar celular y escritorio, incluidos los cambios de menú a 800 px. Usar como referencia 360, 390, 768, 800, 930 y 1280 px; verificar navegación y acceso al botón final de los formularios. Documentar qué se comprobó y cualquier validación pendiente.
- Al cerrar cada paso funcional o ajuste de interfaz, actualizar `DEVLOG.md` y `PROJECT_STATUS.md` con el resultado y las verificaciones realizadas.


## Navegación modular (rediseño 2026-11-06)

- Barra lateral de escritorio: Mi día, Hábitos, Check-in diario, Mi diario, Objetivos, Entrenamiento (Mi semana, Ejercicios, Rutinas, Historial, Medidas y molestias), Estudio (Resumen, Materias, Tareas, Exámenes, Sesiones) y Mi perfil. Los módulos deben conservar accesos directos; no volver a agruparlos bajo "Seguimiento".
- Barra inferior móvil: Hoy, Hábitos, Entrenar, Objetivos y Más. "Más" abre `/menu` con accesos a los módulos de seguimiento, Estudio y las vistas de Entrenamiento; los formularios y la navegación deben quedar accesibles sobre la barra fija.
- Componentes de navegación: `src/components/app-navigation.tsx` y `src/components/tracking-shell.tsx`. Diseño: `src/app/design-v2.css` y `src/app/navigation-v2.css`.
- Mantener estilo claro, verde original `#16734a`, contraste suficiente; sin fondos oscuros, degradados o violetas.


## Continuidad: Fase 4 — IA de texto (aún pendiente)

- Fases 0–3 publicadas; el usuario confirmó funcionamiento general el 2026-11-06. Conservar la diferencia entre aceptación del usuario y pruebas independientes de dos cuentas.
- Primero 4A de solo lectura: herramienta de consulta sobre registros del usuario autenticado, `AIProvider` y Gemini solo en servidor; no exponer tokens ni claves, no crear memoria paralela a la BD.
- Implementar restricciones de cuota/coste, límites de tokens, control de errores, rate limiting, validación de argumentos y pruebas de autorización; registrar mínimo de datos sensibles.
- Una tool de escritura exige confirmación contextual, verificación de propietario, acción transaccional cuando proceda y auditoría. No anunciar `create_task` general ni `create_reminder` como disponibles: no existen actualmente su backend y scheduler.
- Documentar avances en `PROJECT_STATUS.md`, `DEVLOG.md`, `docs/PLAN_MAESTRO.md` y `README.md` sin reescribir entradas históricas.


## Fase 4A — seguridad y privacidad

- Nunca pasar `GEMINI_API_KEY` al cliente, a `NEXT_PUBLIC_*`, al repositorio, a mensajes de error o a logs. No usar `service_role` para leer información del asistente.
- La ruta `/api/assistant` debe comprobar la sesión, validar mensajes, el origen, ejecutar el límite de solicitudes antes de consultar Gemini y devolver respuesta sin caché.
- Funciones de Gemini solo pueden acceder a las herramientas explícitas de lectura: nada de SQL libre, escritura, recordatorios ni acceso a datos de otros usuarios.
- Conservar la pantalla de aceptación de transmisión a Gemini; no guardar automáticamente las conversaciones en BD o navegador. Evitar enviar notas íntimas, síntomas y contenidos médicos.
- Mantener tests SQL de presupuestos y Playwright de navegación sin credenciales reales; integrar claves solo en entornos autorizados. Toda migración debe cotejarse con el historial de Supabase antes de fusionar.
