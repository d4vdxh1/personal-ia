<div align="center">

<img src="src/app/icon.svg" width="76" height="76" alt="Ícono de Día a Día: pulso blanco sobre fondo verde" />

# Día a Día

### Tu rutina, tus objetivos y tu progreso. Un paso más.

Un espacio personal para organizar tus hábitos, entrenamiento, universidad y objetivos, con un asistente de IA que te ayuda a consultar lo importante de cada día.

**[Abrir la aplicación](https://personal-ia-two.vercel.app/)** · **[Ver asistente IA](https://personal-ia-two.vercel.app/assistant)** · **[Documentación técnica](docs/GUIA_TECNICA.md)**

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-202b25?style=flat-square&logo=next.js&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3077c6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-16734a?style=flat-square&logo=supabase&logoColor=white" />
  <img alt="Google Gemini" src="https://img.shields.io/badge/Gemini-IA%20de%20consulta-16734a?style=flat-square&logo=googlegemini&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-202b25?style=flat-square&logo=vercel&logoColor=white" />
</p>

</div>

---

## ¿Qué es Día a Día?

**Día a Día** es una aplicación web personal desarrollada para reunir en un mismo lugar las actividades cotidianas. En vez de mantener separados los hábitos, las rutinas de ejercicio, las entregas de la universidad y los objetivos, ofrece un panel organizado que utiliza los registros reales de cada cuenta.

El enfoque es simple: **menos fricción para planificar y más claridad para avanzar**, con una interfaz adaptable a computadora y celular, navegación por módulos y una identidad visual clara en blanco y verde.

## Funcionalidades

| Módulo | Qué podés hacer |
|---|---|
| **Mi Día** | Consultar hábitos, registros diarios, entrenamiento y compromisos académicos desde un panel central. |
| **Hábitos** | Crear hábitos, organizar su frecuencia semanal y registrar el cumplimiento diario. |
| **Check-in diario** | Registrar cómo fue tu día y consultar tu seguimiento. |
| **Diario personal** | Escribir, consultar y editar entradas, con historial por fecha. |
| **Objetivos** | Organizar metas semanales o mensuales y seguir sus avances y vencimientos. |
| **Entrenamiento** | Gestionar ejercicios, rutinas, sesiones, historial, medidas y molestias. |
| **Universidad y Estudio** | Administrar materias, tareas, exámenes y sesiones de estudio. |
| **Asistente IA** | Preguntar por tus registros mediante Google Gemini, y, en la rama 4B.1, confirmar el registro de un hábito de hoy. |

### Asistente personal con Gemini

El asistente puede responder preguntas como:

> ¿Qué tengo pendiente hoy?

> ¿Qué entrenamiento me corresponde?

> ¿Cuáles son mis próximas tareas o exámenes?

Sus respuestas se apoyan en consultas autorizadas a los módulos existentes. En 4B.1, escribí «Completé lectura hoy». Si existe un único hábito propio con ese nombre programado para hoy, aparece una tarjeta con nombre, fecha y valor. **Confirmar** guarda el registro y **Cancelar** descarta la propuesta. Antes de enviar preguntas y datos necesarios a Gemini, la aplicación solicita consentimiento. El historial del chat no se almacena de forma persistente.

## Interfaz

- **Escritorio:** navegación lateral organizada por áreas y submódulos.
- **Móvil:** navegación inferior y directorio de secciones.
- **Diseño:** fondos claros, verde como color principal, contraste y estados de interacción.
- **Datos:** estados vacíos y mensajes de error cuando todavía no existen registros o una consulta falla.

**Capturas de pantalla:** el repositorio todavía no incluye capturas públicas preparadas para esta sección. Se incorporarán imágenes reales de la interfaz, revisadas para no revelar datos personales ni sesiones privadas.

## Arquitectura

```text
Next.js + React + TypeScript
          │
          ├── Interfaz responsive y rutas protegidas
          │
          ├── Acciones y API del servidor
          │     └── Asistente Gemini (consultas y propuestas de hábitos)
          │
          └── Supabase
                ├── Authentication
                └── PostgreSQL + Row Level Security (RLS)

Despliegue: Vercel
```

| Capa | Tecnologías |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Next.js Server Actions y Route Handlers |
| Datos y autenticación | Supabase, PostgreSQL, Auth y políticas RLS |
| IA | Google Gemini, proveedor del lado servidor y herramientas de consulta autorizadas |
| Despliegue y validación | Vercel, GitHub Actions y Playwright |

### Seguridad y privacidad

El acceso a los módulos personales requiere una sesión autenticada. La base de datos utiliza políticas de aislamiento por usuario y el asistente consulta los datos mediante el cliente asociado a esa sesión.

La API de Gemini se configura **solo en el servidor**. El asistente dispone de un límite interno de **20 consultas por cuenta al día**, con un intervalo mínimo de cinco segundos. Las notas privadas del diario y los registros de molestias no forman parte de las herramientas de consulta de la Fase 4A.

Estas medidas no sustituyen auditorías de seguridad externas ni garantizan que los servicios de terceros sean gratuitos.

## Acceso y registro de usuarios

La aplicación utiliza Supabase Auth. El [PR #6](https://github.com/d4vdxh1/personal-ia/pull/6) publicó el acceso con Google; el usuario probó dos cuentas distintas. El login con contraseña para cuentas existentes se mantiene; la creación de cuentas mediante correo y la recuperación por email permanecen desactivadas hasta configurar SMTP y protección antiabuso. Ver [guía de configuración](docs/REGISTRO_PUBLICO.md).

## Ejecutar el proyecto

Se recomienda Node.js 24. Necesitás acceso a un proyecto Supabase configurado con el esquema correspondiente.

```bash
git clone https://github.com/d4vdxh1/personal-ia.git
cd personal-ia
npm ci
cp .env.example .env.local
npm run dev
```

En Windows PowerShell, podés reemplazar el comando de copia por `Copy-Item .env.example .env.local`.

Completá en `.env.local` las variables necesarias para tu entorno:

| Variable | Finalidad |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública de Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable de Supabase |
| `GEMINI_API_KEY` | Clave privada para activar el asistente de IA; **solo servidor** |

Luego abrí **http://localhost:3000**. El acceso a las pantallas privadas requiere una cuenta de Supabase Auth.

**No incluyas credenciales en GitHub, capturas ni archivos versionados.** Las migraciones existentes ya se aplicaron al proyecto original; no las ejecutes nuevamente sin revisar el historial de tu base de datos.

Para requisitos detallados, rutas, variables opcionales, migraciones y procedimientos de prueba, consultá la **[guía técnica](docs/GUIA_TECNICA.md)**.

## Calidad y pruebas

El proyecto incluye pruebas automatizadas de lógica, persistencia y navegación:

```bash
npm run lint
npm test
npm run test:db
npm run build
npm run typecheck
npm run test:browser
```

Las pruebas de base de datos usan PostgreSQL de prueba y las pruebas de navegador utilizan autenticación simulada. **No equivalen a una auditoría completa de producción con dos cuentas reales.**

## Estado y próximos pasos

| Etapa | Estado |
|---|---|
| Base, seguimiento personal, entrenamiento y estudio | Implementados |
| **Fase 4A — Asistente Gemini de consulta** | Implementada y validada funcionalmente por el usuario |
| **Fase 4B — Acciones mediante IA** | Hábitos y check-in con confirmación; 4B.2 aceptada por el usuario |
| Recordatorios, Google Calendar y notificaciones | Pendientes |
| Estadísticas avanzadas, voz y finanzas | Etapas futuras |

4B.1 está publicada y el usuario confirmó su funcionamiento desde localhost con Gemini. 4B.2 tiene la migración aplicada y fue aceptada funcionalmente por el usuario para su publicación mediante PR #9. Después sigue 4B.3, sesiones de estudio.

## Documentación

- **[Guía técnica](docs/GUIA_TECNICA.md)** — instalación, arquitectura, variables y pruebas.
- **[Estado del proyecto](PROJECT_STATUS.md)** — módulos, avances y pendientes verificados.
- **[Plan maestro](docs/PLAN_MAESTRO.md)** — fases y roadmap.
- **[Historial de desarrollo](DEVLOG.md)** — decisiones, cambios y verificaciones.
- **[Plan de la Fase 4B](docs/FASE_4B_PLAN.md)** — acciones confirmadas por IA, validación y auditoría.
- **[Entrenamiento](docs/ENTRENAMIENTO.md)** · **[Universidad y Estudio](docs/FASE_3_ESTUDIO.md)** · **[Asistente IA](docs/FASE_4_IA_V1.md)**

---

<div align="center">

**Día a Día · Un paso más**

[Aplicación](https://personal-ia-two.vercel.app/) · [Repositorio](https://github.com/d4vdxh1/personal-ia) · [Portafolio del desarrollador](https://d4vdxh1.github.io/david-espinola-portfolio/)

</div>
