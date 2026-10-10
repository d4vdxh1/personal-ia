export const GOAL_TYPES = ["weekly", "monthly"] as const;
export const GOAL_STATUSES = ["active", "completed", "cancelled"] as const;
export type GoalStatus = typeof GOAL_STATUSES[number];

export function parseGoal(formData: FormData) {
  const title = formData.get("title");
  const type = formData.get("type");
  const targetDate = formData.get("target_date");
  const progress = formData.get("progress");
  const status = formData.get("status");
  if (typeof title !== "string" || !title.trim() || [...title.trim()].length > 200) return null;
  if (type !== "weekly" && type !== "monthly") return null;
  if (status !== "active" && status !== "completed" && status !== "cancelled") return null;
  if (typeof progress !== "string" || !/^(0|[1-9]\d?|100)$/.test(progress)) return null;
  if (status === "completed" && progress !== "100") return null;
  if (typeof targetDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate) || targetDate < "0001-01-01") return null;
  const date = new Date(`${targetDate}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== targetDate) return null;
  return { title: title.trim(), type, target_date: targetDate, progress: Number(progress), status };
}

export function goalFilter(value: string | string[] | undefined): GoalStatus | "all" {
  return value === "active" || value === "completed" || value === "cancelled" ? value : "all";
}
