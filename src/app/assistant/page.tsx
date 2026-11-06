import { TrackingShell } from "@/components/tracking-shell";
import { AssistantChat } from "@/components/assistant/assistant-chat";
import { getAccount } from "@/lib/auth/account";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const { user, profile } = await getAccount();
  const name = profile?.display_name?.trim() || user.email?.split("@")[0] || "Usuario";
  return <TrackingShell title="Asistente personal" dateLabel="INTELIGENCIA PERSONAL"
    copy="Hacé preguntas sobre tu día y recibí respuestas basadas en tus registros."
    active="assistant" displayName={name}>
    <AssistantChat enabled={Boolean(process.env.GEMINI_API_KEY)} />
  </TrackingShell>;
}
