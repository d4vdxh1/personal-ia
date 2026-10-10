import Link from "next/link";
import { TrackingShell } from "@/components/tracking-shell";
import { JournalComposer, JournalForm } from "@/components/journal/entry-form";
import { getAccount } from "@/lib/auth/account";
import { createClient } from "@/lib/supabase/server";
import { getBuenosAiresToday } from "@/lib/habits/data";
import { JOURNAL_PAGE_SIZE, loadJournal } from "@/lib/journal/data";
import { journalPage } from "@/lib/journal/validation";

export const dynamic = "force-dynamic";

export default async function JournalPage({ searchParams }: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { user, profile } = await getAccount();
  const page = journalPage((await searchParams).page);
  const supabase = await createClient();
  const result = await loadJournal(supabase, user.id, page);
  const { date } = getBuenosAiresToday();
  const formatDate = (value: string) => new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(`${value}T12:00:00-03:00`));

  return (
    <TrackingShell title="Tu diario" dateLabel={formatDate(date)} active="journal"
      displayName={profile?.display_name.trim() || user.email || "?"}
      copy="Un espacio para recordar, aprender y mirar cómo venís.">
      <div className="journal-layout">
        <section className="card journal-card" aria-label="Escribir en tu diario">
          <JournalComposer today={date} />
        </section>
        <section className="card journal-card" aria-labelledby="journal-history-title">
          <h2 id="journal-history-title">Tus entradas</h2>
          {result.error ? <p role="alert" className="form-error">No pudimos cargar tu diario. Actualizá la página para volver a intentar.</p> : (
            <>
              {result.entries.length === 0 && <p className="habit-empty">{page === 1 ? "Todavía no hay entradas. Podés empezar con algo pequeño de hoy." : "No hay entradas en esta página."}</p>}
              <div className="journal-list">
                {result.entries.map((entry) => (
                  <article className="journal-entry" key={entry.id}>
                    <details>
                      <summary><time dateTime={entry.entry_date}>{formatDate(entry.entry_date)}</time><span>{(entry.relevant_event || entry.notes || "Entrada").slice(0, 100)}</span></summary>
                      {entry.relevant_event && <div className="journal-text"><h3>Hecho relevante</h3><p>{entry.relevant_event}</p></div>}
                      {entry.notes && <div className="journal-text"><h3>Notas</h3><p>{entry.notes}</p></div>}
                      <details className="journal-edit">
                        <summary>Editar entrada</summary>
                        <JournalForm today={date} entry={entry} />
                      </details>
                    </details>
                  </article>
                ))}
              </div>
              <nav className="journal-pagination" aria-label="Páginas del diario">
                {page > 1 && <Link className="secondary-button" href={`/journal?page=${page - 1}`}>Anterior</Link>}
                <span>Página {page}</span>
                {page * JOURNAL_PAGE_SIZE < result.count && <Link className="secondary-button" href={`/journal?page=${page + 1}`}>Siguiente</Link>}
                {page > 1 && <Link className="secondary-button" href="/journal">Volver al inicio</Link>}
              </nav>
            </>
          )}
        </section>
      </div>
    </TrackingShell>
  );
}
