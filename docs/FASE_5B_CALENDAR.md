# Fase 5B.1 — Google Calendar, acceso de solo lectura

**Estado de implementación:** flujo OAuth 2.0 servidor y vista de eventos diseñados en rama. La activación real requiere credenciales propias de Google Cloud; el login existente con Google no concede scopes Calendar.

## Flujo y seguridad

1. `GET /api/calendar/connect` exige sesión y crea `state` aleatorio en cookie HttpOnly, SameSite Lax, 10 minutos, vinculada a la cuenta.
2. Google autoriza **solo** `https://www.googleapis.com/auth/calendar.readonly`. `access_type=offline` y consentimiento explícito.
3. El callback comprueba estado, cuenta y origen del redirect, canjea el código por token y cifra el `refresh_token` con AES-256-GCM más autenticación ligada al identificador del usuario.
4. Tokens en base de datos con RLS por propietario. La clave AES permanece solo en Vercel (`GOOGLE_CALENDAR_TOKEN_KEY`). No se guarda el access token ni se envían tokens al navegador.
5. Consulta bajo demanda del calendario principal, con refresh server-side y ventana de 14 días, máximo 25 eventos; sin copiar eventos a recordatorios ni escribir en Google.
6. Desconectar elimina el acceso local y solicita revocación a Google; si revocación falla, recomendar retirarla desde la cuenta Google.

## Configuración externa obligatoria antes de activar

En [Google Cloud Console](https://console.cloud.google.com/apis/credentials) crear o utilizar un cliente OAuth 2.0 **Web application**, habilitar Google Calendar API, configurar pantalla de consentimiento y usuarios de prueba cuando corresponda, y registrar exactamente:

`https://personal-ia-two.vercel.app/api/calendar/callback`

Solo en Vercel (production): `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`, `GOOGLE_CALENDAR_REDIRECT_URI` y `GOOGLE_CALENDAR_TOKEN_KEY` (32 bytes aleatorios en Base64). Nunca commitear secretos.

## Criterios de cierre

CI, pruebas de RLS entre dos cuentas, cifrado/tamper/owner mismatch y datos inválidos. Después, con OAuth real, autorizar una cuenta de prueba, ver sus eventos, revocar y comprobar que no se puede seguir consultando. Sin credenciales Google Cloud, el módulo se publica **desactivado**; no declararlo probado extremo a extremo.

## Posterior

5B.2 creación de eventos con aprobación y sincronización selectiva, deduplicación y revocación. Implica scopes de escritura adicionales y nueva revisión de seguridad.

## 5B.2 — Exportación selectiva en revisión

Se implementa la autorización incremental para crear eventos (`calendar.events`), exportación manual de un recordatorio individual al calendario principal, ID de evento determinista, comprobación del 409 con lectura autenticada y tabla de vínculos con RLS. Sin modificación ni borrado de eventos Google; no hay sincronización bidireccional ni recurrencias importadas. Requiere `GOOGLE_CALENDAR_WRITE_ENABLED=true` y credenciales OAuth antes de poder probarlo. Ver [guía específica](FASE_5B2_EXPORT.md).

## Estado actualizado 2026-11-08

5B.1 (PR #16) está integrado y desplegado con modo de solo lectura, deshabilitado funcionalmente mientras falten credenciales Google Cloud. 5B.2 (PR #18) prepara exportación manual con permiso incremental, ID estable y comprobación de duplicados. Migraciones ya aplicadas: `20261108185959_google_calendar_connections` y `20261108194807_calendar_event_export`. No confundir código instalado con conexión Google OAuth real; la puesta en marcha necesita configurar Google Cloud y ejecutar pruebas reales de autorización, visualización, creación, reintento y revocación. Sin sincronización bidireccional.
