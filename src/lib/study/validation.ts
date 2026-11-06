export const isId = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export function requiredText(value: FormDataEntryValue | null, max: number) {
  if (typeof value !== "string") throw new Error("Completá los campos obligatorios.");
  const text = value.trim();
  if (!text || text.length > max) throw new Error("Revisá los campos: hay texto vacío o demasiado largo.");
  return text;
}
export function optionalText(value: FormDataEntryValue | null, max: number) {
  if (value === null) return "";
  if (typeof value !== "string" || value.trim().length > max) throw new Error("El texto supera el máximo permitido.");
  return value.trim();
}
export function integer(value: FormDataEntryValue | null, min: number, max: number) {
  if (typeof value !== "string" || !/^\d{1,4}$/.test(value)) throw new Error("Ingresá un número válido.");
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) throw new Error("El número está fuera del rango permitido.");
  return n;
}
export function validDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Indicá una fecha válida.");
  const parsed = new Date(value + "T12:00:00Z");
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0,10) !== value) throw new Error("La fecha no existe.");
  return value;
}
export function choice<T extends string>(value: FormDataEntryValue | null, options: readonly T[]): T {
  if (typeof value !== "string" || !options.includes(value as T)) throw new Error("Seleccioná una opción válida.");
  return value as T;
}
export const ASSIGNMENT_STATUSES = ["pending","in_progress","completed"] as const;
export const EXAM_STATUSES = ["scheduled","completed","cancelled"] as const;
export const EXAM_TYPES = ["exam","quiz","presentation","other"] as const;
export const viewParam = (value: unknown) =>
  value === "subjects" || value === "assignments" || value === "exams" || value === "sessions" ? value : "overview";
