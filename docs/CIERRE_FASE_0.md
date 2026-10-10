# Diseño y verificación de cierre de fase 0

> Informe histórico. El 2026-10-10 se retiraron la demo, sus datos/pruebas y `/api/health/supabase` junto con la excepción del proxy. La retirada en producción depende del próximo push/despliegue. Estado vigente: [verificación de fase 1](CIERRE_FASE_1.md).

## Interfaz de demostración

`/` presenta Mi Día en español: fecha de Buenos Aires renderizada en servidor, próximo compromiso ficticio, registro rápido, hábitos, agenda, entrenamiento/estudio y cierre del día. Los datos viven en `src/lib/demo/day.ts`; no se consultan ni guardan datos personales para esta vista. Las casillas solo actualizan memoria y vuelven al ejemplo al recargar.

Navegación inferior móvil y lateral de escritorio con Hoy, Seguimiento, Progreso y Más. Las secciones futuras muestran estados explicativos; las acciones de registro/perfil abren un diálogo nativo, con cierre mediante Escape y retorno del foco. No hay login, guardado, chat, IA ni PWA instalable.

Componentes principales: `src/components/day-demo.tsx`, `src/components/ui/{card,icon}.tsx`, `src/app/globals.css` y `src/app/page.tsx`. Se conserva Arial, sin dependencias nuevas en la app. Ícono SVG propio en `src/app/icon.svg`.

## Verificaciones locales realizadas

- `npm run lint`, `npm run typecheck` y `npm run build`: correctos.
- `node scripts/check-health.mjs`: casos sin variables, Auth no disponible, permiso denegado esperado, clave inválida, tabla ausente, acceso inesperadamente permitido y error de red; respuesta mínima sin información interna y sin caché.
- Edge headless con Playwright, contra `next start` local: 360, 390, 768 y 1280 px, sin desbordamiento horizontal. Comprobados hábitos/progreso, navegación/selección, estados futuros, diálogo, Escape, retorno de foco, teclado, reset al recargar, altura mínima de botones y consola sin errores.
- Revisadas capturas de 360 y 1280 px visualmente. Capturas de cuatro tamaños disponibles en `%TEMP%/personal-ia-visual/`; no se versionan.
- Contrastes calculados de usos principales: texto principal/blanco 16.27:1; secundario/fondo 5.89:1; blanco/verde 5.86:1; aviso demo 5.58:1; prioridad 5.95:1; azul/fondo azul claro 4.64:1. No constituye una auditoría completa de lector de pantalla.
- No se ejecutó ni se repitió ninguna migración. Los scripts SQL del paso anterior se versionan como historial, sin ejecutar.

### Repetir la prueba de navegador

Playwright se instaló en una carpeta temporal fuera del proyecto; usa Microsoft Edge instalado en Windows. Con la app iniciada, ejecutar en PowerShell:

```powershell
$env:PLAYWRIGHT_MODULE = ([System.Uri](Join-Path $env:TEMP 'personal-ia-browser/node_modules/playwright/index.mjs')).AbsoluteUri
$env:DEMO_URL = 'http://127.0.0.1:3100'
node scripts/check-demo.mjs
```

Para preparar ese entorno en otra máquina: `npm install --prefix "$env:TEMP/personal-ia-browser" --no-package-lock playwright`. El puerto 3100 corresponde a `npm run start -- --hostname 127.0.0.1 --port 3100`, después de compilar.

## Diagnóstico de comunicación desde producción

Ruta temporal: `/api/health/supabase`. Exclusión explícita del proxy de sesión para no depender de cookies de visitantes. Respuesta dinámica, `Cache-Control: no-store, max-age=0`, timeout de seis segundos, solo clave pública y consultas GET sin registros (`limit=0`). No acepta parámetros ni devuelve URL, claves, mensajes de error, cookies o datos personales.

Respuesta esperada:

```json
{"status":"ok","auth":"reachable","dataApi":"restricted"}
```

Solo devuelve HTTP 200 si Auth responde correctamente y la consulta anónima a `profiles` devuelve HTTP 401/403 con código PostgreSQL `42501`. Una clave inválida, tabla inexistente, error de red o acceso anónimo permitido dan HTTP 503 y `{"status":"unavailable"}`.

El resultado confirma comunicación del servidor con Auth/PostgREST y un rechazo anónimo esperado. **No demuestra login, acceso autenticado ni aislamiento con JWT reales.** Esas pruebas pertenecen a fase 1.

El endpoint es público y estrictamente mínimo; cada petición consulta servicios externos. No utilizarlo como herramienta de sondeo continuo. Retirarlo al iniciar la implementación del monitoreo de fase 1 (eliminar la ruta y su exclusión del proxy, actualizar su prueba/documentación); mantenerlo por ahora permite reproducir la evidencia de cierre.

Si producción devuelve 503, comprobar en Vercel → Project Settings → Environment Variables que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` estén configuradas para Production y volver a desplegar. No publicar valores en el chat. Si están presentes, revisar disponibilidad de Supabase y políticas sin desactivar RLS.

## Estado de publicación

Fase 0 cerrada el 2026-10-09. Commit de implementación `aeeaa88` enviado correctamente a `origin/main` (`53e3bc6..aeeaa88`). La versión nueva apareció en el proyecto existente: `https://personal-ia-two.vercel.app/`.

- Página pública HTTP 200 con la vista de ejemplo nueva.
- `https://personal-ia-two.vercel.app/api/health/supabase`: HTTP 200 con la respuesta mínima esperada y `Cache-Control: no-store, max-age=0`. Estas llamadas salieron del servidor de Vercel hacia Supabase.
- Pruebas Playwright/Edge repetidas online a 360, 390, 768 y 1280 px: PASS en los cuatro tamaños, sin errores de consola ni desbordamiento; hábitos, progreso, navegación, diálogo y teclado correctos.
- El diagnóstico demuestra disponibilidad de Auth/Data API y rechazo anónimo, no operaciones de un usuario autenticado. No se modificaron tablas, políticas o migraciones y no se creó ningún usuario.
- La configuración privada del panel de Vercel no fue inspeccionada. Se observó el resultado publicado después del push; no se creó otro proyecto.
- Documentación de cierre actualizada después de verificar producción y preparada para un segundo commit de documentación. Fase 1 no iniciada.
