import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutForm } from "@/components/auth/logout-form";
import { Icon, type IconName } from "@/components/ui/icon";

const navigation: { label: string; icon: IconName; href: string }[] = [
  { label: "Hoy", icon: "sun", href: "/" },
  { label: "Seguimiento", icon: "grid", href: "/habits" },
  { label: "Progreso", icon: "chart", href: "/goals" },
  { label: "Más", icon: "more", href: "/" },
];

export function TrackingShell({ title, dateLabel, copy, displayName, active, children }: {
  title: string;
  dateLabel: string;
  copy: string;
  displayName: string;
  active: "today" | "habits" | "check-in" | "profile" | "journal" | "goals";
  children: ReactNode;
}) {
  const selectedSection = active === "today" ? "Hoy" : active === "profile" ? "Más" : active === "goals" ? "Progreso" : "Seguimiento";
  return (
    <>
      <LogoutForm withSidebar />
      <div className="app-shell">
        <a className="skip-link" href="#contenido">Saltar al contenido</a>
        <aside className="sidebar">
          <Link className="brand" href="/" aria-label="Día a Día, inicio">
            <span className="brand-mark"><Icon name="activity" /></span>
            <span>Día a Día<small>Un paso más</small></span>
          </Link>
          <p className="nav-caption">TU ESPACIO</p>
          <nav aria-label="Navegación principal">
            {navigation.map((item) => (
              <Link key={item.label} className={item.label === selectedSection ? "nav-item selected" : "nav-item"}
                aria-current={item.label === selectedSection ? "location" : undefined}
                href={item.label === "Más" ? "/profile" : item.href}>
                <Icon name={item.icon} /><span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="sidebar-note">
            <span className="small-leaf">✧</span>
            <p>Un poco de claridad.<br />Un paso a la vez.</p>
            <small>Tu espacio está tomando forma.</small>
          </div>
          <div className="sidebar-foot">DÍA A DÍA <span>UN PASO MÁS</span></div>
        </aside>
        <main id="contenido" className="main-content">
          <div className="topline"><span>DÍA A DÍA</span><span className="status-dot">Un paso más</span></div>
          <header className="page-header">
            <div>
              <p className="date-label">{dateLabel}</p>
              <h1>{title}<span className="greeting-dot">.</span></h1>
              <p className="header-copy">{copy}</p>
            </div>
            <Link className="avatar" aria-label="Abrir tu perfil" href="/profile">
              {displayName.slice(0, 1).toUpperCase() || "?"}
            </Link>
          </header>
          {active !== "profile" && active !== "today" && <nav className="tracking-tabs" aria-label="Registros personales">
            <Link href="/habits" aria-current={active === "habits" ? "page" : undefined}>Hábitos</Link>
            <Link href="/check-in" aria-current={active === "check-in" ? "page" : undefined}>Check-in diario</Link>
            <Link href="/journal" aria-current={active === "journal" ? "page" : undefined}>Diario</Link>
            <Link href="/goals" aria-current={active === "goals" ? "page" : undefined}>Objetivos</Link>
          </nav>}
          {children}
        </main>
      </div>
    </>
  );
}
