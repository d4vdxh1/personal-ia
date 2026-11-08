import { proposalId } from "./habit-proposal";

export type StudyValues = { subject_name: string; topic: string; duration_minutes: number };
export type StudyProposal = {
  kind: "study"; id: string; date: string; subject: string;
  topic: string; duration_minutes: number;
};

// Only the subject's human-readable name may be sent by Gemini: no user IDs,
// subject IDs, alternate dates or hidden notes are accepted.
export function parseStudyValues(input: unknown): StudyValues | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const fields = input as Record<string, unknown>;
  if (Object.keys(fields).length !== 3 ||
    !Object.hasOwn(fields, "subject_name") || !Object.hasOwn(fields, "topic") ||
    !Object.hasOwn(fields, "duration_minutes") ||
    typeof fields.subject_name !== "string" || typeof fields.topic !== "string" ||
    typeof fields.duration_minutes !== "number") return null;
  const subject = fields.subject_name.trim();
  const topic = fields.topic.trim();
  const minutes = fields.duration_minutes;
  if (!subject || subject.length > 120 || !topic || topic.length > 200 ||
    !Number.isInteger(minutes) || minutes < 1 || minutes > 720) return null;
  return { subject_name: subject, topic, duration_minutes: minutes };
}

export function isStudyProposal(input: unknown): input is StudyProposal {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const card = input as Partial<StudyProposal>;
  return card.kind === "study" && typeof card.id === "string" && proposalId.test(card.id) &&
    typeof card.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(card.date) &&
    typeof card.subject === "string" && typeof card.topic === "string" &&
    parseStudyValues({ subject_name: card.subject, topic: card.topic, duration_minutes: card.duration_minutes }) !== null;
}
