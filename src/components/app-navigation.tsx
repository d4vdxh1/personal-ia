import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";

export type AppSection = "today" | "habits" | "check-in" | "journal" | "goals" | "training" | "profile" | "menu" | "study" | "assistant" | "reminders" | "calendar" | "analytics" | "finance";
export type StudyView = "overview" | "subjects" | "assignments" | "exams" | "sessions";
export type TrainingView = "week" | "exercises" | "plans" | "history" | "health";

type NavItem = { key: AppSection; title: string; href: string; icon: IconName };
const groups: { heading: string; items: NavItem[] }[] = [
  { heading: "INICIO", items: [
    { key: "today", title: "Mi día", href: "/", icon: "sun" },
    { key: "analytics", title: "Estadísticas", href: "/analytics", icon: "chart" },
    { key: "assistant", title: "Asistente IA", href: "/assistant", icon: "sparkles" },
    { key: "reminders", title: "Recordatorios", href: "/reminders", icon: "calendar" },
    { key: "calendar", title: "Google Calendar", href: "/calendar", icon: "calendar" },
  ] },
  { heading: "REGISTRO DIARIO", items: [
    { key: "habits", title: "Hábitos", href: "/habits", icon: "check" },
    { key: "check-in", title: "Check-in diario", href: "/check-in", icon: "heart" },
    { key: "journal", title: "Mi diario", href: "/journal", icon: "note" },
  ] },
  { heading: "METAS Y ACTIVIDAD", items: [
    { key: "goals", title: "Objetivos", href: "/goals", icon: "target" },
    { key: "training", title: "Entrenamiento", href: "/training", icon: "activity" },
  ] },
  { heading: "UNIVERSIDAD", items: [
    { key: "study", title: "Estudio", href: "/study", icon: "book" },
  ] },
  { heading: "FINANZAS", items: [
    { key: "finance", title: "Mis finanzas", href: "/finance", icon: "chart" },
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
export const studyLinks: { view: StudyView; title: string; href: string }[] = [
  { view: "overview", title: "Resumen", href: "/study" },
  { view: "subjects", title: "Materias", href: "/study?view=subjects" },
  { view: "assignments", title: "Tareas", href: "/study?view=assignments" },
  { view: "exams", title: "Exámenes", href: "/study?view=exams" },
  { view: "sessions", title: "Sesiones", href: "/study?view=sessions" },
];
export const allDestinations = groups.flatMap(group => group.items);

export function DesktopNavigation({ active, trainingView, studyView }: { active: AppSection; trainingView?: TrainingView; studyView?: StudyView }) {
  return <nav className="desktop-nav" aria-label="Navegación principal">
    {groups.map(group => <div className="nav-group" key={group.heading}>
      <p className="nav-caption">{group.heading}</p>
      {group.items.map(item => <div key={item.key}>
        <Link href={item.href} aria-current={active === item.key ? "page" : undefined}
          className={active === item.key ? "nav-item selected" : "nav-item"}>
          <Icon name={item.icon} /><span>{item.title}</span>
        </Link>
        {item.key === "study" &&
          <div className="sidebar-subnav" aria-label="Apartados de estudio">
            {studyLinks.map(sub => <Link href={sub.href} key={sub.view}
              className={active === "study" && studyView === sub.view ? "sidebar-subitem selected-subitem" : "sidebar-subitem"}
              aria-current={active === "study" && studyView === sub.view ? "page" : undefined}>{sub.title}</Link>)}
          </div>}
        {item.key === "training" &&
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
  const selected = active === "check-in" || active === "journal" || active === "profile" || active === "study" || active === "assistant" || active === "reminders" || active === "calendar" || active === "analytics" || active === "finance" ? "menu" : active;
  return <nav className="mobile-nav" aria-label="Navegación principal">
    {mobileItems.map(item => <Link key={item.key} href={item.href}
      className={selected === item.key ? "nav-item selected" : "nav-item"}
      aria-current={selected === item.key ? "page" : undefined}>
      <Icon name={item.icon} /><span>{item.title}</span>
    </Link>)}
  </nav>;
}
