import Link from "next/link";
import { TrackingShell } from "@/components/tracking-shell";
import { allDestinations, trainingLinks, studyLinks } from "@/components/app-navigation";
import { Icon } from "@/components/ui/icon";
import { getAccount } from "@/lib/auth/account";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const { user, profile } = await getAccount();
  const displayName = profile?.display_name.trim() || user.email?.split("@")[0] || "Usuario";
  return (
    <TrackingShell active="menu" title="Todos tus espacios" dateLabel="EXPLORAR"
      displayName={displayName} copy="Accedé directamente a cada parte de Día a Día.">
      <div className="module-directory">
        <section className="directory-section" aria-labelledby="directory-modules">
          <h2 id="directory-modules">Mis módulos</h2>
          <div className="directory-grid">
            {allDestinations.map(item => (
              <Link className="directory-link" key={item.key} href={item.href}>
                <span className="directory-icon"><Icon name={item.icon} /></span>
                <strong>{item.title}</strong>
                <Icon name="arrow" />
              </Link>
            ))}
          </div>
        </section>
        <section className="directory-section" aria-labelledby="directory-study">
          <h2 id="directory-study">Universidad y Estudio</h2>
          <p>Materias, tareas, exámenes y sesiones registradas.</p>
          <div className="directory-grid">
            {studyLinks.map(item => <Link className="directory-link" key={item.view} href={item.href}>
              <span className="directory-icon"><Icon name="book" /></span>
              <strong>{item.title}</strong><Icon name="arrow" />
            </Link>)}
          </div>
        </section>
        <section className="directory-section" aria-labelledby="directory-training">
          <h2 id="directory-training">Entrenamiento</h2>
          <p>Organizá las sesiones, consultá el historial y registrá tus medidas.</p>
          <div className="directory-grid">
            {trainingLinks.map(item => (
              <Link className="directory-link" key={item.view} href={item.href}>
                <span className="directory-icon"><Icon name="activity" /></span>
                <strong>{item.title}</strong>
                <Icon name="arrow" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </TrackingShell>
  );
}
