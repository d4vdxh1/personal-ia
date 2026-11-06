import type { PlanItem, SetValue } from "./validation";
export type Exercise = { id: string; name: string; muscle_group: string; equipment: string; notes: string; active: boolean };
export type Plan = { id: string; name: string; notes: string; active: boolean; items: (PlanItem & { position: number })[] };
export type Schedule = { id: string; plan_id: string; scheduled_date: string };
export type Session = { id: string; plan_id: string; schedule_id: string | null; plan_name: string; entry_date: string; started_at: string; status: "in_progress" | "completed"; duration_minutes: number | null; rpe: number | null; notes: string };
export type TrainingSet = SetValue & { session_id: string; exercise_id: string; exercise_name: string; position: number; set_number: number };
export type Metric = { id: string; entry_date: string; weight_kg: number | null; waist_cm: number | null; arm_cm: number | null; notes: string };
export type Symptom = { id: string; entry_date: string; area: string; intensity: number; locking: boolean; notes: string; session_id: string | null };
