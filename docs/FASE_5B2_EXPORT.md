# Fase 5B.2 — Exportación selectiva a Google Calendar

## Alcance y estado

Implementación de **exportación manual unidireccional** de recordatorios individuales a Google Calendar. No se modifican eventos existentes, no se borran eventos remotos al cancelar un recordatorio, no se sincronizan recurrencias y no existe sincronización bidireccional.

La activación requiere el OAuth ya definido en 5B.1 y credenciales propias de Google Cloud. Hasta entonces el sistema se mantiene desactivado mediante `GOOGLE_CALENDAR_WRITE_ENABLED=false`. No hay tokens en GitHub ni en el navegador.

## Seguridad

- Scopes mínimos: `calendar.readonly` para consultar y `calendar.events` solo cuando el usuario pide crear eventos. El login normal de Google no habilita Google Calendar.
- `GET /api/calendar/connect?mode=write` solicita autorización reforzada con consentimiento explícito y valida el scope concedido en el callback.
- Refresh tokens cifrados AES-256-GCM, ligados al ID de usuario; tokens de acceso efímeros solo en servidor.
- Cada envío se inicia al pulsar **Enviar a Google Calendar** para un recordatorio propio. RLS valida propietario y vinculación; se evita utilizar `service_role` en el flujo del usuario.
- IDs de eventos deterministas derivados de usuario + recordatorio; si Google responde 409 se verifica con GET el ID y las propiedades privadas antes de reconocer un reintento. Almacenar la relación local solo al verificar que Google creó o tiene el evento correcto.
- La exportación está condicionada a `GOOGLE_CALENDAR_WRITE_ENABLED=true` en el servidor y `can_write=true` en la conexión autorizada. No enviar invitados, enlaces privados ni notas de los recordatorios.

## Criterios de validación

- CI completo: lint, pruebas unitarias y SQL con dos usuarios, build/TypeScript y navegador.
- Pruebas de IDs estables, 409/GET con propiedades privadas correctas e incorrectas, campos inválidos, aislamiento RLS y permisos anon.
- Prueba real aún pendiente: configurar Google Cloud, autorizar una cuenta con scopes correctos, exportar un recordatorio, repetir y comprobar que no se duplica; revocar.
- **No activar el flag ni declarar sincronización completa sin credenciales y aceptación real de Google.**
