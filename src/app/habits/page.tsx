import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { LogoutForm } from "@/components/auth/logout-form";
import { HabitManager } from "@/components/habits/manager";
import { getAccount } from "@/lib/auth/account";
import { loadHabits } from "@/lib/habits/data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const navigation: { label: string; icon: IconName; href: string }[] = [
  { label: "Hoy", icon: "sun", href: "/" },
  { label: "Seguimiento", icon: "grid", href: "/habits" },
  { label: "Progreso", icon: "chart", href: "/" },
  { label: "Más", icon: "more", href: "/" },
];

export default async function HabitsPage() {
  const { user } = await getAccount();
  const supabase = await createClient();
  const result = await loadHabits(supabase, user.id);
  const dateLabel = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long", day: "numeric", month: "long",
  }).format(new Date(`${result.date}T12:00:00-03:00`));
  return <>
    <LogoutForm />
    <div className="app-shell">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Día a Día, inicio">
          <span className="brand-mark"><Icon name="activity" /></span>
          <span>Día a Día<small>Un paso más</small></span>
        </Link>
        <p className="nav-caption">TU ESPACIO</p>
        <nav aria-label="Navegación principal">
          {navigation.map((item) => <Link key={item.label} className={item.label === "Seguimiento" ? "nav-item selected" : "nav-item"} aria-current={item.label === "Seguimiento" ? "page" : undefined} href={item.href}>
            <Icon name={item.icon} /><span>{item.label}</span>
          </Link>)}
        </nav>
        <div className="sidebar-note">
          <span className="small-leaf">✧</span>
          <p>Un poco de claridad.<br />Un paso a la vez.</p>
          <small>Tu espacio está tomando forma.</small>
        </div>
        <div className="sidebar-foot">DÍA A DÍA <span>VISTA PREVIA</span></div>
      </aside>
      <main id="contenido" className="main-content">
        <div className="topline"><span>DÍA A DÍA</span><span className="status-dot">Un paso más</span></div>
        <header className="page-header">
          <div>
            <p className="date-label">{dateLabel}</p>
            <h1>Hábitos<span className="greeting-dot">.</span></h1>
            <p className="header-copy">Elegí los días que querés practicar cada hábito.</p>
          </div>
          <Link className="avatar" aria-label="Abrir perfil" href="/profile">{user.email?.slice(0, 1).toUpperCase() ?? "?"}</Link>
        </header>
        {result.error ? <p role="alert" className="form-error">No pudimos cargar tus hábitos. Actualizá la página o volvé a ingresar.</p> : <HabitManager habits={result.habits} />}
      </main>
    </div>
  </>;
}
