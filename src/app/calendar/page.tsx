import Link from "next/link";
import { TrackingShell } from "@/components/tracking-shell";
import { getAccount } from "@/lib/auth/account";
import { createClient } from "@/lib/supabase/server";
import { loadGoogleEvents } from "@/lib/calendar/google";
import { disconnectGoogleCalendar } from "./actions";

export const dynamic="force-dynamic";
export default async function CalendarPage(){
  const {user,profile}=await getAccount();
  const client=await createClient();
  const result=await loadGoogleEvents(client,user.id);
  const writeEnabled=process.env.GOOGLE_CALENDAR_WRITE_ENABLED==="true";
  const connection=writeEnabled && result.status!=="unconfigured" && result.status!=="disconnected"
    ? await client.from("google_calendar_connections").select("can_write").eq("user_id",user.id).maybeSingle()
    : null;
  const canWrite=Boolean(connection?.data?.can_write);
  return <TrackingShell title="Google Calendar" active="calendar" dateLabel="INTEGRACIONES"
    copy="Consultá tus próximos eventos con permiso explícito y sin copiarlos a tus recordatorios."
    displayName={profile?.display_name.trim()||user.email||"Usuario"}>
    <section className="card study-card" aria-label="Conexión de Google Calendar">
      <h2>Tu calendario</h2>
      {result.status==="unconfigured" ? <p role="status">La conexión todavía requiere configurar un cliente OAuth de Google Calendar en el servidor. Tus recordatorios siguen funcionando.</p> :
       result.status==="disconnected" ? <>
        <p>Conectá tu calendario con permiso de solo lectura. No crearemos ni modificaremos eventos.</p>
        <Link className="auth-submit" href="/api/calendar/connect">Conectar Google Calendar</Link>
       </> : <>
        {result.status==="connected" && <p role="status">Calendario conectado · próximos 14 días.</p>}
        {result.status==="reconnect" && <p role="alert">Google necesita que autorices nuevamente la conexión.</p>}
        {result.status==="unavailable" && <p role="alert">No fue posible consultar Google Calendar. Tus recordatorios no se modificaron.</p>}
        {writeEnabled && result.status==="connected" && (canWrite
          ? <p role="status">Permiso adicional para exportar recordatorios concedido. Elegí los eventos desde Recordatorios.</p>
          : <Link className="secondary-button" href="/api/calendar/connect?mode=write">Autorizar creación de eventos</Link>)}
        <div className="reminder-actions">
          <Link href="/api/calendar/connect" className="secondary-button">Autorizar nuevamente</Link>
          <form action={disconnectGoogleCalendar}><button className="secondary-button">Desconectar Calendar</button></form>
        </div>
        {result.status==="connected" && <div aria-label="Próximos eventos">
          {result.events.length===0 ? <p>No tenés eventos próximos en el calendario principal.</p> :
           result.events.map(event=><article className="study-record" key={event.id}>
             <h3>{event.title}</h3>
             <p><time dateTime={event.start}>{event.start.replace("T"," ").slice(0,16)}</time>
               {event.allDay?" · Todo el día":""}</p>
             {event.url && <a href={event.url} target="_blank" rel="noopener noreferrer">Ver en Google Calendar</a>}
           </article>)}
        </div>}
       </>}
    </section>
    <section className="card reminder-notice" role="note"><strong>Solo lectura en 5B.1</strong>
      <p>No agregamos automáticamente eventos a Día a Día. La exportación de recordatorios necesita autorización adicional y una acción explícita. No hay sincronización bidireccional.</p>
    </section>
  </TrackingShell>;
}
