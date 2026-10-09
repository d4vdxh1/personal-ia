# Día a Día

**Un paso más**. Nombre del producto: **Día a Día**. Identificador técnico: `personal-ia`; repositorio, carpeta, URL de Vercel y proyecto Supabase conservan sus nombres actuales.

Aplicación personal para organizar rutina, hábitos, estudio, entrenamiento y objetivos. El núcleo funcionará manualmente antes de integrar IA.

Estado actual: **fase 0 completada; pasos 1, 2 y 3 de fase 1 implementados localmente**. El usuario confirmó el login real. `/profile` lee y actualiza el perfil propio. `/habits` permite crear, editar días y archivar hábitos; Mi Día registra el cumplimiento diario en Supabase bajo RLS. Pendiente verificar los flujos con la cuenta real y el aislamiento remoto entre usuarios. La agenda y otros módulos continúan como ejemplo. Este paso no se ha publicado.

## Login local

Abrir `/login` con una cuenta existente de Supabase Auth, correo confirmado y contraseña. Alta y recuperación de contraseña fuera de este paso. Los formularios validan en servidor y muestran errores y estado de envío. `Cerrar sesión` termina la sesión de este dispositivo; una sesión inválida vuelve al login. No se necesitan claves administrativas.

Prueba aislada con Auth simulado, Playwright externo y Microsoft Edge instalado, sin nuevas dependencias:

```powershell
node scripts/test-auth.mjs "RUTA/AL/PLAYWRIGHT/index.mjs"
```

Ejecutar sin otro `next dev` activo y con puerto 3107 libre. No reemplaza la validación con Supabase real.

## Entorno local

El proyecto se verificó con Node.js 24 y npm 11. Las versiones de dependencias están fijadas en `package.json` y `package-lock.json`.

Desde la raíz del repositorio:

```powershell
npm ci
# Configurar .env.local como se indica debajo antes de iniciar.
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). Si ese puerto está ocupado, usar la URL que indique la terminal. Para detener el servidor, presionar `Ctrl+C`.

El proxy de Supabase requiere las dos variables públicas de conexión en `.env.local`.

## Variables de entorno

`.env.example` contiene los nombres sin valores reales. En esta máquina `.env.local` ya está configurado. En una copia nueva, crear el archivo en la raíz y completar la URL y clave pública del proyecto Supabase. En PowerShell, este comando conserva cualquier archivo local existente:

```powershell
if (-not (Test-Path .env.local)) {
    Copy-Item .env.example .env.local
}
```

| Variable | Uso previsto |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública del proyecto Supabase. Obligatoria. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública publicable del proyecto. Obligatoria; reemplaza el nombre ANON_KEY del plan inicial. |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor; opcional si una operación requiere privilegios administrativos. |
| `GEMINI_API_KEY` | Solo servidor; integración de IA en una fase posterior. |
| `GOOGLE_CLIENT_ID` | Integración futura de Google Calendar. |
| `GOOGLE_CLIENT_SECRET` | Solo servidor; integración futura de Google Calendar. |

Las variables con prefijo `NEXT_PUBLIC_` pueden incorporarse al código del navegador. No usar ese prefijo para secretos. Reiniciar el servidor después de modificar variables.

Git excluye `.env` y sus variantes locales; la excepción es `.env.example`, que debe mantenerse sin credenciales. `.gitignore` no elimina archivos que ya estén versionados.

## Comandos disponibles

| Comando | Función |
|---|---|
| `npm run dev` | Iniciar el servidor de desarrollo. |
| `npm run lint` | Revisar el código con ESLint. |
| `npm run typecheck` | Verificar los tipos de TypeScript. |
| `npm run check:supabase` | Verificar Data API y Auth con las variables locales, sin escrituras. |
| `npm run build` | Generar la compilación de producción. |
| `npm start` | Servir la compilación de producción después de ejecutar `npm run build`. |

En una copia nueva, ejecutar `npm run build` antes del primer `npm run typecheck` para generar los tipos de Next.js.

## Estructura y seguimiento

- `src/app/`: página inicial, layout y estilos Tailwind.
- `src/lib/supabase/`: configuración y clientes de navegador/servidor, más renovación de sesión.
- `src/proxy.ts`: renueva la sesión y redirige sin sesión; la página privada también verifica al usuario en servidor mediante `src/lib/auth/session.ts`.
- `scripts/check-supabase.mjs`: verifica Auth y consulta una tabla de diagnóstico inexistente con límite cero. El error esperado `PGRST205` confirma acceso a PostgREST; no verifica tablas de negocio, políticas RLS ni login.
- [PROJECT_STATUS.md](PROJECT_STATUS.md): estado actual, pendientes y limitaciones conocidas.
- [DEVLOG.md](DEVLOG.md): historial de cambios y verificaciones.
- [docs/PLAN_MAESTRO.md](docs/PLAN_MAESTRO.md): alcance y roadmap completo.
- [docs/ESQUEMA_INICIAL.md](docs/ESQUEMA_INICIAL.md): seis tablas, reglas RLS, zona horaria y guía para aplicar/verificar la migración.
- `supabase/migrations/`: migraciones versionadas; la primera está aplicada; tablas, RLS y políticas confirmados por los resultados remotos compartidos por el usuario.
- `supabase/tests/`: pruebas SQL para una base PostgreSQL desechable, nunca el bootstrap en producción.

Actualizar `PROJECT_STATUS.md` y agregar una entrada a `DEVLOG.md` al terminar cada paso. Avanzar al siguiente paso solo cuando el usuario lo indique.

Versionar `package-lock.json` junto con los cambios de dependencias. Las dependencias instaladas, compilaciones, cachés, logs y configuración local de Vercel quedan excluidos por `.gitignore`.

## Pendientes conocidos

Antes del cierre de fase 9: activar Vercel Web Analytics en Hobby e integrar `@vercel/analytics`. Pendiente; no se implementa ni se agregan dependencias en este cambio de identidad.

En el paso 1, la auditoría registró 5 alertas altas en dependencias de desarrollo de ESLint y 0 en producción. ESLint 9 se mantuvo por compatibilidad de plugins, aunque npm lo marca fuera de soporte. El detalle está en `PROJECT_STATUS.md`; estos resultados corresponden a esa verificación y no reemplazan una auditoría futura.

El archivo local `promt_supabe_connect.md` se excluye de Git porque contiene los datos del proyecto utilizados para configurar `.env.local`. La integración utiliza solo la clave pública; no requiere una clave administrativa.

## Hábitos

Desde “Seguimiento” o “Gestionar hábitos” se pueden crear hábitos, elegir días (lunes a domingo), cambiar nombre y frecuencia, y archivar. El archivo conserva registros anteriores. Mi Día solo lista los hábitos activos programados para hoy en `America/Argentina/Buenos_Aires`; marcar o desmarcar guarda una entrada única por hábito y fecha. Todas las lecturas y escrituras usan la sesión Supabase del usuario y las políticas RLS existentes. La verificación con cuenta real y entre dos usuarios queda pendiente.

El diseño mobile-first sigue como demostración: los cambios de hábitos no se guardan y los módulos siguen pendientes. Ver [el informe de cierre](docs/CIERRE_FASE_0.md) para la evidencia de fase 0 y retirada del diagnóstico. El paso 2 incluye la pantalla de perfil y acceso SSR; la comprobación remota de dos usuarios queda pendiente antes de cerrar ese paso.
