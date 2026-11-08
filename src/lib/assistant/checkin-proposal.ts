import { parseCheckin } from "@/lib/checkins/validation";
import { proposalId } from "./habit-proposal";

export type CheckinValues = {
  energy: number;
  emotional_state: number;
  life_rating: number;
  sleep_hours?: number;
  stress?: number;
};
export type CheckinProposal = {
  kind: "checkin";
  id: string;
  date: string;
  overwrite: boolean;
  values: CheckinValues;
};

export function parseCheckinValues(input: unknown): CheckinValues | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const fields = input as Record<string, unknown>;
  const allowed = ["energy", "emotional_state", "life_rating", "sleep_hours", "stress"];
  if (Object.keys(fields).some(key => !allowed.includes(key) || typeof fields[key] !== "number")) return null;
  const form = new FormData();
  for (const key of allowed) form.set(key, fields[key] === undefined ? "" : String(fields[key]));
  form.set("notes", "");
  const parsed = parseCheckin(form);
  if (!parsed) return null;
  return {
    energy: parsed.energy, emotional_state: parsed.emotional_state, life_rating: parsed.life_rating,
    ...(parsed.sleep_hours === null ? {} : { sleep_hours: parsed.sleep_hours }),
    ...(parsed.stress === null ? {} : { stress: parsed.stress }),
  };
}

export function isCheckinProposal(input: unknown): input is CheckinProposal {
  if (!input || typeof input !== "object") return false;
  const card = input as Partial<CheckinProposal>;
  return card.kind === "checkin" && typeof card.id === "string" && proposalId.test(card.id) &&
    typeof card.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(card.date) &&
    typeof card.overwrite === "boolean" && parseCheckinValues(card.values) !== null;
}
