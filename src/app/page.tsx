import { DayDemo } from "@/components/day-demo";
export const dynamic = "force-dynamic";
export default function Home() {
  const dateLabel = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  return <DayDemo dateLabel={dateLabel} />;
}
