import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/");
  const { reason } = await searchParams;
  return <main className="auth-shell">
    <section className="auth-card" aria-labelledby="login-title">
      <p className="auth-brand">Día a Día</p>
      <p className="auth-tagline">Un paso más</p>
      <h1 id="login-title">Tu espacio personal</h1>
      <p>Ingresá para continuar con tu día.</p>
      <p className="auth-welcome">Cada día se vuelve más fácil. Lo difícil es hacerlo cada día.</p>
      {reason === "session" && <p role="status">Tu sesión no está activa. Ingresá para continuar.</p>}
      {reason === "logout" && <p role="status">Cerraste tu sesión correctamente.</p>}
      <LoginForm />
      <p>Usá tu cuenta existente con correo y contraseña.</p>
    </section>
  </main>;
}
