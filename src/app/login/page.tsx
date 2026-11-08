import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/");
  const { reason } = await searchParams;
  return <main className="auth-shell">
    <section className="auth-card auth-card-v2" aria-labelledby="login-title">
      <Link href="/" className="auth-brand-link">
        <span className="auth-logo-mark" aria-hidden="true">✳</span>
        <span>Día a Día<small>Un paso más</small></span>
      </Link>
      <p className="auth-eyebrow">BIENVENIDO DE VUELTA</p>
      <h1 id="login-title">Tu espacio personal.</h1>
      <p className="auth-description">Retomá tus hábitos, objetivos y avances donde los dejaste.</p>
      {reason === "session" && <p role="status">Tu sesión no está activa. Ingresá para continuar.</p>}
      {reason === "logout" && <p role="status">Cerraste tu sesión correctamente.</p>}
      {reason === "oauth-error" && <p role="alert" className="auth-feedback error">No se pudo completar el acceso con Google. Intentá de nuevo.</p>}
      {reason === "confirmation-error" && <p role="alert" className="auth-feedback error">El enlace es inválido o ya venció. Solicitá uno nuevo.</p>}
      <GoogleSignInButton />
      <div className="auth-divider"><span>o ingresá con tu correo</span></div>
      <LoginForm />
      {process.env.EMAIL_RECOVERY_ENABLED === "true" && <div className="auth-links">
        <Link href="/forgot-password">¿Olvidaste tu contraseña?</Link>
      </div>}
      <p className="auth-footer">¿Todavía no tenés cuenta? <Link href="/signup">Crear cuenta gratis</Link></p>
    </section>
  </main>;
}
