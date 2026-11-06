# Guía técnica — Día a Día

> Documentación para desarrollar, ejecutar y verificar `personal-ia`.
> La presentación del producto está en el [README principal](../README.md). El estado y evidencia de cada entrega están en [PROJECT_STATUS](../PROJECT_STATUS.md) y [DEVLOG](../DEVLOG.md).

## Requisitos y arquitectura

- **Node.js 24** y npm compatibles con el `package-lock.json` versionado.
- **Next.js 16.4.5**, React 19, TypeScript y Tailwind CSS 4.
- **Supabase**: PostgreSQL, autenticación y Row Level Security (RLS).
- **Google Gemini**: integración de solo lectura mediante un proveedor del lado servidor.
- **Vercel**: despliegue del frontend y rutas del servidor.

La aplicación valida sesiones en servidor. Las consultas y escrituras manuales respetan la identidad autenticada y las políticas RLS. Las llamadas a Gemini parten del endpoint autenticado, no del navegador directamente.

## Primer inicio

```bash
git clone https://github.com/d4vdxh1/personal-ia.git
cd personal-ia
npm ci
```

Si todavía no existe `.env.local`, copialo de `.env.example` y completá las variables correspondientes:

```bash
cp .env.example .env.local
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). El inicio de sesión requiere una cuenta válida en el Supabase correspondiente. No subas `.env.local` a GitHub.

### Variables de entorno

| Variable | Alcance | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | URL del proyecto Supabase. Obligatoria. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Pública | Clave publicable de Supabase. Obligatoria. |
| `GEMINI_API_KEY` | **Solo servidor** | Activa la IA de consulta. En producción se configura en Vercel. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Solo servidor / opcional** | Reservada para operaciones administrativas que la requieran; el asistente no debe usarla para consultar datos. |
| `GOOGLE_CLIENT_ID` | Futuro | Integración prevista con Google Calendar, todavía no disponible. |
| `GOOGLE_CLIENT_SECRET` | **Solo servidor / futuro** | Integración prevista con Google Calendar, todavía no disponible. |

Nunca uses `NEXT_PUBLIC_` en nombres de secretos. Reiniciá el servidor después de cambiar variables locales.

## Rutas principales

| Ruta | Descripción |
|---|---|
| `/` | Resumen personal con datos del usuario. |
| `/profile` | Perfil. |
| `/habits` | Hábitos y cumplimiento diario. |
| `/check-in` | Registro diario. |
| `/journal` | Diario personal e historial. |
| `/goals` | Objetivos y avance. |
| `/training` | Ejercicios, rutinas, programación, sesiones, historial, medidas y molestias. |
| `/study` | Materias, tareas académicas, exámenes y sesiones de estudio. |
| `/assistant` | Chat con Gemini y herramientas de solo lectura. |
| `/menu` | Directorio de módulos en móvil. |

Los menús comparten la identidad visual verde y blanca; la aplicación tiene barra lateral en escritorio y navegación inferior en móvil.

## Comportamientos importantes

**Diario personal:** permite entradas múltiples por día, consultar y editar entradas, e historial paginado. No permite fechas futuras. Las validaciones y la persistencia se ejecutan en servidor.

**Objetivos:** permite crear y actualizar objetivos semanales/mensuales, registrar progreso, estados y vencimientos, con filtros y paginación. Los objetivos todavía no tienen relación automática con hábitos o actividades.

**Universidad y Estudio:** las tareas están asociadas a una materia; no existe un gestor de tareas generales. Las sesiones de estudio guardan fecha, duración y tema; Mi Día muestra tareas y exámenes registrados.

**Gemini (Fase 4A):** ofrece cinco herramientas autorizadas de solo lectura sobre Mi Día, hábitos, entrenamiento, estudio y objetivos. La consulta exige consentimiento para compartir información con Google; no envía notas del diario ni molestias personales. El historial de chat no se guarda de manera persistente. El límite interno es 20 solicitudes por día por cuenta, con al menos 5 segundos entre solicitudes. No permite escribir registros ni activar recordatorios.

## Base de datos y migraciones

Las migraciones se encuentran en [`supabase/migrations/`](../supabase/migrations/). Ya fueron aplicadas al proyecto remoto; **no volver a ejecutarlas sobre el mismo proyecto**.

| Versión | Alcance |
|---|---|
| `202610090001_initial_schema` | Perfil, hábitos, check-in, diario y objetivos. |
| `20261106031833_training` | Entrenamiento. |
| `20261106141453_study` | Universidad y Estudio. |
| `20261106152923_ai_usage` | Cuota diaria del asistente y función de reserva. |

Las tablas de cada módulo contienen reglas de acceso por usuario. Las pruebas de migración utilizan una base PostgreSQL de prueba, no la base de producción. **Nunca ejecutar `supabase/tests/bootstrap.sql` en Supabase de producción.**

## Pruebas reproducibles

```bash
npm run lint
npm test
npm run test:db
npm run build
npm run typecheck
npx playwright install chromium
npm run test:browser
```

- `npm test`: lógica de los módulos y validaciones con servicios simulados.
- `npm run test:db`: PostgreSQL desechable, relaciones, permisos y límites del asistente.
- `npm run test:browser`: Playwright en un entorno de pruebas, navegación responsive, formularios y estados de error.
- `npm run build` y `npm run typecheck`: compilación y tipos; en un entorno nuevo ejecutar build primero para generar tipos de Next.js.
- `npm run check:supabase`: diagnóstico básico de conexión, no reemplaza una prueba de autenticación/RLS real.

GitHub Actions ejecuta el conjunto automatizado sin claves privadas. Su autenticación simulada **no equivale** a comprobar dos cuentas y JWT reales en producción.

## Estructura útil

```text
src/app/                  Rutas Next.js, páginas, API y estilos
src/app/api/assistant/    Endpoint autenticado para Gemini
src/components/           Shell, navegación, formularios y chat
src/lib/assistant/        Provider y herramientas de solo lectura
src/lib/supabase/         Clientes y sesión
src/lib/study/            Consulta y validación académica
src/lib/training/         Datos y lógica de entrenamiento
src/proxy.ts              Renovación y control de sesión
supabase/migrations/      Cambios versionados de base de datos
supabase/tests/           Verificaciones SQL
scripts/                  Pruebas y diagnóstico
docs/                     Plan, cierres de fase y guías
```

## Pendientes técnicos conocidos

- **Fase 4B:** herramientas de escritura desde IA con confirmación, validación y auditoría.
- **Fase 5:** gestor de recordatorios, ejecución programada y Calendar.
- Estadísticas avanzadas, voz y finanzas: fases posteriores.
- Verificación de aislamiento con dos cuentas reales, métricas de latencia, monitoreo y Web Analytics.
- Revisar las advertencias de seguridad conocidas de Supabase y las dependencias registradas en [PROJECT_STATUS](../PROJECT_STATUS.md).

## Documentación de continuidad

- [Estado actual](../PROJECT_STATUS.md) · [Bitácora](../DEVLOG.md) · [Plan Maestro](PLAN_MAESTRO.md)
- [Cierre Fase 1](CIERRE_FASE_1.md) · [Entrenamiento](ENTRENAMIENTO.md) · [Fase 3 — Estudio](FASE_3_ESTUDIO.md)
- [Fase 4 — Gemini](FASE_4_IA_V1.md) · [Reglas de contribución para agentes](../AGENTS.md)

_Actualizado el 6 de noviembre de 2026._
