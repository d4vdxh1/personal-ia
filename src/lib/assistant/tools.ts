import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getBuenosAiresToday, loadHabits } from "@/lib/habits/data";
import { loadCheckin } from "@/lib/checkins/data";
import { loadGoals } from "@/lib/goals/data";
import { loadStudyToday } from "@/lib/study/data";
import { loadTrainingToday } from "@/lib/training/data";

export const READ_TOOLS = [
  { name: "get_today_plan", description: "Consulta un resumen del día: hábitos, check-in, objetivos, estudio y entrenamiento." },
  { name: "get_habits_summary", description: "Consulta los hábitos del día y cuáles están completados." },
  { name: "get_today_workout", description: "Consulta sesiones y programación de entrenamiento de hoy." },
  { name: "get_study_overview", description: "Consulta las próximas tareas académicas y exámenes." },
  { name: "get_goals_summary", description: "Consulta objetivos activos, prioridades y vencimientos." },
] as const;
export type ReadToolName = typeof READ_TOOLS[number]["name"];

export function isReadToolName(input: string): input is ReadToolName {
  return READ_TOOLS.some(tool => tool.name === input);
}
type ToolResult = { data?: unknown; error?: string };

export async function runReadTool(name: ReadToolName, client: SupabaseClient, userId: string): Promise<ToolResult> {
  const { date, weekday } = getBuenosAiresToday();
  // Always bind data to the authenticated user. Use the session-scoped client,
  // never a service-role client. Database text is untrusted input, not instructions.
  if (name === "get_habits_summary" || name === "get_today_plan") {
    const data = await loadHabits(client, userId);
    if (data.error) return { error: "No se pudieron consultar los hábitos." };
    const habits = data.habits.filter(h => h.weekdays.includes(weekday));
    const summary = { date, completed: habits.filter(h => h.done).length, total: habits.length, habits: habits.slice(0, 25).map(h => ({ name: h.name.slice(0, 100), done: h.done })) };
    if (name === "get_habits_summary") return { data: summary };
    const [checkin, goals, training, study] = await Promise.all([
      loadCheckin(client, userId, date),
      loadGoals(client, userId, 1, "active"),
      loadTrainingToday(client, userId, date),
      loadStudyToday(client, userId, date),
    ]);
    return { data: {
      today: date,
      habits: summary,
      checkin: checkin.error ? "no disponible" : checkin.checkin ? "registrado" : "pendiente",
      goals: goals.error ? "no disponible" : goals.goals.slice(0, 5).map(g => ({ title: g.title.slice(0, 120), due: g.target_date, progress: g.progress })),
      training: training.error ? "no disponible" : {
        scheduledCount: training.schedule.length,
        sessions: training.sessions.slice(0, 5).map(s => ({ name: s.plan_name.slice(0, 120), status: s.status })),
      },
      study: study.error ? "no disponible" : {
        tasks: study.tasks.slice(0, 3).map(t => ({ title: t.title.slice(0, 120), due: t.due_date })),
        exams: study.exams.slice(0, 3).map(e => ({ title: e.title.slice(0, 120), date: e.exam_date })),
      },
      errors: [checkin.error && "check-in", goals.error && "objetivos", training.error && "entrenamiento", study.error && "estudio"].filter(Boolean),
    }};
  }
  if (name === "get_today_workout") {
    const result = await loadTrainingToday(client, userId, date);
    if (result.error) return { error: "No se pudo consultar el entrenamiento." };
    return { data: { date, scheduledCount: result.schedule.length, sessions: result.sessions.slice(0, 10).map(s => ({ name: s.plan_name.slice(0, 120), status: s.status })) }};
  }
  if (name === "get_study_overview") {
    const result = await loadStudyToday(client, userId, date);
    if (result.error) return { error: "No se pudo consultar Estudio." };
    return { data: { date, tasks: result.tasks.map(t => ({ title: t.title.slice(0, 120), due: t.due_date })), exams: result.exams.map(e => ({ title: e.title.slice(0, 120), date: e.exam_date })) }};
  }
  const goals = await loadGoals(client, userId, 1, "active");
  if (goals.error) return { error: "No se pudieron consultar los objetivos." };
  return { data: { date, totalActive: goals.count, visible: goals.goals.slice(0, 10).map(g => ({ title: g.title.slice(0, 120), progress: g.progress, due: g.target_date })) }};
}
