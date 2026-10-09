# DEVLOG — Asistente Personal IA

Registro cronológico del desarrollo. **No borrar entradas anteriores.** Agregar las nuevas arriba o abajo de forma consistente; se recomienda más reciente primero.

---

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
