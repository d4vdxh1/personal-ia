import Link from "next/link";
import { getAccount } from "@/lib/auth/account";
import { LogoutForm } from "@/components/auth/logout-form";
import { ProfileForm } from "@/components/auth/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { user, profile, profileError } = await getAccount();
  const displayName = profile?.display_name ?? "";

  return <>
    <LogoutForm />
    <main className="auth-shell profile-shell">
      <section className="auth-card" aria-labelledby="profile-title">
        <Link className="profile-back" href="/">← Volver a Mi Día</Link>
        <p className="auth-brand">Día a Día</p>
        <p className="auth-tagline">Un paso más</p>
        <h1 id="profile-title">Tu perfil</h1>
        <p>Los datos de esta cuenta se cargan de Supabase con tu sesión y respetan las reglas de acceso del perfil.</p>
        <dl className="profile-details">
          <div><dt>Correo</dt><dd>{user.email}</dd></div>
          <div><dt>Zona horaria</dt><dd>{profile?.timezone ?? "America/Argentina/Buenos_Aires"}</dd></div>
          <div><dt>Sueño previsto</dt><dd>{profile?.preferred_sleep_hours ?? 7} horas</dd></div>
        </dl>
        {profileError || !profile ? (
          <p role="alert" className="form-error">No pudimos cargar el perfil asociado a tu cuenta. Actualizá la página o volvé a ingresar.</p>
        ) : <ProfileForm displayName={displayName} />}
      </section>
    </main>
  </>;
}
