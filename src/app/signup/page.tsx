import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupForm } from "@/components/auth/signup-form";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/");
  const emailSignupEnabled = process.env.EMAIL_SIGNUP_ENABLED === "true";

  return <main className="auth-shell">
    <section className="auth-card auth-card-v2" aria-labelledby="signup-title">
      <Link href="/" className="auth-brand-link" aria-label="Día a Día, inicio">
        <span className="auth-logo-mark" aria-hidden="true">✳</span>
        <span>Día a Día<small>Un paso más</small></span>
      </Link>
      <p className="auth-eyebrow">EMPEZÁ POR ACÁ</p>
      <h1 id="signup-title">Creá tu espacio personal.</h1>
      <p className="auth-description">Organizá tus hábitos, tu entrenamiento y tus objetivos en un solo lugar.</p>
      <GoogleSignInButton />
      {emailSignupEnabled ? <>
        <div className="auth-divider"><span>o registrate con tu correo</span></div>
        <SignupForm />
      </> : <p className="auth-footnote" role="status">
        Por ahora, las cuentas nuevas se crean con Google. El registro con correo y contraseña estará disponible cuando habilitemos la confirmación por email.
      </p>}
      <p className="auth-footer">¿Ya tenés una cuenta? <Link href="/login">Iniciar sesión</Link></p>
      <p className="auth-footnote">Tus registros son privados. El correo puede requerir confirmación antes de ingresar.</p>
    </section>
  </main>;
}
