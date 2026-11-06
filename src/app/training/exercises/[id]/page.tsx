import Link from "next/link";
import { notFound } from "next/navigation";
import { TrackingShell } from "@/components/tracking-shell";
import { getAccount } from "@/lib/auth/account";
import { createClient } from "@/lib/supabase/server";
import { isId } from "@/lib/training/validation";
import { journalPage } from "@/lib/journal/validation";
export const dynamic = "force-dynamic";
type Point = { session_id: string; entry_date: string; exercise_name: string; max_weight: number; volume: number; performed_sets: number; total_count: number };
export default async function ExerciseHistory({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string }> }) {
  const { user, profile } = await getAccount(); const { id } = await params; if (!isId(id)) notFound();
  const page = journalPage((await searchParams).page); const client = await createClient();
  const result = await client.rpc("training_exercise_history", { p_exercise: id, p_page: page });
  const points = (result.data ?? []) as Point[];
  return <TrackingShell active="training" trainingView="history" title="Evolución del ejercicio" dateLabel="TUS REGISTROS" copy="Carga y volumen por sesión completada, sin aumentos automáticos." displayName={profile?.display_name.trim() || user.email || "?"}><Link className="training-open" href="/training?view=history">← Volver al historial</Link><section className="card training-card"><h2>{points[0]?.exercise_name ?? 'Sesiones del ejercicio'}</h2>{result.error ? <p role="alert" className="form-error">No pudimos cargar la evolución.</p> : !points.length ? <p>No hay series realizadas en sesiones completadas para esta página.</p> : points.map(point => <article key={point.session_id} className="goal-entry"><h3><Link href={`/training/${point.session_id}`}>{point.entry_date}</Link></h3><p>{point.performed_sets} series · máxima carga: {point.max_weight} kg</p><p>Volumen: {point.volume} kg × rep</p></article>)}<nav className="journal-pagination" aria-label="Páginas de evolución">{page > 1 && <Link href={`/training/exercises/${id}?page=${page - 1}`}>Anterior</Link>}<span>Página {page}</span>{page * 10 < Number(points[0]?.total_count ?? 0) && <Link href={`/training/exercises/${id}?page=${page + 1}`}>Siguiente</Link>}</nav></section></TrackingShell>;
}
