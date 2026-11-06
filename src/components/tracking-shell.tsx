import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutForm } from "@/components/auth/logout-form";
import { Icon } from "@/components/ui/icon";
import { DesktopNavigation, MobileNavigation, type AppSection, type TrainingView } from "@/components/app-navigation";

export function TrackingShell({
  title, dateLabel, copy, displayName, active, trainingView, children,
}: {
  title: string;
  dateLabel: string;
  copy: string;
  displayName: string;
  active: AppSection;
  trainingView?: TrainingView;
  children: ReactNode;
}) {
  return <>
    <LogoutForm withSidebar />
    <div className="app-shell">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Día a Día, inicio">
          <span className="brand-mark"><Icon name="activity" /></span>
          <span>Día a Día<small>Un paso más</small></span>
        </Link>
        <DesktopNavigation active={active} trainingView={trainingView} />
        <div className="sidebar-note">
          <span className="small-leaf">✧</span>
          <p>Un poco de claridad.<br />Un paso a la vez.</p>
          <small>Cada avance suma.</small>
        </div>
        <div className="sidebar-foot">DÍA A DÍA <span>UN PASO MÁS</span></div>
        <MobileNavigation active={active} />
      </aside>
      <main id="contenido" className="main-content">
        <div className="topline"><span>DÍA A DÍA</span><span className="status-dot">Un paso más</span></div>
        <header className="page-header">
          <div>
            <p className="date-label">{dateLabel}</p>
            <h1>{title}</h1>
            <p className="header-copy">{copy}</p>
          </div>
          <Link className="avatar" aria-label="Abrir tu perfil" href="/profile">
            {displayName.slice(0, 1).toUpperCase() || "?"}
          </Link>
        </header>
        {children}
      </main>
    </div>
  </>;
}
