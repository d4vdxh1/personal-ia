import { getAccount } from "@/lib/auth/account";
import { TrackingShell } from "@/components/tracking-shell";
import { ProfileForm } from "@/components/auth/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { user, profile, profileError } = await getAccount();
  const displayName = profile?.display_name ?? "";

  return <TrackingShell title="Tu perfil" dateLabel="TU CUENTA" active="profile"
    displayName={displayName.trim() || user.email || "?"}
    copy="Consultá los datos de tu cuenta y elegí cómo querés que te llamemos.">
      <section className="card profile-card" aria-labelledby="profile-details-title">
        <h2 id="profile-details-title">Datos de tu cuenta</h2>
        <dl className="profile-details">
          <div><dt>Correo</dt><dd>{user.email}</dd></div>
          <div><dt>Zona horaria</dt><dd>{profile?.timezone ?? "America/Argentina/Buenos_Aires"}</dd></div>
          <div><dt>Sueño previsto</dt><dd>{profile?.preferred_sleep_hours ?? 7} horas</dd></div>
        </dl>
        {profileError || !profile ? (
          <p role="alert" className="form-error">No pudimos cargar el perfil asociado a tu cuenta. Actualizá la página o volvé a ingresar.</p>
        ) : <ProfileForm displayName={displayName} />}
      </section>
  </TrackingShell>;
}
