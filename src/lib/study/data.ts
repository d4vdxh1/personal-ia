import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Assignment, Exam, StudySession, Subject, StudyView } from "./types";

const empty = () => Promise.resolve({ data: [], error: null });
export async function loadStudy(client: SupabaseClient, userId: string, view: StudyView) {
  const overview = view === "overview";
  const [subjects, assignments, exams, sessions] = await Promise.all([
    client.from("study_subjects").select("id,name,professor,schedule_notes,semester,priority,active")
      .eq("user_id",userId).order("name").limit(150),
    view === "assignments" || overview
      ? client.from("study_assignments").select("id,subject_id,title,details,due_date,priority,status")
        .eq("user_id",userId).order("due_date").limit(100)
      : empty(),
    view === "exams" || overview
      ? client.from("study_exams").select("id,subject_id,title,exam_date,exam_type,notes,status")
        .eq("user_id",userId).order("exam_date").limit(100)
      : empty(),
    view === "sessions" || overview
      ? client.from("study_sessions").select("id,subject_id,study_date,topic,duration_minutes,notes")
        .eq("user_id",userId).order("study_date",{ascending:false}).limit(100)
      : empty(),
  ]);
  return {
    subjects: (subjects.data ?? []) as Subject[],
    assignments: (assignments.data ?? []) as Assignment[],
    exams: (exams.data ?? []) as Exam[],
    sessions: (sessions.data ?? []) as StudySession[],
    error: Boolean(subjects.error || assignments.error || exams.error || sessions.error),
  };
}

export async function loadStudyToday(client: SupabaseClient, userId: string, today: string) {
  const [tasks, exams] = await Promise.all([
    client.from("study_assignments").select("id,title,due_date,subject_id")
      .eq("user_id",userId).neq("status","completed").gte("due_date",today)
      .order("due_date").limit(3),
    client.from("study_exams").select("id,title,exam_date,subject_id")
      .eq("user_id",userId).eq("status","scheduled").gte("exam_date",today)
      .order("exam_date").limit(3),
  ]);
  return { tasks: tasks.data ?? [], exams: exams.data ?? [], error: Boolean(tasks.error || exams.error) };
}
