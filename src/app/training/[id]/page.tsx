import Link from "next/link";
import { notFound } from "next/navigation";
import { TrackingShell } from "@/components/tracking-shell";
import { SessionForm, SymptomForm } from "@/components/training/forms";
import { getAccount } from "@/lib/auth/account";
import { createClient } from "@/lib/supabase/server";
import { getBuenosAiresToday } from "@/lib/habits/data";
import { isId } from "@/lib/training/validation";
import type { Session, TrainingSet } from "@/lib/training/types";
export const dynamic = "force-dynamic";
export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, profile } = await getAccount(); const { id } = await params; if (!isId(id)) notFound();
  const client = await createClient(); const { date: today } = getBuenosAiresToday();
  const [result, sets] = await Promise.all([client.from("training_sessions").select("*").eq("id", id).eq("user_id", user.id).maybeSingle(), client.from("training_sets").select("*").eq("session_id", id).eq("user_id", user.id).order("position").order("set_number").limit(200)]);
  if (!result.error && !result.data) notFound();
  const session = result.data as Session | null;
  return <TrackingShell active="training" trainingView="history" title={session?.plan_name ?? "Sesión"} dateLabel={session?.entry_date ?? today} displayName={profile?.display_name.trim() || user.email || "?"} copy="Tus series, tu esfuerzo y tus notas."><Link className="training-open" href="/training?view=history">← Volver al historial</Link>{result.error || sets.error ? <p role="alert" className="form-error">No pudimos cargar la sesión. Actualizá para volver a intentar.</p> : session && <div className="journal-layout"><section className="card training-card">{session.status === 'in_progress' ? <SessionForm session={session} sets={sets.data as TrainingSet[]} /> : <><h2>Entrenamiento completado</h2><p>{session.duration_minutes} minutos · Dificultad {session.rpe}/10</p><p className="training-notes">{session.notes}</p>{(sets.data as TrainingSet[]).map(set => <article className="goal-entry" key={set.id}><h3>{set.exercise_name} · serie {set.set_number}</h3><p>{set.done ? `${set.reps} rep × ${set.weight_kg} kg` : 'No realizada'}{set.rpe ? ` · Dificultad ${set.rpe}/10` : ''}</p></article>)}</>}</section><section className="card training-card"><SymptomForm today={today} sessionId={session.id} /></section></div>}</TrackingShell>;
}
