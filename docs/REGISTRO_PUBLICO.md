# Registro abierto y acceso con Google

**Estado:** implementación propuesta en la rama `feat/public-signup-google-auth`. El código no habilita automáticamente Google OAuth ni la entrega de correo de Supabase: requieren configuración en sus paneles. No anunciar acceso público hasta completar las comprobaciones con cuentas nuevas.

## Flujos

- **Correo:** `/signup` valida correo y contraseña de mínimo 10 caracteres. `signUp()` crea la cuenta; con confirmación de correo activa, envía un enlace y no crea una sesión utilizable hasta confirmar.
- **Google:** botón «Continuar con Google» en inicio y registro, `signInWithOAuth` con redirect a `/auth/callback`, intercambio de PKCE code del lado del servidor.
- **Sesiones:** el proxy permite exclusivamente login, signup, recuperación y callbacks sin autenticación; los módulos privados conservan la comprobación actual de sesión y las políticas RLS. `handle_new_user` crea una fila en `profiles` para cada nuevo usuario; no requiere migración nueva.
- **Recuperación:** `/forgot-password` solicita correo y `/auth/confirm` acepta el token de recuperación para abrir `/reset-password`.

## Configuración de Supabase Auth

En [Supabase Dashboard](https://supabase.com/dashboard/project/bpfhuuemibcxhxxoqovh/auth/providers):

1. En **Authentication → Providers → Email**, habilitar el registro por email y mantener **Confirm email** activado. No desactivar el chequeo de correo para simplificar las pruebas.
2. En **Authentication → URL Configuration**, establecer **Site URL** = `https://personal-ia-two.vercel.app`. Agregar a Redirect URLs las rutas:
   - `https://personal-ia-two.vercel.app/auth/callback`
   - `https://personal-ia-two.vercel.app/auth/confirm`
   - Para desarrollo, `http://localhost:3000/auth/callback` y `http://localhost:3000/auth/confirm`.
3. Para compatibilidad con **Supabase SSR**, configurar las plantillas de emails en **Authentication → Email Templates**:

   **Confirm signup**:
   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirmar mi correo</a>
   ```

   **Reset Password**:
   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Cambiar contraseña</a>
   ```

   Es posible agregar texto y diseño de marca, manteniendo el formato de los enlaces. Si usás un dominio distinto del dominio principal, ajustar la plantilla y los Redirect URLs.

4. Revisar **Auth rate limits**, **CAPTCHA / Turnstile** y el proveedor de correo SMTP antes de anunciar registro público. La entrega de correo estándar de Supabase puede tener limitaciones importantes. Asegurar cuentas nuevas con verificación y protección antiabuso.

## Configuración de Google OAuth

1. En [Google Cloud Console](https://console.cloud.google.com/apis/credentials), configurar la **pantalla de consentimiento OAuth**; establecer publicación apropiada (no «Testing» con una lista cerrada de usuarios) y políticas requeridas. Crear un cliente OAuth de tipo **Web application**.
2. **Authorized JavaScript origins**: `https://personal-ia-two.vercel.app` (y `http://localhost:3000` para local).
3. **Authorized redirect URI** de Google: `https://bpfhuuemibcxhxxoqovh.supabase.co/auth/v1/callback` — **no** la ruta `/auth/callback` de Next.js. La primera es el callback de Supabase con Google; la segunda completa la sesión dentro de la app.
4. En **Supabase Authentication → Providers → Google**, activar el proveedor y pegar el Client ID y Client Secret de Google. **Nunca** agregar estos valores a GitHub, al cliente o a archivos de documentación.
5. Probar una cuenta Google externa nueva, verificar que se crea el perfil y que no tiene acceso a datos de otro usuario.

## Vercel

Configurar `NEXT_PUBLIC_SITE_URL=https://personal-ia-two.vercel.app` en Production; luego ejecutar un redeploy. No hace falta Pro ni otra base de datos.

## Pruebas antes de cerrar

- [ ] `/signup` accesible sin sesión, contraseñas coinciden y se valida longitud.
- [ ] Se recibe correo real y se confirma por enlace.
- [ ] Nuevo usuario entra a Mi Día sin datos de otras personas.
- [ ] Inicio con Google desde navegador privado y perfil creado.
- [ ] Cierre de sesión e inicio posterior por correo y Google.
- [ ] Recuperación de contraseña por correo.
- [ ] Dos cuentas reales diferentes no acceden a datos ajenos.
- [ ] Límite de correos, protección antiabuso y uso público de Gemini revisados.

**Costes:** abrir el registro hace que más usuarios compartan cuotas de Vercel, Supabase y Gemini. El límite de 20 consultas al día es por cuenta y no evita que múltiples cuentas consuman los límites gratuitos globales.
