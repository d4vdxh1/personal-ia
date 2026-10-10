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
