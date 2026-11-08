import Link from "next/link";
import type { Metadata } from "next";
import { PublicShell } from "@/components/public/public-shell";

export const metadata: Metadata = {
  title: "Día a Día — Tu rutina, objetivos y estudio",
  description: "Organizá tus hábitos, entrenamiento, universidad y objetivos en un solo lugar, con un asistente de IA de consulta.",
};

const features = [
  { index: "01", name: "Hábitos y seguimiento", text: "Registrá tus hábitos y observá tu progreso día tras día." },
  { index: "02", name: "Entrenamiento", text: "Organizá ejercicios, rutinas y sesiones en tu propio ritmo." },
  { index: "03", name: "Universidad y Estudio", text: "Reuní materias, entregas, exámenes y horas de estudio." },
  { index: "04", name: "Objetivos y diario", text: "Planificá metas, registrá avances y escribí lo que querés recordar." },
  { index: "05", name: "Asistente con Gemini", text: "Consultá tus registros mediante IA. Si completaste un hábito hoy, podés revisar y confirmar su registro." },
];

export default function WelcomePage() {
  return (
    <PublicShell>
      <section className="public-hero">
        <div className="public-hero-copy">
          <p className="public-eyebrow">ORGANIZACIÓN PERSONAL · UN PASO MÁS</p>
          <h1>Hacé que cada día <em>cuente.</em></h1>
          <p className="public-lead">Tus hábitos, entrenamiento, universidad y objetivos, en un mismo lugar. Organizate a tu ritmo y consultá lo importante de tu día.</p>
          <div className="public-actions">
            <Link href="/login" className="public-button">Entrar a Día a Día <span aria-hidden="true">→</span></Link>
            <a href="#public-features" className="public-outline">Conocer las funciones</a>
          </div>
          <p className="public-note">Tus registros requieren una cuenta personal. El asistente IA necesita tu consentimiento antes de enviar consultas a Google Gemini.</p>
        </div>
        <div className="public-hero-aside" aria-label="Resumen ilustrativo de los módulos">
          <p className="public-eyebrow">TU ESPACIO PERSONAL</p>
          <h2>Todo lo importante, en orden.</h2>
          <div className="public-demo-row"><span>✓</span><div><strong>Mis hábitos</strong><small>Rutinas que querés mantener</small></div></div>
          <div className="public-demo-row"><span>◎</span><div><strong>Próximas entregas</strong><small>Materias y fechas importantes</small></div></div>
          <div className="public-demo-row"><span>↗</span><div><strong>Mi progreso</strong><small>Avances que podés consultar</small></div></div>
          <div className="public-demo-foot">Una representación de los módulos, no datos de una cuenta.</div>
        </div>
      </section>
      <section id="public-features" className="public-section">
        <div className="public-section-head">
          <p className="public-eyebrow">LO QUE PODÉS ORGANIZAR</p>
          <h2>Un solo espacio para lo cotidiano.</h2>
          <p>Una aplicación que reúne tus registros sin obligarte a cambiar entre herramientas diferentes.</p>
        </div>
        <div className="public-feature-grid">
          {features.map(item => <article key={item.index} className="public-feature-card">
            <span className="public-feature-number">{item.index}</span>
            <h3>{item.name}</h3><p>{item.text}</p>
          </article>)}
        </div>
      </section>
      <section className="public-privacy-spotlight">
        <div><p className="public-eyebrow">INFORMACIÓN Y PRIVACIDAD</p>
          <h2>Tu espacio, tus registros.</h2>
          <p>Utilizamos Supabase para las cuentas y los datos personales. Si elegís usar el asistente, las preguntas y algunos resúmenes relevantes se transmiten a Google Gemini con tu consentimiento.</p>
        </div>
        <Link href="/privacy" className="public-outline">Leer la política de privacidad</Link>
      </section>
    </PublicShell>
  );
}
