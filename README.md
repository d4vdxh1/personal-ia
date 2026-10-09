# Asistente Personal IA

Aplicación personal para organizar rutina, hábitos, estudio, entrenamiento y objetivos. El núcleo funcionará manualmente antes de integrar IA.

Estado actual: fase 0, pasos 1 a 3 completados. Página inicial y clientes Supabase configurados; Data API y Auth verificados. Tablas, login, módulos de seguimiento, PWA e IA pendientes.

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
- `src/proxy.ts`: ejecuta la renovación de sesión antes de las rutas; no implementa aún autorización ni login.
- `scripts/check-supabase.mjs`: verifica Auth y consulta una tabla de diagnóstico inexistente con límite cero. El error esperado `PGRST205` confirma acceso a PostgREST; no verifica tablas de negocio, políticas RLS ni login.
- [PROJECT_STATUS.md](PROJECT_STATUS.md): estado actual, pendientes y limitaciones conocidas.
- [DEVLOG.md](DEVLOG.md): historial de cambios y verificaciones.
- [docs/PLAN_MAESTRO.md](docs/PLAN_MAESTRO.md): alcance y roadmap completo.

Actualizar `PROJECT_STATUS.md` y agregar una entrada a `DEVLOG.md` al terminar cada paso. Avanzar al siguiente paso solo cuando el usuario lo indique.

Versionar `package-lock.json` junto con los cambios de dependencias. Las dependencias instaladas, compilaciones, cachés, logs y configuración local de Vercel quedan excluidos por `.gitignore`.

## Pendientes conocidos

En el paso 1, la auditoría registró 5 alertas altas en dependencias de desarrollo de ESLint y 0 en producción. ESLint 9 se mantuvo por compatibilidad de plugins, aunque npm lo marca fuera de soporte. El detalle está en `PROJECT_STATUS.md`; estos resultados corresponden a esa verificación y no reemplazan una auditoría futura.

El archivo local `promt_supabe_connect.md` se excluye de Git porque contiene los datos del proyecto utilizados para configurar `.env.local`. La integración utiliza solo la clave pública; no requiere una clave administrativa.

Próximo paso: definir el esquema inicial y las reglas de acceso. El despliegue en Vercel se realizará en el paso 6.
