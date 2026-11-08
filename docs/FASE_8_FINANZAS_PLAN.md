# Fase 8A — Finanzas personales manuales

**Estado:** rama `feat/fase-8a-finanzas-manuales`, PR de revisión. No se han aplicado migraciones a producción ni fusionado cambios.

## Decisión de orden
Por solicitud del usuario, Finanzas (Fase 8) pasa antes de Voz (Fase 7). La numeración original del Plan Maestro no cambia para evitar romper referencias. El diseño general de la app sigue provisional para el MVP.

## Alcance de 8A
- Registro manual de **ingresos y gastos en guaraníes (PYG)**, sin decimales.
- Categorías iniciales controladas y tipo de movimiento; descripción opcional.
- Vista mensual con total de ingresos, total de gastos y resultado neto del mes.
- Desglose de gastos por categoría e historial, con eliminación mediante confirmación explícita.
- Filtrado y acceso por usuario autenticado mediante RLS, filtros adicionales `user_id` y permisos mínimos.
- No se calcula saldo bancario ni se importan movimientos: el resultado mensual **no representa dinero disponible en una cuenta real**.
- Las cifras solo proceden de datos manualmente registrados, sin ejemplos fingidos.

## Datos y seguridad
- Tabla aislada `public.finance_transactions`, columna `user_id` y políticas SELECT/INSERT/DELETE para el titular.
- `anon` y `PUBLIC` sin privilegios; `authenticated` sin UPDATE en 8A.
- Monto `bigint` de 1 a 1.000.000.000.000 ₲, sin valores flotantes; categorías validadas del lado cliente, servidor y SQL.
- Fecha validada en hora local de Paraguay, sin permitir días futuros en la aplicación.
- Hasta 500 registros por mes consultados; si excede la cantidad o falla la consulta, la página devuelve error en vez de mostrar sumas parciales.
- Operaciones desde Server Actions con `auth.getUser()`, sin claves de servicio o cuentas bancarias conectadas.
- No enviar descripciones de movimientos a Gemini; la función de finanzas IA no está habilitada.
- La nueva migración SQL está **pendiente de aplicar y aprobar**; Vercel Preview puede mostrar el estado de error hasta que exista un entorno de base de datos de prueba.

## Pruebas
- Validación de entradas, categoría/tipo, montos enteros, fechas, zona horaria y cálculos mensuales.
- Pruebas SQL de dos identidades con RLS, denegación de `anon`, denegación de actualizaciones y restricciones CHECK.
- Lint, build, TypeScript y QA en navegador deben aprobarse antes de considerar la PR lista.

## Próximos incrementos
- **8B:** cuentas manuales (efectivo/billetera/banco de referencia), saldos derivados por cuenta, presupuestos y alertas; sin acceder al banco.
- **8C:** metas de ahorro, recurrencias, comparaciones y gráficos por categoría.
- **8D (opcional):** Gemini de lectura de sumas agregadas y propuestas de registros **con confirmación**. Nunca transferencias, pagos ni operaciones bancarias.
- **Fase 7 Voz:** después de Finanzas.
- **Fase 9:** seguridad, backup, monitoreo, rendimiento, pruebas E2E y rediseño UX/UI final después del MVP.
