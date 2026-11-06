export const isId = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export function text(value: unknown, max: number, required = false) {
  if (typeof value !== "string" || [...value].length > max) throw new Error("Revisá los textos y su longitud.");
  const clean = value.trim();
  if (required && !clean) throw new Error("Completá los campos obligatorios.");
  return clean;
}
export function number(value: unknown, min: number, max: number, integer = false, optional = false): number | null {
  if (optional && (value === "" || value === null)) return null;
  if ((typeof value !== "string" && typeof value !== "number") || String(value).trim() === "") throw new Error("Completá los valores numéricos.");
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n)) || (!integer && Math.abs(n * 100 - Math.round(n * 100)) > 1e-6)) throw new Error("Revisá los rangos y decimales.");
  return n;
}
export function date(value: unknown, today?: string) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "0001-01-01" || (today && value > today)) throw new Error("Elegí una fecha válida.");
  const d = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== value) throw new Error("Elegí una fecha válida.");
  return value;
}
export type PlanItem = { exercise_id: string; sets: number; reps: number; weight_kg: number; rest_seconds: number };
export type SetValue = { id: string; reps: number; weight_kg: number; rpe: number | null; done: boolean };
function rows(value: unknown, limit: number) {
  if (typeof value !== "string" || value.length > 100000) throw new Error("Formulario inválido.");
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > limit || parsed.some(v => !v || typeof v !== "object")) throw new Error("Agregá al menos una fila válida.");
  return parsed as Record<string, unknown>[];
}
export function planItems(value: unknown): PlanItem[] {
  return rows(value, 20).map(row => {
    if (!isId(row.exercise_id)) throw new Error("Elegí un ejercicio.");
    return { exercise_id: row.exercise_id, sets: number(row.sets, 1, 10, true)!, reps: number(row.reps, 1, 200, true)!, weight_kg: number(row.weight_kg, 0, 1000)!, rest_seconds: number(row.rest_seconds, 0, 900, true)! };
  });
}
export function sessionSets(value: unknown): SetValue[] {
  const ids = new Set();
  return rows(value, 200).map(row => {
    if (!isId(row.id) || ids.has(row.id) || typeof row.done !== "boolean") throw new Error("Series inválidas.");
    ids.add(row.id);
    return { id: row.id, done: row.done, reps: number(row.reps, row.done ? 1 : 0, 200, true)!, weight_kg: number(row.weight_kg, 0, 1000)!, rpe: number(row.rpe, 1, 10, true, true) };
  });
}
