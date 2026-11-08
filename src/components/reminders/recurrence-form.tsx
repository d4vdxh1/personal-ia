"use client";
import { useActionState,useEffect,useRef,useState } from "react";
import { saveReminderSeries,type SeriesActionState } from "@/app/reminders/recurrence-actions";
import type { ReminderSeries } from "@/lib/reminders/data";
const initial:SeriesActionState={message:"",error:false,saved:false};
const days=[["1","Lun"],["2","Mar"],["3","Mié"],["4","Jue"],["5","Vie"],["6","Sáb"],["0","Dom"]];
export function RecurrenceForm({series}:{series?:ReminderSeries}) {
  const [state,action,pending]=useActionState(saveReminderSeries,initial);
  const ref=useRef<HTMLFormElement>(null);
  const [frequency,setFrequency]=useState(series?.frequency??"weekly");
  useEffect(()=>{if(state.saved && !series)ref.current?.reset();},[state.saved,series]);
  return <form action={action} ref={ref} className="study-form">
    {series&&<input type="hidden" name="id" value={series.id}/>}
    <fieldset disabled={pending}>
      <legend>{series?"Modificar serie":"Nuevo recordatorio recurrente"}</legend>
      <div className="study-field"><label htmlFor={"series-title-"+(series?.id??"new")}>Título</label>
        <input id={"series-title-"+(series?.id??"new")} name="title" required maxLength={200}
          defaultValue={series?.title} placeholder="Ej.: Repasar inglés"/></div>
      <div className="study-field"><label htmlFor={"series-notes-"+(series?.id??"new")}>Notas (opcional)</label>
        <textarea id={"series-notes-"+(series?.id??"new")} name="notes" rows={2} maxLength={1000} defaultValue={series?.notes}/></div>
      <div className="study-field"><label htmlFor={"series-frequency-"+(series?.id??"new")}>Repetición</label>
        <select id={"series-frequency-"+(series?.id??"new")} name="frequency" value={frequency} onChange={event=>setFrequency(event.target.value)}>
          <option value="daily">Todos los días</option><option value="weekly">Días seleccionados</option>
          <option value="monthly">Cada mes (día de inicio)</option>
        </select></div>
      <fieldset className="recurrence-weekdays" disabled={frequency!=="weekly"}>
        <legend>Para frecuencia semanal, elegí al menos un día</legend>
        {days.map(([value,label])=><label key={value}>
          <input type="checkbox" name="weekdays" value={value} defaultChecked={series?.weekdays.includes(Number(value))??(value==="1")}/>{label}
        </label>)}
      </fieldset>
      <div className="study-field"><label htmlFor={"series-start-"+(series?.id??"new")}>Fecha de inicio</label>
        <input type="date" id={"series-start-"+(series?.id??"new")} name="starts_on" required defaultValue={series?.starts_on??""}/></div>
      <div className="study-field"><label htmlFor={"series-time-"+(series?.id??"new")}>Hora local</label>
        <input type="time" id={"series-time-"+(series?.id??"new")} name="local_time" required defaultValue={series?.local_time?.slice(0,5)??"18:00"}/></div>
      <div className="study-field"><label htmlFor={"series-zone-"+(series?.id??"new")}>Zona horaria</label>
        <select id={"series-zone-"+(series?.id??"new")} name="timezone" defaultValue={series?.timezone??"America/Asuncion"}>
          <option value="America/Asuncion">Paraguay (Asunción)</option>
          <option value="America/Argentina/Buenos_Aires">Argentina (Buenos Aires)</option>
          <option value="UTC">UTC</option>
        </select></div>
      <div className="study-field"><label htmlFor={"series-end-"+(series?.id??"new")}>Finalizar el (opcional)</label>
        <input type="date" id={"series-end-"+(series?.id??"new")} name="until_on" defaultValue={series?.until_on??""}/></div>
      <p className="goal-meta">Si elegís semanal, marcá los días correspondientes. Si elegís mensual, se repite el día de inicio y se omiten los meses que no lo tienen.</p>
      <button type="submit" className="auth-submit" disabled={pending}>{pending?"Guardando…":series?"Guardar serie":"Crear serie"}</button>
    </fieldset>
    {state.message&&<p role={state.error?"alert":"status"} className={state.error?"form-error":"form-success"}>{state.message}</p>}
  </form>;
}
