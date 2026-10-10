import { TrackingShell } from "@/components/tracking-shell";
import { CheckinForm } from "@/components/checkins/checkin-form";
import { getAccount } from "@/lib/auth/account";
import { loadCheckin } from "@/lib/checkins/data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const { user, profile } = await getAccount();
  const supabase = await createClient();
  const result = await loadCheckin(supabase, user.id);
  const dateLabel = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires", weekday: "long", day: "numeric", month: "long",
  }).format(new Date(`${result.date}T12:00:00-03:00`));

  return (
    <TrackingShell title="Check-in diario" dateLabel={dateLabel} active="check-in"
      displayName={profile?.display_name.trim() || user.email || "?"}
      copy="Un momento para registrar cómo venís hoy.">
        <section className="card checkin-card" aria-label="Registro de hoy">
          {result.error ? (
            <p role="alert" className="form-error">No pudimos cargar tu check-in. Actualizá la página o volvé a ingresar.</p>
          ) : (
            <>
              {result.checkin && <p>Ya registraste tu día. Podés actualizarlo sin crear otro registro.</p>}
              <CheckinForm key={result.date} checkin={result.checkin} date={result.date} />
            </>
          )}
        </section>
    </TrackingShell>
  );
}
