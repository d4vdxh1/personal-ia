"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { demoAgenda, demoHabits } from "@/lib/demo/day";
import { Card } from "./ui/card";
import { Icon, type IconName } from "./ui/icon";

const navigation: { label: string; icon: IconName }[] = [
  { label: "Hoy", icon: "sun" },
  { label: "Seguimiento", icon: "grid" },
  { label: "Progreso", icon: "chart" },
  { label: "Más", icon: "more" },
];
const upcoming: Record<string, { title: string; copy: string }[]> = {
  Seguimiento: [
    { title: "Hábitos", copy: "Tus pequeños pasos, reunidos en un lugar." },
    { title: "Entrenamiento", copy: "Rutinas y registro de sesiones." },
    { title: "Estudio", copy: "Materias, temas y sesiones de estudio." },
  ],
  Progreso: [
    {
      title: "Objetivos",
      copy: "Todavía no hay objetivos. Acá vas a poder seguir tus metas.",
    },
    { title: "Historial", copy: "Todavía no hay registros para mostrar." },
    {
      title: "Estadísticas",
      copy: "Los resúmenes aparecerán cuando tengas datos reales.",
    },
  ],
  Más: [
    { title: "Diario", copy: "Un espacio para lo que quieras recordar." },
    { title: "Ajustes", copy: "Tus preferencias y tu perfil." },
  ],
};

