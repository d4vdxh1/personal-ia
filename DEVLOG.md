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
