import { DayDemo } from "@/components/day-demo";
import { LogoutForm } from "@/components/auth/logout-form";
import { getAccount } from "@/lib/auth/account";
export const dynamic = "force-dynamic";
export default async function Home() {
  const { user, profile } = await getAccount();
  const displayName = profile?.display_name.trim() || user.email?.split("@")[0] || "ahí";
  const dateLabel = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  return <><LogoutForm /><DayDemo dateLabel={dateLabel} displayName={displayName} /></>;
}