export function DayDemo({ dateLabel }: { dateLabel: string }) {
  const [section, setSection] = useState("Hoy");
  const [habits, setHabits] = useState(demoHabits);
  const [dialogTitle, setDialogTitle] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const completed = habits.filter((habit) => habit.done).length;
  function explain(title: string) {
    setDialogTitle(title);
    dialog.current?.showModal();
  }
  function navigate(label: string) {
    setSection(label);
    requestAnimationFrame(() => {
      heading.current?.focus();
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Personal IA, inicio">
          <span className="brand-mark">
            <Icon name="activity" />
          </span>
          <span>
            personal<span className="brand-dot">.</span>
            <small>UN DÍA A LA VEZ</small>
          </span>
        </Link>
        <p className="nav-caption">TU ESPACIO</p>
        <nav aria-label="Navegación principal">
          {navigation.map((item) => (
            <button
              key={item.label}
              className={
                section === item.label ? "nav-item selected" : "nav-item"
              }
              aria-current={section === item.label ? "page" : undefined}
              onClick={() => navigate(item.label)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="small-leaf">✧</span>
          <p>
            Un poco de claridad.
            <br />
            Un paso a la vez.
          </p>
          <small>Tu espacio está tomando forma.</small>
        </div>
        <div className="sidebar-foot">
          PERSONAL IA <span>VISTA PREVIA</span>
        </div>
      </aside>
      <main id="contenido" className="main-content">
        <div className="topline">
          <span>MI ESPACIO PERSONAL</span>
          <span className="status-dot">Un día a la vez</span>
        </div>
        <header className="page-header">
          <div>
            <p className="date-label">{dateLabel}</p>
            <h1 ref={heading} tabIndex={-1}>
              {section === "Hoy" ? "Buen día, David" : section}
              <span className="greeting-dot">.</span>
            </h1>
            <p className="header-copy">
              {section === "Hoy"
                ? "Hagamos lugar para lo importante."
                : "Todo en su lugar, a tu ritmo."}
            </p>
          </div>
          <button
            className="avatar"
            aria-label="Abrir perfil de ejemplo"
            onClick={() => explain("Perfil")}
          >
            D
          </button>
        </header>
        <div className="demo-banner">
          <span className="demo-badge">DEMO</span>
          <span>Vista de ejemplo — los cambios no se guardan</span>
        </div>
        {section === "Hoy" ? (
          <>
            <section className="next-card" aria-labelledby="next-title">
              <div className="next-icon">
                <Icon name="book" />
              </div>
              <div className="next-copy">
                <p className="eyebrow">PRÓXIMO COMPROMISO · EJEMPLO</p>
                <h2 id="next-title">Clase de ejemplo</h2>
                <p>Prepará tus apuntes y salí con tiempo.</p>
                <span className="priority">Prioridad alta</span>
              </div>
              <div className="next-time">
                <strong>18:30</strong>
                <span>Salida 18:00</span>
              </div>
            </section>
            <section className="quick-section" aria-labelledby="quick-title">
              <div className="section-heading">
                <h2 id="quick-title">Registro rápido</h2>
                <span>Un momento para vos</span>
              </div>
              <div className="quick-actions">
                {(
                  [
                    { title: "Check-in", sub: "¿Cómo estás hoy?", icon: "sun" },
                    {
                      title: "Hábito",
                      sub: "Un pequeño avance",
                      icon: "check",
                    },
                    { title: "Nota", sub: "Algo para recordar", icon: "note" },
                  ] as const
                ).map((item) => (
                  <button
                    className="quick-action"
                    key={item.title}
                    onClick={() => explain(item.title)}
                  >
                    <span className={"action-icon " + item.icon}>
                      <Icon name={item.icon} />
                    </span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.sub}</small>
                    </span>
                    <span className="quick-arrow">
                      <Icon name="arrow" />
                    </span>
                  </button>
                ))}
              </div>
            </section>
            <div className="dashboard-grid">
              <Card
                title="Hábitos de hoy"
                eyebrow="LA CONSTANCIA EMPIEZA EN PEQUEÑO"
                className="habits-card"
              >
                <div className="habit-summary">
                  <span aria-live="polite">
                    {completed} de {habits.length} completados
                  </span>
                  <strong>
                    {Math.round((completed / habits.length) * 100)}%
                  </strong>
                </div>
                <progress
                  aria-label="Progreso de hábitos de ejemplo"
                  value={completed}
                  max={habits.length}
                />
                <div className="habit-list">
                  {habits.map((habit) => (
                    <label
                      className={habit.done ? "habit-row is-done" : "habit-row"}
                      key={habit.id}
                    >
                      <input
                        type="checkbox"
                        checked={habit.done}
                        onChange={() =>
                          setHabits((current) =>
                            current.map((entry) =>
                              entry.id === habit.id
                                ? { ...entry, done: !entry.done }
                                : entry,
                            ),
                          )
                        }
                      />
                      <span>
                        <strong>{habit.name}</strong>
                        <small>{habit.detail}</small>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="card-footnote">
                  Probá las casillas. Al recargar, vuelve el ejemplo.
                </p>
              </Card>
              <Card
                title="Tu agenda"
                eyebrow="LO QUE VIENE"
                className="agenda-card"
              >
                <ol className="agenda-list">
                  {demoAgenda.map((item) => (
                    <li key={item.time}>
                      <time>{item.time}</time>
                      <span className="timeline-dot" />
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.detail}</p>
                        <span className="tag">{item.tag}</span>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="quiet-note">
                  También hay espacio para una pausa.
                </div>
              </Card>
              <Card title="Entrenamiento" className="small-card">
                <div className="section-icon">
                  <Icon name="activity" />
                </div>
                <p className="empty-title">Hoy, sin sesión de ejemplo</p>
                <p>Tu rutina aparecerá acá cuando la configures.</p>
                <button
                  className="text-button"
                  onClick={() => explain("Entrenamiento")}
                >
                  Ver este espacio <Icon name="arrow" />
                </button>
              </Card>
              <Card title="Estudio" className="small-card">
                <div className="section-icon blue">
                  <Icon name="book" />
                </div>
                <p className="empty-title">Un tema a la vez</p>
                <p>Ejemplo: repasar apuntes de una materia.</p>
                <button
                  className="text-button"
                  onClick={() => explain("Estudio")}
                >
                  Ver este espacio <Icon name="arrow" />
                </button>
              </Card>
            </div>
            <section className="closing-card">
              <div>
                <p className="eyebrow">ANTES DE TERMINAR</p>
                <h2>¿Con qué te quedás de hoy?</h2>
                <p>Una idea, un buen momento o algo que aprendiste.</p>
              </div>
              <button
                className="primary-button"
                onClick={() => explain("Cierre del día")}
              >
                Escribir una nota <Icon name="note" />
              </button>
            </section>
            <footer className="page-footer">
              No hace falta hacerlo todo. Un paso también es progreso.
              <span>Contenido ficticio · Vista de ejemplo</span>
            </footer>
          </>
        ) : (
          <div className="placeholder-grid">
            {upcoming[section].map((item) => (
              <Card title={item.title} key={item.title}>
                <p>{item.copy}</p>
                <span className="coming-soon">
                  Disponible en una próxima fase
                </span>
              </Card>
            ))}
          </div>
        )}
      </main>
      <dialog
        ref={dialog}
        aria-labelledby="dialog-title"
        className="demo-dialog"
      >
        <span className="demo-badge">VISTA DE EJEMPLO</span>
        <h2 id="dialog-title">{dialogTitle}</h2>
        <p>Este espacio estará disponible en una próxima fase.</p>
        <p>
          Por ahora podés explorar el diseño. No se registra ni se guarda
          información.
        </p>
        <form method="dialog">
          <button className="primary-button">Entendido, volver</button>
        </form>
      </dialog>
    </div>
  );
}
