// The card receives a proposal ID, never an editable target/user/date for the write.
export type HabitProposal = { id: string; name: string; date: string; completed: true };
export const proposalId = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isHabitProposal(value: unknown): value is HabitProposal {
  if (!value || typeof value !== "object") return false;
  const card = value as Partial<HabitProposal>;
  return typeof card.id === "string" && proposalId.test(card.id) &&
    typeof card.name === "string" && card.name.trim().length > 0 &&
    typeof card.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(card.date) && card.completed === true;
}
