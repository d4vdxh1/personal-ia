import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";

export type AppSection = "today" | "habits" | "check-in" | "journal" | "goals" | "training" | "profile" | "menu";
export type TrainingView = "week" | "exercises" | "plans" | "history" | "health";

type NavItem = { key: AppSection; title: string; href: string; icon: IconName };
const groups: { heading: string; items: NavItem[] }[] = [
  { heading: "INICIO", items: [{ key: "today", title: "Mi día", href: "/", icon: "sun" }] },
  { heading: "REGISTRO DIARIO", items: [
    { key: "habits", title: "Hábitos", href: "/habits", icon: "check" },
    { key: "check-in", title: "Check-in diario", href: "/check-in", icon: "heart" },
    { key: "journal", title: "Mi diario", href: "/journal", icon: "note" },
  ] },
  { heading: "METAS Y ACTIVIDAD", items: [
    { key: "goals", title: "Objetivos", href: "/goals", icon: "target" },
    { key: "training", title: "Entrenamiento", href: "/training", icon: "activity" },
  ] },
  { heading: "CUENTA", items: [
    { key: "profile", title: "Mi perfil", href: "/profile", icon: "user" },
  ] },
];
export const trainingLinks: { view: TrainingView; title: string; href: string }[] = [
  { view: "week", title: "Mi semana", href: "/training?view=week" },
  { view: "exercises", title: "Ejercicios", href: "/training?view=exercises" },
  { view: "plans", title: "Rutinas", href: "/training?view=plans" },
  { view: "history", title: "Historial", href: "/training?view=history" },
  { view: "health", title: "Medidas y molestias", href: "/training?view=health" },
];
export const allDestinations = groups.flatMap(group => group.items);

export function DesktopNavigation({ active, trainingView }: { active: AppSection; trainingView?: TrainingView }) {
  return <nav className="desktop-nav" aria-label="Navegación principal">
    {groups.map(group => <div className="nav-group" key={group.heading}>
      <p className="nav-caption">{group.heading}</p>
      {group.items.map(item => <div key={item.key}>
        <Link href={item.href} aria-current={active === item.key ? "page" : undefined}
          className={active === item.key ? "nav-item selected" : "nav-item"}>
          <Icon name={item.icon} /><span>{item.title}</span>
        </Link>
        {item.key === "training" && active === "training" &&
          <div className="sidebar-subnav" aria-label="Apartados de entrenamiento">
            {trainingLinks.map(sub => <Link href={sub.href} key={sub.view}
              className={trainingView === sub.view ? "sidebar-subitem selected-subitem" : "sidebar-subitem"}
              aria-current={trainingView === sub.view ? "page" : undefined}>{sub.title}</Link>)}
          </div>}
      </div>)}
    </div>)}
  </nav>;
}

const mobileItems: NavItem[] = [
  { key: "today", title: "Hoy", href: "/", icon: "sun" },
  { key: "habits", title: "Hábitos", href: "/habits", icon: "check" },
  { key: "training", title: "Entrenar", href: "/training", icon: "activity" },
  { key: "goals", title: "Objetivos", href: "/goals", icon: "target" },
  { key: "menu", title: "Más", href: "/menu", icon: "grid" },
];

export function MobileNavigation({ active }: { active: AppSection }) {
  const selected = active === "check-in" || active === "journal" || active === "profile" ? "menu" : active;
  return <nav className="mobile-nav" aria-label="Navegación principal">
    {mobileItems.map(item => <Link key={item.key} href={item.href}
      className={selected === item.key ? "nav-item selected" : "nav-item"}
      aria-current={selected === item.key ? "page" : undefined}>
      <Icon name={item.icon} /><span>{item.title}</span>
    </Link>)}
  </nav>;
}
